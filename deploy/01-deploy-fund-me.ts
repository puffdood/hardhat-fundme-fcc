import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { network } from 'hardhat'
import { developmentChains, networkConfig } from '../helper-hardhat-config'
import verify from '../utils/verify'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId!

  let ethUsdPriceFeeAddress: string
  let waitConfirms: number | undefined
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator')
    ethUsdPriceFeeAddress = ethUsdAggregator.address
    waitConfirms = undefined
  } else {
    console.log(`Getting ethUsdPriceFeeAddress for chain id ${chainId}`)
    ethUsdPriceFeeAddress = networkConfig[chainId]['ethUsdPriceFeed']
    waitConfirms = networkConfig[chainId]['blockConfirmations']
  }

  const args = [ethUsdPriceFeeAddress] || 1
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitConfirms,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args)
  }
  console.log('----------------------------------------------')
}
func.tags = ['all', 'fundme']
export default func
