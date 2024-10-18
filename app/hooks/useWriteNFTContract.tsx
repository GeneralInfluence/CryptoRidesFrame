import { contractConfig } from "@/app/utils/config";
import { Address } from "viem";
import { useWriteContract } from "wagmi";

export const useWriteNFTContract = () => {
  const { writeContract } = useWriteContract();

  const mintNFT = async function (
    userAddress: Address,
    tokenURI: string,
    handleTransactionSubmitted: (txHash: string) => Promise<string | undefined>
  ) {
    const tx = writeContract(
      {
        address: contractConfig.contractAddress,
        abi: contractConfig.contractAbi,
        functionName: "safeMint",
        args: [userAddress, tokenURI],
      },
      {
        onSuccess: handleTransactionSubmitted,
      }
    );

    return tx;
  };

  // Note: delegate votes to a user, and if the user themselves wants to vote,
  // they can delegate to themselves.
  const delegateVotes = async (
    delegateAddress: Address,
    handleTransactionSubmitted: (txHash: string) => Promise<string | undefined>
  ) => {
    const tx = writeContract(
      {
        address: contractConfig.contractAddress,
        abi: contractConfig.contractAbi,
        functionName: "delegate",
        args: [delegateAddress],
      },
      {
        onSuccess: handleTransactionSubmitted,
      }
    );

    return tx;
  };

  const whitelist = async (
    walletAddress: Address,
    handleTransactionSubmitted: (txHash: string) => Promise<void>
  ) => {
    const tx = writeContract(
      {
        address: contractConfig.contractAddress,
        abi: contractConfig.contractAbi,
        functionName: "whitelist",
        args: [walletAddress],
      },
      {
        onSuccess: handleTransactionSubmitted,
      }
    );

    return tx;
  };

  const removeWhitelist = async (
    walletAddress: Address,
    handleTransactionSubmitted: (txHash: string) => Promise<void>
  ) => {
    const tx = writeContract(
      {
        address: contractConfig.contractAddress,
        abi: contractConfig.contractAbi,
        functionName: "removeWhitelist",
        args: [walletAddress],
      },
      {
        onSuccess: handleTransactionSubmitted,
      }
    );

    return tx;
  };

  return {
    mintNFT,
    delegateVotes,
    whitelist,
    removeWhitelist,
  };
};
