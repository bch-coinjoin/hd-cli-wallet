/*
  Create a new BCH wallet
*/

// External npm libraries

// Local libraries
// const AppUtils = require('../util')
const globalConfig = require('../../config')

// const appUtils = new AppUtils()

const bchjs = new globalConfig.BCHLIB({
  restURL: globalConfig.MAINNET_REST,
  apiToken: globalConfig.JWT
})

class CreateWalletLib {
  constructor () {
    // Encapsulate dependencies
    this.bchjs = bchjs
    this.localConfig = globalConfig
  }

  // testnet is a boolean.
  async createWallet (inObj = {}) {
    try {
      // Input validation
      let { desc, testnet } = inObj

      if (!desc) desc = ''

      // console.log(filename)
      // Initialize the wallet data object that will be saved to a file.
      const walletData = {}
      if (testnet) walletData.network = 'testnet'
      else walletData.network = 'mainnet'

      // create 128 bit (12 word) BIP39 mnemonic
      const mnemonic = this.bchjs.Mnemonic.generate(
        128,
        this.bchjs.Mnemonic.wordLists().english
      )
      walletData.mnemonic = mnemonic

      // root seed buffer
      const rootSeed = await this.bchjs.Mnemonic.toSeed(mnemonic)

      // master HDNode
      const masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)

      // Use the 245 derivation path by default.
      walletData.derivation = 245

      // HDNode of BIP44 account
      const account = this.bchjs.HDNode.derivePath(
        masterHDNode,
        `m/44'/${walletData.derivation}'/0'`
      )

      // derive the first external change address HDNode which is going to spend utxo
      const change = this.bchjs.HDNode.derivePath(account, '0/0')

      // get the cash address
      walletData.rootAddress = this.bchjs.HDNode.toCashAddress(change)

      // Initialize other data.
      walletData.balance = 0
      walletData.nextAddress = 1
      walletData.hasBalance = []
      walletData.addresses = []
      walletData.description = desc

      return walletData
    } catch (err) {
      console.error('Error in lib/create-wallet.js/createWallet(): ', err.message)
      // if (err.code !== 'EEXIT') console.log('Error in createWallet().')
      throw err
    }
  }
}

module.exports = CreateWalletLib
