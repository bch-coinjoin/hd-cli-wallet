/*
  This library is concerned with UTXO management. The chief management strategy
  is how UTXOs how handled when spent.
*/

class Utxos {
  // Selects a UTXO from an array of UTXOs based on this optimization criteria:
  // 1. The UTXO must be larger than or equal to the amount of BCH to send.
  // 2. The UTXO should be as close to the amount of BCH as possible.
  //    i.e. as small as possible
  // Returns a single UTXO object.
  async selectUtxo (bch, utxos) {
    let candidateUTXO = {}

    const bchSatoshis = bch * 100000000
    const total = bchSatoshis + 250 // Add 250 satoshis to cover TX fee.

    // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

    // Loop through each address.
    for (let i = 0; i < utxos.length; i++) {
      const thisAddrObj = utxos[i]

      // Loop through each UTXO for each address.
      for (let j = 0; j < thisAddrObj.bchUtxos.length; j++) {
        const thisUTXO = thisAddrObj.bchUtxos[j]

        // Ensure the Electrumx or Blockbook UTXO has a satoshis property.
        if (thisUTXO.value && !thisUTXO.satoshis) {
          thisUTXO.satoshis = Number(thisUTXO.value)
        }

        // Ensure the UTXO has HD index information
        thisUTXO.hdIndex = thisAddrObj.hdIndex

        // The UTXO must be greater than or equal to the send amount.
        if (thisUTXO.satoshis >= total) {
          // console.log(`thisUtxo: ${JSON.stringify(thisUTXO, null, 2)}`)

          // Skip if change would less than the dust amount.
          if (thisUTXO.satoshis - bchSatoshis < 546) continue

          // Automatically assign if the candidateUTXO is an empty object.
          if (!candidateUTXO.satoshis) {
            candidateUTXO = thisUTXO
            continue

            // Replace the candidate if the current UTXO is closer to the send amount.
          } else if (candidateUTXO.satoshis > thisUTXO.satoshis) {
            candidateUTXO = thisUTXO
          }
        }
      }
    }

    if (candidateUTXO.satoshis) {
      candidateUTXO.amount = candidateUTXO.satoshis / 100000000
    }

    return candidateUTXO
  }

  // Similar to the selectUtxos(), this selection algorithm selects UTXOs to
  // use in a CoinJoin, using this criteria:
  // 1. The UTXOs chosen must exceed the target BCH amount by at least 546 sats.
  // This function returns an array of UTXOs.
  selectCoinJoinUtxos (sats, utxos) {
    try {
      const candidateUtxos = []

      // Add dust sats to pay for TX fees.
      const total = sats + 546

      // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

      let breakOutOfParentLoop = false

      // Loop through each address.
      for (let i = 0; i < utxos.length; i++) {
        const thisAddrObj = utxos[i]

        // Loop through each UTXO for each address.
        for (let j = 0; j < thisAddrObj.bchUtxos.length; j++) {
          const thisUTXO = thisAddrObj.bchUtxos[j]

          // Ensure the Electrumx or Blockbook UTXO has a satoshis property.
          if (thisUTXO.value && !thisUTXO.satoshis) {
            thisUTXO.satoshis = Number(thisUTXO.value)
          }

          // Ensure the UTXO has HD index information
          thisUTXO.hdIndex = thisAddrObj.hdIndex

          // Add the UTXO to the list of candidate UTXOs.
          candidateUtxos.push(thisUTXO)

          // Sum the total BCH in all the already selected UTXO candidates
          let subTotal = 0
          candidateUtxos.map(x => subTotal += x.satoshis)
          // console.log('subTotal: ', subTotal)

          const diff = total - subTotal
          // console.log('diff: ', diff)

          // Exit the loop if enough UTXO candidates have been chosen to meet
          // the BCH requirement.
          if (diff < 0) {
            console.log('Breaking out of for loop')
            breakOutOfParentLoop = true
            break
          }
        }

        if (breakOutOfParentLoop) break
      }

      return candidateUtxos
    } catch (err) {
      console.error('Error in selectCoinJoinUtxos()')
      throw err
    }
  }
}

module.exports = Utxos
