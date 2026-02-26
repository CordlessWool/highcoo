output "server_id" {
  description = "Hetzner server ID of the new pasture VM"
  value       = hcloud_server.pasture.id
}

output "server_name" {
  description = "Hetzner server name of the new pasture VM"
  value       = hcloud_server.pasture.name
}

output "server_ipv6" {
  description = "Primary public IPv6 address of the new pasture VM"
  value       = hcloud_server.pasture.ipv6_address
}

