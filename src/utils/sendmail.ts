import nodemailer from 'nodemailer'
import isDev from './isDev'
import generateEmailContent from './emailTemplate/passwordReset'

let transporter: nodemailer.Transporter
// if (!isDev) {
//   // transporter = nodemailer.createTransport({
//   //   host: process.env.SMTP_HOST,
//   //   port: process.env.SMTP_PORT,
//   //   secure: process.env.SMTP_SECURE === 'true',
//   //   auth: {
//   //     user: process.env.SMTP_USERNAME,
//   //     pass: process.env.SMTP_PASSWORD
//   //   }
//   // })
// }

export const sendEmail = async (
  subject: string,
  html: string,
  email: string,
) => {
  // console.log("sendmail")
  // console.log("isdev",isDev)
  // console.log(process.env.NODE_ENV)

  console.log('sendmail')
  const testAccount = await nodemailer.createTestAccount()
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  // console.log(html)
  // console.log(subject)
  // console.log(email)
  // console.log(process.env.MAIL_FROM)
  // console.log(transporter)
  // console.log("html")
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM!,
    to: email,
    subject,
    html,
  })

  if (isDev) {
    const testUrl = nodemailer.getTestMessageUrl(info)
    console.log(`--> Test send mail: ${testUrl}`)
  }
}
