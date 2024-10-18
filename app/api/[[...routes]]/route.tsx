/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { getUserData, isWhitelisted, sendMintTransaction, mintNFT } from "@/app/utils/client"
import { Address } from "viem"

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'Crypto Rides',
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/', (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
  return c.res({
    image: "/SuiteViewCryptoRidesMiamiBackground.png",
    // image: (
    //   <div
    //     style={{
    //       alignItems: 'center',
    //       // backgroundImage: `url("/SV-BG.png")`,
    //       background:
    //         status === 'response'
    //           ? 'linear-gradient(to right, #432889, #17101F)'
    //           : 'black',
    //       backgroundSize: '100% 100%',
    //       display: 'flex',
    //       flexDirection: 'column',
    //       flexWrap: 'nowrap',
    //       height: '100%',
    //       justifyContent: 'center',
    //       textAlign: 'center',
    //       width: '100%',
    //     }}
    //   >
    //     <div
    //       style={{
    //         color: 'white',
    //         fontSize: 60,
    //         fontStyle: 'normal',
    //         letterSpacing: '-0.025em',
    //         lineHeight: 1.4,
    //         marginTop: 30,
    //         padding: '0 120px',
    //         whiteSpace: 'pre-wrap',
    //       }}
    //     >
    //       {status === 'response'
    //         ? `Nice choice.${fruit ? ` ${fruit.toUpperCase()}!!` : ''}`
    //         : 'Welcome!'}
    //     </div>
    //   </div>
    // ),
    intents: [
      // <TextInput placeholder="Welcome to Crypto Rides." />,
      <Button action="/isWhitelisted">Am I Eligible?</Button>,
      <Button.Link href="https://www.suiteview.org/crypto-rides-modal">
        Claim Ride
      </Button.Link>,
      <Button.Link href="https://www.suiteview.org/crypto-donation">
        Donate Rides
      </Button.Link>,
      // status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

app.frame("/isWhitelisted", async (c) => {
  const { frameData, verified } = c;
  const userData = await getUserData(frameData?.fid!);

  let userAddress: Address = "0x3a01234190749D69ee2E87e50fA58925CB5Ce669"; // userData.address;

  const whitelisted = await isWhitelisted(userAddress);

  if (!whitelisted) {
    return c.res({
      image: renderImage(
        "Please claim a ride before minting your ticket.",
        `/SuiteViewCryptoRidesMiamiBackground.png`,
      ),
      intents: [
        <Button.Link href="https://www.suiteview.org/crypto-rides-modal">
          Claim your Ride
        </Button.Link>
      ]
    })
  } else {
    return c.res({
      image: renderImage("","/TarkinClaim.jpg"),
      intents: [ // TODO: mint natively, then redirect to share.
        // <Button.Link href="https://claims.suiteview.org">
        //   Mint your Ticket
        // </Button.Link>
        <Button action="/mintTicket">
          Mint your Ticket
        </Button>
        
      ]
    })
  }
})

const handleTransactionSubmitted = function(txn) {

}

app.frame("/mintTicket", async (c) => {
  const { frameData, verified } = c;
  const userData = await getUserData(frameData?.fid!);

  let userAddress: Address = "0x3a01234190749D69ee2E87e50fA58925CB5Ce669"; // userData.address;

  // const txn = sendMintTransaction(userAddress,"QmSMqcgyu2Sy8Xo5e8FQjUXtTSyqPaZz2BsUesyQMya2FE")
  const txn = await mintNFT(userAddress,"QmSMqcgyu2Sy8Xo5e8FQjUXtTSyqPaZz2BsUesyQMya2FE");

  return c.res({
    image: renderImage("Your Ride is Ready.","CRYPTO-RIDES.png"),
    intents: [
      <Button action="/share">
        GOTV
      </Button>,
      <Button.Link href="https://www.suiteview.org/crypto-donation">
        Donate Rides
      </Button.Link>
    ]
  })
})

app.frame("/share", async (c) => {
  const { frameData, verified } = c;
  const userData = await getUserData(frameData?.fid!);

  let userAddress: Address = "0x3a01234190749D69ee2E87e50fA58925CB5Ce669"; // userData.address;

  return c.res({
    image: renderImage("Your Ride is Ready.","CRYPTO-RIDES.png"),
    intents: [
      <Button action="/share">
        GOTV
      </Button>,
      <Button.Link href="https://www.suiteview.org/crypto-donation">
        Donate Rides
      </Button.Link>
    ]
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)

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
          <img src={image} alt="Pharo Landing" height={620} width={1200} />
        )}
      </div>
      {content == "" ? (
        <></>
      ):(
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