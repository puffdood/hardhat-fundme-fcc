import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { network } from 'hardhat'
import {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} from '../helper-hardhat-config'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  // const chainId = network.config.chainId

  // when going for localhost or hardhat, we want to use a mock
  if (developmentChains.includes(network.name)) {
    console.log('Local network detected. Deploying mocks...')
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    console.log('Mocks deployed')
    console.log('----------------------------------------------')
  }
}
func.tags = ['all', 'mocks']
export default func
