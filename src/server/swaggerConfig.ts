import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import {  Router } from "express";

const swaggerDocument = YAML.load("./swagger.yaml");

const options: swaggerUi.SwaggerOptions = {
  customSiteTitle: "Polkadot Light Client API Documentation",
  
};
export const setupSwagger = (router: Router) => {
  router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
};

export default setupSwagger;
