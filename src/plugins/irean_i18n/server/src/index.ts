import bootstrap from "./bootstrap";
import register from "./register";
import controllers from "./controllers";
import services from "./services";
import routes from "./routes";

console.log("🚀 [irean_i18n] Index.ts cargando...");
console.log("📦 [irean_i18n] Bootstrap:", typeof bootstrap);
console.log("📦 [irean_i18n] Register:", typeof register);
console.log("📦 [irean_i18n] Controllers:", typeof controllers);
console.log("📦 [irean_i18n] Services:", typeof services);
console.log("📦 [irean_i18n] Routes:", typeof routes);

export default {
  bootstrap,
  register,
  controllers,
  services,
  routes,
};
