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
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL as string),
});

export const isWhitelisted = async (address: string) => {
  if (!address) {
    console.error("Address is undefined or empty");

    return false;
  }

  try {
    const result = await publicClient.readContract({
      address: contractConfig.contractAddress,
      abi: contractConfig.contractAbi,
      functionName: "isWhitelisted",
      args: [address],
    });

    return result;
  } catch (error) {
    console.error("Error checking whitelist status:", error);

    return false;
  }
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
