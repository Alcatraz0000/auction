//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Deed is ERC721 {
    constructor() ERC721("Deed", "DEED") {}

    uint256 tokenIds = 0;

    function mintNewToken() public {
        tokenIds++;
        ERC721._mint(msg.sender, tokenIds);
    }

    function exists(uint256 _tokenId) public view returns (bool) {
        return ERC721._exists(_tokenId);
    }
    function getLastTokenId() public view returns (uint256){
        return tokenIds;
    }
}
