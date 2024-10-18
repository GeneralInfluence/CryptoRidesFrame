import { Abi, Address } from "viem";

export type ContractConfig = {
  alchemyApiKey: string;
  contractAddress: Address;
  contractAbi: Abi;
};