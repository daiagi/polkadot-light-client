import { Request, Response, NextFunction } from "express";
import { LightClient } from "../../client/LightClient";

export const validateClient = (lightClient: LightClient | undefined) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!lightClient) {
      return res.status(500).send("LightClient not initialized");
    }
    next();
  };
};
