/*
  Utility Library.
  Common functions used by several commands.

  TODO:

*/

'use strict'

const fs = require('fs')

// Inspect utility used for debugging.
const util = require('util')
util.inspect.defaultOptions = {
  showHidden: true,
  colors: true,
  depth: 1
}

const config = require('../config')

const bchjs = new config.BCHLIB({ restURL: config.MAINNET_REST })

class AppUtils {
  constructor (config) {
    // By default use public npm library and mainnet.
    this.bchjs = bchjs

    // If bchjs is specified, override it with that.
    if (config && config.bchjs) {
      this.bchjs = config.bchjs
    }
  }

  // Open a wallet by file name.
  openWallet (filename) {
    try {
      // Delete the cached copy of the wallet. This allows testing of list-wallets.
      delete require.cache[require.resolve(filename)]

      const walletInfo = require(filename)
      return walletInfo
    } catch (err) {
      throw new Error(`Could not open ${filename}`)
    }
  }

  // Save a wallet to a file.
  saveWallet (filename, walletData) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, JSON.stringify(walletData, null, 2), function (
        err
      ) {
        if (err) return reject(console.error(err))

        // console.log(`${name}.json written successfully.`)
        return resolve()
      })
    })
  }

  // convert walletInfo to format suitable for NFT calls
  async nftInfo (walletInfo, indexStr) {
    const index = parseInt(indexStr, 10)
    const addrData = walletInfo.addresses.filter(x => x[0] === index)
    const rootSeed = await this.bchjs.Mnemonic.toSeed(walletInfo.mnemonic)
    const masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)
    const childNode = masterHDNode.derivePath(`m/44'/245'/0'/0/${index}`)

    const walletObj = {
      mnemonic: walletInfo.mnemonic,
      cashAddress: addrData[0][1],
      slpAddress: this.bchjs.SLP.Address.toSLPAddress(addrData[0][1]),
      legacyAddress: this.bchjs.HDNode.toLegacyAddress(childNode),
      WIF: this.bchjs.HDNode.toWIF(childNode)
    }
    return walletObj
  }

  // Generate a change address from a Mnemonic of a private key.
  async changeAddrFromMnemonic (walletInfo, index) {
    try {
      if (!walletInfo.derivation) {
        throw new Error('walletInfo must have integer derivation value.')
      }
      // console.log(`walletInfo: ${JSON.stringify(walletInfo, null, 2)}`)

      // console.log(`index: ${index}`)
      if (!index && index !== 0) {
        throw new Error('index must be a non-negative integer.')
      }

      // root seed buffer
      const rootSeed = await this.bchjs.Mnemonic.toSeed(walletInfo.mnemonic)

      // master HDNode
      let masterHDNode
      if (walletInfo.network === 'testnet') {
        masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed, 'testnet')
      } else masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)

      // HDNode of BIP44 account
      // console.log(`derivation path: m/44'/${walletInfo.derivation}'/0'`)
      const account = this.bchjs.HDNode.derivePath(
        masterHDNode,
        `m/44'/${walletInfo.derivation}'/0'`
      )

      // derive the first external change address HDNode which is going to spend utxo
      const change = this.bchjs.HDNode.derivePath(account, `0/${index}`)

      return change
    } catch (err) {
      console.log('Error in util.js/changeAddrFromMnemonic()')
      throw err
    }
  }

  // Broadcasts the transaction to the BCH network.
  // Expects a hex-encoded transaction generated by sendBCH(). Returns a TXID
  // or throws an error.
  async broadcastTx (hex) {
    try {
      // console.log(`this.bchjs.restURL: ${this.bchjs.restURL}`)
      const txid = await this.bchjs.RawTransactions.sendRawTransaction([hex])

      return txid
    } catch (err) {
      console.log('Error in util.js/broadcastTx()')
      throw err
    }
  }

  // Generates a link to the block explorer on the command line terminal.
  // Expects a txid String as input, and the network value from the
  // wallet file (testnet or mainnet).
  displayTxid (txid, network) {
    console.log(' ')
    console.log(`TXID: ${txid}`)

    if (network === 'testnet') {
      console.log(
        `View on the block explorer: https://explorer.bitcoin.com/tbch/tx/${txid}`
      )
    } else {
      console.log(
        `View on the block explorer: https://explorer.bitcoin.com/bch/tx/${txid}`
      )
    }
  }

  // Takes a number and returns it, rounded to the nearest 8 decimal place.
  eightDecimals (num) {
    const thisNum = Number(num)

    let tempNum = thisNum * 100000000
    tempNum = Math.floor(tempNum)
    tempNum = tempNum / 100000000

    return tempNum
  }

  // Call the full node to validate that UTXO has not been spent.
  // Returns true if UTXO is unspent.
  // Returns false if UTXO is spent.
  async isValidUtxo (utxo) {
    try {
      // console.log(`this.bchjs.restURL: ${this.bchjs.restURL}`)

      // Input validation.
      if (!utxo.txid) throw new Error('utxo does not have a txid property')
      if (!utxo.vout && utxo.vout !== 0) {
        throw new Error('utxo does not have a vout property')
      }

      // console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`)

      const txout = await this.bchjs.Blockchain.getTxOut(utxo.txid, utxo.vout)
      // console.log(`txout: ${JSON.stringify(txout, null, 2)}`)

      if (txout === null) return false
      return true
    } catch (err) {
      console.error('Error in util.js/isValidUtxo()')
      throw err
    }
  }

  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Generates an array of HD addresses.
  // Address are generated from index to limit.
  // e.g. generateAddress(walletInfo, 20, 10)
  // will generate a 10-element array of addresses from index 20 to 29
  async generateAddress (walletInfo, index, limit) {
    // console.log(`walletInfo: ${JSON.stringify(walletInfo, null, 2)}`)

    if (!walletInfo.mnemonic) throw new Error('mnemonic is undefined!')

    // root seed buffer
    const rootSeed = await this.bchjs.Mnemonic.toSeed(walletInfo.mnemonic)

    // master HDNode
    let masterHDNode
    if (walletInfo.network === 'testnet') {
      masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed, 'testnet')
    } else masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)

    // HDNode of BIP44 account
    const account = this.bchjs.HDNode.derivePath(
      masterHDNode,
      `m/44'/${walletInfo.derivation}'/0'`
    )

    // Empty array for collecting generated addresses
    const bulkAddresses = []

    // Generate the addresses.
    for (let i = index; i < index + limit; i++) {
      // derive an external change address HDNode
      const change = this.bchjs.HDNode.derivePath(account, `0/${i}`)

      // get the cash address
      const newAddress = this.bchjs.HDNode.toCashAddress(change)
      // const legacy = this.bchjs.HDNode.toLegacyAddress(change)

      // push address into array
      bulkAddresses.push(newAddress)
    }

    return bulkAddresses
  }

  // Generates an array of HD addresses. Returns an object containing two arrays:
  // - bulkAddresses - is a simple array of addresses
  // - bulkAddressesWithIndex - is an array of objects. Each object contains the
  //   address and the HD index that generated that address.
  // Address are generated from index to limit.
  // e.g. generateAddress(walletInfo, 20, 10)
  // will generate a 10-element array of addresses from index 20 to 29
  async generateAddresses (walletInfo, index, limit) {
    // console.log(`walletInfo: ${JSON.stringify(walletInfo, null, 2)}`)

    if (!walletInfo.mnemonic) throw new Error('mnemonic is undefined!')

    // root seed buffer
    const rootSeed = await this.bchjs.Mnemonic.toSeed(walletInfo.mnemonic)

    // master HDNode
    let masterHDNode
    if (walletInfo.network === 'testnet') {
      masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed, 'testnet')
    } else masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)

    // HDNode of BIP44 account
    const account = this.bchjs.HDNode.derivePath(
      masterHDNode,
      `m/44'/${walletInfo.derivation}'/0'`
    )

    // Empty array for collecting generated addresses
    const bulkAddresses = []
    const bulkAddressesWithIndex = []

    // Generate the addresses.
    for (let i = index; i < index + limit; i++) {
      // derive an external change address HDNode
      const change = this.bchjs.HDNode.derivePath(account, `0/${i}`)

      // get the cash address
      const newAddress = this.bchjs.HDNode.toCashAddress(change)
      // const legacy = this.bchjs.HDNode.toLegacyAddress(change)

      // push address into array
      bulkAddresses.push(newAddress)

      const addrWithIndex = {
        addr: newAddress,
        hdIndex: i
      }
      bulkAddressesWithIndex.push(addrWithIndex)
    }

    // return bulkAddresses
    return { bulkAddresses, bulkAddressesWithIndex }
  }

  // Returns an integer representing the HD node index of an address. Scans
  // from 0 to walletInfo.nextAddress.
  // Returns false if address is not found.
  async getIndex (addr, walletInfo) {
    try {
      const retVal = false

      if (!walletInfo || !walletInfo.nextAddress) {
        throw new Error('walletInfo object does not have nextAddress property.')
      }

      if (!walletInfo.addresses) {
        throw new Error(
          'walletInfo object does not have an addresses property.'
        )
      }

      const addrData = walletInfo.addresses.filter(x => x[1] === addr)
      // console.log(`addrData: ${JSON.stringify(addrData, null, 2)}`)

      if (addrData.length === 1) return addrData[0][0]

      return retVal
    } catch (err) {
      console.error('Error in util.js/getIndex()')
      throw err
    }
  }

  // Similar to getIndex, except it generates the index through computation rather
  // than simply retrieving it from the wallet file.
  // Returns an integer representing the HD node index of an address. Scans
  // from 0 to walletInfo.nextAddress.
  // Returns false if address is not found.
  async generateIndex (addr, walletInfo) {
    // try {
    let retVal = false

    if (!walletInfo || !walletInfo.nextAddress) {
      throw new Error('walletInfo object does not have nextAddress property.')
    }

    // Generate an array containing all the addresses used by the wallet so far.
    const addresses = await this.generateAddress(
      walletInfo,
      0,
      walletInfo.nextAddress
    )
    // console.log(`addresses: ${JSON.stringify(addresses, null, 2)}`)

    // Loop through all the addresses to find a match.
    for (let i = 0; i < addresses.length; i++) {
      const thisAddr = addresses[i]

      // If a match is found, exit the loop and return the value.
      if (addr === thisAddr) {
        retVal = i
        break
      }
    }

    return retVal
    // } catch (err) {
    //   throw err
    // }
  }

  // check for valid BCH/SLP address
  async validAddress (address) {
    try {
      const legacyAddress = this.bchjs.SLP.Address.toLegacyAddress(address)
      const check = await this.bchjs.Util.validateAddress(legacyAddress)
      return check.isvalid
    } catch (error) {
      return false
    }
  }
}

module.exports = AppUtils
