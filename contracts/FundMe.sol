// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PriceConverter.sol";

contract FundMe is Ownable {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    AggregatorV3Interface private s_priceFeed;

    event Funded(address indexed from, uint256 amount);

    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function withdraw() external onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");
    }

    function cheaperWithdraw() external onlyOwner {
        address[] memory fs = s_funders;
        for (uint256 i = 0; i < fs.length; i++) {
            address funder = fs[i];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");
    }

    function conversionRate(uint256 ethAmount) public view returns (uint256) {
        return ethAmount.getConversionRate(s_priceFeed);
    }

    function fund() public payable {
        uint256 minimumUSDAmount = 50 * 10**18;
        require(
            msg.value.getConversionRate(s_priceFeed) >= minimumUSDAmount,
            "Value sent is too low"
        );
        s_addressToAmountFunded[msg.sender] = msg.value;
        s_funders.push(msg.sender);
        emit Funded(msg.sender, msg.value);
    }

    function addressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function funders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
