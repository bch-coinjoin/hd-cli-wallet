/*
  Unit tests for the get-address command.
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs')

// Local libraries
const CreateWallet = require('../../src/commands/create-wallet')
const GetAddress = require('../../src/commands/get-address')
// const config = require('../../config')
const { bitboxMock } = require('../mocks/bitbox')
const filename = `${__dirname.toString()}/../../wallets/test123.json`
// const AppUtils = require('../../src/util')

// Set default environment variables for unit tests.
// if (!process.env.TEST) process.env.TEST = 'unit'

const deleteFile = () => {
  const prom = new Promise((resolve, reject) => {
    fs.unlink(filename, () => {
      resolve(true)
    }) // Delete wallets file
  })
  return prom
}

describe('get-address', () => {
  let bchjs
  let getAddress
  let sandbox
  // let appUtils

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    getAddress = new GetAddress()
    // appUtils = new AppUtils()

    // By default, use the mocking library instead of live calls.
    bchjs = bitboxMock
    getAddress.bchjs = bchjs
    await deleteFile()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#getAddress()', () => {
    it('increments the nextAddress property of the wallet.', async () => {
      // Create a wallet
      const createWallet = new CreateWallet()
      const initialWalletInfo = await createWallet.createWallet(filename)

      // Record the initial nextAddress property. This is going to be 1 for a new wallet.
      // const firstAddressIndex = initialWalletInfo.nextAddress

      // Generate a new address
      const result = await getAddress.getAddress({ walletInfo: initialWalletInfo, flags: {} })
      // console.log('result: ', result)

      // Assert that the nextAddress property has been incremented.
      assert.equal(result.newWalletInfo.nextAddress, 2)
    })

    it('returns a cash address', async () => {
      // Create a testnet wallet
      const createWallet = new CreateWallet()
      const initialWalletInfo = await createWallet.createWallet(filename)

      // Generate a new address
      const { newAddress } = await getAddress.getAddress({ walletInfo: initialWalletInfo, flags: {} })

      // Assert that the returned address is mainnet address.
      assert.include(newAddress, 'bitcoincash:')
    })

    it('returns a simpleledger address', async () => {
      // Create a testnet wallet
      const createWallet = new CreateWallet()
      const initialWalletInfo = await createWallet.createWallet(filename)

      const flags = {
        token: true
      }

      // Generate a new address
      const result = await getAddress.getAddress({ walletInfo: initialWalletInfo, flags })
      // console.log(`result: `, result)

      // Assert that the returned address is SLP address.
      assert.include(result.newAddress, 'simpleledger:')
    })
  })

  describe('#validateFlags()', () => {
    // This validation function is called when the program is executed from the command line.
    it('validateFlags() should throw error if name is not supplied.', () => {
      try {
        getAddress.validateFlags({})

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet with the -n flag',
          'Expected error message.'
        )
      }
    })
  })

  describe('#run()', () => {
    it('should run the run() function', async () => {
      const flags = {
        name: 'test123'
      }
      // Mock methods that will be tested elsewhere.
      const createWallet = new CreateWallet()
      await createWallet.createWallet(filename)

      sandbox.stub(getAddress, 'parse').returns({ flags: flags })

      // Reduce screen spam
      sandbox.stub(getAddress.qrcode, 'generate').returns()
      sandbox.stub(getAddress, 'log').returns()

      const addr = await getAddress.run()
      const index = addr.indexOf('bitcoincash:')
      assert.isAbove(index, -1, 'cash address')
    })

    it('should return error message on empty flags', async () => {
      sandbox.stub(getAddress, 'parse').returns({ flags: {} })

      const result = await getAddress.run()
      // console.log('result: ', result)

      assert.equal(result, 0)
    })

    it('should handle an error without a message', async () => {
      // Force error in run() function.
      sandbox.stub(getAddress, 'parse').throws({})

      const result = await getAddress.run()
      // console.log('result: ', result)

      assert.equal(result, 0)
    })
  })
})
