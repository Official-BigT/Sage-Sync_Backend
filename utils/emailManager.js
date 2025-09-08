const emailManager = async (to, subject, html) => {
  const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

  const payload = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME,
    },
    to: [{ email: to }], // 
    subject: subject,
    htmlContent: html,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, // Authentication header
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error sending via Brevo REST API:", errorData);
      throw new Error(`Failed to send email to ${to}: ${errorData.message}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export default emailManager;
