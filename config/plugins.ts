export default () => ({
  "irean-i18n": {
    enabled: true,
    resolve: "./dist/src/plugins/irean-i18n",
    config: {
      defaultLocale: "es",
      locales: ["es", "en", "ca"],
    },
  },
});
