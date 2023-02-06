_Warning: This is an experimental 'hacker-friendly' wallet. It's intended for use by software developers. It has been tested only for the most common use-cases. It has been known to burn SLP tokens. Do not use this wallet for tokens with value._

# hd-cli-wallet

This is an npm library and Bitcoin Cash (BCH) wallet that runs on the command
line. Add this library to your app to instantly give it the ability to transact
on the BCH network! New to Bitcoin Cash? Find educational resources on the [FullStack.cash Documenation page](https://fullstack.cash/documentation).

This project has the following goals:

- Create a code base for a wallet that is easily forkable and extensible by JavaScript developers.
- Provide a high-level abstraction to make it easy for new developers to add BCH and SLP wallet functionality into their apps.

If you want a wallet with a graphical user interface, check out [wallet.FullStack.cash](https://wallet.fullstack.cash). For a front-end friendly package, check out [minimal-slp-wallet-web](https://www.npmjs.com/package/minimal-slp-wallet-web). Bitcoin Cash functionality is implemented in all wallets with [bch-js](https://www.npmjs.com/package/@psf/bch-js), provided by [FullStack.cash](https://fullstack.cash). The command line interface for this project is built with [oclif](https://oclif.io).

Also, be sure to check out the design decisions and trade-offs that went into the
creation of this project in the [docs directory](./docs)

<!-- toc -->
* [hd-cli-wallet](#hd-cli-wallet)
* [NPM Usage](#npm-usage)
* [Install Dev Environment](#install-dev-environment)
* [Command Line Usage](#command-line-usage)
* [Commands](#commands)
<!-- tocstop -->

# NPM Usage

The [npm library](https://www.npmjs.com/package/slp-cli-wallet) can be included
in your own app to instantly give it the ability to send and receive BCH transactions, including SLP tokens.
Here is an example of how to include it in your own app. This example will generate
a new HD wallet.

```javascript
// Instantiate the Create Wallet class from this library.
const CreateWallet = require('slp-cli-wallet/src/commands/create-wallet')
const createWallet = new CreateWallet()

const walletFile = './wallet.json'

async function makeNewWallet() {
  const wallet = await createWallet.createWallet(walletFile)

  console.log(`wallet: ${JSON.stringify(wallet, null, 2)}`)
}
makeNewWallet()
```

## Node and NPM Versions

This app is tested on the following versions for npm and node.js:

- npm: v7.12.1
- node.js: v14.16.1

# Install Dev Environment

While this npm library can be used globally, the intended audience is developers
familiar with the usage of `npm` and `git`. Here is how to set up your own
developer environment:

- Clone this repo with `git clone`.
- Install npm dependencies with `npm install`
- Execute the commands like this: `./bin/run help`

Running the wallet this way, you can edit the behavior of the wallet
by making changes to the code in the [src/commands](src/commands) directory.

# Command Line Usage

<!-- usage -->
```sh-session
$ npm install -g hd-cli-wallet
$ hd-cli-wallet COMMAND
running command...
$ hd-cli-wallet (-v|--version|version)
hd-cli-wallet/1.0.1 linux-x64 node-v16.19.0
$ hd-cli-wallet --help [COMMAND]
USAGE
  $ hd-cli-wallet COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`hd-cli-wallet burn-tokens`](#hd-cli-wallet-burn-tokens)
* [`hd-cli-wallet create-wallet`](#hd-cli-wallet-create-wallet)
* [`hd-cli-wallet derivation`](#hd-cli-wallet-derivation)
* [`hd-cli-wallet get-address`](#hd-cli-wallet-get-address)
* [`hd-cli-wallet get-key`](#hd-cli-wallet-get-key)
* [`hd-cli-wallet help [COMMAND]`](#hd-cli-wallet-help-command)
* [`hd-cli-wallet list-wallets`](#hd-cli-wallet-list-wallets)
* [`hd-cli-wallet nft-create-child`](#hd-cli-wallet-nft-create-child)
* [`hd-cli-wallet nft-create-group`](#hd-cli-wallet-nft-create-group)
* [`hd-cli-wallet nft-list-addr`](#hd-cli-wallet-nft-list-addr)
* [`hd-cli-wallet nft-list-tokens`](#hd-cli-wallet-nft-list-tokens)
* [`hd-cli-wallet nft-remove-child`](#hd-cli-wallet-nft-remove-child)
* [`hd-cli-wallet remove-wallet`](#hd-cli-wallet-remove-wallet)
* [`hd-cli-wallet scan-funds`](#hd-cli-wallet-scan-funds)
* [`hd-cli-wallet send`](#hd-cli-wallet-send)
* [`hd-cli-wallet send-all`](#hd-cli-wallet-send-all)
* [`hd-cli-wallet send-tokens`](#hd-cli-wallet-send-tokens)
* [`hd-cli-wallet sign-message`](#hd-cli-wallet-sign-message)
* [`hd-cli-wallet slp-avax-bridge`](#hd-cli-wallet-slp-avax-bridge)
* [`hd-cli-wallet sweep`](#hd-cli-wallet-sweep)
* [`hd-cli-wallet update-balances`](#hd-cli-wallet-update-balances)

## `hd-cli-wallet burn-tokens`

Burn SLP tokens.

```
USAGE
  $ hd-cli-wallet burn-tokens

OPTIONS
  -n, --name=name        Name of wallet
  -q, --qty=qty
  -t, --tokenId=tokenId  Token ID
```

_See code: [src/commands/burn-tokens.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/burn-tokens.js)_

## `hd-cli-wallet create-wallet`

Generate a new HD Wallet.

```
USAGE
  $ hd-cli-wallet create-wallet

OPTIONS
  -d, --description=description  Description of the wallet
  -n, --name=name                Name of wallet
  -t, --testnet                  Create a testnet wallet
```

_See code: [src/commands/create-wallet.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/create-wallet.js)_

## `hd-cli-wallet derivation`

Display or set the derivation path used by the wallet.

```
USAGE
  $ hd-cli-wallet derivation

OPTIONS
  -n, --name=name  name to print
  -s, --save=save  save a new derivation path

DESCRIPTION
  This command is used to display the derivation path used by the wallet. The -s
  flag can be used to save a new derivation path.

  Common derivation paths used:
  145 - BIP44 standard path for Bitcoin Cash
  245 - BIP44 standard path for SLP tokens
  0 - Used by common software like the Bitcoin.com wallet and Honest.cash

  Wallets use the 245 derivation path by default.
```

_See code: [src/commands/derivation.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/derivation.js)_

## `hd-cli-wallet get-address`

Generate a new address to recieve BCH.

```
USAGE
  $ hd-cli-wallet get-address

OPTIONS
  -n, --name=name  Name of wallet
  -s, --slp        Generate a simpledger: token address
  -t, --testnet    Create a testnet wallet
```

_See code: [src/commands/get-address.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/get-address.js)_

## `hd-cli-wallet get-key`

Generate a new private/public key pair.

```
USAGE
  $ hd-cli-wallet get-key

OPTIONS
  -n, --name=name  Name of wallet
```

_See code: [src/commands/get-key.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/get-key.js)_

## `hd-cli-wallet help [COMMAND]`

display help for hd-cli-wallet

```
USAGE
  $ hd-cli-wallet help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `hd-cli-wallet list-wallets`

List existing wallets.

```
USAGE
  $ hd-cli-wallet list-wallets
```

_See code: [src/commands/list-wallets.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/list-wallets.js)_

## `hd-cli-wallet nft-create-child`

Create NFT child

```
USAGE
  $ hd-cli-wallet nft-create-child

OPTIONS
  -c, --child=child        Name of the child
  -f, --funder=funder      Fee funder address index in the wallet
  -g, --groupId=groupId    NFT Group ID
  -h, --hash=hash          Document hash of the group
  -i, --index=index        Address index in the wallet
  -n, --name=name          Name of wallet
  -r, --receiver=receiver  Address to send the token
  -t, --ticker=ticker      Ticker of the child
  -u, --url=url            Document URL of the group

DESCRIPTION
  ...
  Will create NFT child token in a specified NFT group (groupId parameter)
```

_See code: [src/commands/nft-create-child.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/nft-create-child.js)_

## `hd-cli-wallet nft-create-group`

Create NFT Group

```
USAGE
  $ hd-cli-wallet nft-create-group

OPTIONS
  -a, --amount=amount
  -f, --funder=funder  Fee funder address index in the wallet
  -g, --group=group    Name of the group
  -h, --hash=hash      Document hash of the group
  -i, --index=index    Address index in the wallet
  -n, --name=name      Name of wallet
  -t, --ticker=ticker  Ticker of the group
  -u, --url=url        Document URL of the group

DESCRIPTION
  ...
  Will create NFT group with specified name, ticker and amount
```

_See code: [src/commands/nft-create-group.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/nft-create-group.js)_

## `hd-cli-wallet nft-list-addr`

List addresses inside the wallet

```
USAGE
  $ hd-cli-wallet nft-list-addr

OPTIONS
  -n, --name=name  Name of wallet

DESCRIPTION
  ...
  Will return a list of available addresses
```

_See code: [src/commands/nft-list-addr.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/nft-list-addr.js)_

## `hd-cli-wallet nft-list-tokens`

List NFT tokens in a wallet address

```
USAGE
  $ hd-cli-wallet nft-list-tokens

OPTIONS
  -g, --groups       List only NFT groups
  -i, --index=index  Address index in the wallet
  -n, --name=name    Name of wallet

DESCRIPTION
  ...
  Will return a JSON formated list of available NFT tokens
```

_See code: [src/commands/nft-list-tokens.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/nft-list-tokens.js)_

## `hd-cli-wallet nft-remove-child`

Remove NFT child token

```
USAGE
  $ hd-cli-wallet nft-remove-child

OPTIONS
  -f, --funder=funder    Fee funder address index in the wallet
  -i, --index=index      Address index in the wallet
  -n, --name=name        Name of wallet
  -t, --tokenId=tokenId  NFT child tokenId

DESCRIPTION
  ...
  Will remove NFT child token (type = 65) with specified tokenId
```

_See code: [src/commands/nft-remove-child.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/nft-remove-child.js)_

## `hd-cli-wallet remove-wallet`

Remove an existing wallet.

```
USAGE
  $ hd-cli-wallet remove-wallet

OPTIONS
  -n, --name=name  Name of wallet
```

_See code: [src/commands/remove-wallet.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/remove-wallet.js)_

## `hd-cli-wallet scan-funds`

Scans first 20 addresses of each derivation path for

```
USAGE
  $ hd-cli-wallet scan-funds

OPTIONS
  -m, --mnemonic=mnemonic  mnemonic phrase to generate addresses, wrapped in quotes

DESCRIPTION
  history and balance of the given mnemonic. If any of them had a history, scans
  the next 20, until it reaches a batch of 20 addresses with no history. The -m
  flag is used to pass it a mnemonic phrase.

  Derivation pathes used:
  145 - BIP44 standard path for Bitcoin Cash
  245 - BIP44 standard path for SLP tokens
  0 - Used by common software like the Bitcoin.com wallet and Honest.cash
```

_See code: [src/commands/scan-funds.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/scan-funds.js)_

## `hd-cli-wallet send`

Send an amount of BCH

```
USAGE
  $ hd-cli-wallet send

OPTIONS
  -a, --sendAddr=sendAddr  Cash address to send to
  -b, --bch=bch            Quantity in BCH
  -n, --name=name          Name of wallet
```

_See code: [src/commands/send.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/send.js)_

## `hd-cli-wallet send-all`

Send all BCH in a wallet to another address. **Degrades Privacy**

```
USAGE
  $ hd-cli-wallet send-all

OPTIONS
  -a, --sendAddr=sendAddr  Cash address to send to
  -i, --ignoreTokens       Ignore and burn tokens
  -n, --name=name          Name of wallet

DESCRIPTION
  Send all BCH in a wallet to another address.

  This method has a negative impact on privacy by linking all addresses in a
  wallet. If privacy of a concern, CoinJoin should be used.
  This is a good article describing the privacy concerns:
  https://bit.ly/2TnhdVc
```

_See code: [src/commands/send-all.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/send-all.js)_

## `hd-cli-wallet send-tokens`

Send SLP tokens.

```
USAGE
  $ hd-cli-wallet send-tokens

OPTIONS
  -a, --sendAddr=sendAddr  Cash or SimpleLedger address to send to
  -n, --name=name          Name of wallet
  -q, --qty=qty
  -t, --tokenId=tokenId    Token ID
```

_See code: [src/commands/send-tokens.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/send-tokens.js)_

## `hd-cli-wallet sign-message`

Sign message

```
USAGE
  $ hd-cli-wallet sign-message

OPTIONS
  -i, --sendAddrIndex=sendAddrIndex  Address index
  -m, --message=message              Message to sign. (Wrap in quotes)
  -n, --name=name                    Name of wallet
```

_See code: [src/commands/sign-message.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/sign-message.js)_

## `hd-cli-wallet slp-avax-bridge`

Send SLP tokens.

```
USAGE
  $ hd-cli-wallet slp-avax-bridge

OPTIONS
  -a, --sendAddr=sendAddr  [default: bitcoincash:qrmjjjhz0a7dhp46ymw36l9zd0wcfryahq3s4989yj] Cash or SimpleLedger bridge
                           address

  -n, --name=name          Name of wallet

  -q, --qty=qty

  -t, --tokenId=tokenId    [default: c43eb59134473addee345df4172f4432bd09a8f087ba683462f0d66f8d221213] Token ID

  -x, --avaxAddr=avaxAddr  Avalanche address to send tokens to from the bridge
```

_See code: [src/commands/slp-avax-bridge.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/slp-avax-bridge.js)_

## `hd-cli-wallet sweep`

Sweep a private key

```
USAGE
  $ hd-cli-wallet sweep

OPTIONS
  -a, --address=address  Address to sweep funds to.
  -b, --balanceOnly      Balance only, no claim.
  -i, --tokenId=tokenId  The token ID to sweep when there are multiple tokens
  -t, --testnet          Testnet
  -w, --wif=wif          WIF private key

DESCRIPTION
  ...
  Sweeps a private key in WIF format.
  Supports SLP token sweeping, but only one token class at a time. It will throw
  an error if a WIF contains more than one class of token.
```

_See code: [src/commands/sweep.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/sweep.js)_

## `hd-cli-wallet update-balances`

Poll the network and update the balances of the wallet.

```
USAGE
  $ hd-cli-wallet update-balances

OPTIONS
  -i, --ignoreTokens  Ignore and burn tokens
  -n, --name=name     Name of wallet
```

_See code: [src/commands/update-balances.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/update-balances.js)_
<!-- commandsstop -->
