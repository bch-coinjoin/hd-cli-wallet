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

class CoinJoinSingle extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies
    this.util = new AppUtils()
    this.updateBalancesCmd = new UpdateBalancesCmd()
    this.axios = axios
    this.transactions = new Transactions()
  }

  async run () {
    const { flags } = this.parse(CoinJoinSingle)

    this.validateFlags(flags)

    // Update the wallet UTXOs
    const walletInfo = await this.updateBalancesCmd.updateBalances(flags)
    console.log('walletInfo: ', walletInfo)

    // Pass the wallet UTXOs to the CoinJoin API
    const { bchUtxos, mnemonic } = walletInfo
    const inObj = { bchUtxos, mnemonic }
    const result = await this.axios.post('http://localhost:5540/wallet', inObj)
    console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

    do {
      const utxCall = await this.axios.get('http://localhost:5540/wallet/unsignedTx')
      console.log('utxCall.data: ', JSON.stringify(utxCall.data, null, 2))

      if (utxCall.data) {
        const unsignedHex = utxCall.data.unsignedHex
        const utxosToSign = utxCall.data.peerData.coinjoinUtxos

        if (unsignedHex) {
          console.log('Unsigned TX data received. Can now sign and submit')
          await this.transactions.signCoinJoinTx({ unsignedHex, utxosToSign, walletInfo })

          break
        }
      }

      await this.sleep(10000)
    } while (1)
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
