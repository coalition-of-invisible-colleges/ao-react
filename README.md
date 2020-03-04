
#### Install

AO is a vue project get started with the developer mode that allows you to explore the code.

```
npm install
npm run serve
```

To be fully setup ao requires (tested on) Ubuntu 18 and Raspbian lite. These dependencies will be installed:
- sqlite3 - `~/.ao/database.sqlite3` file where history is stored
- clightning - `~/.lightning/` directory where bitcoin wallet is created
- tor - `/usr/local/etc/tor/torrc` file that configures external access

```
npm run setup
npm install
npm run compile
```

After compiling a webserver should be hosted on localhost:8003.

- The **name *and* password** of the first account is **dctrl**.

At this time [clightning](https://github.com/ElementsProject/lightning) requires [bitcoind](https://www.bitcoin.org/download). Ao facilitates getting addresses and invoices from this wallet. Backup the ~/.lightning/bitcoin/hsm_secret file. Use responsibly and at your own risk!

After setup, the ao and any information you put into it are meaningfully *yours*.

### Anatomy of Autonomous Organization
#### - Three dimensions: Unicorn, Sun, and Bull.
The dimensions of ao are the three aspects of a decentralized society. You, the individual (Unicorn), We, the community (Sun), and The Computer, the server (Bull).
#### - Five modes: doge, boat, badge, chest, and timecube
The modes of ao correspond loosely to
- doge: contemplate, articulate
- boat: plan, prioritize
- badge: acknowledge, collaborate
- chest: reward, value, incentivize
- timecube: schedule, coordinate

Each of the dimensions is augmented by the current mode to make 15 different places that can be navigated to using the three clickies at the top of the page. Top left takes you to the Sun, top right to the Bull, and center top - the Helm - switches the mode.

#### Cards

When in Unicorn - the main dimension - you view, add to, adjust, organize and navigate arounds cards. The current context is the card currently being viewed; you see its upgrades and its panel of contained cards. Click on the five color bar at the bottom center of the page to add a card to the panel of this context. Double click on a card and you go into it. The card becomes the new context and the color bar now creates cards within this card. To be clear, ao is card inception.

Cards are units of text that render markdown and can include links, images, and other embedded content. Cards have clickies at each corner and in the bottom center middle. Top left (bird) allows you to send to other accounts. Cards send to you display in front of the upgrades panel and take one attention. Bottom left (downboat or scuttle) is the 'go away' or 'not now' interaction and will remove it from the present context. Bottom right is the same as a double click and will (go in) make that card the current context.

#### Upgrades: priorities, checkmarks, calendar

Depending on the mode you will see one of 4 possible upgrade tools:
- Boat: a list of cards, considered priorities, to be completed.
- Badge: a list of accounts and their checkmarks
- Chest: add points to this card using bitcoin
- Timecube: a calendar that displays dates set on cards within

On the card the top right interaction depends on the mode:
- Doge/boat: prioritize this card to the top of the priorities list
- Badge: add a label (mission title), make the card more prominent and easier to find.  
- Chest: mark card as completed, get the checkmark
- Timecube: Schedule or update date

#### Accounts, Holds, Vouches, and Checkmarks

When you initialize your ao the first thing you will want to do is change the initial account details from name:dctrl/password:dctrl and add accounts for anyone you intend to invite to collaborate with you. The account management tools are on the Bull-badge, three clicks on the top right bull will get you there. Each account is a powerful demigod. They have as much power to see and move cards, organize lists, create new accounts, etc... as your account does.

Each account can only hold a card once, be relevant to it, be on the badge list, and be elegable for checkmarks with that context. On the sun pages cards with the most holds come to the top. When you create a card you automatically become the first holder of it. Click the center middle circle to toggle your hold.

Each account is also a card itself, if you hold the card of another account you are vouching for that account.

#### Points, Rent, and physical Resources

Optionally, you can set a amount of Points to divide evenly between the active accounts each month. If accounts have no points they will become inactive. Adding points to an accounts card using bitcoin will automatically reactivate it.

Using a raspberry pi and [pi](https://github.com/autonomousorganization/pi). Physical objects can be hooked up and triggered by fob or by button (Bull-doge). The resource will only respond for accounts that are active.

<!-- #### Ao 2 Ao
*work in progress* -->

#### Customize
I suggest starting by swapping the images in `src/assets/images/*`  and hex codes in `src/styles/colours.styl` to suit your mojo.

***
###### Ao is an open source project built with open source tools on open source platforms. Much love and gratitude to climb on the shoulders of giants. Linux, Ubuntu, Nodejs, Vuejs, Sqlite3, Tor, Atom, Bitcoind, Clightning, Firefox.
***
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
