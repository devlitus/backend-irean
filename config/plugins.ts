export default () => ({
  i18n: {
    enabled: true,
    resolve: "./src/plugins/i18n",
    config: {
      defaultLocale: "es",
      locales: ["es", "en", "ca"],
    },
  },
});
