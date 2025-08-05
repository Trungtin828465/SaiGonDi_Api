/* eslint-disable no-console */
import { twilioClient } from '~/config/twilio.js'
import { env } from '~/config/environment.js'
import ApiError from './ApiError'

const sendSMS = async (to, body) => {
  try {
    const message = await twilioClient.messages.create({
      body,
      from: env.TWILIO_PHONE_NUMBER,
      to
    })

    return message
  } catch (error) {
    console.error('Error sending SMS:', error.message)
    throw new ApiError(500, 'Failed to send SMS')
  }
}

export default sendSMS