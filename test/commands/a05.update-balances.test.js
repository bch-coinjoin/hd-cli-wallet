/*
  TODO:

*/

// Public NPM libraries.
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries.
const testUtil = require('../util/test-util')

// File to be tested.
const UpdateBalances = require('../../src/commands/update-balances')

// Mock data

// Inspect utility used for debugging.
const util = require('util')
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true,
  depth: 1
}

// Set default environment variables for unit tests.
if (!process.env.TEST) process.env.TEST = 'unit'

describe('#update-balances.js', () => {
  let sandbox
  let uut

  before(() => {
    testUtil.restoreWallet()
  })

  beforeEach(() => {
    uut = new UpdateBalances()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#validateFlags', () => {
    it('should throw error if name is not supplied.', () => {
      try {
        uut.validateFlags({})
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet with the -n flag',
          'Expected error message.'
        )
      }
    })

    it('should return true if all flags pass validation', () => {
      const flags = {
        name: 'test123'
      }

      const result = uut.validateFlags(flags)

      assert.equal(result, true)
    })
  })

  describe('#updateBalances', () => {
    it('should update the balances in the wallet', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.updateBalanceLib, 'getAllAddressData').resolves()
      sandbox.stub(uut.updateBalanceLib, 'generateHasBalance').returns()
      sandbox.stub(uut.updateBalanceLib, 'sumBalances').returns()
      sandbox.stub(uut.appUtils, 'saveWallet').resolves()

      const flags = {
        name: 'test123'
      }

      const result = await uut.updateBalances(flags)
      // console.log('result: ', result)

      // Function will return the wallet object. Assert expected properties exist.
      assert.property(result, 'mnemonic')
      assert.property(result, 'balanceTotalSat')
      assert.property(result, 'hasBalance')
    })

    it('should catch, report, and throw errors', async () => {
      try {
        await uut.updateBalances()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#run', () => {
    it('should run the subfunctions', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'parse').returns({ flags: { name: 'test123' } })
      sandbox.stub(uut, 'updateBalances').resolves({})

      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should return false on error', async () => {
      const result = await uut.run()
      assert.equal(result, false)
    })
  })
})
