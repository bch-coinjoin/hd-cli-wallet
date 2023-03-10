/*
  oclif command to update the balances stored in the wallet.json file.

  TODO:
   - Add notes on the general high-level workflow of this command.
   - Replace Blockbook with Electrumx

  Command Workflow:
  - validateFlags() validates the flags passed into the command.
  - updateBalances() is the parent function that kicks off this command.
    - getAllAddressData() queries data on the last 100 addrs generated by the wallet
    - generateHasBalance() creates an array of addresses with address balances.
    - sumConfirmedBalances() generates a total balance for the wallet.
    - saveWallet() saves the data to the wallet file.

*/

// Global npm libraries
const BCHJS = require('@psf/bch-js')

// Local libraries
const globalConfig = require('../../config')
const AppUtils = require('../util')
const UpdateBalanceLib = require('../lib/update-balance')

const { Command, flags } = require('@oclif/command')

class UpdateBalances extends Command {
  constructor (argv, config) {
    super(argv, config)

    // console.log('UpdateBalances constructor. globalConfig.restURL: ', globalConfig.restURL)

    // Encapsulate dependencies
    this.bchjs = new BCHJS()
    this.appUtils = new AppUtils()
    this.updateBalanceLib = new UpdateBalanceLib({ restURL: globalConfig.restURL })
    this.globalConfig = globalConfig
  }

  async run () {
    try {
      const { flags } = this.parse(UpdateBalances)

      this.validateFlags(flags)

      // Update the balances in the wallet.
      const walletInfo = await this.updateBalances(flags)

      console.log(`Updated balance: ${walletInfo.balance} BCH`)

      return true
    } catch (err) {
      console.log('Error in UpdateBalances.run: ', err.message)
      return false
    }
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

  // Update the balances in the wallet.
  async updateBalances (flags) {
    try {
      const name = flags.name

      // Open the wallet data file.
      const filename = `${__dirname.toString()}/../../wallets/${name}.json`
      let walletInfo = this.appUtils.openWallet(filename)
      walletInfo.name = name

      console.log(`Existing balance: ${walletInfo.balance} BCH`)

      // console.log(`debug: walletInfo.nextAddress = ${walletInfo.nextAddress}`)

      // // Query data on each address that has been generated by the wallet.
      // const rawAddressData = await this.updateBalanceLib.getAllAddressData({ walletInfo })
      // // console.log(`rawAddressData: ${JSON.stringify(rawAddressData, null, 2)}`)
      //
      // // Update hasBalance array with non-zero balances.
      // const hasBalance = this.updateBalanceLib.generateHasBalance(rawAddressData)
      // walletInfo.hasBalance = hasBalance
      // // console.log(`hasBalance: ${JSON.stringify(hasBalance, null, 2)}`)
      //
      // // Update the bchUtxos array with addresses that have BCH UTXOs.
      // const bchUtxos = this.updateBalanceLib.generateBchUtxos(rawAddressData)
      // walletInfo.bchUtxos = bchUtxos
      // console.log('bchUtxos: ', JSON.stringify(bchUtxos, null, 2))
      //
      // // TODO: Add a functoin here similar to generateBchUtxos, but instead
      // // extracts the Type1 SLP token UTXOs.
      //
      // // console.log('walletInfo: ', walletInfo)
      //
      // // Sum all the balances in hasBalance to calculate total balance.
      // const balanceTotalSat = this.updateBalanceLib.sumBalances(hasBalance)
      // walletInfo.balanceTotalSat = balanceTotalSat
      // console.log('balanceTotalSat: ', balanceTotalSat)

      // Update the wallet object with data from the blockchain, including
      // UTXOs and balances.
      walletInfo = await this.updateBalanceLib.updateWallet(walletInfo)

      // Save the updated blockchain data to the wallet data file.
      await this.appUtils.saveWallet(filename, walletInfo)

      return walletInfo
    } catch (err) {
      console.error('Error in updateBalances(): ', err.message)
      throw err
    }
  }
}

UpdateBalances.description =
  'Poll the network and update the balances of the wallet.'

UpdateBalances.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  ignoreTokens: flags.boolean({
    char: 'i',
    description: 'Ignore and burn tokens'
  })
}

module.exports = UpdateBalances
