/*
  This command is useful for testing CoinJoins. It takes the largest UTXO in
  a wallet and splits it into 5 randomly sized UTXOs. This prepares a wallet
  for consolidating UTXOs via a CoinJoin.
*/

// Global npm libraries
const { Command, flags } = require('@oclif/command')

// Local libraies
const GetAddress = require('./get-address')
const UpdateBalances = require('./update-balances')
const config = require('../../config')
const AppUtils = require('../util')
const UtxosLib = require('../lib/utxos')

const appUtils = new AppUtils()

// Mainnet by default
const bchjs = new config.BCHLIB({
  restURL: config.MAINNET_REST,
  apiToken: config.JWT
})

class SplitUtxo extends Command {
  constructor (argv, config) {
    super(argv, config)
    // _this = this

    // Encapsulate dependencies
    this.bchjs = bchjs
    this.appUtils = appUtils
    this.utxosLib = new UtxosLib()
  }

  async run () {
    try {
      const { flags } = this.parse(SplitUtxo)

      // Ensure flags meet qualifiying critieria.
      this.validateFlags(flags)

      const name = flags.name // Name of the wallet.
      // const bch = flags.bch // Amount to send in BCH.
      // const sendToAddr = flags.sendAddr // The address to send to.

      // Open the wallet data file.
      const filename = `${__dirname.toString()}/../../wallets/${name}.json`
      let walletInfo = this.appUtils.openWallet(filename)
      walletInfo.name = name

      // Determine if this is a testnet wallet or a mainnet wallet.
      // if (walletInfo.network === 'testnet') {
      //   this.bchjs = new config.BCHLIB({ restURL: config.TESTNET_REST })
      //   this.appUtils = new AppUtils({ bchjs: this.bchjs })
      // }

      // Update balances before sending.
      const updateBalances = new UpdateBalances()
      updateBalances.bchjs = this.bchjs

      for (let i = 0; i < 5; i++) {
        walletInfo = await updateBalances.updateBalances(flags)
        // console.log('walletInfo: ', JSON.stringify(walletInfo, null, 2))

        // Get info on UTXOs controlled by this wallet.
        // const utxos = await this.appUtils.getUTXOs(walletInfo)
        const utxos = walletInfo.bchUtxos
        // console.log(`send utxos: ${JSON.stringify(utxos, null, 2)}`)

        // Select optimal UTXO
        // const utxo = await this.selectUTXO(bch, utxos)
        const utxo = await this.selectUTXO(utxos)
        console.log(`selected utxo: ${JSON.stringify(utxo, null, 2)}`)

        // Exit if there is no UTXO big enough to fulfill the transaction.
        if (!utxo.amount) {
          this.log('Error: Could not find a UTXO big enough for this transaction. Send more BCH to the wallet, or consolidate UTXOs with CoinJoin.')
          return
        }

        // Generate a new address, for sending change to.
        const getAddress = new GetAddress()
        getAddress.bchjs = this.bchjs
        let addrData = await getAddress.getAddress({ flags, walletInfo })
        const changeAddress = addrData.newAddress
        walletInfo = addrData.newWalletInfo

        // console.log(`changeAddress: ${changeAddress}`)

        // Get address to send new UTXO to
        addrData = await getAddress.getAddress({ flags, walletInfo })
        const sendToAddr = addrData.newAddress
        walletInfo = addrData.newWalletInfo

        // Update the wallet file.
        await getAddress.updateWalletFile({ filename, walletInfo })

        // Calculate the amount of bch to send
        const oneFifth = utxo.amount / 5
        let bch = oneFifth * (1 - Math.random())
        bch = this.bchjs.Util.floor8(bch)

        // Send the BCH, transfer change to the new address
        const hex = await this.sendBCH(
          utxo,
          bch,
          changeAddress,
          sendToAddr,
          walletInfo
        )
        // console.log(`hex: ${hex}`)

        const txid = await this.appUtils.broadcastTx(hex)

        this.appUtils.displayTxid(txid, walletInfo.network)

        await this.bchjs.Util.sleep(3000)
      }
    } catch (err) {
      // if (err.message) console.log(err.message)
      // else console.log(`Error in .run: `, err)
      console.log('Error in send.js/run(): ', err)
    }
  }

  // Sends BCH to
  async sendBCH (utxo, bch, changeAddress, sendToAddr, walletInfo) {
    try {
      // console.log(`utxo: ${util.inspect(utxo)}`)

      sendToAddr = this.bchjs.SLP.Address.toCashAddress(sendToAddr)

      // instance of transaction builder
      let transactionBuilder
      if (walletInfo.network === 'testnet') {
        transactionBuilder = new this.bchjs.TransactionBuilder('testnet')
      } else transactionBuilder = new this.bchjs.TransactionBuilder()

      const satoshisToSend = Math.floor(bch * 100000000)
      // console.log(`Amount to send in satoshis: ${satoshisToSend}`)
      const originalAmount = utxo.satoshis

      const vout = utxo.vout
      const txid = utxo.txid

      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)

      // get byte count to calculate fee. paying 1 sat/byte
      const byteCount = this.bchjs.BitcoinCash.getByteCount(
        { P2PKH: 1 },
        { P2PKH: 2 }
      )
      // console.log(`byteCount: ${byteCount}`)
      const satoshisPerByte = 1.1
      const txFee = Math.floor(satoshisPerByte * byteCount)
      // console.log(`txFee: ${txFee} satoshis\n`)

      // amount to send back to the sending address. It's the original amount - 1 sat/byte for tx size
      const remainder = originalAmount - satoshisToSend - txFee
      // console.log(`remainder: ${remainder}`)

      // Debugging.
      /*
      console.log(
        `Sending original UTXO amount of ${originalAmount} satoshis from address ${changeAddress}`
      )
      console.log(
        `Sending ${satoshisToSend} satoshis to recieving address ${sendToAddr}`
      )
      console.log(
        `Sending remainder amount of ${remainder} satoshis to new address ${changeAddress}`
      )
      console.log(`Paying a transaction fee of ${txFee} satoshis`)
      */

      // add output w/ address and amount to send
      transactionBuilder.addOutput(
        this.bchjs.Address.toLegacyAddress(sendToAddr),
        satoshisToSend
      )
      transactionBuilder.addOutput(
        this.bchjs.Address.toLegacyAddress(changeAddress),
        remainder
      )

      // Generate a keypair from the change address.
      const change = await this.appUtils.changeAddrFromMnemonic(
        walletInfo,
        utxo.hdIndex
      )
      // console.log(`change: ${JSON.stringify(change, null, 2)}`)
      const keyPair = this.bchjs.HDNode.toKeyPair(change)

      // Sign the transaction with the HD node.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      // build tx
      const tx = transactionBuilder.build()

      // output rawhex
      const hex = tx.toHex()
      // console.log(`Transaction raw hex: `)
      // console.log(hex)

      return hex
    } catch (err) {
      console.log('Error in sendBCH()')
      throw err
    }
  }

  // Selects the largest UTXO in the wallet.
  async selectUTXO (utxos) {
    let candidateUTXO = {}

    let total = 0

    // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

    // Loop through each address.
    for (let i = 0; i < utxos.length; i++) {
      const thisAddr = utxos[i]

      // Loop through each UTXO for each address.
      for (let j = 0; j < thisAddr.bchUtxos.length; j++) {
        const thisUTXO = thisAddr.bchUtxos[j]

        thisUTXO.hdIndex = thisAddr.hdIndex

        // Ensure the Electrumx or Blockbook UTXO has a satoshis property.
        if (thisUTXO.value && !thisUTXO.satoshis) {
          thisUTXO.satoshis = Number(thisUTXO.value)
        }

        // The UTXO must be greater than or equal to the send amount.
        if (thisUTXO.satoshis >= total) {
          // console.log(`thisUtxo: ${JSON.stringify(thisUTXO, null, 2)}`)

          candidateUTXO = thisUTXO

          total = thisUTXO.satoshis
        }
      }
    }

    if (candidateUTXO.satoshis) {
      candidateUTXO.amount = candidateUTXO.satoshis / 100000000
    }

    return candidateUTXO
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    return true
  }
}

SplitUtxo.description = 'Send an amount of BCH'

SplitUtxo.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = SplitUtxo
