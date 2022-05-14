import { useState, useRef, useEffect } from "react"; // new
import { useRouter } from "next/router";
import { css } from "@emotion/css";
import { deedContractAddress, auctionContractAddress } from "../config";

import { ethers } from "ethers";

import Deed from "../artifacts/contracts/Deed.sol/Deed.json";

function createDeed() {
  const initialState = { tokenId: "mario" };

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
    <div className={container}>
      {loaded && (
        <div>
          <h1>Cosa vuoi vendere ?</h1>
          <input
            id="tokenId"
            name="tokenId"
            placeholder="tokenId"
            value={deed.tokenId}
            onChange={onChange}
          ></input>
          <button className={button} type="button" onClick={createToken}>
            Create Deed
          </button>
        </div>
      )}
    </div>
  );
}
const hiddenInput = css`
  display: none;
`;

const coverImageStyle = css`
  max-width: 800px;
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
export default createDeed;
