/*
  Generates a new HD address for recieving BCH.

  -The next available address is tracked by the 'nextAddress' property in the
  wallet .json file.

  TODO:
*/

// Global npm libraries
const qrcode = require('qrcode-terminal')

// local libraries
const AppUtils = require('../util')
const config = require('../../config')

// Mainnet by default.
const bchjs = new config.BCHLIB({
  restURL: config.MAINNET_REST,
  apiToken: config.JWT
})

const { Command, flags } = require('@oclif/command')

// let _this

class GetAddress extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsualt dependencies
    this.bchjs = bchjs
    this.appUtils = new AppUtils()
    this.qrcode = qrcode
  }

  async run () {
    try {
      const { flags } = this.parse(GetAddress)

      // Validate input flags
      this.validateFlags(flags)

      // Generate an absolute filename from the name.
      const filename = `${__dirname.toString()}/../../wallets/${
        flags.name
      }.json`

      let walletInfo = this.appUtils.openWallet(filename)

      // const newAddress = await this.getAddress(filename, flags)
      const { newAddress, newWalletInfo } = await this.getAddress({ flags, walletInfo })
      walletInfo = newWalletInfo

      // Update the wallet JSON file
      await this.updateWalletFile({ filename, walletInfo })

      const slpAddr = this.bchjs.SLP.Address.toSLPAddress(newAddress)
      const legacy = this.bchjs.Address.toLegacyAddress(newAddress)

      // Display the address as a QR code.
      this.qrcode.generate(newAddress, { small: true })

      // Display the address to the user.
      this.log(`cash address: ${newAddress}`)
      this.log(`SLP address: ${slpAddr}`)
      this.log(`legacy address: ${legacy}`)

      return newAddress
    } catch (err) {
      if (err.message) console.log(err.message)
      else console.log('Error in GetAddress.run: ', err)
      // console.log('error: ', err)

      return 0
    }
  }

  // async getAddress (filename, flags) {
  async getAddress (inObj = {}) {
    // const filename = `${__dirname.toString()}/../../wallets/${name}.json`

    const { flags, walletInfo } = inObj

    // const walletInfo = this.appUtils.openWallet(filename)
    // console.log(`walletInfo: ${JSON.stringify(walletInfo, null, 2)}`)

    // Point to the correct rest server.
    // if (walletInfo.network === 'testnet') {
    //   this.bchjs = new config.BCHLIB({ restURL: config.TESTNET_REST })
    // } else this.bchjs = new config.BCHLIB({ restURL: config.MAINNET_REST })
    this.bchjs = new config.BCHLIB({ restURL: config.MAINNET_REST })

    // root seed buffer
    const rootSeed = await this.bchjs.Mnemonic.toSeed(walletInfo.mnemonic)

    // master HDNode
    // let masterHDNode
    // if (walletInfo.network === 'testnet') {
    //   masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed, 'testnet')
    // } else masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)
    const masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)

    // HDNode of BIP44 account
    const account = this.bchjs.HDNode.derivePath(
      masterHDNode,
      `m/44'/${walletInfo.derivation}'/0'`
    )
    // console.log(`account: ${util.inspect(account)}`)

    // derive an external change address HDNode
    const change = this.bchjs.HDNode.derivePath(
      account,
      `0/${walletInfo.nextAddress}`
    )
    // console.log(`change: ${util.inspect(change)}`)

    // Increment to point to a new address for next time.
    walletInfo.nextAddress++

    // Update the wallet.addresses array.
    const addresses = await this.appUtils.generateAddress(
      walletInfo,
      0,
      walletInfo.nextAddress
    )
    walletInfo.addresses = []
    for (let i = 0; i < addresses.length; i++) {
      walletInfo.addresses.push([i, addresses[i]])
    }

    // Update the wallet file.
    // await this.appUtils.saveWallet(filename, walletInfo)

    // get the cash address
    let newAddress = this.bchjs.HDNode.toCashAddress(change)

    // Convert to simpleledger: address if flag is set.
    if (flags && flags.token) {
      newAddress = this.bchjs.SLP.Address.toSLPAddress(newAddress)
    }

    return { newAddress, newWalletInfo: walletInfo }
  }

  // Update the wallet JSON file to point to the next address the next time
  // this function is called.
  async updateWalletFile (inObj = {}) {
    const { filename, walletInfo } = inObj

    // Update the wallet file.
    await this.appUtils.saveWallet(filename, walletInfo)
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

GetAddress.description = 'Generate a new address to recieve BCH.'

GetAddress.flags = {
  testnet: flags.boolean({ char: 't', description: 'Create a testnet wallet' }),
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  slp: flags.boolean({
    char: 's',
    description: 'Generate a simpledger: token address'
  })
}

module.exports = GetAddress
