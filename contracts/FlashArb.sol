// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IUniswapV2Pair} from "./interfaces/IUniswapV2Pair.sol";
import {IUniswapV2Router02} from "./interfaces/IUniswapV2Router02.sol";

/**
 * @title FlashArbV2
 * @dev Performs a flash swap on a Uniswap V2 pair, executes an arbitrage across two routers,
 *      and repays the borrowed amount plus fee in one transaction.
 */
contract FlashArbV2 {
    using SafeERC20 for IERC20;

    address public owner;
    uint256 constant FEE_NUMERATOR = 1000;
    uint256 constant FEE_DENOMINATOR = 997; // Uniswap V2 fee: 0.3%

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Initiates the flash arbitrage
     * @param pair The Uniswap V2 pair address to borrow from
     * @param amount0 Amount of token0 to borrow
     * @param amount1 Amount of token1 to borrow
     * @param path The swap path for the intermediate router (e.g. [tokenBorrowed, tokenX, tokenBorrowed])
     * @param router1 First router to swap through
     * @param router2 Second router to swap through
     */
    function startFlash(
        address pair,
        uint256 amount0,
        uint256 amount1,
        address[] calldata path,
        address router1,
        address router2
    ) external onlyOwner {
        // trigger flash swap; data passed to callback
        bytes memory data = abi.encode(path, router1, router2, pair);
        IUniswapV2Pair(pair).swap(amount0, amount1, address(this), data);
    }

    /**
     * @dev This function is called by the pair contract after the flash swap is initiated
     * @param sender The address that called swap (this contract)
     * @param amount0Out The amount of token0 sent
     * @param amount1Out The amount of token1 sent
     * @param data The encoded parameters (path, routers, pair)
     */
    function uniswapV2Call(
        address sender,
        uint256 amount0Out,
        uint256 amount1Out,
        bytes calldata data
    ) external {
        // decode parameters
        (
            address[] memory path,
            address router1,
            address router2,
            address pairAddress
        ) = abi.decode(data, (address[], address, address, address));

        // ensure call came from correct pair
        require(msg.sender == pairAddress, "Invalid pair callback");
        require(sender == address(this), "Not contract call");

        // Determine borrowed token and amount
        address borrowed = amount0Out > 0
            ? IUniswapV2Pair(pairAddress).token0()
            : IUniswapV2Pair(pairAddress).token1();
        uint256 amountBorrowed = amount0Out > 0 ? amount0Out : amount1Out;

        // Approve router1 to spend borrowed token
        IERC20(borrowed).safeApprove(router1, amountBorrowed);

        // First swap via router1: borrowed -> intermediate -> borrowed
        // expects full returned borrowed amount to repay
        uint[] memory amounts1 = IUniswapV2Router02(router1)
            .swapExactTokensForTokens(
                amountBorrowed,
                0,
                path,
                address(this),
                block.timestamp
            );

        // Approve router2 to spend result of first swap
        IERC20(path[1]).safeApprove(router2, amounts1[amounts1.length - 1]);

        // Second swap via router2: intermediate -> borrowed
        address[] memory reversePath = new address[](2);
        reversePath[0] = path[1];
        reversePath[1] = borrowed;
        uint[] memory amounts2 = IUniswapV2Router02(router2)
            .swapExactTokensForTokens(
                amounts1[amounts1.length - 1],
                0,
                reversePath,
                address(this),
                block.timestamp
            );

        // Calculate repayment amount: borrowed + 0.3% fee
        uint256 fee = ((amountBorrowed * 3) / 997) + 1;
        uint256 repayment = amountBorrowed + fee;

        // Ensure we have enough to repay
        require(
            amounts2[amounts2.length - 1] > repayment,
            "Arb not profitable"
        );

        // Repay flash swap
        IERC20(borrowed).safeTransfer(pairAddress, repayment);

        // Send profit to owner
        uint256 profit = amounts2[amounts2.length - 1] - repayment;
        IERC20(borrowed).safeTransfer(owner, profit);
    }
}
