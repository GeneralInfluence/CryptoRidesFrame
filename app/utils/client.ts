import {
  Address,
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
} from "viem";
import { base, baseSepolia } from "viem/chains";
import { config } from "dotenv";
import { contractConfig } from "@/app/utils/config";

config();

export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export const isWhitelisted = async (user: Address) => {
  const balance = await publicClient.readContract({
    address: contractConfig.contractAddress,
    abi: contractConfig.contractAbi,
    functionName: "isWhitelisted",
    args: [user],
  });

  return balance;
};

export const getUserData = async (fid: number) => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY as string,
    },
  };

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    options
  );

  return response.json();
};
