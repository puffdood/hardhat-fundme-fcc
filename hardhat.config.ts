import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'solidity-coverage'
import 'hardhat-gas-reporter'
import 'dotenv/config'

const private_key = process.env.PRIVATE_KEY || ''

const config: HardhatUserConfig = {
  // solidity: '0.8.9',
  solidity: {
    compilers: [{ version: '0.8.9' }, { version: '0.8.0' }],
  },
  networks: {
    goerli: {
      url: process.env.GOERLI_URL || '',
      accounts: [private_key],
      chainId: 5,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
    token: 'MATIC',
    // coinmarketcap: process.env.CMC_API_KEY,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
}

export default config
