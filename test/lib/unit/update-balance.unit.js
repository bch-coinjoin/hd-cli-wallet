/*
  Unit tests for the update-balance library.
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
const UpdateBalanceLib = require('../../../src/lib/update-balance')
const CreateWalletLib = require('../../../src/lib/create-wallet')

describe('#update-balance-lib', () => {
  let walletInfo
  let uut
  let sandbox

  before(async () => {
    const createWalletLib = new CreateWalletLib()
    walletInfo = await createWalletLib.createWallet()
  })

  beforeEach(() => {
    uut = new UpdateBalanceLib()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#constructor', () => {
    it('should let the user override the restURL', () => {
      const testUrl = 'http://test.com'
      uut = new UpdateBalanceLib({ restURL: testUrl })

      assert.equal(uut.bchConsumer.restURL, testUrl)
    })
  })

  describe('#getAddressData', () => {
    it('should retrieve data on 20 addresses from the wallet', async () => {
      // console.log('walletInfo: ', walletInfo)
      // Mock dependencies and force desired code path
      sandbox.stub(uut.bchConsumer.bch, 'getBalance').resolves({
        balances: [{
          balance: {
            confirmed: 0,
            unconfirmed: 0
          },
          address: walletInfo.rootAddress
        }]
      })
      sandbox.stub(uut.bchConsumer.bch, 'getUtxos').resolves({
        data: [{
          address: walletInfo.rootAddress,
          utxos: {
            address: walletInfo.rootAddress,
            bchUtxos: [],
            slpUtxos: {
              type1: {
                tokens: [],
                mintBatons: []
              },
              group: {
                tokens: [],
                mintBatons: []
              },
              nft: {
                tokens: []
              }
            }
          }
        }]
      })

      const result = await uut.getAddressData({ walletInfo, index: 0, limit: 5 })
      // console.log('result: ', JSON.stringify(result, null, 2))

      assert.property(result, 'addresses')
      assert.property(result, 'balances')
      assert.property(result, 'utxos')

      // There should be 5 addresses generated
      assert.equal(result.addresses.length, 5)

      // There should be a 'total' in the balances object
      assert.property(result.balances[0].balance, 'total')

      // There should be an hdIndex property in the balances object
      assert.property(result.balances[0], 'hdIndex')

      // There should be an hdIndex property in each address UTXO object
      assert.property(result.utxos[0], 'hdIndex')
    })

    it('should throw error if index is not supplied', async () => {
      try {
        await uut.getAddressData({ walletInfo })

        assert.equal(true, false, 'unexpected result!')
      } catch (err) {
        // console.log(`err: ${util.inspect(err)}`)
        assert.include(err.message, 'index must be supplied as a number')
      }
    })

    it('should throw error if limit is not supplied', async () => {
      try {
        await uut.getAddressData({ walletInfo, index: 0 })

        assert.equal(true, false, 'unexpected result!')
      } catch (err) {
        // console.log(`err: ${util.inspect(err)}`)
        assert.include(
          err.message,
          'limit must be supplied as a non-zero number'
        )
      }
    })

    it('should throw error if limit is over 20', async () => {
      try {
        await uut.getAddressData({ walletInfo, index: 0, limit: 40 })

        assert.equal(true, false, 'unexpected result!')
      } catch (err) {
        // console.log(`err: ${util.inspect(err)}`)
        assert.include(err.message, 'limit must be 20 or less')
      }
    })
  })

  describe('#getAllAddressData', () => {
    it('should get data for the last 100 addresses in the wallet', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'getAddressData').resolves({
        addresses: ['a'],
        balances: ['b'],
        utxos: ['c']
      })

      walletInfo.nextAddress = 150

      const result = await uut.getAllAddressData({ walletInfo })
      // console.log('result: ', result)

      // Call should make 5 API calls, so the length of data should be 5 elements long.
      assert.equal(result.addresses.length, 5)
      assert.equal(result.balances.length, 5)
      assert.equal(result.utxos.length, 5)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'getAddressData').rejects(new Error('test error'))

        walletInfo.nextAddress = 150

        await uut.getAllAddressData({ walletInfo })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })

    it('should scan entire wallet when scanEntireWallet flag is true', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'getAddressData').resolves({
        addresses: ['a'],
        balances: ['b'],
        utxos: ['c']
      })

      walletInfo.nextAddress = 150

      const result = await uut.getAllAddressData({ walletInfo, scanEntireWallet: true })
      // console.log('result: ', result)

      // A wallet with a nextAddress of 150 should make 8 API calls, so the
      // length of data should be 8 elements long.
      assert.equal(result.addresses.length, 8)
      assert.equal(result.balances.length, 8)
      assert.equal(result.utxos.length, 8)
    })
  })
})
