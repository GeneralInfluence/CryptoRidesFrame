/** @jsxImportSource frog/jsx */

import { CryptoRidesNFTAbi } from "@/app/abis/CryptoRidesNFT";
import { getUserData, isWhitelisted } from "@/app/utils/client";
import { contractConfig, ipfsNftMetadataHash } from "@/app/utils/config";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { neynar } from "frog/hubs";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { Address } from "viem";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  hub: neynar({
    apiKey: process.env.NEXT_PUBLIC_NEYNAR_API_KEY as string,
  }),
  title: "Crypto Rides",
});

// export const runtime = "edge";

app.frame("/", (c) => {
  return c.res({
    image: "/SuiteViewCryptoRidesMiamiBackground.png",
    intents: [
      <Button action="/donate">Donate</Button>,
      <Button action="/claim">Claim</Button>,
    ],
  });
});

app.frame("/donate", async (c) => {
  const { frameData, verified, status, buttonValue, inputText } = c;
  const userData = await getUserData(frameData?.fid!);
  const amountDonated = inputText || buttonValue;

  console.log("amountDonated", amountDonated);

  const userAddress: Address = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7"; // userData.address;

  return c.res({
    image: "/SuiteViewCryptoRidesMiamiBackground.png",
    intents: [
      <Button value="five">5</Button>,
      <Button value="ten">10</Button>,
      <Button value="twenty">25</Button>,
      status === "response" && <Button.Reset>Cancel</Button.Reset>,
    ],
  });
});

app.transaction("/mintTicket", async (c) => {
  const { frameData, verified } = c;
  const userData = await getUserData(frameData?.fid!);

  let userAddress: Address = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7"; // userData.address;

  return c.contract({
    abi: CryptoRidesNFTAbi,
    to: contractConfig.contractAddress,
    functionName: "safeMint",
    args: [userAddress, ipfsNftMetadataHash],
    chainId: "eip155:8453",
  });
});

app.frame("/claim", async (c) => {
  const { frameData, verified, status } = c;
  const userData = await getUserData(frameData?.fid!);
  const userAddress: Address = "0xa1784AA2de3C93D60Aa47242a6e010fe273515D7"; // userData.address;
  const whitelisted = await isWhitelisted(userAddress);

  if (!whitelisted) {
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
        status === "response" && <Button.Reset>Cancel</Button.Reset>,
      ],
    });
  } else {
    return c.res({
      image: renderImage("", "/TarkinClaim.jpg"),
      intents: [
        // TODO: mint natively, then redirect to share.
        // <Button.Link href="https://claims.suiteview.org">
        //   Mint your Ticket
        // </Button.Link>
        <Button.Transaction target="/mintTicket">
          Mint your Ticket
        </Button.Transaction>,
        status === "response" && <Button.Reset>Cancel</Button.Reset>,
      ],
    });
  }
});

app.frame("/share", async (c) => {
  const { frameData, verified, status } = c;
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

// NOTE: That if you are using the devtools and enable Edge Runtime, you will need to copy the devtools
// static assets to the public folder. You can do this by adding a script to your package.json:
// ```json
// {
//   scripts: {
//     "copy-static": "cp -r ./node_modules/frog/_lib/ui/.frog ./public/.frog"
//   }
// }
// ```
// Next, you'll want to set up the devtools to use the correct assets path:
// ```ts
// devtools(app, { assetsPath: '/.frog' })
// ```
