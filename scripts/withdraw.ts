import { ethers, getNamedAccounts } from 'hardhat'

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract('FundMe', deployer)
  console.log('Withdrawing from contract...')
  const txResponse = await fundMe.withdraw()
  await txResponse.wait(1)
  console.log('Withdrawn')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
