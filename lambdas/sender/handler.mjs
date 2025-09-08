import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const client = twilio(accountSid, authToken);

export const handler = async (event) => {
  try {
    const payload = event.detail || (event.body ? JSON.parse(event.body) : {});
    const { phoneNumber, message } = payload;

    if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
      return { statusCode: 400, body: "Invalid E.164 phone number" };
    }

    await client.messages.create({
      to: phoneNumber,
      from: fromNumber,
      body: message,
    });

    return { statusCode: 200, body: "Message sent" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Failed to send" };
  }
};


