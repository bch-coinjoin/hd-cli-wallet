/*
  This file creates a single JS library that encapsulates all the commands.
*/

// Sublibraries
const CreateWalletLib = require('./lib/create-wallet')
const UpdateBalanceLib = require('./lib/update-balance')

class HdWallet {
  constructor () {
    // Encapsulate sublibraries
    this.createWallet = new CreateWalletLib()
    this.updateBalance = new UpdateBalanceLib()
  }
}

module.exports = HdWallet
