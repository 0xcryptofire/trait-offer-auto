
import { isAddress } from 'web3-validator';


export const getContractAddress = (contractAddress: string) => {
  if (isAddress(contractAddress)) {
    return contractAddress
  } else {
    throw new Error("Contract address is invalid")
  }
}

export const isEmpty = value => typeof value === "undefined" || Object.keys(value).length === 0