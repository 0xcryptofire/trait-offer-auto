// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
// import sdk from '@api/opensea';
import { ALCHEMY_API_KEY_MAINNET, OPENSEA_API } from "@/constant";
import { Chain, OpenSeaSDK } from "opensea-js";
import { AlchemyProvider, ethers } from "ethers";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method === 'POST') {

    let provider = new AlchemyProvider("homestead", ALCHEMY_API_KEY_MAINNET)

    const walletMainnet = new ethers.Wallet(
      req.body.privateKey as string,
      provider
    );

    const WALLET_ADDRESS = walletMainnet.address;

    const sdk = new OpenSeaSDK(
      walletMainnet,
      {
        chain: Chain.Mainnet,
        apiKey: OPENSEA_API,
      },
      (line) => console.info(`MAINNET: ${line}`),);


    for (const asset of req.body.assets) {
      const offer = {
        accountAddress: WALLET_ADDRESS,
        startAmount: req.body.offerAmount,
        asset: {
          tokenAddress: req.body.tokenAddress,
          tokenId: asset.tokenId,
        },
      };

      try {
        const response = await sdk.createOffer(offer);
        console.log("Successfully created an offer with orderHash:", response.orderHash);
        res.status(200).json({ message: response.orderHash, success: true })
      } catch (error) {
        // console.error("Error in createOffer:", error.message);
        res.status(405).json({ message: error.message, success: false })
        throw new Error("Error in createOffer:" + error.message)
      }
    }

  }
}