/*
  Unit tests for the create-wallet library.
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
const CreateWalletLib = require('../../../src/lib/create-wallet')

describe('#create-wallet-lib', () => {
  let uut
  let sandbox

  beforeEach(() => {
    uut = new CreateWalletLib()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
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

    it('should catch, report, and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.bchjs.Mnemonic, 'generate').throws(new Error('test error'))

        await uut.createWallet()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })
})
