# test-erc20forwarder

Problem statement -> Allowing users to transfer ERC20 tokens(USDC/DAI) and pay gas fees for the transfer in same tokens.

Current implementation -> As USDC/DAI are gasless complaint, we have setup everything in dashboard and then we are directly calling transfer function from DAI.
