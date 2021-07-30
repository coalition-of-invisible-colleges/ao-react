# ao-react

ao-react is a reimplementation of the [AO on Vue](https://github.com/AutonomousOrganization/ao-3/) frontend using TypeScript and React.

## Install

The AO comes with an install script that will install all the prerequisites for the AO, including sqlite3, as well as tor, bitcoin, c-lightning, and other apps that the AO integrates. The script has been tested on Debian, Raspbian, and Manjaro.

1. `wget http://raw.githubusercontent.com/coalition-of-invisible-colleges/ao-react/staging/install.sh`

or clone the repository, which contains the install.sh script:

```
git clone https://github.com/coalition-of-invisible-colleges/ao-react.git
cd ao-react
```

2. `chmod +x install.sh`

3. `./install.sh`

4. `rm ao-react/configuration.js`

5. `./install.sh`

The script will generate a valid configuration file, so step #4 has you delete the script so it will be regenerated after tor has been installed.

### Default URL, port, and login

After compiling a webserver should be hosted on 127.0.0.1:3000.

The **name _and_ password** of the first account is **dctrl**.

Once you log into the AO, you can take a tour of its features by clicking Start Tour, near the bottom-left corner of the page.

### Installing manually / using NPM

The AO runs on Node.js, which is controlled using three commands: `node` itself, `nvm` (node version manager), and `npm` (node package manager). `node` is the JavaScript platform itself, and it compiles and executes your code, hosting the AO server. `nvm` installs and manages your different versions of node. `npm` is used to install the packages for a node project, compile a node project, or run node project scripts. `npx` is also sometimes used as a shortcut to execute node scripts directly.

#### `npm install`

`npm i` is a synonym for `npm install`.

Run `npm i` to install package dependences that are listed in the `package.json` file, generating the `node_modules` folder. You can always delete the `node_modules` folder and run `npm i` again to regenerate it. Whenever you change node versions (e.g., with `nvm use current` or `nvm use 16`), you will need to run `npm i` again to reinstall the project and its dependencies using the current version of node.

#### `npm run <script name>`

The `npm run <script name>` command runs the named bash script from the `packages.json` file. See this file for available scripts. Some of the most important ones are:

`npm run webpack` - compiles the client (the server is interpreted and does not need to be compiled)

`npm run start` - launches the server, recompiles the client and begins serving it, watching the folder for changes and recompiling when changed files are detected

## Important locations

Here are some important locations the AO uses:

### `~/ao-react/configuration.js`

Assuming you installed the AO to ~/ao-react/, this will be the location of your configuration.js file. This file is used at compiletime to configure settings for your AO server. To generate a fresh and valid configuration file, delete or rename (`mv`) your current configuration.js file, then run the install.sh script. See below for a complete description of what can be configured in this file.

### sqlite3 - `~/.ao/database.sqlite3`

This is the default path where the AO's sqlite3 database file is stored. You can manually read and edit this file using the `sqlite3` command. (Example query: `select * from events where document like '%hippopotamus%';`, where the % signs are wildcards surrounding the search string.)

### c-lightning `~/.lightning/`

This is the directory where the bitcoin lightning wallet is created

### c-lightning `~/.lightning/bitcoin/hsm_secret file`

At this time [clightning](https://github.com/ElementsProject/lightning) requires [bitcoind](https://www.bitcoin.org/download). AO facilitates getting addresses and invoices from this wallet. Backup the . Use responsibly and at your own risk!

### tor - `/usr/local/etc/tor/torrc`

This file configures tor's external access. The install.sh script will add a line to the end of this file to host the AO on tor.

## Anatomy of Autonomous Organization

### Three dimensions:

The dimensions of ao are the three aspects of a decentralized society.

- **Unicorn**: You, the individual
- **Sun**: We, the community
- **Bull**: The Computer, the server

### Five modes:

The modes of ao correspond loosely to

- **doge**: contemplate, articulate
- **boat**: plan, prioritize
- **badge**: acknowledge, collaborate, account
- **chest**: reward, value, incentivize
- **timecube**: schedule, coordinate

Switch dimension using the top corners of the page: top left to the Sun, top right to the Bull. At the top center, the current mode is displayed and can be switched with clicks or swipes. Each of the dimensions is augmented by the current mode for 15 combinations. _Unicorn-doge_ is where you start; you start on your account card.

#### Cards

Ao is a blank piece of infinite paper. It can be used for articulating goals, augmenting memory, storing memes, or however you like.

To create a new card, click at the bottom center to reveal a text input box. As you type search results will appear if existing cards match (via regular expressions). On enter it will be placed on top of the panel inside the current card; parsed in markdown, it can include links, images, or embedded content.

Double click on a card it becomes the new context and more cards can be made within it. To be clear: ao is card inception.

Cards have clickies at each corner. Top left (bird) opens a selection to send. Bottom left removes it from the present context; it can be found again or brought back with the search. Bottom right is the same as a double click and will go into it.

The top right adds to the priorities list, adds a mission title, claims as completed, or schedules a time depending on the mode.

#### Upgrades

Depending on the mode there are four possible views: a priority list, accounts and their activity, an interface to add points, and a calendar.

Upgrades are specific to the current card and reveal or summarize information about the contained cards or past activity. Upgrade interactions update in real time to other account on the ao.

#### Accounts and Holds

Each account is able to see and move cards, organize lists, create new accounts, shares the abilities of the origin account. If you make an account for someone on your ao, it is because you trust them and want to read there thoughts, and collaborate on ideas together. Ao can be concieved as shared memory, all accounts can alter the memory.

Each card account can only hold a card once, be relevant to it, be on the badge list, and be elegable for checkmarks with that context. By holding it your account is also protecting it from being removed. On the sun pages cards with the most holds come to the top. When you create a card you automatically become the first holder of it. Click the moon to toggle your hold.

#### Points

Ao is an interface to recieve payments in bitcoin. Each card can request payment and when recieved it is translated to points on the card or account. Points on a card indicate irrefutably that someone values that idea. Ao converts payments into points using the btc-cad exchange rate (~8500&#12471; per point). Note that is is a recieve only, channel create interface, to withdraw or make outgoing payments you must have access to the computer or server running the ao.

Optionally, you can set an amount of points to divide monthly between active accounts. If accounts have no points they will become inactive. Add points to an account using bitcoin to automatically reactivate it.

#### Physical Resources

Using the gpio pins of a raspberry pi and the [repo pi](https://github.com/autonomousorganization/pi). Physical objects - such as maglock doors and vending machines - can be hooked up then triggered by fob or by button. The resource will only respond for accounts that are active.

#### Ao 2 Ao

Ao allows you or others to access from anywhere using a tor .onion location. You can connect two ao servers together, then mark cards that you would like to share. Ao will periodically keep the contents of the linked cards synced between servers.

#### Customize

I suggest starting by swapping the images in `src/assets/images/*` and hex codes in `src/styles/colours.styl` to suit your mojo.

---

###### Ao is an open source project built with open source tools on open source platforms. Much love and gratitude to climb on the shoulders of giants. Linux, Ubuntu, Nodejs, Vuejs, Sqlite3, Tor, Atom, Bitcoind, Clightning, Firefox.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

---
