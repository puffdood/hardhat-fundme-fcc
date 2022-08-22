import { expect, assert } from 'chai'
import { ethers, getNamedAccounts, deployments, network } from 'hardhat'
import { Address } from 'hardhat-deploy/types'
import { FundMe, MockV3Aggregator } from '../../typechain-types'
import { developmentChains } from '../../helper-hardhat-config'

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', () => {
      let fundMe: FundMe
      let mockV3Aggregator: MockV3Aggregator
      let deployer: Address
      const sendValue = ethers.utils.parseEther('1')

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(['all'])
        mockV3Aggregator = await ethers.getContract(
          'MockV3Aggregator',
          deployer,
        )
        fundMe = await ethers.getContract('FundMe', deployer)
      })

      describe('constructor', () => {
        it('Sets the aggregator addresses correctly', async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe('fund', () => {
        it('Fails if the user doesnt send enough ETH', async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            'Value sent is too low',
          )
        })

        it('ETH converted correctly', async () => {
          const val = await fundMe.conversionRate(sendValue)
          assert.equal(ethers.utils.formatEther(val), '2000.0')
        })

        it('Updates the amount funded data structure', async () => {
          await expect(fundMe.fund({ value: sendValue })).to.not.be.reverted
          const response = await fundMe.addressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })

        it('Adds funder to array of funders', async () => {
          await expect(fundMe.fund({ value: sendValue })).to.not.be.reverted
          const funder = await fundMe.funders(0)
          assert.equal(funder, deployer)
        })
      })

      describe('withdraw', () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it('Withdraw ETH from a single founder', async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer,
          )
          // Act
          const txResponse = await fundMe.withdraw()
          const txReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer,
          )
          // Assert
          assert.equal(
            endingFundMeBalance.toString(),
            ethers.utils.parseEther('0').toString(),
          )
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString(),
          )
        })

        it('Allows us to withdraw with multiple funders', async () => {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer,
          )

          // Act
          const txResponse = await fundMe.withdraw()
          const txReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          // Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer,
          )

          assert.equal(
            endingFundMeBalance.toString(),
            ethers.utils.parseEther('0').toString(),
          )
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString(),
          )

          await expect(fundMe.funders(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            const endingBalance = await fundMe.addressToAmountFunded(
              accounts[i].address,
            )
            assert.equal(
              endingBalance.toString(),
              ethers.utils.parseEther('0').toString(),
            )
          }
        })

        it('Only allows the owner to withdraw', async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await fundMe.connect(attacker)
          await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })
      })

      describe('cheaper withdraw....?', () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it('Withdraw ETH from a single founder', async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer,
          )
          // Act
          const txResponse = await fundMe.cheaperWithdraw()
          const txReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer,
          )
          // Assert
          assert.equal(
            endingFundMeBalance.toString(),
            ethers.utils.parseEther('0').toString(),
          )
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString(),
          )
        })

        it('allows us to withdraw with multiple funders', async () => {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer,
          )

          // Act
          const txResponse = await fundMe.cheaperWithdraw()
          const txReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          // Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer,
          )

          assert.equal(
            endingFundMeBalance.toString(),
            ethers.utils.parseEther('0').toString(),
          )
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString(),
          )

          await expect(fundMe.funders(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            const endingBalance = await fundMe.addressToAmountFunded(
              accounts[i].address,
            )
            assert.equal(
              endingBalance.toString(),
              ethers.utils.parseEther('0').toString(),
            )
          }
        })

        it('only allows the owner to withdraw', async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await fundMe.connect(attacker)
          await expect(attackerConnectedContract.cheaperWithdraw()).to.be
            .reverted
        })
      })
    })
