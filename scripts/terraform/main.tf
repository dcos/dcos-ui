variable "variant" {
  type        = "string"
  description = "The cluster variant to spawn."
}

variable "license_key" {
  type        = "string"
  description = "The license key to spawn an ee-cluster with."
  default     = ""
}

variable "cluster_name" {
  type        = "string"
}

variable "custom_dcos_download_path" {
  type = "string"
  default = "https://downloads.mesosphere.com/dcos-enterprise/testing/master/dcos_generate_config.ee.sh"
}

provider "aws" {
  region = "us-west-2"
  version = ">= 2.58"
}

# Used to determine your public IP for forwarding rules
data "http" "whatismyip" {
  url = "http://whatismyip.akamai.com/"
}

module "dcos" {
  source  = "dcos-terraform/dcos/aws"
  version = "0.3.3"

  providers = {
    aws = "aws"
  }

  cluster_name        = var.cluster_name
  ssh_public_key_file = "~/.ssh/${var.variant}.pub"
  admin_ips           = ["${data.http.whatismyip.body}/32"]

  num_masters        = 1
  num_private_agents = 1
  num_public_agents  = 1

  tags = {
    owner      = "dcos-ui"
    expiration = "1h"
  }

  custom_dcos_download_path = var.custom_dcos_download_path

  # ee / open
  dcos_variant              = var.variant
  dcos_license_key_contents = var.license_key

  dcos_instance_os             = "centos_7.5"
  bootstrap_instance_type      = "m5.xlarge"
  masters_instance_type        = "m5.xlarge"
  private_agents_instance_type = "m5.xlarge"
  public_agents_instance_type  = "m5.xlarge"
}

output "masters-ips" {
  value = module.dcos.masters-ips
}

output "cluster-address" {
  value = module.dcos.masters-loadbalancer
}

output "public-agents-loadbalancer" {
  value = module.dcos.public-agents-loadbalancer
}
