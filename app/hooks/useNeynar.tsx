"server only";

import { createNeynar } from "frog/middlewares";

export const useNeynar = () => {
  const neynar = createNeynar({
    apiKey: process.env.NEYNAR_API_KEY as string,
  });

  const getUserData = async (fid: number) => {
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

  return {
    neynar,
    getUserData,
  };
};
