import { contractConfig } from "@/app/utils/config";
import { Address } from "viem";
import { useReadContracts } from "wagmi";

export const useReadNFTContract = (userAddress: Address) => {

  const { data: isWhitelisted, isLoading: isLoadingWhitelisted } =
    useReadContracts({
      contracts: [
        {
          address: contractConfig.contractAddress,
          abi: contractConfig.contractAbi,
          functionName: "isWhitelisted",
          // pass the users address to the contract here
          args: [userAddress],
        },
      ],
    });

  const { data: votes, isLoading: isLoadingVotes } = useReadContracts({
    contracts: [
      {
        address: contractConfig.contractAddress,
        abi: contractConfig.contractAbi,
        functionName: "getVotes",
        args: [userAddress],
      },
    ],
  });

  // check if the user has enough votes to do something
  const hasEnoughVotes =
    votes &&
    votes[0]?.result &&
    BigInt(votes[0].result as number) >= BigInt(1);

  // calculate if the user has enough votes to do something based on the required votes
  const calculateHasEnoughVotes = (requiredVotes: bigint) => {
    return (
      votes &&
      votes[0]?.result &&
      BigInt(votes[0].result as number) >= requiredVotes
    );
  };

  const totalSupply = useReadContracts({
    contracts: [
      {
        address: contractConfig.contractAddress,
        abi: contractConfig.contractAbi,
        functionName: "totalSupply",
      },
    ],
  });

  return {
    isWhitelisted,
    isLoadingWhitelisted,
    hasEnoughVotes,
    isLoadingVotes,
    calculateHasEnoughVotes,
    totalSupply,
  };
};
