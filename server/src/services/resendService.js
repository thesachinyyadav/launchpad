const { Resend } = require('resend')

let resendClient = null

function getResendClient() {
  if (resendClient) {
    return resendClient
  }

  if (!process.env.RESEND_API_KEY) {
    return null
  }

  resendClient = new Resend(process.env.RESEND_API_KEY)
  return resendClient
}

async function sendEmail({ to, subject, html, text }) {
  const client = getResendClient()
  const fromAddress = process.env.RESEND_FROM

  if (!client || !fromAddress) {
    return {
      status: 'mocked',
      id: null,
    }
  }

  try {
    const response = await client.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      text,
    })

    return {
      status: 'sent',
      id: response.data?.id || null,
    }
  } catch (error) {
    return {
      status: 'failed',
      id: null,
      error: error.message || 'email_send_failed',
    }
  }
}

module.exports = {
  sendEmail,
}
