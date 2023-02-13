/*
  This file creates a single JS library that encapsulates all the commands.
*/

// Sublibraries
const CreateWallet = require('./lib/create-wallet')

class HdWallet {
  constructor () {
    // Encapsulate sublibraries
    this.createWallet = new CreateWallet()
  }
}

module.exports = HdWallet
