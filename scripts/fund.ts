import { ethers, getNamedAccounts } from 'hardhat'

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract('FundMe', deployer)
  console.log('Funding contract...')
  const txResponse = await fundMe.fund({
    value: ethers.utils.parseEther('0.05'),
  })
  await txResponse.wait(1)
  console.log('Funded')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
