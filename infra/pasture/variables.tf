variable "hetzner_token" {
  description = "Hetzner Cloud API token"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH public key material to install on the VM"
  type        = string
  sensitive   = true
}

variable "ssh_private_key" {
  description = "SSH private key material for provisioning (used by Terraform/OpenTofu)"
  type        = string
  sensitive   = true
}

variable "floating_ip_id" {
  description = "ID of the pre-existing Hetzner Floating IP to assign to the VM"
  type        = string
}

variable "floating_ip_address" {
  description = "The actual IP address of the Floating IP (used for health-check)"
  type        = string
}

variable "postgres_password" {
  description = "PostgreSQL password for the Highcoo database"
  type        = string
  sensitive   = true
}

variable "rp_id" {
  description = "WebAuthn Relying Party ID (e.g. pasture.example.com)"
  type        = string
}

variable "origin" {
  description = "WebAuthn origin (e.g. https://pasture.example.com)"
  type        = string
}

variable "server_type" {
  description = "Hetzner server type"
  type        = string
  default     = "cx22"
}

variable "location" {
  description = "Hetzner datacenter location"
  type        = string
  default     = "nbg1"
}

variable "image" {
  description = "Hetzner OS image name"
  type        = string
  default     = "fedora-41"
}

variable "docker_image_tag" {
  description = "Highcoo Docker image tag to deploy"
  type        = string
  default     = "main"
}
