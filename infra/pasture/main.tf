terraform {
  required_version = ">= 1.6"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.49"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
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

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ---------------------------------------------------------------------------
# Locals
# ---------------------------------------------------------------------------

locals {
  rotation_date = formatdate("YYYY-MM-DD", timestamp())

  user_data = templatefile("${path.module}/cloud-init.yaml.tftpl", {
    docker_image_tag  = var.docker_image_tag
    postgres_password = var.postgres_password
    rp_id             = var.rp_id
    origin            = var.origin
  })
}

# ---------------------------------------------------------------------------
# VM
# ---------------------------------------------------------------------------

resource "hcloud_server" "pasture" {
  name               = "pasture-${local.rotation_date}"
  server_type        = var.server_type
  image              = var.image
  location           = var.location
  ssh_keys           = [var.ssh_key_id]
  user_data          = local.user_data
  public_net {
    ipv4_enabled = false
    ipv6_enabled = true
  }
}

# ---------------------------------------------------------------------------
# DNS
# ---------------------------------------------------------------------------

resource "cloudflare_record" "pasture" {
  zone_id         = var.cloudflare_zone_id
  name            = "pasture"
  type            = "AAAA"
  content         = hcloud_server.pasture.ipv6_address
  proxied         = true
  allow_overwrite = true

  lifecycle {
    create_before_destroy = true
  }
}
