import { queryOne } from './database.js'

const getOtp = async () => {
  if (!process.argv[2]) {
      console.log('Usage: node get_otp.js <email>')
      process.exit(1)
  }
  const email = process.argv[2]
  try {
    const user = await queryOne('SELECT otp_code FROM users WHERE email = ?', [email])
    if (user) {
        console.log(`OTP for ${email}: ${user.otp_code}`)
    } else {
        console.log('User not found')
    }
    process.exit(0)
  } catch (e) {
      console.error(e)
      process.exit(1)
  }
}

getOtp()
