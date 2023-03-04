/*
  Unit tests for the utxos.js library
*/

// Global npm libraries
const clonedeep = require('lodash.clonedeep')
const assert = require('chai').assert
// const sinon = require('sinon')

// Local libraries
const UtxoLib = require('../../../src/lib/utxos.js')
const mockUtxosLib = require('../../mocks/utxos.mocks.js')

describe('#utxos-lib', () => {
  let uut
  let mockUtxos

  beforeEach(() => {
    uut = new UtxoLib()
    mockUtxos = clonedeep(mockUtxosLib)
  })

  describe('#selectCoinJoinUtxos', () => {
    it('should return a single UTXO', () => {
      const result = uut.selectCoinJoinUtxos(9000, mockUtxos.utxos01)
      // console.log('result: ', result)

      assert.equal(Array.isArray(result), true)
      assert.equal(result.length, 1)
      assert.isAbove(result[0].value, 9000)
    })

    it('should return three UTXOs', () => {
      const result = uut.selectCoinJoinUtxos(148000, mockUtxos.utxos01)
      // console.log('result: ', result)

      assert.equal(Array.isArray(result), true)
      assert.equal(result.length, 3)
    })

    it('should catch, report, and throw errors', () => {
      try {
        uut.selectCoinJoinUtxos()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err.message: ', err.message)
        assert.include(err.message, 'Cannot read')
      }
    })
  })
})
