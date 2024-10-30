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

const { neynar, getUserData } = useNeynar();

const app = new Frog<{ State: State }>({
  initialState: {
    whitelisted: false,
  },
  hub: neynar.hub(),
  assetsPath: "/",
  basePath: "/api",
  title: "Crypto Rides",
  verify: "silent",
}).use(
  neynar.middleware({
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
  const { frameData, verified, address } = c;

  if (!verified) {
    return c.error(new Error("something went wrong..."));
  }

  const userData = await getUserData(frameData?.fid!);
  const userAddress: Address = await getAddressFromUserData(userData);

  return c.contract({
    abi: CryptoRidesNFTAbi,
    to: contractConfig.contractAddress,
    functionName: "safeMint",
    args: [userAddress, ipfsNftMetadataHash],
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
  const { fid, castId } = frameData;
  const whitelisted: boolean = false;
  const userAddress = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7";
  let userData;

  if (!verified) {
    return c.res({
      image: renderImage(
        "Not Verified frame message.",
        "/SuiteViewCryptoRidesMiamiBackground.png"
      ),
      intents: [<Button.Reset>Reset</Button.Reset>],
    });
  }
  const state = await deriveState(async (prevState) => {
    // call to check if whitelisted and set state
    prevState.whitelisted = await isWhitelisted(userAddress);
  });

  if (frameData) {
    userData = await getUserData(fid);
    const userAddress = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7";
    // userAddress = await getAddressFromUserData(userData);
    console.log("userAddress from userData for claim route", userAddress);
  } else {
    console.error("Bad Frame Data.");
  }

  console.log("whitelisted", state.whitelisted);

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
  const { frameData, verified, status } = c;

  if (!verified) {
    return c.res({
      image: renderImage(
        "Not Verified frame message.",
        "/SuiteViewCryptoRidesMiamiBackground.png"
      ),
      intents: [<Button.Reset>Reset</Button.Reset>],
    });
  }

  const userData = await getUserData(frameData?.fid!);
  let userAddress: Address = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7"; // userData.address;

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
