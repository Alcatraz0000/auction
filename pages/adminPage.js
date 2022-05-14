import { useState, useRef, useEffect } from "react"; // new
import { useRouter } from "next/router";
import { css } from "@emotion/css";
import { deedContractAddress, auctionContractAddress } from "../config";

import { ethers } from "ethers";

import Auction from "../artifacts/contracts/Auction.sol/Auction.json";
import Deed from "../artifacts/contracts/Deed.sol/Deed.json";

function adminPage(props) {
  const initialState = { tokenId: "mario" };
  const { auction } = props;

  let exist;

  const [loaded, setLoaded] = useState(false);
  const [deed, setDeed] = useState(initialState);
  const router = useRouter();

  const { tokenId } = deed;

  let provider;
  let signer;

  useEffect(() => {
    setTimeout(() => {
      /* delay rendering buttons until dynamic import is complete */
      setLoaded(true);
    }, 500);
  }, []);

  function onChange(e) {
    setDeed(() => ({ ...deed, [e.target.name]: e.target.value }));
  }

  async function createToken() {
    console.log("creo il _tokenId " + tokenId);
    if (typeof window.ethereum !== "undefined") {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const contract = new ethers.Contract(
        deedContractAddress,
        Deed.abi,
        signer
      );
      console.log("contract: ", contract);
      try {
        const val = await contract.mintNewToken();
        /* optional - wait for transaction to be confirmed before rerouting */
        await provider.waitForTransaction(val.hash);
        console.log("val: ", val);
        exist = true;
      } catch (err) {
        //token dont exist !
        console.log("Error: ", err);
      }
    }
  }

  return (
    <div>
      <div className={postList}>
        <p>Ended Auction</p>
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
  const data = await contract.getEndedButNotCompleteAuction();
  console.log(JSON.parse(JSON.stringify(data)));
  return {
    props: {
      auction: JSON.parse(JSON.stringify(data)),
    },
  };
}

export default adminPage;

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
