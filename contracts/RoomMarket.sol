// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * 极简版 RoomMarket 合约
 *
 * 目标：为「人人皆可做市」的现场 Demo 提供一条真实的上链路径，
 * 不做复杂结算，只记录「谁在什么市场标题上，选择了哪个选项，下注了多少」。
 */
contract RoomMarket {
    event BetPlaced(
        address indexed user,
        string marketTitle,
        uint256 option,
        uint256 amount
    );

    /**
     * 任何人都可以调用，任何标题都可以传进来：
     * - marketTitle：当前前端市场的标题（例如「今晚谁是冠军？」）
     * - option：前端里选项的 index（0,1,2...）
     * - msg.value：下注金额（单位：wei）
     */
    function placeBet(
        string calldata marketTitle,
        uint256 option
    ) external payable {
        require(bytes(marketTitle).length > 0, "title required");
        require(msg.value > 0, "need value");

        emit BetPlaced(msg.sender, marketTitle, option, msg.value);
    }
}
