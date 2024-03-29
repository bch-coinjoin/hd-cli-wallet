/*
  This command consolidates UTXOs using CoinJoin for a single round. It exits
  after a single CoinJoin round has been completed.
*/

// Global npm libraries
// const shelljs = require('shelljs')
const { Command, flags } = require('@oclif/command')
const axios = require('axios')

// Local libraries
const AppUtils = require('../util')
const UpdateBalancesCmd = require('./update-balances')
const Transactions = require('../lib/transaction')
const GetAddress = require('../commands/get-address')

class CoinJoinSingle extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies
    this.util = new AppUtils()
    this.updateBalancesCmd = new UpdateBalancesCmd()
    this.axios = axios
    this.transactions = new Transactions()
    this.getAddress = new GetAddress()
  }

  async run () {
    const { flags } = this.parse(CoinJoinSingle)

    this.validateFlags(flags)

    // Generate an absolute filename from the name.
    const filename = `${__dirname.toString()}/../../wallets/${
      flags.name
    }.json`

    // Update the wallet UTXOs
    let walletInfo = await this.updateBalancesCmd.updateBalances(flags)
    console.log('walletInfo: ', walletInfo)

    // Generate an output address
    let getAddrOut = await this.getAddress.getAddress({ walletInfo })
    const outputAddr = getAddrOut.newAddress
    walletInfo = getAddrOut.newWalletInfo
    await this.getAddress.updateWalletFile({ filename, walletInfo })

    // Generate a change address
    getAddrOut = await this.getAddress.getAddress({ walletInfo })
    const changeAddr = getAddrOut.newAddress
    walletInfo = getAddrOut.newWalletInfo
    await this.getAddress.updateWalletFile({ filename, walletInfo })

    // Pass the wallet UTXOs to the CoinJoin API
    const { bchUtxos } = walletInfo
    const inObj = { bchUtxos, outputAddr, changeAddr }
    const result = await this.axios.post('http://localhost:5540/wallet', inObj)
    console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

    // This will hold the partially signed transaction.
    let psHex = null
    let utxosToSign = []

    do {
      const utxCall = await this.axios.get('http://localhost:5540/wallet/unsignedTx')
      console.log('utxCall.data: ', JSON.stringify(utxCall.data, null, 2))

      if (utxCall.data) {
        const unsignedHex = utxCall.data.unsignedHex
        utxosToSign = utxCall.data.peerData.coinjoinUtxos

        if (unsignedHex) {
          console.log('Unsigned TX data received. Can now sign and submit')
          psHex = await this.transactions.signCoinJoinTx({ unsignedHex, utxosToSign, walletInfo })

          break
        }
      }

      await this.sleep(10000)
    } while (1)

    if (!psHex) {
      throw new Error('While loop exited without retrieving a partially signed TX!')
    }

    // Pass the partially signed transaction back to the REST API
    await this.axios.post('http://localhost:5540/wallet/partiallySignedTx', { psHex, signedUtxos: utxosToSign })
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

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

CoinJoinSingle.description = `Pariticipate in a single CoinJoin round

This command will initiate a CoinJoin round, and will exit after a single
successful round.
`

CoinJoinSingle.flags = {
  // testnet: flags.boolean({ char: "t", description: "Create a testnet wallet" }),
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = CoinJoinSingle
