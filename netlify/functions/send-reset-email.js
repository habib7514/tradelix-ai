export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, resetLink } = JSON.parse(event.body);

    if (!email || !resetLink) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing email or link" }) };
    }

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "Tradelix AI", email: "mmatrix081@gmail.com" },
        to: [{ email: email }],
        subject: "Reset Your Password - Tradelix AI",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to set a new password:</p>
            <a href="${resetLink}" style="background-color: #F5C518; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            <p>If you didn't request this, ignore this email.</p>
          </div>
        `
      })
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      return { statusCode: 500, body: JSON.stringify({ error: errorData }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}