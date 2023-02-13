/*
  Integration tests for the update-balance.js library.
*/

// Global npm libraries
const assert = require('chai').assert

// Local libraries
const testUtil = require('../../util/test-util')
const UpdateBalanceLib = require('../../../src/lib/update-balance')
const CreateWalletLib = require('../../../src/lib/create-wallet')

const restURL = 'https://bch-consumer-anacortes-wa-usa.fullstackcash.nl'

describe('#update-balance-lib', () => {
  let walletInfo
  let uut

  before(async () => {
    // testUtil.restoreWallet()

    const createWalletLib = new CreateWalletLib()
    walletInfo = await createWalletLib.createWallet()
  })

  beforeEach(() => {
    uut = new UpdateBalanceLib({ restURL })

    // sandbox = sinon.createSandbox()
  })

  describe('#getAddressData', () => {
    it('should retrieve data on 20 addresses from the wallet', async () => {
      const result = await uut.getAddressData({ walletInfo, index: 60, limit: 5 })
      console.log('result: ', JSON.stringify(result, null, 2))

      assert.property(result, 'addresses')
      assert.property(result, 'balances')
      assert.property(result, 'utxos')
    })
  })
})
