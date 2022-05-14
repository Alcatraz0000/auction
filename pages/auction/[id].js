/* pages/post/[id].js */
import ReactMarkdown from "react-markdown";
import { useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { css } from "@emotion/css";
import { ethers } from "ethers";

import { deedContractAddress, auctionContractAddress } from "../../config";
import { useState, useRef, useEffect } from "react"; // new

/* import contract and owner addresses */
import { contractAddress, ownerAddress } from "../../config";

import Auction from "../../artifacts/contracts/Auction.sol/Auction.json";
import Deed from "../../artifacts/contracts/Deed.sol/Deed.json";

import { AccountContext } from "../../context";

const ipfsURI = "https://ipfs.io/ipfs/";

const initialState = { theBid: 10 };
let myId;
export default function Post(props) {
  let { auction } = props;
  const account = useContext(AccountContext);
  const [bid, setBid] = useState(initialState);

  const { theBid } = bid;

  const router = useRouter();
  const { id } = router.query;
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  function onChange(e) {
    setBid(() => ({ ...bid, [e.target.name]: e.target.value }));
  }

  async function createBid() {
    console.log(
      "inserisco una bid per il _tokenId " + id + "con un valore di " + theBid
    );
    if (typeof window.ethereum !== "undefined") {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      const contract = new ethers.Contract(
        auctionContractAddress,
        Auction.abi,
        signer
      );
      console.log("contract: ", contract);
      try {
        const val = await contract.createBid(id, theBid);
        /* optional - wait for transaction to be confirmed before rerouting */
        await provider.waitForTransaction(val.hash);
        console.log("val: ", val);
      } catch (err) {
        //token dont exist !
        console.log("Error: ", err);
      }
    }
  }

  return (
    <div>
      <h1>This is the Auction for the Deed #{id}</h1>
      <div>
        <h1>Cosa vuoi vendere ?</h1>
        <input
          id="bid"
          name="theBid"
          placeholder="bid"
          value={bid.theBid}
          onChange={onChange}
        ></input>
        <button className={button} type="button" onClick={createBid}>
          Create Deed
        </button>
        <p>Old bid {auction}</p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  /* here we check to see the current environment variable */
  /* and render a provider based on the environment we're in */
  let provider;
  if (process.env.ENVIRONMENT === "local") {
    provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
  } else if (process.env.ENVIRONMENT === "testnet") {
    provider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.matic.today"
    );
  } else {
    provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
  }

  const contract = new ethers.Contract(
    auctionContractAddress,
    Auction.abi,
    provider
  );
  const data = await contract.getActualBid(id);
  console.log(parseInt(JSON.parse(JSON.stringify(data)).hex));
  return {
    props: {
      auction: parseInt(JSON.parse(JSON.stringify(data)).hex),
    },
  };
}

const editPost = css`
  margin: 20px 0px;
`;

const contentContainer = css`
  margin-top: 60px;
  padding: 0px 40px;
  border-left: 1px solid #e7e7e7;
  border-right: 1px solid #e7e7e7;
  & img {
    max-width: 900px;
  }
`;
const hiddenInput = css`
  display: none;
`;

const mdEditor = css`
  margin-top: 40px;
`;

const titleStyle = css`
  margin-top: 40px;
  border: none;
  outline: none;
  background-color: inherit;
  font-size: 44px;
  font-weight: 600;
  &::placeholder {
    color: #999999;
  }
`;

const container = css`
  width: 800px;
  margin: 0 auto;
`;

const button = css`
  background-color: #fafafa;
  outline: none;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  font-size: 18px;
  padding: 16px 70px;
  box-shadow: 7px 7px rgba(0, 0, 0, 0.1);
`;
