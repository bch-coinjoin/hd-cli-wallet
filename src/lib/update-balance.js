/*
  This library retrieves data from the blockchain and updates the wallet
  data to reflect its current state, based on the results of the data coming
  back from the blockchain.
*/

// External npm libraries
const BchConsumer = require('bch-consumer')

// Local libraries
const AppUtils = require('../util')

class UpdateBalanceLib {
  constructor (localConfig = {}) {
    // Default REST API server
    let restURL = 'https://free-bch.fullstack.cash'
    // Allow the user to overwrite the server.
    if (localConfig.restURL) restURL = localConfig.restURL

    // Encapsulate dependencies
    this.appUtils = new AppUtils()
    this.bchConsumer = new BchConsumer({ restURL })
  }

  // Retrieves details data (objects) on addresses in an HD wallet from REST server.
  // A max of 20 addresses can be retrieved at a time.
  // Addresses start at the index and the number of address data retrieved is
  // set by the limit (up to 20). Data is returned as an object with balance and
  // hydrated utxo data.
  async getAddressData (inObj = {}) {
    // This is a complex function. Here are the high-level outline of the workflow:
    // - Input validation
    // - Generate an array of 20 addresses from the HD wallet.
    // - Get the balances for each address
    // - Get the UTXOs for each address
    // - Return an object with balances and UTXO information for each address.

    try {
      // Input validation
      const { walletInfo, index, limit } = inObj

      if (isNaN(index)) throw new Error('index must be supplied as a number.')

      if (!limit || isNaN(limit)) {
        throw new Error('limit must be supplied as a non-zero number.')
      }

      if (limit > 20) throw new Error('limit must be 20 or less.')

      console.log(
        `Getting address data at index ${index} up to index ${index + limit}`
      )

      // Get the list of addresses.
      const { bulkAddresses, bulkAddressesWithIndex } = await this.appUtils.generateAddresses(
        walletInfo,
        index,
        limit
      )
      // console.log('bulkAddressesWithIndex: ', bulkAddressesWithIndex)
      // console.log('bulkAddresses: ', bulkAddresses)

      // get BCH balance and details for each address.
      const balancesAry = await this.bchConsumer.bch.getBalance(bulkAddresses)
      // console.log(`balancesAry 1: ${JSON.stringify(balancesAry, null, 2)}`)

      // Add the HD Index to each balance.
      for (let i = 0; i < balancesAry.balances.length; i++) {
        const thisAddr = balancesAry.balances[i]

        // Find the entry in the bulkAddressesWithIndex entry that matches
        // the address for this balance.
        const thisIndex = bulkAddressesWithIndex.find(x => x.addr === thisAddr.address)
        // console.log('thisIndex: ', thisIndex)

        // Add the HD index for this address to the object.
        thisAddr.hdIndex = thisIndex.hdIndex

        // Add the total to the object
        thisAddr.balance.total = thisAddr.balance.confirmed + thisAddr.balance.unconfirmed
      }
      // console.log(`balancesAry 2: ${JSON.stringify(balancesAry, null, 2)}`)

      // Get UTXO data.
      const utxos = await this.bchConsumer.bch.getUtxos(bulkAddresses)
      // console.log(`utxos 1: ${JSON.stringify(utxos, null, 2)}`)

      // Add the HD index to each entry of UTXOs
      for (let i = 0; i < utxos.data.length; i++) {
        const thisAddr = utxos.data[i]

        // Find the entry in the bulkAddressesWithIndex entry that matches
        // the address for these UTXOs.
        const thisIndex = bulkAddressesWithIndex.find(x => x.addr === thisAddr.address)

        // Add the HD index for this address to the object.
        thisAddr.hdIndex = thisIndex.hdIndex
      }
      // console.log(`utxos 2: ${JSON.stringify(utxos, null, 2)}`)

      const outObj = {
        addresses: bulkAddresses,
        balances: balancesAry.balances,
        utxos: utxos.data
      }

      return outObj
    } catch (err) {
      // console.log('Error: ', err)
      console.log('Error in update-balance.js/getAddressData(): ', err.message)
      throw err
    }
  }
}

module.exports = UpdateBalanceLib
