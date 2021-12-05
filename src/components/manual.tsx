import * as React from 'react'
import Markdown from 'markdown-to-jsx'
import { gloss } from '../semantics'
import { toTitleCase } from '../calculations'
import aoStore from '../client/store'

const topics = {
  Introduction: `Welcome to the AO User Manual! Here you will find a comprehensive guide to all of the AO's functions and many of its possible uses.

The <a href="https://github.com/coalition-of-invisible-colleges/ao-react">ao-react project</a> is currently at version 0.7.0.

This user manual is currently at version 0.7.1`,
  Overview: {
    index: `The AO is a free software project and a lived practice of creating open-source software for an online-and-offline peer-to-peer community.

A.O. stands for "Autonomous Organization". The AO seeks to distribute power informally by teaching new users how to set up and administer an AO server. This is similar to DAOs, but we have dropped the 'D', which stands for "Decentralized", because the AO does not use blockchain technology and is ultimately technology-agnostic.

The AO is not just software. The AO is a distributed, agile, flocking organization made up of everyone who uses the AO software or enacts the liberatory peer-to-peer principles of the AO in their dealings with others.

Each new person who discovers the AO has their own desires, feature requests, and big ideas. The AO is intended to include and smooth out the entire process of bringing in new community members, teaching them how to use the software, and improving the software based on requests from the new community member.

For developers, the AO provides a free and increasingly standards-focused digital space, as well as a suite of task-management tools for improving the AO in collaboration with other AO developers.`,
    "What's it For?": `There are many reasons you might set up an AO server. Here are some of the types of community projects the AO was specifically designed to support:

### Local Hackerspace

The AO was originally created to help a local hackerspace manage its membership dues and to allow active members to use an RFID fob to open the front door. Members can also pay bitcoin or lightning to the AO to activate the bitcoin soda machine, or use the AO to control the sidewalk LED art.

### Chore Rota

For a household or a local community center, the AO can be used to help organize chores and other maintenance tasks for the community. The points and bounty system in the AO make it easy to create and distribute either real or made-up local points amongst various projects and goals, and people who complete those tasks can claim the points on them.

### Hardware Automation / IOT

Hardware devices can be connected to the AO over a local network and controlled through customizeable panels. Custom scripts for each device can be triggered by the AO to allow virtually any device to be connected and controlled or automated. AO users have created dancing LED sidewalk art installations, security doors, and bitcoin-activated vending machines, with plans for autonomous lockers and other useful devices.

### Online Image Board

In addition to local communities, the AO is also designed to support online-only communities. Since digital communities are ultimately grounded in the media they exchange, the AO comes with drag-and-drop file sharing and the ability to automatically sync file attachments over tor between two paired AO servers. This makes the AO ideal for trading rare memes.

### Virtual Rooms

The AO is also a good place to hang out online in real time. Each group can have a chatroom added to it, making it easy to create new secure virtual rooms.

### Online Classes

For online schools and freelance teachers, the AO makes it easy to organize a group as a class, assign roles (levels) to members of a classroom, and share cards in the dropbox that can only be accessed by members of that level.

### News Syndication

The AO's peer-to-peer tor synchronization feature makes it trivial to syndicate news through multiple hops across the network. By networking our AO servers together, we can build a powerful decentralized news network.

### Personal Wiki

The cards on the AO are designed to make it easy to capture ideas at any time, and keep these ideas as organized as possible with the minimum number of actions. Cards can be placed inside each other, and one card can appear in multiple locations. Search uses regular expressions to provide powerful and industry-standard access to cards.

### Getting Things Done

The AO has been designed with a powerful productivity workflow that focuses on doing and completing tasks, not endless planning. An exciting feature called the Hopper allows you to hop automatically between your bookmarks every X to Y minutes, optionally sending you a Signal notification. This lets you get a bird's eye view of all your tasks or receive randomized reminders or affirmations throughout your day. The AO has also been designed with David Allen's GTD system in mind.

### Political Campaigns

For activists or decentralist politicians, the AO has been designed as the ultimate specialized tool for decentralized community organizers and canvassers-for-the-people. The AO will help you to get a top-level view, recruit, communicate, plan timelines (with grids), build knowledge bases, and track checklists.

### Email Replacement (planned feature)

Send cards to other members on the same server, or sync cards securely over tor. Future updates will allow the AO to act as a public (or members-only) website where people can go to send you messages. Also under consideration is transitional full email server integration (incoming emails will arrive as cards—a sender approved list or Captcha will stop spam before it starts).

### Independent Content Publishing (planned feature)

For content creators, the AO will make it easy to publish your content publicly or for members-only, and collect donations or required monthly dues from members. Why use YouTube when you can host your own content and provide your viewers a customizable and intimate free or membership experience?`,
    'Getting Started': `To use the AO, you must have an account.

1. Someone else will need to create an account for you and tell you the URL, your username and password so you can log in.

2. Visit the URL and type the username and password and press Enter to log in.

When you first log in, there will be a big, rainbow button that says "**Take Tour**" in the lower left of the page. Click this to take an introductory tour of the AO.

The default username for new AO accounts is the same as the username.

Planned feature: The ability for anyone to create an new account on the AO, without having to be invited.`,
  },
  Cards: {
    index: `The AO stores a deck of cards for each member on a server. You can put plain text, Markdown, HTML, pasted links, or uploaded files on a card. You can send cards to other members on the same server, or synchronize cards and their attachments with another AO server over tor.`,
    'Creating a Card': `There are two ways to create a card:

1. Click the Compose button at the top of the bookmarks bar (bottom center), type something, and press Enter to create the card. This will create a card within the card you are currently viewing.

2. Click an empty grid square, type something, then press Enter to create the card. This will create a card and place it in that grid square.

The card compose box will remember a draft you are writing. Your draft is stored locally in your browser and also saved on the server.

Planned features: Choose color of card before creating; rich text editing features; ability to create a card already-prioritized; ability to create cards encrypted with the server's private key.`,
    'Navigating Within a Card': `Cards can contain other cards within them.

1. Click a card to navigate to it and see what's within it.`,
    'Viewing Your Deck':
      'Each member has a deck of cards on each AO server that they have an account on. You can view and search all of the cards in your deck by clicking the icon to the right of the bookmarks bar, along the bottom edge of the screen.',
    'Grabbing cards':
      'If you see a card you like or someone sends you a card, you can grab it and add it to your deck by clicking the Grab icon on the card. Cards in your deck cannot be deleted by other members—cards that are held by nobody may be cleaned up every 5-10 minutes.',
    'Searching for Cards': `To find a card you are looking for, you can use the search box.

1. Click the Search icon in the button left corner of the page, then type what you are looking for in the search box.

The AO's search uses regular expressions, a powerful way to format your searches. For example, to search for all cards on the server, search for ".\\\*" (period asterisk). For more information on regular expressions, search the web for "regular expression guide" or "regular expressoin cheatsheet". If you want to avoid using regular expressions, you must escape certain punctuation marks by preceding them with a backslash. For example, period (.) and asterisk (\\\*) are special characters, so to search for them, search for "\\\\." and "\\\\\*" respectively.`,
    'Sharing Cards': `After you grab a card, an icon will appear in the top-left corner of the card. Click this icon and type a member name to send this card to another member on this server.`,
    'Receiving cards': `When someone sends you a card, it will appear in a giftbox on your member card. Click it to open the gift and put the card in your member priorities. This will add the card to your deck; discard the card to send it to your archive, where it can be deleted (feature coming soon).
Planned feature: Ability to open a gift without accepting it yet (was previously possible)`,
    'Bookmarking cards': `You can drop cards on your dock aka bookmarks bar at the bottom center edge of the screen. Use the bookmarks bar to store frequently-used groups or cards, or use it as a clipboard or composition area.

You can resize the bookmarks bar by clicking the +/- buttons on its right edge.

Guild cards placed in the bookmarks bar will act like folders, and cards dropped on them will be moved within to that card's priorities. By placing a few different guilds on the bookmarks bar, can use the boomarks bar to quickly sort cards into categories.
  This is just a normal grid on a reserved card that is named based on your memberId (normally hidden, you can see it in the address bar on your home card).`,
    'Uploading a file': `You can upload a file to the AO as an attachment to a new card.

1. Add a pyramid or grid to the card, if it doesn't have one.have

2. Drag a file from your desktop and drop it on an empty grid square.grid

3. Wait until the file fully uploads, then it should re-download and appear on a new yellow card.

If the card is blue, something went wrong.

Files are stored by their hash so if you need to re-upload the same file, change it a tiny bit and then it will re-upload properly.`,
    'The Community Hub Card': `There is a reserved card with the text 'community hub' on each server. Click the icon in the top-left corner of the screen to visit this card. Having one card as a shared starting-place for everyone makes it much easier to start sharing cards, memes, and news in smaller communities. The other way to share stuff within a server is guilds.`,
  },
  'Organizing Cards': {
    index:
      'When you view a card, you can also place other cards within it, and modify the card in various ways.',
    'Zones within a card': `Each card has four zones where other cards can be placed: the priorities, the pyramid or grid, the stack below grid, and the accomplishments.the

### Priorities

Prioritized cards appear in a stack just after the content of the card. If this stack has more than one card in it, a number will display below the stack of the number of hidden cards. Click this number to show the other cards in the stack.

To prioritize a card, drag it to the priorities area, or if the card has a boat icon in its top-right corner, click that will prioritize it.

If the list of priorities has more than 6 items in it, a button that says "Refocus" will appear. Click this button to dump all priorities back down to the other stack of cards below.

The number of priorities with an a card displays on the front of the card, followed by an exclamation mark. For example, a card with three priorities will display a small "3!" on its face. Click this number to toggle priority mode. While in priority mode, the first priority of a card will display in front of that card on the grid. This allows you to see your next actions even in nested subprojects.

To re-prioritize a card to the top of the priorities, drag and drop a card onto the priorities stack.

### Pyramid / Grid

After the priorities, an optional grid or pyramid can be added to a card. A grid has squares that other cards can be dragged an dropped on. To add a pyramid to a card, click the card's menu (three dots in lower right of card), then click "Add pyramid".  To change it to a grid, click the small triangualur menu button in the lower right corner of the pyramid, then click Grid in the popup menu that appears. In this menu, you can also increase and decrease the size of the grid squares.the

To resize a pyramid or increase the number of rows a grid has, click the horizontal +/- button below the grid. To increase the number of columns a grid has, click the vertical +/- buttons to the right of the grid. If you use these buttons to shrink a pyramid or grid to one row (or column), a "-grid" button will appear which allows the grid to be removed.

When a grid is shrunk, any cards that no longer fit will be harmlessly dumped to the stack below the grid.

Please break these sections out and combine with grid section below.

### Subcards

Other cards that are not prioritized and not placed on the grid accumulate in the stack below the grid. To move a card to the top of the subcards stack, drag and drop a card onto the stack.the

### Accomplishments

The Accomplishments icon appears in the lower left corner of the card when a card contains at least one completed card. When you discard a card from another card, if that card has at least one checkmark, it is moved to the Accomplishments section instead of being discarded. This allows you to collect accomplishments wthout having to think about it.

Click the Accomplishments icon to show the completed cards within a card. If you want to remove a card from the Accomplishments section, drag it and drop it to the background of the page.`,
    'Moving cards around': 'Use drag-and-drop to move cards around',
    'Discarding cards':
      'You can drop cards onto the black background and they will be discarded from the current card. Discarding will not delete the card, just remove it from its present location. You can drag on the black background itself to grab the most recently-discarded card back (it remembers all the cards you discard locally until you refresh the page).',
    'Card menu':
      'Each card has a card menu, which is three dots in the lower-right corner or on the right edge of the card. Click it to see various options and modifications for the card.',
    'The Grid':
      "Each card can have a grid added to it, and other cards can be place in the squares of this grid. The grid can be resized or removed. If the grid is resized, any cards that no longer fit will fall down to the stack below the grid. To add a grid to a card, click the card's card menu and then click '+grid'.",
  },
  Productivity: {
    index:
      'The AO contains all the things you need to track todo lists, organize your life, and get tons done!',
    'Checking off tasks': 'Every card has a checkmark you can check',
    'Prioritizing tasks':
      'When viewing a full card, you can drag a card within it to the priorities stack to prioritize it. This places it visually above the other cards so you can focus on it first.',
    'Starting tasks':
      "(Upcoming feature) If you want to completely immerse yourself in the AO's tasking experience, you can press DO IT next to the first priority within a card. This will start the timeclock and display the task at the top center of your screen to remind you that you are still working on it. You can use this feature to optimize your time-management through feedback, or to track work or time spent on different projects.",
    'The Hopper': 'The hopper allows you to hop between your bookmarks',
    'Drawing cards':
      'Not sure what to do next? Press the Escape key to go up one card at at time until you clear all the cards. Behind it you will find up to four draw piles including plus a Doge that randomly chooses from one of the piles below.',
  },
  Guilds: {
    index:
      'A guild is a card that has been upgraded into a group. Guilds have various features that help make groups run smoothly.',
    'Creating Guilds': `How to do it here`,
    'Joining a Guild': `Here is a paragraph describing how to join a guild. This longer text will eventually run off the screen, causing it to scroll.`,
    'Joining the video chatroom':
      'A guild can have a stash added to it by clicking +chatroom in its card menu. The chatroom icon will appear near the top-right corner of the card. Click this button to join the chatroom, which will appear in a panel on the right side of the page. This panel will remain open as you browse other cards. The chatroom contains a secure Jitsi video chat embed—you will be asked for camera and microphone permission. Below the video room, you can also choose a color and type chat messages to create cards of that color in the chat box. These cards will be moved out of the chat box and into the guild that the chatroom belongs to if anyone grabs them.',
    'Guild Stash':
      'A guild can have a stash added to it by clicking +stash in its card menu. The stash icon will appear near the top-left corner of the card. The stash is a dropbox for members who have joined the guild and been accepted. There is one dropbox for each guild membership level within a guild. Members of one level can access the stash of their level and the levels below them.',
  },
  Events: {
    index: `The AO includes a calendar that allows you to plan events and schedule reminders, individually or within a guild.`,
    'Booking an event': `A card can have a time and date attached to it to turn it into an event.`,
    'Viewing upcoming events':
      'Click the calendar icon on the left edge of the screen to show upcoming events.',
  },
  Account: {
    index: 'You need a member account to log in.',
    'Changing your password': `Click the main menu (three dots in lower right corner) and then click Change Password. Type your new password twice and hit Enter.`,
    'Changing your username':
      'Click the main menu (three dots in lower right corner) and then click your username, the top item in the menu. Enter a new username and press enter. You will need to log in with this new username next time you log in, so be careful to remember you changed it!',
  },
  Members: {
    index:
      'Click the Members icon on the left edge of the screen to show the Members panel. It contains all of the member cards on this server.',
    'Creating new users': 'Invite them on the member panel',
    'Monthly memberships':
      'If your server offers monthly memberships, here is how they work and how to pay them.',
    'Administering other members':
      'If you need to clean up old accounts or ban unruly members, here is how the Senpai System works and how to do these things.',
  },
  'Points & Bounties': {
    index: 'The AO includes a simple system of points on each server.',
    'Refilling points':
      'Use bitcoin to refill points (not currently implemented)',
    'Spending points':
      'How to spend points on things or send them to other people',
  },
  Cryptocurrency: {
    index:
      'The AO includes native support for bitcoin (not currently implemented) and several other cryptocurrency-related features.',
    'Lightning connection info':
      "The AO integrates with the bitcoin lightning network. When the AO connects to the server's lightning node, it will display detailed information on connections to and from the server, current balances, etc.",
    Tickers:
      'The AO comes with convenient crypto tickers that allow you to ambiently monitor the relative worthlessness of various shitcoins.',
  },
  Hardware:
    'To access hardware resources connected to the AO, click the icon in the top-right corner of the screen.',
  Installation: {
    index:
      'Instructions from scratch for installing the AO on various platforms',
    'Running the install script': `The AO comes with a comprehensive install script, just download and run it and it will do almost everything.

1. Open a terminal (in your home directory).wget

2. \`wget https://raw.githubusercontent.com/coalition-of-invisible-colleges/ao-react/master/install.sh\`

3. \`chmod +x install.sh\`

4. \`./install.sh\`

5. Wait for installation to finish. It may take 15 minutes or up to several hours on slower computers.

Now, you must delete the autogenerated configuration.js file and run the install script a second time to regenerate it. (Do not delete your configuration.js file if you have already customized it!)

1. \`rm ~/ao-react/configuration.js\`

2. \`./install.sh\`

The second time you run the AO install script, it should say "already installed" for everything. If it doesn't, please tell an AO dev so they can update the install script.`,
    'Configuring the AO':
      'How to set up your configuration.js file and .env file. Sane defaults to be provided here.',
    'Setting up nginx': 'How to do it',
    'Setting up file hosting': 'How to do it',
    'Setting up filesharing over tor': 'How to do it',
    'Setting up Signal Notifications': 'How to do it',
  },
  Administration: {
    index: 'For admins',
    'Connecting hardware resources': `The AO can connect over a wired LAN or wifi to control the GPIO pins on a raspberry pi. This allows hardware peripherals to be connected to the AO, controlled by members, and restricted with a fee or to active members.

To use a hardware resource with the AO, it must be connected, and a custom control panel GUI must be written for it to display in the Resources panel.


To set up the RFID fob:

1. Plug in your RFID reader device

2. Find the name of the hardware by finding where your OS has its hardware devices, and save this info for the init process (type it exactly)

7. Do gpio-export (there are two different numbering systems for the pins)

8 . Set it up to autostart with systemctl

To connect a hardware resource to the AO via a Raspberry Pi:

1. Install an OS on your Raspberry Pi (we suggest Debian).

2. git clone https://github.com/AutonomousOrganization/pi

3. cd pi

4. npm i

5. Create a user on your AO for the hardware resource to use (or use an existing user)

6. npm run init

The AO connect script on the pi will log into the AO as the user and use that access to trigger resource-used events on the server.

GPIO has two modes: BCM and 'board'. For 'board', the order is the physical order of the pins themselves. BCM stands for Board Control Module, and the order is the logical order of the pins.`,
    'Connecting two AOs': "How to connect two AO's p2p over tor",
    'Adding files serverside':
      "The AO allows users of the website frontend to drag-and-drop files onto a grid to upload them. However, if you install the AO on your laptop or on a server, you can add files directly to the AO by putting them in the AO's memes folder. The default location of this folder is ~/.ao/memes/. Simply copy or move files here and restart the AO, and the files will be scanned and a card made for each file. These cards are not held by anyone right now, so you must search for them and grab them to find them. Future updates will also add live scanning and full iTunes-like file organization features, so that your folders of memes on your hard drive can be kept in lockstep with the structure of your cards on the AO.",
    'Snapshot backups':
      'In its database, the AO uses a log of events from the beginning of time to reconstruct the current state of affairs every time it starts up. The AO can also make snapshots of the state of affairs at a particular point in time and load from one of these images when it starts up. Currently, the recommended normal operation of the AO is to set the AO to automatically make these snapshots once per day, and to always load from the most recent snapshot. When a snapshot is created, in theory, all of the events preceding that snapshot could be safely deleted, as the AO will always be able to load from the snapshot. However, this is not yet recommended, because the AO is not yet fully stable, and if you run into any issues with your snapshots, you can always just reconstruct from the beginning of time. Later, we may set it to automatically delete the old events, which will allow the AO to fully forget deleted cards and members. Currently, traces still remain in the database and are accessible to admins (or an attacker).',
    'Updating ao AO server': `to update the AO:
cd ao-react
git pull --rebase
npm i [if package.js or package-lock.js has changed]
npm run webpack [if anything on the client such as components have changed]
sudo systemctl restart ao [if anything on the server has changed]`,
    Security:
      'The AO has not been adequately secured, tested or vetted and is not secure. It is not recommended to use the AO for storing private information. However, the AO has been made with modern web technologies in a fairly standard way, so in theory it should be "secure by default" to most common attacks.',
  },
  Development: {
    index:
      'If you are a software developer, you can help improve the AO! Some AO developers volunteer, and others opt to claim bounties put up by hackerspaces who want to see the AO improved. Either way, we would realy appreciate your help! You can join us at ao.coalitionofinvisiblecolleges.org.',
    Roadmap: `Here is a roadmap of the next few versions of the AO:
* AO version 0.8.0 will bring back bitcoin and lightning integration.

* AO version 0.9.0 will finalize task completion, timeclock, and bounty features.

* AO version 1.0 Alpha will finalize all existing features and freeze the feature set for the 1.0 release.the

* AO version 1.0 Beta will polish all features and fix all bugs

* AO version 1.0, codename "Shrigma", will be complete

* AO version 1.1 will add important convenience features such as the ability for end-users to export their cards for download, sound effects, and better theming.`,
    'Components Guide': 'Describe, visualize and name every component',
    'How to help':
      'Please contact an existing developer to request an account at ao.coalitionofinvisiblecolleges.org, where ao-react development goals are currently being organized.',
  },
  Philosophy: {
    index: `The AO, ultimately, is a collection of principles about how to develop sofware communally and how to talk about cooperation.

These principles are meant to be modified by the community that uses them, so please take these ideas as evolving and in-discussion. Please propose or make changes to this manual.`,
    'Desert Power':
      'Desert power is the capability of the autonomous to improve itself. The potential of the potential.',
    Easiness: `*Go for the low-hanging fruit.*

 Computers and other technology should make our lives easier, not harder. As an end-user I want everything to be free and easy. As a developer, I fix all the easy bugs first and work outward from there, looking for the task that will have the greatest positive impact on the AO's desert power. Efficiency thus becomes a practice of ease and pleasure and not asceticism.`,
    Unmanageability: `*Take chances, make mistakes, get messy!*

The AO helps its users to become unmanageable, and the AO also eschews top-down models of card management as much as possible, while still providing convenient ways to organize cards. The AO user interface is designed to make interaction with the computer safe and to make it impossible to accidentally delete cards or leak private data.`,
    Unscalability: `The AO is not designed to be highly scaelable. Dunbar's number is 150 and large groups are toxic. Instead, the AO is designed to empower individuals and small groups, and make it easy to fork and administer one or several AOs. This increases the number of users capable of administering an AO, whereas a model that places scalability as first priority is designed to handle a large number of inept users on one platform provider's service. This runs contrary to the peer-to-peer and community educational functions of the AO.`,
    Unmodularity: `The AO is a standards- and consensus-building project amongst the many projects of the free software / open source communities. Often, when projects decide to add a plugins or modules functionality, it is because the devs are unable to agree on what is essential, and/or are attempting to farm additional labor from an alienated plugins dev community.

The AO is a project to integrate the many existing and working useful open-source projects into one (or a few) usable end-products that are useful for specific users for specific use-cases. These use-cases are things we're all familiar with, that we all want to do with our computers, such as taking notes, planning a todo list, or sharing a photo album privately with a group of people. There are really not that many of these core features, and they are simple enough that we all want mostly the same functionality.the

However, the AO will eventually add a modules feature and it will be glorious. Something that will make the AO's modules different from other plugin systems, such as Firefox's Add-ons, will be that AO modules will be able to require dependencies in sequence. All currenty AO modules will be part of one sequence, such that when all modules are activated, the sequence is included and activated within the AO in the same order. That is because choices to include features are hierarchical and also represent living user communities forking or merging.`,
  },
}

/*


cards can be dragged and dropped to move them around. each card has three regions: the priorities, the optional grid or pyramid of cards, and a stack of cards below the grid. cards also have an "accomplishments" section where checked-off cards end up

Q: I can only drag and drop them in a grid, right?

A: you can also drop them to the priorities above or the stack below the grid

cards dropped from within one of those lists to the same list will move to the top (so you can reorder the list)

if you are having trouble finding the drop region, create  a card with the Compose button to see where it is

Q: Can I get a larger grid?

A: yes, use the +/- buttons at the right edge and bottom

Q: How do you delete cards?

A: a card cannot be deleted if at least one person has grabbed the card to their collecton. currently this feature is being reworked and there is no way to drop or delete a card right now.

but you can see your collection by clicking the moon card button to the right of the bookmarks bar

and you can discard cards by dropping them to the background

an update soon will make it easy to go through your old cards and delete or reorganize them. this was a feature before and will be brought back

you can click the menu on a card to change its color and do other things with it. the menu is a bit messy but the features on it are cool

if you paste a youtube or video link on a card and then click card menu—>Cache Media, it will cache it for you. this makes it possible to watch the video without visiting the original host website and potentially revealing your identity to them, and also makes it easy to download the full file.

any card can be upgraded to a group aka Mission in its card menu. Missions are listed in the Missions sidebar. a mission can have members join it and have membership rankings/levels controlled by those of higher rank. a mission can have an optional chatroom or dropbox added, and the rankings are used to control dropbox access

if you create a card that matches the text or mission/guild/group title of an existing card, it will place that existing card instead of creating a new card (duplicates not allowed)

there is also a points system. if you check off a card with a funded bounty, you will get the points immediately. the idea is to use this to manage the hackerspace (monthly dues + $3 / soda, all paid in bitcoin) and to pay AO devs  for improvements they make to the AO

so the AO will become an autonomous self-improving system

also, there is a very cool feature with priorities. if a card has prioritized cards within it, the number of them will show on the front, on the grid, with an !

if you click this, it will show the priorities on front (prior to) the cards on the grid that they are within

so you can see what the next task is in a project, or even a subproject

you can drag a card to the area above the grid to drop it to the priorities

if you shrink the grid, they just dump
*/

export default function AoManual() {
  const [show, setShow] = React.useState(false)
  const [topic, setTopic] = React.useState('Introduction')
  const [subTopic, setSubTopic] = React.useState('')
  console.log('current subtopic is ', subTopic)

  function showManual(event) {
    event.stopPropagation()
    setShow(true)
  }

  const hideManual = event => {
    if (event) {
      event.stopPropagation()
    }
    setShow(false)
  }

  React.useEffect(() => {
    aoStore.registerCloseable(hideManual)
    return () => {
      aoStore.unregisterCloseable(hideManual)
    }
  }, [])

  function selectTopic(topic) {
    setTopic(topic)
    setSubTopic(null)
  }

  function selectSubTopic(newSubTopic) {
    // console.log('selectSubTopic st is ', newSubTopic)
    setSubTopic(newSubTopic)
  }

  function renderSubTopics(heading, subTopics) {
    // console.log('render subTopics is ', subTopics)
    return Object.keys(subTopics)
      .filter(st => st !== 'index')
      .map(st => (
        <li
          onClick={event => {
            event.stopPropagation()
            selectSubTopic(st)
          }}
          className={
            'subTopic' +
            (topic === heading ? ' show' : '') +
            (subTopic === st ? ' selected' : '')
          }>
          {gloss(st)}
        </li>
      ))
  }

  function renderContent(content) {
    return (
      <Markdown
        options={{
          forceBlock: true,
        }}>
        {gloss(content)}
      </Markdown>
    )
  }

  const renderedTopics = Object.entries(topics).map(([tpc, content]) => (
    <React.Fragment>
      <li
        onClick={event => {
          event.stopPropagation()
          selectTopic(tpc)
        }}
        className={topic === tpc && !subTopic ? 'selected' : ''}>
        {typeof content !== 'string' &&
          (topic === tpc ? (
            <div className="triangle">&#9660;</div>
          ) : (
            <div className="triangle">&#9664;</div>
          ))}
        {toTitleCase(gloss(tpc))}
      </li>
      {typeof content !== 'string' && renderSubTopics(tpc, content)}
    </React.Fragment>
  ))

  return (
    <div id="theManual">
      {/*<div className="theX" onClick={hideManual} />*/}
      <h1>{gloss('AO User Manual')}</h1>
      <div className="topicContent">
        {subTopic ? (
          <h2>{gloss(subTopic)}</h2>
        ) : (
          <h2>{toTitleCase(gloss(topic))}</h2>
        )}
        {subTopic
          ? renderContent(topics[topic][subTopic])
          : topic && typeof topics[topic] === 'string'
          ? renderContent(topics[topic])
          : renderContent(topics[topic]['index'])}
      </div>
      <ul className="topics">{renderedTopics}</ul>
    </div>
  )
}
