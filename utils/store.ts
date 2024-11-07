import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const ses = new AWS.SES();

export const passwordResetStore: Record<string, { code: string; expires: number }> = {};

export const sendResetEmail = async (email: string, resetCode: string): Promise<void> => {
  const params = {
    Source: process.env.EMAIL_USER!, // Ensure this email is verified in SES
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
    const data = await ses.sendEmail(params).promise();
    console.log("Email sent:", data);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send reset email");
  }
};
