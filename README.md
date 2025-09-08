# Shola Time Tracker

This app provides Work Time calculators and a Discount calculator. It is a static site (S3/GitHub Pages compatible) with optional SMS reminders using AWS and Twilio.

## SMS Reminders (AWS + Twilio)

Infra (in `infra/`) provisions:
- API Gateway (HTTP API) `POST /schedule-sms`
- Lambda `tts-schedule-sms` (creates one-time EventBridge schedules)
- Lambda `tts-sms-sender` (invoked by EventBridge; sends SMS via Twilio)
- IAM roles/policies and EventBridge Scheduler role

Lambdas are in `lambdas/`:
- `lambdas/scheduler` (Node.js 18 + @aws-sdk/client-scheduler)
- `lambdas/sender` (Node.js 18 + twilio)

### Prereqs
- AWS account and CLI with credentials targeting your account
- Twilio account
  - If trial: verify the destination number; messages include a trial preamble
  - Buy/set a Twilio From number
- Terraform >= 1.5

### Deploy (us-west-2)
1. Create `infra/terraform.tfvars`:
```
aws_region = "us-west-2"
twilio_account_sid = "<your_sid>"
twilio_auth_token  = "<your_token>"
twilio_from_number = "+1XXXXXXXXXX" # E.164
cors_allow_origins = ["*"] # tighten later to your domain
```
2. From `infra/` run:
```
terraform init
terraform apply -auto-approve
```
3. On success, note the output `schedule_sms_endpoint`. Set it in the frontend:
   - Open `index.html`, set `SMS_SCHEDULER_ENDPOINT` to the printed value.

### Test the API
Use curl or Postman to test scheduling a message a few minutes in the future:
```
curl -X POST "$SCHEDULE_URL" \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "+16198893118",
    "whenIso": "2025-01-01T19:05:00.000Z",
    "message": "Reminder: test message"
  }'
```
You should see `{ ok: true, scheduleName: "..." }`. The SMS should arrive at the scheduled time.

### Frontend wiring
- `index.html` constants:
  - `SMS_SCHEDULER_ENDPOINT`: set to the API Gateway URL printed by Terraform
  - `REMINDER_PHONE_NUMBER`: set to the user number (hard-coded)
- When the SMS toggle is set to On, the page POSTs `{ phoneNumber, whenIso, message }` to the endpoint. Toasts indicate success/error.

### Notes
- Keep Twilio credentials only in Lambda environment variables (never in the browser).
- Lock CORS to your site domain once verified.
- EventBridge `at()` uses absolute UTC timestamps; ensure `whenIso` is in UTC.
- To teardown: `terraform destroy` in `infra/`.