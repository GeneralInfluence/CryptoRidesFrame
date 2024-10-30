import { ReactNode } from "react";
import { Abi, Address } from "viem";

export type State = {
  whitelisted: boolean;
};

// https://docs.opensea.io/docs/metadata-standards
export type NFTMetadata = {
  description: string;
  external_url: string;
  image: string;
  name: string;
  attributes?: {
    display_type?: string;
    trait_type?: string;
    value: string;
  }[];
};

export type ContractConfig = {
  alchemyApiKey: string;
  contractAddress: Address;
  contractAbi: Abi;
};
