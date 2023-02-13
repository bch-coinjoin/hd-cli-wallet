/*
  Unit tests for the create-wallet library.
*/

// Global npm libraries
const assert = require('chai').assert

// Local libraries
const CreateWalletLib = require('../../../src/lib/create-wallet')

describe('#create-wallet-lib', () => {
  let uut

  beforeEach(() => {
    uut = new CreateWalletLib()
  })

  describe('#createWallet', () => {
    it('should create a new wallet', async () => {
      const result = await uut.createWallet()
      // console.log('result: ', result)

      assert.property(result, 'mnemonic')
      assert.property(result, 'derivation')
      assert.property(result, 'rootAddress')
      assert.property(result, 'balance')
      assert.property(result, 'nextAddress')
      assert.property(result, 'hasBalance')
      assert.property(result, 'addresses')
      assert.property(result, 'description')
    })
  })
})
