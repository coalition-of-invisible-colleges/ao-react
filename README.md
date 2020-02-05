
#### Install

To get started from the node projects directory:

```
npm install
npm run compile
npm run start
```

On Raspbian or Ubunutu 18 run `npm run setup` to updates and environment dependencies
- sqlite3
- tor
- lightning
<!-- - ipfs  -->

Process runs on localhost:8003 after setup. **The username and password of the first user is dctrl**. Script creates lightning wallet [clightning](https://github.com/ElementsProject/lightning) and requires a full node (bitcoind). Addresses and invoices are controlled on your device. Backup the ~/.lightning/bitcoin/hsm_secret file. Use at your own risk!

### Autonomous Organization

- Create accounts that can log in and register rfid tags.
- Manage vending machines and maglocks using [pi](https://github.com/autonomousorganization/pi).
- Add ideas, missions, goals, text to cards and pass them to other users.
- Use tor to access remotely and relay cards to other aos.
