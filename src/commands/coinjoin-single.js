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

class CoinJoinSingle extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies
    this.util = new AppUtils()
    this.updateBalancesCmd = new UpdateBalancesCmd()
    this.axios = axios
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

CoinJoinSingle.description = `Pariticipate in a single CoinJoin round

This command will initiate a CoinJoin round, and will exit after a single
successful round.
`

CoinJoinSingle.flags = {
  // testnet: flags.boolean({ char: "t", description: "Create a testnet wallet" }),
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = CoinJoinSingle
