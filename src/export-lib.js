/*
  This file creates a single JS library that encapsulates all the commands.
*/

// Sublibraries
const CreateWalletLib = require('./lib/create-wallet')
const UpdateBalanceLib = require('./lib/update-balance')
const Utxos = require('./lib/utxos')
const Util = require('./util')

class HdWallet {
  constructor (config) {
    // Encapsulate sublibraries
    this.createWallet = new CreateWalletLib(config)
    this.updateBalance = new UpdateBalanceLib(config)
    this.utxos = new Utxos(config)
    this.util = new Util(config)
  }
}

module.exports = HdWallet
