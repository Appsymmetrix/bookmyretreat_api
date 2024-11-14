import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";

dotenv.config();

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const passwordResetStore: Record<
  string,
  { code: string; expires: number }
> = {};

export const sendResetEmail = async (
  email: string,
  resetCode: string
): Promise<void> => {
  const params = {
    Source: process.env.EMAIL_USER!,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Password Reset Code",
      },
      Body: {
        Text: {
          Data: `Your password reset code is: ${resetCode}`,
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log("Email sent:", data);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send reset email");
  }
};

export const sendVerificationEmail = async (
  email: string,
  resetCode: string
): Promise<void> => {
  const params = {
    Source: process.env.EMAIL_USER!,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Email verifing code",
      },
      Body: {
        Text: {
          Data: `Your e-mail verifying code is: ${resetCode}`,
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log("Email sent:", data);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send reset email");
  }
};
