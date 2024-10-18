import { Address } from "viem";
import { ContractConfig } from "@/app/types";
import { CryptoRidesNFTAbi } from "@/abis/CryptoRidesNFT";

export const cryptoRidesNFTAddress: Address =
  "0xF39e471454C79610d52DAe7DEB92Fa2e984e8dC8";

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://cryptoridesframe.vercel.app";


export const contractConfig: ContractConfig = {
  alchemyApiKey: process.env.ALCHEMY_API_KEY!,
  // Base Mainnet contract address
  contractAddress: "0xf39e471454c79610d52dae7deb92fa2e984e8dc8" as Address, // "0x4A4C6Aff51732c5A016F7485fB287192540A7d61" as Address,
  contractAbi: CryptoRidesNFTAbi,
};