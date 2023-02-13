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
  })
})
