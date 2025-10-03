export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    options: {
      expiresIn: '30d',
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  url: env('STRAPI_ADMIN_BACKEND_URL', 'https://backend-irean-production.up.railway.app/admin'),
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  forgotPassword: {
    from: env('EMAIL_FROM', 'no-reply@strapi.io'),
    replyTo: env('EMAIL_REPLY_TO', 'no-reply@strapi.io'),
  },
});