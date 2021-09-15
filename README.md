# ao-react

ao-react is a reimplementation of the AO frontend using TypeScript and React.

Benefits compared to the [AO on Vue](https://github.com/AutonomousOrganization/ao/):

- AO API abstracted to one file
- Totally responsive—platform bugs, slowdowns and memory leaks are gone (afaict).
- CSS organized in one place, in one structure which matches page layout.
- React elements use native HTML; custom components appear as native HTML elements (no extra divs needed!).
- TypeScript ubiquitously checks types, speeding up coding, reducing errors, and improving security.
- CSS themes already work.
- New card grid with working drag-and-drop makes it easy to organize cards spatially.

Disadvantages:

- Vue is community-built from the ground up; React is maintained by Facebook and TypeScript by Microsoft. Both are open-source, though. Vue 3.0 might be great but it is still delayed.
- Vue might be more fun to code in. In React you have to deal with all verbosity of HTML and JavaScript.
- Still missing about half the features of the original AO (these are being rapidly ported).
- A few mutations have changed, which might make databases incompatible.
- Still no way to easily migrate cards between databases.
- Vue's idiosyncratic page layout language is more concise than React's HTML-like components.
- Consolidating CSS means it is not compartmentalized with each component.
- Original AO layout will need to be ported over (or, a new streamlined layout based around grids).
- Possible performance issues (computer seems to run moderately hot).

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

- The **name _and_ password** of the first account is **dctrl**.

At this time [clightning](https://github.com/ElementsProject/lightning) requires [bitcoind](https://www.bitcoin.org/download). Ao facilitates getting addresses and invoices from this wallet. Backup the ~/.lightning/bitcoin/hsm_secret file. Use responsibly and at your own risk!

After setup, the ao and any information you put into it are meaningfully _yours_.

### Anatomy of Autonomous Organization

#### - Three dimensions:

The dimensions of ao are the three aspects of a decentralized society.

- **Unicorn**: You, the individual
- **Sun**: We, the community
- **Bull**: The Computer, the server

#### - Five modes:

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
