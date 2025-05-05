// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ArbExecutor is FlashLoanSimpleReceiverBase {
    using SafeERC20 for IERC20;

    address internal owner;
    IUniswapV2Router02 internal v2Router;
    IV3SwapRouter internal v3Router;
    IQuoterV2 internal quoter;

    enum Dex {
        V2,
        V3
    }
    struct RouteStep {
        Dex dex;
        address[] path;
        uint24 fee;
    }

    constructor(
        IPoolAddressesProvider provider,
        address _v2Router,
        address _v3Router,
        address _quoter
    ) FlashLoanSimpleReceiverBase(provider) {
        owner = msg.sender;
        v2Router = IUniswapV2Router02(_v2Router);
        v3Router = IV3SwapRouter(_v3Router);
        quoter = IQuoterV2(_quoter);
    }

    function getOwner() external view returns (uint256 backTest) {
        backTest = 20;
        console.log(owner);
    }

    function initFlashLoan(
        address asset,
        uint256 amount,
        RouteStep[] calldata steps
    ) external {
        console.log("start flash loan");
        POOL.flashLoanSimple(
            address(this),
            asset,
            amount,
            abi.encode(steps),
            0
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address,
        bytes calldata params
    ) external override returns (bool) {
        uint256 assetBalance = IERC20(asset).balanceOf(address(this));
        RouteStep[] memory steps = abi.decode(params, (RouteStep[]));
        uint256 currentAmount = amount;

        for (uint i = 0; i < steps.length; i++) {
            if (steps[i].dex == Dex.V2) {
                currentAmount = _swapV2(steps[i].path, currentAmount);
            } else {
                currentAmount = _swapV3(
                    steps[i].path[0],
                    steps[i].path[1],
                    steps[i].fee,
                    currentAmount
                );
            }
        }
        uint256 totalDebt = amount + premium;

        IERC20(asset).approve(address(POOL), totalDebt);

        if (currentAmount > totalDebt) {
            IERC20(asset).transfer(owner, currentAmount - totalDebt);
        }
        return true;
    }

    function pathSwap(
        uint256 amount,
        RouteStep[] calldata steps
    ) external returns (bool) {
        require(steps.length > 0, "No steps");
        address tokenIn = steps[0].path[0];
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);
        uint256 currentAmount = amount;

        for (uint i = 0; i < steps.length; i++) {
            if (steps[i].dex == Dex.V2) {
                currentAmount = _swapV2(steps[i].path, currentAmount);
            } else {
                currentAmount = _swapV3(
                    steps[i].path[0],
                    steps[i].path[1],
                    steps[i].fee,
                    currentAmount
                );
            }
        }
        IERC20(tokenIn).transfer(msg.sender, currentAmount);
        return true;
    }

    function _swapV2(
        address[] memory path,
        uint256 amountIn
    ) internal returns (uint256) {
        IERC20(path[0]).safeIncreaseAllowance(address(v2Router), amountIn);

        uint[] memory outs = v2Router.swapExactTokensForTokens(
            amountIn,
            0,
            path,
            address(this),
            block.timestamp
        );
        console.log(outs[outs.length - 1]);
        return outs[outs.length - 1];
    }

    function _swapV3(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn
    ) internal returns (uint256) {
        IERC20(tokenIn).safeIncreaseAllowance(address(v3Router), amountIn);
        uint256 amountOutMin = _getV3Quote(tokenIn, tokenOut, fee, amountIn);
        console.log("amount out min", amountOutMin);
        return
            v3Router.exactInputSingle(
                IV3SwapRouter.ExactInputSingleParams({
                    tokenIn: tokenIn,
                    tokenOut: tokenOut,
                    fee: fee,
                    recipient: address(this),
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMin,
                    sqrtPriceLimitX96: 0
                })
            );
    }

    function _getV3Quote(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn
    ) private returns (uint256 amountOutMin) {
        (uint256 amountOut, , , ) = quoter.quoteExactInputSingle(
            IQuoterV2.QuoteExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                amountIn: amountIn,
                fee: fee,
                sqrtPriceLimitX96: 0
            })
        );
        amountOutMin = (amountOut * 99) / 100;
    }
}
