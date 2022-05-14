const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const Deed = await hre.ethers.getContractFactory("Deed");
  const deed = await Deed.deploy();

  await deed.deployed();

  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(deed.address);

  await auction.deployed();

  console.log("Deed deployed to:", deed.address);
  console.log("Auction deployed to:", auction.address);

  fs.writeFileSync(
    "./config.js",
    `
  export const deedContractAddress = "${deed.address}"
  export const auctionContractAddress = "${auction.address}"
  export const ownerAddress = "${deed.signer.address}"
  `
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
