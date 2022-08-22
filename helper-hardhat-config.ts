interface NetworkConfig {
  [index: number]: {
    name: string
    ethUsdPriceFeed: string
    blockConfirmations?: number
  }
}

const networkConfig: NetworkConfig = {
  5: {
    name: 'goerli',
    ethUsdPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    blockConfirmations: 6,
  },
}

const developmentChains = ['hardhat', 'localhost']

const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

export { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
