terraform {
  required_version = ">= 1.6"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.49"
    }
  }

  # Remote state — configure a backend that suits your setup.
  # Uncomment and fill in for production use:
  #
  # backend "s3" {
  #   bucket = "my-tofu-state"
  #   key    = "pasture/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "hcloud" {
  token = var.hetzner_token
}

# ---------------------------------------------------------------------------
# SSH key
# ---------------------------------------------------------------------------

resource "hcloud_ssh_key" "pasture" {
  name       = "pasture-key-${local.rotation_date}"
  public_key = var.ssh_public_key

  lifecycle {
    create_before_destroy = true
  }
}

# ---------------------------------------------------------------------------
# Locals
# ---------------------------------------------------------------------------

locals {
  rotation_date = formatdate("YYYY-MM-DD", timestamp())

  # Cloud-init user-data: installs Docker, writes compose file, starts services.
  user_data = <<-USERDATA
    #cloud-config
    package_update: true
    package_upgrade: false

    packages:
      - docker
      - docker-compose-plugin
      - firewalld

    runcmd:
      # Enable & start Docker
      - systemctl enable --now docker

      # Enable firewall; allow SSH + HTTP
      - systemctl enable --now firewalld
      - firewall-cmd --permanent --add-service=ssh
      - firewall-cmd --permanent --add-port=3001/tcp
      - firewall-cmd --reload

      # Configure the floating IP as a secondary address so traffic routed to
      # it arrives on this host (Hetzner requires this on the guest side).
      - |
        cat > /etc/NetworkManager/dispatcher.d/99-floating-ip.sh <<'EOF'
        #!/bin/bash
        if [ "$2" = "up" ]; then
          ip addr add ${var.floating_ip_address}/32 dev eth0 || true
        fi
        EOF
      - chmod +x /etc/NetworkManager/dispatcher.d/99-floating-ip.sh
      - ip addr add ${var.floating_ip_address}/32 dev eth0 || true

      # Write Docker Compose file
      - mkdir -p /opt/pasture
      - |
        cat > /opt/pasture/docker-compose.yml <<'EOF'
        ${local.compose_content}
        EOF

      # Write .env
      - |
        cat > /opt/pasture/.env <<'EOF'
        ${local.env_content}
        EOF
      - chmod 600 /opt/pasture/.env

      # Pull & start
      - cd /opt/pasture && docker compose --profile prod pull
      - cd /opt/pasture && docker compose --profile prod up -d

    USERDATA

  compose_content = <<-COMPOSE
    services:
      app:
        image: cordlesswool/highcoo:${var.docker_image_tag}
        restart: unless-stopped
        profiles: [prod]
        ports:
          - "3001:3001"
        environment:
          DATABASE_URL: postgres://highcoo:$${POSTGRES_PASSWORD}@db:5432/highcoo
          BODY_SIZE_LIMIT: "Infinity"
          RP_ID: $${RP_ID}
          ORIGIN: $${ORIGIN}
        depends_on:
          db:
            condition: service_healthy
        volumes:
          - uploads:/app/uploads

      db:
        image: postgres:18-alpine
        restart: unless-stopped
        profiles: [prod]
        environment:
          POSTGRES_USER: highcoo
          POSTGRES_DB: highcoo
          POSTGRES_PASSWORD: $${POSTGRES_PASSWORD}
        volumes:
          - pgdata:/var/lib/postgresql/data
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U highcoo"]
          interval: 5s
          timeout: 5s
          retries: 10

    volumes:
      pgdata:
      uploads:
  COMPOSE

  env_content = <<-ENV
    POSTGRES_PASSWORD=${var.postgres_password}
    RP_ID=${var.rp_id}
    ORIGIN=${var.origin}
  ENV
}

# ---------------------------------------------------------------------------
# VM
# ---------------------------------------------------------------------------

resource "hcloud_server" "pasture" {
  name        = "pasture-${local.rotation_date}"
  server_type = var.server_type
  image       = var.image
  location    = var.location
  ssh_keys    = [hcloud_ssh_key.pasture.id]
  user_data   = local.user_data

  # Keep the server until the floating IP re-assignment is done.
  lifecycle {
    create_before_destroy = true
  }
}

# ---------------------------------------------------------------------------
# Floating IP assignment
# ---------------------------------------------------------------------------

resource "hcloud_floating_ip_assignment" "pasture" {
  floating_ip_id = var.floating_ip_id
  server_id      = hcloud_server.pasture.id

  # Re-assign before the old server is destroyed.
  lifecycle {
    create_before_destroy = true
  }
}

# ---------------------------------------------------------------------------
# Health check — wait until the app is reachable via the Floating IP
# ---------------------------------------------------------------------------

resource "null_resource" "health_check" {
  depends_on = [hcloud_floating_ip_assignment.pasture]

  triggers = {
    server_id = hcloud_server.pasture.id
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = <<-BASH
      echo "Waiting for Highcoo to become healthy at http://${var.floating_ip_address}:3001 ..."
      for i in $(seq 1 60); do
        status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
          http://${var.floating_ip_address}:3001 2>/dev/null || echo "000")
        echo "  attempt $i: HTTP $status"
        if [ "$status" = "200" ] || [ "$status" = "302" ] || [ "$status" = "301" ]; then
          echo "App is healthy."
          exit 0
        fi
        sleep 10
      done
      echo "Health check timed out after 10 minutes." >&2
      exit 1
    BASH
  }
}
