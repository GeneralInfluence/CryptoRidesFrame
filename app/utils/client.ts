import {
  Address,
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
} from "viem";
import { useWriteContract } from "wagmi";
import { 
  type WriteContractErrorType,
  type WriteContractReturnType } from '@wagmi/core'
// import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { config } from "dotenv";
import { cryptoRidesNFTAddress, contractConfig } from "@/app/utils/config";
import { CryptoRidesNFTAbi } from "@/abis/CryptoRidesNFT";

config();

export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});


const { writeContract, onError, onSuccess } = useWriteContract();

export const mintNFT = async function (
  userAddress: Address,
  tokenURI: string,
  handleTransactionSuccess: (txHash: string) => Promise<string | undefined>,
  handleTransactionError: (txHash: string) => Promise<string | undefined>
) {
  const tx = writeContract(
    {
      address: contractConfig.contractAddress,
      abi: contractConfig.contractAbi,
      functionName: "safeMint",
      args: [userAddress, tokenURI],
    },
    {
      onSuccess: handleTransactionSuccess
    },
    {
      onError: handleTransactionError
    }
  );

  return tx;
};


// JSON-RPC Account
export const [address] = await walletClient.getAddresses();

export const sendMintTransaction = async (to: Address, uri: string) => {
  const { request } = await publicClient.simulateContract({
    account: address,
    address: cryptoRidesNFTAddress,
    abi: CryptoRidesNFTAbi,
    functionName: "safeMint",
    args: [to, uri],
  });

  const txn = await walletClient.writeContract(request);

  return txn;
};

export const isWhitelisted = async (user: Address) => {
  const balance = await publicClient.readContract({
    address: cryptoRidesNFTAddress,
    abi: [
      {
        type: "function",
        name: "isWhitelisted",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
      },
    ],
    functionName: "isWhitelisted",
    args: [user],
  });

  return BigInt(balance);
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
