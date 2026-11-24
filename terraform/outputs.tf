output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.app_server.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "app_url" {
  description = "Application Web URL (Accessible in browser)"
  value       = "http://${aws_instance.app_server.public_ip}"
}

output "api_health_url" {
  description = "Backend API Health check URL"
  value       = "http://${aws_instance.app_server.public_ip}/health"
}

output "nagios_url" {
  description = "Nagios Monitoring Web Interface URL"
  value       = "http://${aws_instance.app_server.public_ip}:8080/nagios4/"
}

output "ssh_command" {
  description = "Command to SSH into EC2 instance"
  value       = "ssh -i terraform/id_rsa ubuntu@${aws_instance.app_server.public_ip}"
}
