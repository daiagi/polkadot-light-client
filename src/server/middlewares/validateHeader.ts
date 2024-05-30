import { Request, Response, NextFunction } from "express";
import { LightClient } from "../../client/LightClient";

export const validateHeader = (lightClient: LightClient) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { hash, blockNumber } = req.params;

    let header;
    if (hash) {
      header = lightClient.getHeaderByHash(hash);
    } else if (blockNumber) {
      header = lightClient.getHeaderByBlockNumber(parseInt(blockNumber));
    }

    if (!header) {
      return res.status(404).send("Header not found");
    }

    res.locals.header = header;
    next();
  };
};
