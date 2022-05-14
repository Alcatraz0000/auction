const { ethers, network } = require("hardhat");
const { expect } = require("chai");

describe("Deed", async function () {
  let contractInstance;
  beforeEach(async function () {
    address = await ethers.getSigners();
    const Deed = await ethers.getContractFactory("Deed");
    contractInstance = await Deed.deploy();
  });

  context("try mint ", async () => {
    it("should be able to mint", async () => {
      let result = await contractInstance.mintNewToken();
      expect(result.from).to.equal(address[0].address);
    });
  });
  context("try to trasfer ", async () => {
    it("should be able to mint and trasfer to Other ", async () => {
      let result = await contractInstance.mintNewToken();
      expect(result.from).to.equal(address[0].address);
      result = await contractInstance.transferFrom(
        address[0].address,
        address[1].address,
        1
      );
      result = await contractInstance.ownerOf(1);
      expect(result).to.equal(address[1].address);
    });
  });
});

describe("Auction", async function () {
  let contractInstance;
  let deedContract;
  let _tokenId = 54;
  beforeEach(async function () {
    address = await ethers.getSigners();
    const Deed = await ethers.getContractFactory("Deed");
    deedContract = await Deed.deploy();
    const Auction = await ethers.getContractFactory("Auction");
    contractInstance = await Auction.deploy(deedContract.address);
  });

  context("try create Deed and Audction ", async () => {
    it("should be able to create Audiction ", async () => {
      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);
    });
  });
  context("try create check Auction data  ", async () => {
    it("should be able to verify the seller  ", async () => {
      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      result = await contractInstance.getSellerById(1);
      expect(result).to.equal(address[1].address);
    });

    it("should be able to verify the starting date of Auction  ", async () => {
      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);

      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      result = await contractInstance.getStartAuction(1);
    });
    it("should be able to verify if Auction is ended  ", async () => {
      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);

      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      result = await contractInstance.isEnded(1);
      expect(result).to.be.false;

      await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 2 + 1]);
      await network.provider.send("evm_mine");

      result = await contractInstance.isEnded(1);
      expect(result).to.be.true;
    });
  });

  context("Check if bid work  ", async () => {
    it("should be able to place a bid ", async () => {
      let bidValue = 5;

      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await contractInstance.connect(address[2]).createBid(1, bidValue);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[2].address);

      result = await contractInstance.getActualBid(1);
      expect(result).to.equal(bidValue);
    });

    it("should be able to overPass a bid ", async () => {
      let bidValue = 5;
      let bidValue2 = 10;

      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await contractInstance.connect(address[2]).createBid(1, bidValue);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[2].address);

      result = await contractInstance.getActualBid(1);
      expect(result).to.equal(bidValue);

      await contractInstance.connect(address[3]).createBid(1, bidValue2);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[3].address);

      result = await contractInstance.getActualBid(1);
      expect(result).to.equal(bidValue2);
    });

    it("should be able to not overPass a bid ", async () => {
      let bidValue = 5;
      let bidValue2 = 2;

      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await contractInstance.connect(address[2]).createBid(1, bidValue);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[2].address);

      result = await contractInstance.getActualBid(1);
      expect(result).to.equal(bidValue);

      await contractInstance.connect(address[3]).createBid(1, bidValue2);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[2].address);

      result = await contractInstance.getActualBid(1);
      expect(result).to.equal(bidValue);
    });
    it("should be able to releaseDeed to winner  ", async () => {
      let bidValue = 5;
      let bidValue2 = 2;

      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await contractInstance.connect(address[2]).createBid(1, bidValue);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[2].address);

      result = await contractInstance.getActualBid(1);
      expect(result).to.equal(bidValue);

      await contractInstance.releaseDeed(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(address[2].address);
    });

    it("should be able to create New Auction for same Deed  ", async () => {
      let bidValue = 5;
      let bidValue2 = 2;

      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await contractInstance.connect(address[2]).createBid(1, bidValue);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[2].address);

      result = await contractInstance.getActualBid(1);
      expect(result).to.equal(bidValue);

      await contractInstance.releaseDeed(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(address[2].address);

      result = await deedContract
        .connect(address[2])
        .approve(contractInstance.address, 1);

      result = await contractInstance.connect(address[2]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await contractInstance.connect(address[1]).createBid(1, bidValue);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[1].address);

      result = await contractInstance.getActualBid(1);
      expect(result).to.equal(bidValue);

      await contractInstance.releaseDeed(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(address[1].address);
    });
  });

  context("Check if Auction return work  ", async () => {
    it("should be able to return Actualy Auction ", async () => {
      let bidValue = 5;

      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 2);

      await contractInstance.connect(address[1]).createAuction(2);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 3);

      await contractInstance.connect(address[1]).createAuction(3);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      result = await contractInstance.getActualyAuction();
      expect(result.length).to.equal(3);
    });

    it("should be able to return Ended Auction ", async () => {
      let bidValue = 5;

      let result = await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 1);

      await contractInstance.connect(address[1]).createAuction(1);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await contractInstance.connect(address[2]).createBid(1, bidValue);
      result = await contractInstance.getActualyWinner(1);
      expect(result).to.equal(address[2].address);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);
      await network.provider.send("evm_mine");

      await deedContract.connect(address[1]).mintNewToken();
      result = await deedContract
        .connect(address[1])
        .approve(contractInstance.address, 2);

      await contractInstance.connect(address[1]).createAuction(2);
      result = await deedContract.ownerOf(1);
      expect(result).to.equal(contractInstance.address);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);
      await network.provider.send("evm_mine");

      result = await contractInstance.getActualyAuction();
      expect(result.length).to.equal(1);

      result = await contractInstance.getEndedButNotCompleteAuction();
      expect(result.length).to.equal(1);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24 + 1]);
      await network.provider.send("evm_mine");

      result = await contractInstance.getEndedButNotCompleteAuction();
      expect(result.length).to.equal(2);

      await contractInstance.releaseDeed(1);
      result = await contractInstance.getEndedButNotCompleteAuction();
      expect(result.length).to.equal(1);

      await contractInstance.releaseDeed(2);
      result = await contractInstance.getEndedButNotCompleteAuction();
      expect(result.length).to.equal(0);

      result = await contractInstance.getActualyAuction();
      expect(result.length).to.equal(0);
    });
  });
});
