import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { css } from "@emotion/css";
import { useContext } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import Link from "next/link";
import { AccountContext } from "../context";

import { deedContractAddress, auctionContractAddress } from "../config";
import Auction from "../artifacts/contracts/Auction.sol/Auction.json";

export default function Home(props) {
  const { auction } = props;
  const account = useContext(AccountContext);

  const router = useRouter();

  return (
    <div>
      <div className={postList}>
        <p>Actually Auction</p>
        {
          /* map over the posts array and render a button with the post title */
          auction.map((post, index) => (
            <Link href={`/auction/${parseInt(post.hex)}`} key={index}>
              <a>
                <div key={index} className={linkStyle}>
                  <p className={postTitle}>Deed #{parseInt(post.hex)}</p>
                  <div className={arrowContainer}></div>
                </div>
              </a>
            </Link>
          ))
        }
        {auction.length == 0 && (
          <div className={linkStyle}>
            <p className={postTitle}>Non Ci sta nada</p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
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
  const data = await contract.getActualyAuction();
  console.log(JSON.parse(JSON.stringify(data)));
  return {
    props: {
      auction: JSON.parse(JSON.stringify(data)),
    },
  };
}

const arrowContainer = css`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  padding-right: 20px;
`;

const postTitle = css`
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  margin: 0;
  padding: 20px;
`;

const linkStyle = css`
  border: 1px solid #ddd;
  margin-top: 20px;
  border-radius: 8px;
  display: flex;
`;

const postList = css`
  width: 700px;
  margin: 0 auto;
  padding-top: 50px;
`;

const container = css`
  display: flex;
  justify-content: center;
`;

const buttonStyle = css`
  margin-top: 100px;
  background-color: #fafafa;
  outline: none;
  border: none;
  font-size: 44px;
  padding: 20px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 7px rgba(0, 0, 0, 0.1);
`;

const arrow = css`
  width: 35px;
  margin-left: 30px;
`;

const smallArrow = css`
  width: 25px;
`;
