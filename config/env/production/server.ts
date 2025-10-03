export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('STRAPI_ADMIN_BACKEND_URL', 'https://backend-irean-production.up.railway.app'),
  proxy: {
    enabled: true,
    ssl: true,
    koa: {
      trust: ['loopback', 'linklocal', 'uniquelocal'],
      proxyIpHeader: 'X-Forwarded-For',
      proxyIpHeaderDepth: 1,
    },
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});