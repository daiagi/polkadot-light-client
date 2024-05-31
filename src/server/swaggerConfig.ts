import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { Express } from "express";

const swaggerDocument = YAML.load("./swagger.yaml");

const options: swaggerUi.SwaggerOptions = {
  customSiteTitle: "Polkadot Light Client API Documentation",
  
};
export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
};

export default setupSwagger;
