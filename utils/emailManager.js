import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

const emailManager = async (to, subject, html) => {
  /*
            This line initializes a new instance of the TransactionalEmailsApi class from the @getbrevo/brevo SDK.

            It creates an object named emailAPI which contains all the methods and properties needed to interact with Brevo's email sending service. Think of it as creating a remote control that is specifically designed to work with the Brevo API.

    */
  const emailAPI = new TransactionalEmailsApi();
  //   *.apiKey: This refers to the specific authentication scheme being used—in this case, an API Key authentication. This is a property within the authentications object.

  // * .apiKey: This second apiKey is the property within the API key authentication scheme that holds the actual key value itself.
  emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY; // your Brevo API key

  //   * Creates the email message: A SendSmtpEmail object is created and populated with the sender's details, recipient, subject, and HTML content.
  const message = new SendSmtpEmail();
  message.sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
  };
  //   * { email: to } is an object where the key is email and its value is the recipient's email address, which is passed into the function via the to parameter. This format allows you to also add an optional name for the recipient (e.g., { email: "john@example.com", name: "John Doe" }).

  message.to = [{ email: to }];
  message.subject = subject;
  message.htmlContent = html;

  try {
    const response = await emailAPI.sendTransacEmail(message);
    console.log("Email sent successfully:", response.body);
  } catch (error) {
    console.error("Error sending via Brevo SDK:", error.body || error);
    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }
};

export default emailManager;
