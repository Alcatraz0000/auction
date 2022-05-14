//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

abstract contract DeedInterface {
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );
    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 indexed _tokenId
    );

    function mintNewToken(address owner, uint256 tokenId) public virtual;

    function balanceOf(address _owner) external view virtual returns (uint256);

    function ownerOf(uint256 _tokenId) external view virtual returns (address);
    function getApproved(uint256 tokenId) public view virtual returns (address);

    function getLastTokenId() public view virtual returns (uint256);
    

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable virtual;

    function approve(address _approved, uint256 _tokenId)
        external
        payable
        virtual;

}

contract Auction {
    DeedInterface deedContract;

    event SellDeed(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );

    event newAuction(uint256 _tokenId, address _from);
    event newBid(uint256 _tokenId, uint256 _bid);

    uint256 tokenIds = 0;

    address private _owner;

    uint256 MaxTimeForAuction = 2 days;

    mapping(uint256 => address) TokenToSeller;
    mapping(uint256 => uint256) startedAuctionIn;

    mapping(uint256 => address) TokenToActuallyWinner;
    mapping(uint256 => uint256) tokenToBid;

    constructor(address _deedContract) {
        deedContract = DeedInterface(_deedContract);
        _owner = msg.sender;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function getDeedContractAddress() public view returns (address) {
        return msg.sender;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    modifier notTheSeller(uint256 _tokenId) {
        require(TokenToSeller[_tokenId] != msg.sender, "Seller cannot place a bid for its own auction");
        _;
    }

    function setDeedContractAddress(address _address) external onlyOwner {
        deedContract = DeedInterface(_address);
    }

    function createAuction(uint256 _tokenId) public {
        require(deedContract.getApproved(_tokenId) == address(this), "Contract ist allowed to take this deed");
        
        deedContract.transferFrom(msg.sender, address(this), _tokenId);
        TokenToSeller[_tokenId] = msg.sender;
        startedAuctionIn[_tokenId] = block.timestamp;
        emit newAuction( _tokenId, msg.sender);
    }

    function getSellerById(uint256 _tokenId) public view returns(address){
        return TokenToSeller[_tokenId];
    }

    function getStartAuction(uint256 _tokenId) public view returns(uint256){
        return startedAuctionIn[_tokenId];
    }

     function getActualyWinner(uint256 _tokenId) public view onlyOwner returns(address) {
        return TokenToActuallyWinner[_tokenId];
    }

      function getActualBid(uint256 _tokenId) public view returns(uint256) {
        return tokenToBid[_tokenId];
    }


    modifier onlyInProgress(uint256 _tokenId) {
        require(isEnded(_tokenId) == false);
        _;
    }

    function isEnded(uint256 _tokenId) public view returns (bool) {
        return  block.timestamp > startedAuctionIn[_tokenId] + MaxTimeForAuction;
    }

    function createBid(uint256 _tokenId, uint256 _bid)
        public
        onlyInProgress(_tokenId)
        notTheSeller(_tokenId)
    {
        /*
            require(msg.sender != TokenToActuallyWinner[_tokenId], "You're already in competition" )
            this could be a very very privacy issue, who want to know if is winning cal call and check!
        */
        if (tokenToBid[_tokenId] < _bid) {
            tokenToBid[_tokenId] = _bid;
            TokenToActuallyWinner[_tokenId] = msg.sender;
            emit newBid( _tokenId, _bid);
        }
    }
  

    function releaseDeed(uint256 _tokenId) public onlyOwner {
        address _to = TokenToActuallyWinner[_tokenId];
        if(_to == address(0x00)) 
            _to = TokenToSeller[_tokenId];
        deedContract.approve(_to, _tokenId);
        deedContract.transferFrom(address(this), _to, _tokenId);
        //send eth to user
        emit SellDeed(TokenToSeller[_tokenId], _to, _tokenId);
        _resetValueAuction(_tokenId);
    }

    function _resetValueAuction(uint256 _tokenId)private {
        TokenToSeller[_tokenId] = address(0x0);
        TokenToActuallyWinner[_tokenId] = address(0x0);
        startedAuctionIn[_tokenId] =0;
         tokenToBid[_tokenId]=0;
    }   

    function getActualyAuction() public view returns(uint256[] memory){
     uint256 tokenId = deedContract.getLastTokenId();
     uint256[] memory tmp = new uint256[](tokenId);
     
     uint256 counter=0;
     for(uint256 i = 0 ;i <= tokenId ; i++){
         if(!isEnded(i) && startedAuctionIn[i]!=0){ 
             tmp[counter] = i;
             counter++;
             }
     }
     uint256[] memory result = new uint256[](counter);  
     for(uint256 i = 0 ;i < counter; i++){
         result[i] = tmp[i];
     }
     return result;
    }

    /*function _restoreList(uint256[] memory tmp,bool needEnded) private view returns(uint256[] memory){
         uint256 counter=0;
        for(uint256 i = 0 ;i < tokenId ; i++){
            if(isEnded(i)==needEnded && startedAuctionIn[i]!=0){ 
                tmp[counter] = i;
                counter++;
                }
        }
        uint256[] memory result = new uint256[](counter);  
        for(uint256 i = 0 ;i < counter; i++){
            result[i] = tmp[i];
        }
    }*/

    function getEndedButNotCompleteAuction() public view onlyOwner returns(uint256[] memory){
        uint256 tokenId = deedContract.getLastTokenId();
        uint256[] memory tmp = new uint256[](tokenId);
        
        uint256 counter=0;
        
        for(uint256 i = 0 ;i <= tokenId ; i++){
            if(isEnded(i) && startedAuctionIn[i]!=0){ 
                tmp[counter] = i;
                counter++;
                }
        }
        uint256[] memory result = new uint256[](counter);  
        for(uint256 i = 0 ;i < counter; i++){
            result[i] = tmp[i];
        }
        return result;
    }
}
