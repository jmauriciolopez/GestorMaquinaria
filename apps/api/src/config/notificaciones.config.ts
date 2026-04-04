import { registerAs } from '@nestjs/config';

export default registerAs('notificaciones', () => ({
  // SendGrid
  sendgridApiKey:  process.env.SENDGRID_API_KEY ?? '',
  emailFrom:       process.env.EMAIL_FROM ?? 'no-reply@maquinaria.app',
  emailFromNombre: process.env.EMAIL_FROM_NOMBRE ?? 'Maquinaria SaaS',

  // Twilio WhatsApp
  twilioAccountSid:   process.env.TWILIO_ACCOUNT_SID ?? '',
  twilioAuthToken:    process.env.TWILIO_AUTH_TOKEN ?? '',
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886',

  // AWS S3
  awsAccessKeyId:     process.env.AWS_ACCESS_KEY_ID ?? '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  awsRegion:          process.env.AWS_REGION ?? 'sa-east-1',
  awsS3Bucket:        process.env.AWS_S3_BUCKET ?? '',

  // Modo: 'mock' | 'real'
  modo: process.env.NOTIFICACIONES_MODO ?? 'mock',
}));
