import { Address } from "viem";
import { ContractConfig } from "../types";
import { CryptoRidesNFTAbi } from "../abis/CryptoRidesNFT";

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
export const PAYMASTER_URL =
  process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT;

export const contractConfig: ContractConfig = {
  alchemyApiKey: process.env.ALCHEMY_API_KEY!,
  // Base Mainnet contract address
  contractAddress: "0xdC06c3643694C53bD364c2A25713e2AC138538e4" as Address,
  contractAbi: CryptoRidesNFTAbi,
};

export const ipfsNftMetadataHash =
  "QmSMqcgyu2Sy8Xo5e8FQjUXtTSyqPaZz2BsUesyQMya2FE";

export const adminWallets =
  process.env.NEXT_PUBLIC_ADMIN_WALLETS?.toLowerCase().split(",") || [];
