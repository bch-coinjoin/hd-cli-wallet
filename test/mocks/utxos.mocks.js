/*
  Mock library file containing UTXOs
*/

// This is a real-life output from updateBalanceLib.generateBchUtxos()
const utxos01 = [
  {
    bchUtxos: [
      {
        height: 780767,
        tx_hash: 'cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724',
        tx_pos: 0,
        value: 10000,
        txid: 'cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724',
        vout: 0,
        address: 'bitcoincash:qzeg47yj7a7klnu2rf868xtsw563zl767q7ye8mhcg',
        isSlp: false
      }
    ],
    address: 'bitcoincash:qzeg47yj7a7klnu2rf868xtsw563zl767q7ye8mhcg',
    hdIndex: 2
  },
  {
    bchUtxos: [
      {
        height: 780767,
        tx_hash: 'cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724',
        tx_pos: 1,
        value: 138445,
        txid: 'cd66a7db32663cb4c1ff83fa7d94e19e8e74336098f989b8b9c873741fa7f724',
        vout: 1,
        address: 'bitcoincash:qz44a0ynhcx508rykytv22qre6gn5xamjg202wza6r',
        isSlp: false
      }
    ],
    address: 'bitcoincash:qz44a0ynhcx508rykytv22qre6gn5xamjg202wza6r',
    hdIndex: 4
  },
  {
    bchUtxos: [
      {
        height: 782207,
        tx_hash: '59eee13e1a5915f164b374b21416ab0154a890b11c3bc62bf62f7ad2dfd44f55',
        tx_pos: 1,
        value: 1095,
        txid: '59eee13e1a5915f164b374b21416ab0154a890b11c3bc62bf62f7ad2dfd44f55',
        vout: 1,
        address: 'bitcoincash:qz7u085xuccwpc9vg59fyxfmtxjxvhp67y23alxdfn',
        isSlp: false
      }
    ],
    address: 'bitcoincash:qz7u085xuccwpc9vg59fyxfmtxjxvhp67y23alxdfn',
    hdIndex: 6
  }
]

module.exports = {
  utxos01
}
