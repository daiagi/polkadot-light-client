import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { Express } from "express";

const swaggerDocument = YAML.load("./swagger.yaml");

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default setupSwagger;
