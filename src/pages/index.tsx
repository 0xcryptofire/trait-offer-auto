import Head from "next/head";
import { Abel } from "next/font/google";
import { getContractAddress, isEmpty } from "@/utils";
import { useState } from "react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { log } from "console";

const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

const abel = Abel({ subsets: ["latin"], weight: ["400"] });

export interface IUserData {
  privateKey: string;
  aim: string;
  approach: number;
  trait: string;
  traitValue: string;
  offerAmount: number;
}

export interface ICollectionData {
  show: boolean;
  image_url: string;
  opensea_url: string;
  name: string;
  description: string;
  editors: string[] | string;
  total_supply: number;
}

interface IAlert {
  message: string;
  isError: boolean;
}

function Alert(props: IAlert) {
  return (
    <div
      className={`text-white px-6 py-4 border-0 rounded relative mb-4 ${
        props.isError ? "bg-red-300" : "bg-purple-300"
      }`}
    >
      <span className="text-xl inline-block mr-5 align-middle">
        <i className="fas fa-bell"></i>
      </span>
      <span className="inline-block align-middle mr-8">{props.message}</span>
      <button className="absolute bg-transparent text-2xl font-semibold leading-none right-0 top-0 mt-4 mr-6 outline-none focus:outline-none">
        <span>×</span>
      </button>
    </div>
  );
}
export default function Home() {
  const [userData, setUserData] = useState<IUserData>({
    privateKey: "",
    aim: "",
    approach: 1,
    trait: "",
    traitValue: "",
    offerAmount: 1,
  });
  const [loading, setLoading] = useState(false);
  const [collectionData, setCollectionData] = useState({
    show: false,
    image_url:
      "https://i.seadn.io/gae/uyfXw7Em-kwtCBwBUskWy8qoWPaLyM_cw_DRooz-aOEBTocQm8xqFJpKRZvAIoFOKoaaRjSTY2LjxEs7wp1QTuq7oHU0cBJgbw_l6A?w=500&auto=format",
    opensea_url: "https://opensea.io/collection/cryptoskull",
    name: "cryptoskull",
    description: "ANONYMITY IS A LUXURY.",
    editors: ["0x0d5671d958aa3016ca4e748014e9ec65e6c96a4a"],
    total_supply: 1,
  });
  const [trait, setTrait] = useState({});
  const [assets, setAssets] = useState([]);
  const [currentContract, setCurrentContract] = useState("");
  const [alertInfo, setAlertInfo] = useState({ isError: false, message: "" });

  const fetchMetadata = async () => {
    if (isEmpty(userData.aim)) {
      return alert("Collection Data is empty!");
    }

    let aimNFTsData: string =
      userData.approach === 2 ? getContractAddress(userData.aim) : userData.aim;

    if (userData.approach === 1) {
    } else if (userData.approach === 2) {
    }
    setLoading(true);
    setAlertInfo({ isError: false, message: "Fetching premetadata" });

    try {
      const res = await fetch("/api/opensea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approach: userData.approach,
          aim: aimNFTsData,
        }),
      });
      const data = await res.json();

      const newCollection = { show: true, ...data.collectionData };

      setCollectionData(newCollection);
      setTrait(data.traits);
      setAssets(data.nfts);
      console.log(data);

      if (data.contractAddress === undefined) {
        return alert("Invaild Contract, please try another");
      }

      const newContractAddr = getContractAddress(data.contractAddress);
      setCurrentContract(newContractAddr);
    } catch (error) {
      throw new Error(error.message);
    }
    setLoading(false);
    setAlertInfo({ isError: false, message: "Fetching finished" });
  };

  const placeOffer = async () => {
    // if (isEmpty(userData.privateKey)) {
    //   return alert("Privatekey is required");
    // }

    if (isEmpty(currentContract)) {
      return alert("Contract address is invaild");
    }
    const shouldFilterForMetadata =
      userData.trait !== undefined && userData.traitValue !== undefined;
    if (shouldFilterForMetadata) {
      const newAssets = assets.filter(function (asset) {
        return (
          asset.attributes.findIndex(function (attribute) {
            return (
              attribute.trait_type === userData.trait &&
              attribute.value === userData.traitValue
            );
          }) !== -1
        );
      });
      setAssets(newAssets);
    }

    // for (const ass of assets) {
    const bodyContent = {
      // privateKey: userData.privateKey,
      offerAmount: userData.offerAmount,
      tokenAddress: currentContract,
      assets,
    };

    try {
      const res = await fetch("/api/createOffer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyContent),
      });
      const data = await res.json();
      setAlertInfo({ isError: false, message: data.message });
    } catch (error) {
      console.error("[Offer Error]", error);
      setAlertInfo({ isError: true, message: error.response.data.message });
      // throw new Error(error.message);
    }
    // }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let newUserData = {
      ...userData,
      [e.currentTarget.name]: e.currentTarget.value,
    };
    setUserData(newUserData);
  };

  const handleApproach = (e: React.FormEvent<HTMLSelectElement>): void => {
    let newUserData = {
      ...userData,
      approach: parseInt(e.currentTarget.value),
    };
    setUserData(newUserData);
    console.log({ newUserData });
  };

  return (
    <>
      <Head>
        <title>Trait Offer</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`text-center justify-center lex min-h-screen flex-col items-center p-24 ${abel.className}`}
      >
        {alertInfo.message && (
          <Alert isError={alertInfo.isError} message={alertInfo.message} />
        )}
        <p className="text-2xl mb-6 text-black-700 font-bold">
          KEEP YOUR PRIVATE KEY SAFE
        </p>
        <form className="w-full max-w-xl contents">
          <div className="flex flex-wrap -mx-3 mb-6  md:mb-0">
            {/* <div className="w-full md:w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-private-key"
              >
                Private Key
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                id="grid-private-key"
                type="text"
                name="privateKey"
                placeholder="**********"
                value={userData.privateKey}
                onChange={handleChange}
              />
            </div> */}
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-approach"
              >
                Choose Approach way
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-approach"
                  onChange={handleApproach}
                >
                  <option value={1}>Collection</option>
                  <option value={2}>Contract</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-contract-address"
              >
                {userData.approach === 1
                  ? "Collection Name"
                  : "Contract Address"}
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                type="text"
                id="grid-contract-address"
                name="aim"
                placeholder={
                  userData.approach === 1 ? "cryptoskull" : "0xa6...36ef"
                }
                value={userData.aim}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-marketplace"
              >
                Marketplace
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-marketplace"
                >
                  <option>Opensea</option>
                  <option>Magic eden</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-chain"
              >
                Choose Chain
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-chain"
                >
                  <option>Ethereum (mainnet)</option>
                  <option>Sepolia (eth)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-min-limit"
              >
                Min Rate Limit
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-min-limit"
                type="number"
                placeholder="30 - 60"
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-5 mt-5">
            <div className="w-full px-3 mb-6 md:mb-0">
              <button
                className="shadow bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none text-black py-2 px-4 rounded"
                type="button"
                onClick={fetchMetadata}
              >
                {loading ? "Fetching..." : "Prefetch Metadata"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/6 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-price"
              >
                Bidding Price
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-price"
                type="number"
                name="offerAmount"
                placeholder="WETH"
                value={userData.offerAmount}
                onChange={handleChange}
              />
            </div>
            <div className="w-full md:w-1/6 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-quantity"
              >
                Quantity
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-quantity"
                type="number"
                placeholder="1"
              />
            </div>
            <div className="w-full md:w-1/6 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-expiration"
              >
                Offer Expiration
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-expiration"
                type="number"
                placeholder="15min"
              />
            </div>
            <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-trait"
              >
                Traits
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-trait"
                type="text"
                name="trait"
                placeholder="(Optional)"
                value={userData.trait}
                onChange={handleChange}
              />
            </div>
            <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="grid-trait-value"
              >
                Trait Value
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-trait-value"
                type="text"
                name="traitValue"
                placeholder="(Optional)"
                value={userData.traitValue}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-5 mt-5">
            <div className="w-full px-3 mb-6 md:mb-0">
              <button
                className="shadow bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none text-black py-2 px-4 rounded"
                type="button"
                onClick={placeOffer}
              >
                Place Traits Offer
              </button>
            </div>
          </div>
        </form>
        {/* collection data */}
        {collectionData.show ? (
          <>
            <div
              className="max-w-sm w-full lg:max-w-full lg:flex cursor-pointer "
              // onClick={() => setShowModal(true)}
            >
              <div
                className="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden"
                style={{
                  backgroundImage: `url(${collectionData.image_url})`,
                }}
                title="Collection Data"
              ></div>
              <div className="border-r w-full lg:max-w-full border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
                <div className="mb-8">
                  <p className="text-sm text-gray-600 flex items-center">
                    {collectionData.opensea_url}
                  </p>
                  <div className="text-gray-900 font-bold text-xl mb-2">
                    {collectionData.name}
                  </div>
                  <p className="text-gray-700 text-base">
                    {collectionData.description}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-sm block">
                    <p className="text-gray-600">
                      Total Supply: {collectionData.total_supply}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
        <p className="text-2xl mb-6 text-black-700 mt-3 mb-6 font-bold">
          Check the Traits of NFTs
        </p>
        <DynamicReactJson
          style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            display: "block",
            textAlign: "start",
          }}
          src={trait}
          theme="solarized"
          enableClipboard={false}
        />

        {/* bid state */}
        {/* <div className="w-full contents">
          <div className="flex flex-col">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-hidden">
                  <table className="min-w-full text-left text-sm font-light text-surface dark:text-white">
                    <thead className="border-b border-neutral-200 font-medium dark:border-white/10">
                      <tr>
                        <th scope="col" className="px-6 py-4">
                          #
                        </th>
                        {headerTableUser.map((header, idx) => (
                          <th scope="col" className="px-6 py-4" key={idx}>
                            {header.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-200 dark:border-white/10">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          1
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">Mark</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </main>
    </>
  );
}
