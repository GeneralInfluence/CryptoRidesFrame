import { contractConfig } from "@/app/utils/config";
import { publicClient } from "@/app/utils/client";

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

    return result as boolean;
  } catch (error) {
    console.error("Error checking whitelist status:", error);

    return false;
  }
};
