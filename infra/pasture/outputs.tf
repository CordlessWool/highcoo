output "server_id" {
  description = "Hetzner server ID of the new pasture VM"
  value       = hcloud_server.pasture.id
}

output "server_name" {
  description = "Hetzner server name of the new pasture VM"
  value       = hcloud_server.pasture.name
}

output "server_ipv4" {
  description = "Primary public IPv4 address of the new pasture VM"
  value       = hcloud_server.pasture.ipv4_address
}

output "floating_ip" {
  description = "Floating IP address (stable across rotations)"
  value       = var.floating_ip_address
}

output "ssh_key_id" {
  description = "ID of the SSH key created for this rotation"
  value       = hcloud_ssh_key.pasture.id
}
