
#### Install

On Raspbian or Ubunutu 18 run the `install.sh` script file. From the ao directory, add the permission and run script:
```
chmod u+x install.sh
./install.sh
```
Try running the script 2-3 times. Process should be running on localhost:8003 after setup. **The username and password of the first user is dctrl**. Script creates lightning wallet [clightning](https://github.com/ElementsProject/lightning) and requires a full node. Addresses and invoices are controlled on your device. Backup the ~/.lightning/bitcoin/hsm_secret file. Use at your own risk!

### Autonomous Organization

1. Add ideas, missions, goals, text on cards.
2. Create accounts that can log in and register rfid tags.
3. Manage smart vending machine and maglock door using [pi](https://github.com/autonomousorganization/pi).
4. Use tor to access remotely and relay cards to another ao.
