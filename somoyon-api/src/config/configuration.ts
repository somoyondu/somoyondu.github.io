export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    rootFolder: process.env.CLOUDINARY_ROOT_FOLDER || 'somoyon',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    allowedEmails: (process.env.GOOGLE_ALLOWED_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    hostedDomain: process.env.GOOGLE_HOSTED_DOMAIN || undefined,
  },
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
  cacheTtl: parseInt(process.env.CACHE_TTL, 10) || 300,
  mail: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'Somoyon <no-reply@somoyon.org>',
    contactNotifyTo: process.env.CONTACT_NOTIFY_TO,
  },
  swagger: {
    user: process.env.SWAGGER_USER || 'somoyon',
    password: process.env.SWAGGER_PASSWORD || 'somoyon',
  },
});
