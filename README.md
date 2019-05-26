
#### Autonomous Organization

AO is javascrinfrastructure to help share & co-ordinate

`git clone dctrl.ca`
`cd ao`

`yarn install`
`yarn compile`
`yarn start`

Feature list:
    - Connect resources with rfid readers and pin activated hardware
    - Maintain list of accounts associated with rfid tag & password
    - Accounts can create cards, send them between accounts, create lists of priorities, plunge cards into cards inception.

To fully function ao requires sqlite3, bitcoind, and clightning. Example configuration.js:

`module.exports = {
    bitcoind:{
        username:'dctrl',
        password:'123',
        network: 'regtest'
    },
    bitcoinAverage: {
        pub: '',
        secret: ''
    },
    clightning: {
        dir:'/home/trhode/.lightning'
    },
    sqlite3: {
        file: '/home/trhode/.ao/database.sqlite3'
    }

}
`

The addresses created by ao are on this device - backup the ~/.lightning/hsm_secret file.
