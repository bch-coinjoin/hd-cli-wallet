/*
  This library is handles transactions.
*/

// Global npm libraries
const Bitcoin = require('@psf/bitcoincashjs-lib')

// Local libraries
const AppUtils = require('../util')

class Transactions {
  constructor () {
    // Encapsulate dependencies
    this.util = new AppUtils()
  }

  // This function takes an unsigned TX as input, as well as an array of UTXOs
  // belonging to this wallet (which are included in the unsigned TX).
  // It signs the inputs of the TX for the UTXOs belonging to this wallet,
  // then sends the partially-signed TX back to the colab-coinjoin-api.
  async signCoinJoinTx (inObj = {}) {
    try {
      const { unsignedHex, utxosToSign, walletInfo } = inObj
      console.log('unsignedHex: ', unsignedHex)
      console.log(`utxosToSign: ${JSON.stringify(utxosToSign, null, 2)}`)
      console.log(`walletInfo: ${JSON.stringify(walletInfo, null, 2)}`)

      // Input validation
      if (!unsignedHex) {
        throw new Error('unsignedHex must be a string containing a hexidecimal serialized transaction')
      }
      if (!walletInfo) {
        throw new Error('walletInfo object is required in order to sign transaction')
      }

      // Convert the hex string version of the transaction into a Buffer.
      const txBuf = Buffer.from(unsignedHex, 'hex')

      // Generate a Transaction object from the transaction binary data.
      const txObj = Bitcoin.Transaction.fromBuffer(txBuf)
      // console.log('txObj: ', txObj)

      // Instantiate the Transaction Builder.
      const txBuilder = Bitcoin.TransactionBuilder.fromTransaction(txObj, 'mainnet')
      // console.log('txBuilder: ', txBuilder)

      // console.log('txBuilder.tx.ins: ', JSON.stringify(txBuilder.tx.ins, null, 2))

      // Loop through each UTXO and get the private key for it
      for (let i = 0; i < utxosToSign.length; i++) {
        const thisUtxo = utxosToSign[i]

        const hdData = await this.util.getPrivateKey(walletInfo, thisUtxo.hdIndex)

        if (hdData.cashAddress !== thisUtxo.address) {
          console.log(`thisUtxo: ${JSON.stringify(thisUtxo, null, 2)}`)
          console.log(`hdData: ${JSON.stringify(hdData, null, 2)}`)
          throw new Error('Addresses generated by HD index do not match')
        }

        console.log(`thisUtxo: ${JSON.stringify(thisUtxo, null, 2)}`)
        // console.log(`txBuilder.tx.ins: ${JSON.stringify(txBuilder.tx.ins, null, 2)}`)

        const txInputIndex = this.inputForUtxo(thisUtxo, txBuilder.tx.ins)
        console.log('txInputIndex: ', txInputIndex)

        thisUtxo.wif = hdData.wif
        const ecPair = hdData.ecPair

        // Sign the input for this UTXO
        let redeemScript
        txBuilder.sign(
          txInputIndex,
          ecPair,
          redeemScript,
          Bitcoin.Transaction.SIGHASH_ALL,
          thisUtxo.satoshis
        )
      }

      // Build the partially-signed TX
      const psTx = txBuilder.buildIncomplete()

      // Serialize the partially signed TX in to a hex string
      const psHex = psTx.toHex()
      console.log('psHex: ', psHex)

      return psHex
    } catch (err) {
      console.error('Error in signCoinJoinTx(): ', err)
      throw err
    }
  }

  // Find input index belonging to a particular UTXO
  inputForUtxo (utxo, txInputs) {
    try {
      for (let i = 0; i < txInputs.length; i++) {
        const input = txInputs[i]
        const txId = Buffer.from(input.hash).reverse().toString('hex')
        console.log(`txid: ${txId}, index: ${input.index}`)
        if (txId === utxo.tx_hash && input.index === utxo.tx_pos) return i
      }

      throw new Error(`No inputs for utxo with tx hash ${utxo.tx_hash} and output ${utxo.tx_pos}`)
    } catch (err) {
      console.log('Error in inputForUtxo()')
      throw err
    }
  }
}

module.exports = Transactions
