export default ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET", "default-secret-dev-only"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT", "default-salt"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT", "default-transfer-salt"),
    },
  },
  secrets: {
    encryptionKey: env("ENCRYPTION_KEY", "default-encryption-key"),
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
  watchIgnoreFiles: ["**/config/sync/**"],
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env("CLIENT_URL"),
    },
  },
});
