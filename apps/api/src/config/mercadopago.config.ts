import { registerAs } from '@nestjs/config';

export default registerAs('mercadopago', () => ({
  accessToken: process.env.MP_ACCESS_TOKEN ?? '',
  publicKey:   process.env.MP_PUBLIC_KEY   ?? '',
  webhookSecret: process.env.MP_WEBHOOK_SECRET ?? '',
  // URL base de la app para success/failure/pending redirects
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  // URL pública del backend para el webhook (ngrok en dev)
  webhookUrl: process.env.MP_WEBHOOK_URL ?? 'http://localhost:3000/api/v1/pagos/mp/webhook',
}));
