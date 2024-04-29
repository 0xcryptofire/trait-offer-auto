// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import sdk from '@api/opensea';
import { OPENSEA_API } from "@/constant";
import { Alchemy, Network as AlchemyNetwork } from "alchemy-sdk";

export const config = {
  api: {
    responseLimit: false,
  },
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method === 'POST') {
    sdk.auth(OPENSEA_API);
    sdk.server('https://api.opensea.io');
    const alchemy = new Alchemy({ apiKey: process.env.ALCHEMY_API_KEY, network: AlchemyNetwork.ETH_MAINNET, maxRetries: 3 });


    if (req.body.approach === 1) {
      // data fetch by collection slug
      let collectionData, traits, nfts
      try {
        collectionData = (await sdk.get_collection({ collection_slug: req.body.aim })).data
      } catch (error) {
        console.error(error)
      }
      try {
        traits = (await sdk.get_traits({ collection_slug: req.body.aim })).data
      } catch (error) {
        console.error(error)
      }
      // try {
      //   nfts = (await sdk.list_nfts_by_collection({ limit: 200, collection_slug: req.body.aim })).data
      // } catch (error) {
      //   console.error(error)
      // }

      const contractAddress = collectionData.contracts[0]?.address

      if (contractAddress !== undefined) {
        try {
          nfts = [];
          // Get the async iterable for the contract's NFTs.
          const nftsIterable = alchemy.nft.getNftsForContractIterator(contractAddress);

          // Iterate over the NFTs and add them to the nfts array.
          for await (const nft of nftsIterable) {
            if (nft.raw.metadata.attributes === undefined) {
              continue;
            }

            console.log('[GET NFTs]', new Date(), nft.description);
            nfts.push({
              description: nft.description,
              tokenId: nft.tokenId,
              tokenType: nft.tokenType.toString(),
              attributes: nft.raw.metadata.attributes
            });
          }
        } catch (error) {
          console.error(error);
        }
      }

      console.log({ contractAddress });


      return res.status(200).json({ collectionData, traits, nfts, contractAddress })

    } else if (req.body.approach === 2) {
      // data fetch by nft contract address
      // try {
      //   const nfts = await sdk.list_nfts_by_contract({ address: req.body.aim, chain: "ethereum" }) // chain should be changeable
      //   res.status(200).json(nfts.data)
      // } catch (error) {
      //   console.error(error)
      // }
      const nfts = [];

      try {
        // Get the async iterable for the contract's NFTs.
        const nftsIterable = alchemy.nft.getNftsForContractIterator(req.body.aim);

        // Iterate over the NFTs and add them to the nfts array.
        for await (const nft of nftsIterable) {
          if (nft.raw.metadata.attributes === undefined) {
            continue;
          }

          console.log('[DEBUG]', new Date(), nft.description);
          nfts.push({
            description: nft.description,
            tokenId: nft.tokenId,
            tokenType: nft.tokenType.toString(),
            attributes: nft.raw.metadata.attributes
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    // else if (req.body.approach === 3) {
    //   let assets;
    //   try {
    //     assets = (await sdk.list_nfts_by_collection({ limit: 200, collection_slug: req.body.aim, next: req.body.nextCode })).data
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }

  }
}


