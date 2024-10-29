import { createPublicClient, createWalletClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { config } from "dotenv";

config();

export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL as string),
});
