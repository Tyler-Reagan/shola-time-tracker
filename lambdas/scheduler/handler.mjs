import { SchedulerClient, CreateScheduleCommand } from "@aws-sdk/client-scheduler";

const scheduler = new SchedulerClient({});
const targetArn = process.env.SCHEDULER_TARGET_ARN;
const roleArn = process.env.SCHEDULER_ROLE_ARN;

export const handler = async (event) => {
  try {
    const body = event.requestContext?.http ? JSON.parse(event.body || "{}") : (event.body || {});
    const { phoneNumber, whenIso, message } = body;

    if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
      return { statusCode: 400, body: "Invalid E.164 phone number" };
    }
    const when = new Date(whenIso);
    if (Number.isNaN(when.getTime())) {
      return { statusCode: 400, body: "Invalid whenIso" };
    }

    const scheduleName = `sms-${Date.now()}`;
    const input = JSON.stringify({ phoneNumber, message });

    await scheduler.send(new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: `at(${when.toISOString()})`,
      FlexibleTimeWindow: { Mode: "OFF" },
      Target: {
        Arn: targetArn,
        RoleArn: roleArn,
        Input: input,
      }
    }));

    return { statusCode: 200, body: JSON.stringify({ ok: true, scheduleName }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Failed to schedule" };
  }
};


