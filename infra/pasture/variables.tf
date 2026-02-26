variable "hetzner_token" {
  description = "Hetzner Cloud API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with Zone:DNS:Edit permission"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for highcoo.studio"
  type        = string
}

variable "ssh_key_id" {
  description = "ID of the pre-existing Hetzner SSH key to install on the VM"
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
  default     = "cx23"
}

variable "location" {
  description = "Hetzner datacenter location"
  type        = string
  default     = "nbg1"
}

variable "image" {
  description = "Hetzner OS image name"
  type        = string
  default     = "fedora-43"
}

variable "docker_image_tag" {
  description = "Highcoo Docker image tag to deploy"
  type        = string
  default     = "main"
}
