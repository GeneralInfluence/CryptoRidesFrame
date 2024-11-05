import { Address, isAddress } from "viem";

export const getAddressFromUserData = async (userData: any) => {
  try {
    console.log("userData", userData);
    // Add null checks and provide default values
    if ( !userData ) {
      console.log("No valid user data or addresses found.");
      return null;
    }

    let user = null;
    if ( !userData.users ) {
      console.log("No users found in userData.");
      return null;
    } else {
      user = userData.users[0];
    }

    let verifiedAddresses = null;
    if (!user.verified_addresses) {
      console.log("No address found in user's verified_addresses.");
      return null;
    } else {
      verifiedAddresses = user.verified_addresses;
    }

    let ethAddresses: Array<Address> = [];
    if (verifiedAddresses.eth_addresses.length===0) {
      console.log("No ETH address found in user's verified_addresses.");
      return null;
    } else {
      ethAddresses = verifiedAddresses.eth_addresses;
    }

    for (let i=0; i< ethAddresses.length; i++) {
      if (!isAddress(ethAddresses[i])) {
        console.log("Invalid user address: ",ethAddresses[i]);
      }
    }

    return ethAddresses as Array<Address>;

  } catch (error) {
    console.error("Error getting address from user data:", error);
    return null;
  }
};
