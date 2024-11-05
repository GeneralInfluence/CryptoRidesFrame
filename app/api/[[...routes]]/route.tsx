/** @jsxImportSource frog/jsx */

import { CryptoRidesNFTAbi } from "@/app/abis/CryptoRidesNFT";
import { useNeynar } from "@/app/hooks/useNeynar";
import { State } from "@/app/types";
import { contractConfig, ipfsNftMetadataHash } from "@/app/utils/config";
import { getAddressFromUserData } from "@/app/utils/helpers";
import { isWhitelisted } from "@/app/utils/nftContract";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { Address } from "viem";

// import { neynar } from "frog/hubs";
const { neynarFrogMid, neynarHub, getUserData } = useNeynar();

const app = new Frog<{ State: State }>({
  initialState: {
    whitelisted: false,
  },
  hub: neynarHub, // neynar({apiKey: "NEYNAR_FROG_FM"}),// process.env.NEYNAR_API_KEY}), //.hub(),
  assetsPath: "/",
  basePath: "/api",
  title: "Crypto Rides",
  verify: "silent",
}).use(
  neynarFrogMid.middleware({
    features: ["interactor", "cast"],
  })
);

app.frame("/", (c) => {
  return c.res({
    image: "/SuiteViewCryptoRidesMiamiBackground.png",
    intents: [
      <Button action="/donate">Donate</Button>,
      <Button action="/claim">Claim</Button>,
      <Button action="/share">Share</Button>,
      // <Button.AddCastAction action="/log-this">Add</Button.AddCastAction>,
    ],
  });
});

app.image("/api",(c) => {
  return c.res({
    image: renderImage("","/SuiteViewCryptoRidesMiamiBackground.png"),
  })
})

app.frame("/donate", async (c) => {
  const { status, buttonValue, inputText, frameData } = c;

  const userData = await getUserData(frameData?.fid!);
  const userAddress = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7";
  // const userAddress: Address = await getAddressFromUserData(userData);
  // "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7";
  console.log("userAddress", userAddress);

  const amountDonated = inputText || buttonValue;
  console.log("amountDonated", amountDonated);

  return c.res({
    image: "/SuiteViewCryptoRidesMiamiBackground.png",
    intents: [
      <Button.Transaction target="/sendDonation">5</Button.Transaction>,
      <Button value="ten">10</Button>,
      <Button value="twenty">25</Button>,
      status === "response" && <Button.Reset>Cancel</Button.Reset>,
    ],
  });
});

app.transaction("/mint", async (c) => {
  const { frameData, verified } = c;

  if (!verified || frameData==undefined) {
    return c.error(new Error("The mint frame is not verified, or there's no frameData."));
  } 

  const fid: number = frameData.fid;
  let userAddress: Address | null = null; // frameData.address as Address;
  const userData = await getUserData(fid);
  const fidUserAddresses: Array<Address> | null = await getAddressFromUserData(userData);
  console.log("fidUserAddresses from userData fid for claim route: ", fidUserAddresses);
  if (fidUserAddresses===null) {
    return c.error(new Error("Can't mint to a non-existant address..."));
  } 

  let whitelisted: boolean = false;
  if (fidUserAddresses != null) {
    for (let i=0; i<fidUserAddresses.length; i++) {
      // call to check if whitelisted and set state
      if (await isWhitelisted(fidUserAddresses[i])) { 
        whitelisted = true; 
        userAddress = fidUserAddresses[i] as Address;
        break 
      };
    }
  } 

  // TODO: I need to either pass the right address in, or go through the whitelist check again.
  return c.contract({
    abi: CryptoRidesNFTAbi,
    to: contractConfig.contractAddress,
    functionName: "safeMint",
    args: [userAddress as Address, ipfsNftMetadataHash],
    chainId: "eip155:8453",
  });
});

// app.castAction(
//   "/log-this",
//   (c) => {
//     console.log(
//       `Cast Action to ${JSON.stringify(c.actionData.castId)} from ${
//         c.actionData.fid
//       }`
//     );
//     return c.message({ message: "Action Succeeded" });
//   },
//   { name: "Log This!", icon: "log" }
// );

app.frame("/claim", async (c) => {
  const { frameData, verified, status, deriveState } = c;

  console.log("verified :: ",verified);
  console.log("frameData :: ",frameData);
  if (!verified || frameData==undefined) {
    return c.res({
      image: renderImage(
        "This frame is not verified.",
        "/SuiteViewCryptoRidesMiamiBackground.png"
      ),
      intents: [<Button.Reset>Reset</Button.Reset>],
    });
  } 

  const fid: number = frameData.fid;
  let userAddress: Address = frameData.address as Address; // = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7";
  console.log("Frame claim userAddress: ", userAddress)

  const userData = await getUserData(fid);
  const fidUserAddresses: Array<Address> | null = await getAddressFromUserData(userData);
  console.log("fidUserAddresses from userData fid for claim route: ", fidUserAddresses);

  const state = await deriveState(async (prevState) => {
    if (fidUserAddresses != null) {
      for (let i=0; i<fidUserAddresses.length; i++) {
        // call to check if whitelisted and set state
        if (await isWhitelisted(fidUserAddresses[i])) { 
          prevState.whitelisted = true; 
          userAddress = fidUserAddresses[i];
          break 
        };
      }
    } 
  });
  console.log("whitelisted: ", state.whitelisted);

  if (!state.whitelisted) {
    return c.res({
      image: renderImage(
        "Please claim a ride before minting your ticket.",
        `/SuiteViewCryptoRidesMiamiBackground.png`
      ),
      intents: [
        <Button.Link href="https://www.suiteview.org/crypto-rides-modal">
          Claim your Ride
        </Button.Link>,
        <Button.Reset>Cancel</Button.Reset>,
      ],
    });
  } else {
    return c.res({
      image: renderImage("", "/TarkinClaim.jpg"),
      intents: [
        <Button.Transaction target="/mint">Mint</Button.Transaction>,
        status === "response" && <Button.Reset>Cancel</Button.Reset>,
      ],
    });
  }
});

app.frame("/share", async (c) => {
  const { frameData, verified, status, deriveState } = c;

  if (!verified || frameData==undefined) {
    return c.res({
      image: renderImage(
        "This frame is not verified.",
        "/SuiteViewCryptoRidesMiamiBackground.png"
      ),
      intents: [<Button.Reset>Reset</Button.Reset>],
    });
  } 

  const fid: number = frameData.fid;
  let userAddress: Address = frameData.address as Address; // = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7";
  console.log("Frame claim userAddress: ", userAddress)

  const userData = await getUserData(fid);
  const fidUserAddresses: Array<Address> | null = await getAddressFromUserData(userData);
  console.log("fidUserAddresses from userData fid for claim route: ", fidUserAddresses);

  const state = await deriveState(async (prevState) => {
    if (fidUserAddresses != null) {
      for (let i=0; i<fidUserAddresses.length; i++) {
        // call to check if whitelisted and set state
        if (await isWhitelisted(fidUserAddresses[i])) { 
          prevState.whitelisted = true; 
          userAddress = fidUserAddresses[i];
          break 
        };
      }
    } 
  });
  console.log("whitelisted: ", state.whitelisted);

  // TODO: I'm redirecting to the same frame, I want them to share in warpcast.
  return c.res({
    image: renderImage("Your Ride is Ready.", "/CRYPTO-RIDES.png"),
    intents: [
      <Button action="/share">GOTV</Button>,
      <Button.Link href="https://www.suiteview.org/crypto-donation">
        Donate Rides
      </Button.Link>,
      status === "response" && <Button.Reset>Cancel</Button.Reset>,
    ],
  });
});

function renderImage(content: string, image: string | undefined) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(to right, gold, #17101F)",
        backgroundSize: "100% 100%",
        display: "flex",
        flexDirection: "column",
        flexWrap: "nowrap",
        height: "100%",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
        position: "relative" /* Add relative positioning */,
      }}
    >
      <div
        style={{
          whiteSpace: "pre-wrap",
          display: "flex",
          position: "absolute" /* Absolutely position the image */,
          top: 0 /* Adjust as needed */,
          zIndex: 1 /* Lower z-index for image (behind text) */,
        }}
      >
        {image && (
          <img
            src={image}
            alt="SuiteView Crypto Rides"
            height={620}
            width={1200}
          />
        )}
      </div>
      {content == "" ? (
        <></>
      ) : (
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontWeight: "bold",
            position: "absolute" /* Absolutely position the text */,
            top: "50%" /* Adjust as needed */,
            left: "50%" /* Adjust as needed */,
            zIndex: 10 /* Higher z-index for text (in front) */,
            backgroundColor: "rgba(0, 0, 0, 0.5)" /* Semi-transparent */,
            padding: "20px" /* Add some padding */,
            borderRadius: "10px" /* Optional: Add rounded corners */,
            maxWidth: "80%" /* Optional: Limit width */,
            height: "45%" /* Optional: Limit height */,
            transform: "translate(-50%, -50%)" /* Center the text */,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
