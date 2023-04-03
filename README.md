# hd-cli-wallet

This JavaScript library is several things in one:
- A Bitcoin Cash (BCH) HD wallet
- A command line interface (CLI) application
- A npm library

This app can be run from source to generate wallets, send, and receive BCH. It has hooks to interface with [colab-coinjoin-api](https://github.com/bch-coinjoin/colab-coinjoin-api) in order to preserve privacy by anonymizing your BCH using the [Collaborative CoinJoin protocol](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps004-collaborative-coinjoin.md).

This code is also compiled into a the [hd-cli-wallet npm library](https://www.npmjs.com/package/hd-cli-wallet). This library is included into the [electron-bch-coinjoin-wallet](https://github.com/bch-coinjoin/electron-bch-coinjoin-wallet) desktop application, in order to provide a BCH wallet with a graphical user interface (GUI).

<!-- toc -->
* [hd-cli-wallet](#hd-cli-wallet)
* [NPM Usage](#npm-usage)
* [Install Dev Environment](#install-dev-environment)
* [Command Line Usage](#command-line-usage)
* [Commands](#commands)
<!-- tocstop -->

# NPM Usage

The [npm library](https://www.npmjs.com/package/hd-cli-wallet) can be included
in your own app to instantly give it the ability to send and receive BCH transactions, including SLP tokens.
Here is an example of how to include it in your own app. This example will generate
a new HD wallet.

```javascript
// Instantiate the Create Wallet class from this library.
const CreateWallet = require('hd-cli-wallet')
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

- npm: v16.19.0
- node.js: v8.19.3

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
* [`hd-cli-wallet coinjoin-single`](#hd-cli-wallet-coinjoin-single)
* [`hd-cli-wallet create-wallet`](#hd-cli-wallet-create-wallet)
* [`hd-cli-wallet get-address`](#hd-cli-wallet-get-address)
* [`hd-cli-wallet help [COMMAND]`](#hd-cli-wallet-help-command)
* [`hd-cli-wallet list-wallets`](#hd-cli-wallet-list-wallets)
* [`hd-cli-wallet remove-wallet`](#hd-cli-wallet-remove-wallet)
* [`hd-cli-wallet send`](#hd-cli-wallet-send)
* [`hd-cli-wallet send-all`](#hd-cli-wallet-send-all)
* [`hd-cli-wallet split-utxo`](#hd-cli-wallet-split-utxo)
* [`hd-cli-wallet update-balances`](#hd-cli-wallet-update-balances)

## `hd-cli-wallet coinjoin-single`

Pariticipate in a single CoinJoin round

```
USAGE
  $ hd-cli-wallet coinjoin-single

OPTIONS
  -n, --name=name  Name of wallet

DESCRIPTION
  This command will initiate a CoinJoin round, and will exit after a single
  successful round.
```

_See code: [src/commands/coinjoin-single.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/coinjoin-single.js)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `hd-cli-wallet list-wallets`

List existing wallets.

```
USAGE
  $ hd-cli-wallet list-wallets
```

_See code: [src/commands/list-wallets.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/list-wallets.js)_

## `hd-cli-wallet remove-wallet`

Remove an existing wallet.

```
USAGE
  $ hd-cli-wallet remove-wallet

OPTIONS
  -n, --name=name  Name of wallet
```

_See code: [src/commands/remove-wallet.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/remove-wallet.js)_

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
  -n, --name=name          Name of wallet

DESCRIPTION
  Send all BCH in a wallet to another address.

  This method has a negative impact on privacy by linking all addresses in a
  wallet. If privacy of a concern, CoinJoin should be used.
  This is a good article describing the privacy concerns:
  https://bit.ly/2TnhdVc
```

_See code: [src/commands/send-all.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/send-all.js)_

## `hd-cli-wallet split-utxo`

Send an amount of BCH

```
USAGE
  $ hd-cli-wallet split-utxo

OPTIONS
  -n, --name=name  Name of wallet
```

_See code: [src/commands/split-utxo.js](https://github.com/bch-coinjoin/hd-cli-wallet/blob/v1.0.1/src/commands/split-utxo.js)_

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
