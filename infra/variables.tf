variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-west-2"
}

variable "twilio_account_sid" {
  type        = string
  description = "Twilio Account SID"
  sensitive   = true
}

variable "twilio_auth_token" {
  type        = string
  description = "Twilio Auth Token"
  sensitive   = true
}

variable "twilio_from_number" {
  type        = string
  description = "Twilio phone number in E.164 format"
}

variable "cors_allow_origins" {
  type        = list(string)
  description = "Allowed CORS origins"
  default     = ["*"]
}


