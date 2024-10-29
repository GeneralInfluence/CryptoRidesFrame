import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export const neynarSDKClient = new NeynarAPIClient(
  process.env.NEYNAR_API_KEY as string
);
