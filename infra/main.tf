terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = ">= 2.4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ===============
# Lambda: Sender (invoked at scheduled time; calls Twilio API)
# ===============
data "archive_file" "sender_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/sender"
  output_path = "${path.module}/.dist/sender.zip"
}

resource "aws_iam_role" "sender_role" {
  name               = "tts-sender-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "lambda.amazonaws.com" },
      Action   = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "sender_logs" {
  role       = aws_iam_role.sender_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "sender" {
  function_name    = "tts-sms-sender"
  role             = aws_iam_role.sender_role.arn
  handler          = "handler.handler"
  runtime          = "nodejs18.x"
  filename         = data.archive_file.sender_zip.output_path
  source_code_hash = data.archive_file.sender_zip.output_base64sha256

  environment {
    variables = {
      TWILIO_ACCOUNT_SID = var.twilio_account_sid
      TWILIO_AUTH_TOKEN  = var.twilio_auth_token
      TWILIO_FROM_NUMBER = var.twilio_from_number
    }
  }
}

# Allow EventBridge Scheduler to invoke the sender Lambda
resource "aws_lambda_permission" "allow_scheduler_invoke_sender" {
  statement_id  = "AllowSchedulerInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sender.function_name
  principal     = "scheduler.amazonaws.com"
}

# Role that EventBridge Scheduler will assume to invoke the sender Lambda
resource "aws_iam_role" "scheduler_target_role" {
  name               = "tts-scheduler-target-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "scheduler.amazonaws.com" },
      Action   = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "scheduler_target_invoke_policy" {
  name = "tts-scheduler-target-invoke-policy"
  role = aws_iam_role.scheduler_target_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = ["lambda:InvokeFunction"],
      Resource = aws_lambda_function.sender.arn
    }]
  })
}

# ===============
# Lambda: Scheduler (API handler) - creates one-time schedules
# ===============
data "archive_file" "scheduler_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/scheduler"
  output_path = "${path.module}/.dist/scheduler.zip"
}

resource "aws_iam_role" "scheduler_role" {
  name               = "tts-scheduler-api-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "lambda.amazonaws.com" },
      Action   = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "scheduler_logs" {
  role       = aws_iam_role.scheduler_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "scheduler_create_policy" {
  name = "tts-scheduler-create-policy"
  role = aws_iam_role.scheduler_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "scheduler:CreateSchedule",
          "scheduler:DeleteSchedule",
          "scheduler:GetSchedule"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "scheduler" {
  function_name    = "tts-schedule-sms"
  role             = aws_iam_role.scheduler_role.arn
  handler          = "handler.handler"
  runtime          = "nodejs18.x"
  filename         = data.archive_file.scheduler_zip.output_path
  source_code_hash = data.archive_file.scheduler_zip.output_base64sha256

  environment {
    variables = {
      SCHEDULER_TARGET_ARN = aws_lambda_function.sender.arn
      SCHEDULER_ROLE_ARN   = aws_iam_role.scheduler_target_role.arn
      AWS_REGION           = var.aws_region
    }
  }
}

# ===============
# API Gateway HTTP API -> Scheduler Lambda
# ===============
resource "aws_apigatewayv2_api" "api" {
  name          = "tts-sms-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = var.cors_allow_origins
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
  }
}

resource "aws_apigatewayv2_integration" "integration" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.scheduler.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /schedule-sms"
  target    = "integrations/${aws_apigatewayv2_integration.integration.id}"
}

resource "aws_apigatewayv2_stage" "stage" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_apigw_invoke_scheduler" {
  statement_id  = "AllowAPIGwInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scheduler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_apigatewayv2_api.api.id}/*/*/schedule-sms"
}

data "aws_caller_identity" "current" {}

output "api_base_url" {
  value = aws_apigatewayv2_stage.stage.invoke_url
}

output "schedule_sms_endpoint" {
  value = "${aws_apigatewayv2_stage.stage.invoke_url}/schedule-sms"
}


