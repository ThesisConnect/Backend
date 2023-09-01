// EmailTemplate.tsx

import React from 'react'

interface EmailTemplateProps {
  recipientName: string
  resetLink: string
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({
  recipientName,
  resetLink,
}) => {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        border: '1px solid #ddd',
      }}
    >
      <h2>Hello, {recipientName}!</h2>
      <p>We've received a request to reset your password.</p>
      <p>
        Please{' '}
        <a href={resetLink} target="_blank" rel="noopener noreferrer">
          click here
        </a>{' '}
        to reset your password.
      </p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Best regards,</p>
      <p>Your Friendly App Team</p>
    </div>
  )
}
import { renderToString } from 'react-dom/server'

export const generateEmailContent = (
  recipientName: string,
  resetLink: string,
) => {
  const emailContent = renderToString(
    <EmailTemplate recipientName={recipientName} resetLink={resetLink} />,
  )
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
      </head>
      <body>
        ${emailContent}
      </body>
    </html>
  `
}
export default generateEmailContent
