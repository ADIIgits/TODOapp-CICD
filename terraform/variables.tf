variable "aws_region" {
  description = "AWS Region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name tag prefix"
  type        = string
  default     = "devops-todo-app"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "environment" {
  description = "Environment identifier"
  type        = string
  default     = "production"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block permitted to SSH into EC2"
  type        = string
  default     = "0.0.0.0/0"
}
