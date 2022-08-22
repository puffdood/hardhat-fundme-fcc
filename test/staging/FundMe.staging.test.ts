import { ethers, getNamedAccounts, network } from 'hardhat'
import { Address } from 'hardhat-deploy/types'
import { FundMe } from '../../typechain-types'
import { developmentChains } from '../../helper-hardhat-config'
import { assert } from 'chai'

developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', () => {
      let fundMe: FundMe
      let deployer: Address
      const sendValue = ethers.utils.parseEther('0.05')

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        const deployerBalance = await ethers.provider.getBalance(deployer)
        console.log(
          `deployer balance ${ethers.utils.formatEther(deployerBalance)}`,
        )
        fundMe = await ethers.getContract('FundMe', deployer)
      })

      it('allows people to fund', async () => {
        const tx = await fundMe.fund({ value: sendValue })
        await tx.wait(1)
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(
          endingBalance.toString(),
          ethers.utils.parseEther('0.05').toString(),
        )
      })

      it('allows people to withdraw', async () => {
        const tx = await fundMe.withdraw()
        await tx.wait(1)
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(
          endingBalance.toString(),
          ethers.utils.parseEther('0').toString(),
        )
      })
    })
