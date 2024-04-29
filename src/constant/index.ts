import env from 'dotenv';


env.config();

export const RPC_PROVIDER = process.env.RPC_PROVIDER;
export const OPENSEA_API = process.env.OPENSEA_API
export const ALCHEMY_API_KEY_MAINNET = process.env.ALCHEMY_API_KEY_MAINNET
export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY

export const headerTableUser = [
  {
    name: "address",
    label: "ADDRESS",
  },
  {
    name: "logo",
    label: "LOGO"
  }
]

