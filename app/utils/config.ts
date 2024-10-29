import { Address } from "viem";
import { ContractConfig } from "../types";
import { CryptoRidesNFTAbi } from "../abis/CryptoRidesNFT";

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
export const PAYMASTER_URL =
  process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT;

export const contractConfig: ContractConfig = {
  alchemyApiKey: process.env.ALCHEMY_API_KEY!,
  // Base Mainnet contract address
  contractAddress: "0xD44f7B0ef9159959fcC105f45Ed7266C2181F925" as Address,
  contractAbi: CryptoRidesNFTAbi,
};

export const ipfsNftMetadataHash =
  "QmSMqcgyu2Sy8Xo5e8FQjUXtTSyqPaZz2BsUesyQMya2FE";

export const adminWallets =
  process.env.NEXT_PUBLIC_ADMIN_WALLETS?.toLowerCase().split(",") || [];
