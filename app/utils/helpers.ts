export const getAddressFromUserData = async (userData: any) => {
  try {
    console.log("userData", userData);
    // Add null checks and provide default values
    if (
      !userData ||
      !userData.verified_addresses ||
      !Array.isArray(userData.verified_addresses)
    ) {
      console.log("No valid user data or addresses found");
      return null;
    }

    // Make sure there's at least one address before accessing index 0
    if (userData.verified_addresses.length === 0) {
      console.log("User has no addresses");
      return null;
    }

    return userData.verified_addresses[0];
  } catch (error) {
    console.error("Error getting address from user data:", error);
    return null;
  }
};
