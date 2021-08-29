import * as React from 'react'
import Markdown from 'markdown-to-jsx'
import { gloss } from '../semantics'
import { toTitleCase } from '../calculations'
import aoStore from '../client/store'

const topics = {
  Introduction: `Welcome to the AO User Manual! Here you will find a comprehensive guide to all of the AO's functions and many of its possible uses.

The AO (ao-react project) is currently at version 0.7.0.

This user manual is currently at version 0.7.0

There are currently two bugs in this manual. The manual is customized for the language on each server, and this is done with word replacement. This may lose some capital letters and replace some non-whole-words.`,
  Overview: {
    index: `The AO is a free software project and a lived practice of creating open-source software for a peer-to-peer community.`,
    "What's it For?": `There are many reasons you might set up an AO server. Here are some of the types of community projects the AO was specifically designed to support:

### Local Hackerspace

The AO was originally created to help a local hackerspace manage its membership dues, door security, sidewalk LED art, and bitcoin soda machine.

### Chore Rota

For a household or a local community center, the AO can be used to help organize chores and other maintenance tasks for the community. The points and bounty system in the AO make it easy to create and distribute either real or made-up local points amongst various projects and goals, and people who complete those tasks can claim the points on them.

### Hardware Automation / IOT

Hardware devices can be connected to the AO over a local network and controlled through customizeable panels. Custom scripts for each device can be triggered by the AO to allow virtually any device to be connected and controlled or automated. AO users have created dancing LED sidewalk art installations, security doors, and bitcoin-activated vending machines, with plans for autonomous lockers and other useful devices.

### Online Image Board

In addition to local communities, the AO is also designed to support online-only communities. Since digital communities are ultimately grounded in the media they exchange, the AO comes with drag-and-drop file sharing and the ability to automatically sync file attachments over tor between two paired AO servers.

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
    'Getting Started': `Someone else will need to create an account for you and tell you the URL, username and password so you can log in. Visit the URL and type the username and password and press Enter to log in. There is a bug right now so you will also need to refresh the page after login.`,
  },
  Cards: {
    index: `The AO is full of cards`,
    'Creating a Card': `There are three ways to create a card: 1. First way
2. Second way
3. Third way`,
    'Viewing your deck':
      'Each member has a deck of cards on each AO server that they have an account on. You can view and search all of the cards in your deck by clicking the icon to the right of the bookmarks bar, along the bottom edge of the screen.',
    'Grabbing cards':
      'If you see a card you like or someone sends you a card, you can grab it and add it to your deck by clicking the moon icon on the card. Cards in your deck cannot be deleted by other members—cards that are held by nobody may be cleaned up every 5-10 minutes.',
    'Finding cards': `To find a card you are looking for, you can use the search box.`,
    'Sharing Cards': `Gifts inbox works like this`,
    'Receiving cards':
      'Your inbox is located just under the Community Hub icon in the top-left corner of the screen.',
    'Bookmarking cards':
      'You can drop cards on your dock aka bookmarks bar at the bottom center edge of the screen. This is just a normal grid on a reserved card that is named based on your memberId (normally hidden, you can see it in the address bar on your home card).',
    'The Community Hub Card': `There is a reserved card with the text 'community hub' on each server. Click the icon in the top-left corner of the screen to visit this card. Having one card as a shared starting-place for everyone makes it much easier to start sharing cards, memes, and news in smaller communities. The other way to share stuff within a server is guilds.`,
  },
  'Organizing Cards': {
    index:
      'When you view a card, you can also place other cards within it, and modify the card in various ways.',
    'Zones within a card':
      'Priorities, grid, stack below grid, and completed cards / Accomplishments',
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
      'Click the triangle icon on the left edge of the screen to show the Members panel. It contains all of the member cards on this server.',
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
    'Running the install script':
      'The AO comes with a comprehensive install script, just download and run it and it will do almost everything.',
    'Configuring the AO':
      'How to set up your configuration.js file and .env file. Sane defaults to be provided here.',
    'Setting up nginx': 'How to do it',
    'Setting up file hosting': 'How to do it',
    'Setting up filesharing over tor': 'How to do it',
    'Setting up Signal Notifications': 'How to do it',
  },
  Administration: {
    index: 'For admins',
    'Connecting hardware resources':
      'How to connect a hardware peripheral to a Raspberry Pi and write a script that the AO can trigger, and then how to use the AO hardware connect script to connect them.',
    'Connecting two AOs': "How to connect two AO's p2p over tor",
    'Adding files serverside':
      "The AO allows users of the website frontend to drag-and-drop files onto a grid to upload them. However, if you install the AO on your laptop or on a server, you can add files directly to the AO by putting them in the AO's memes folder. The default location of this folder is ~/.ao/memes/. Simply copy or move files here and restart the AO, and the files will be scanned and a card made for each file. These cards are not held by anyone right now, so you must search for them and grab them to find them. Future updates will also add live scanning and full iTunes-like file organization features, so that your folders of memes on your hard drive can be kept in lockstep with the structure of your cards on the AO.",
    'Snapshot backups':
      'In its database, the AO uses a log of events from the beginning of time to reconstruct the current state of affairs every time it starts up. The AO can also make snapshots of the state of affairs at a particular point in time and load from one of these images when it starts up. Currently, the recommended normal operation of the AO is to set the AO to automatically make these snapshots once per day, and to always load from the most recent snapshot. When a snapshot is created, in theory, all of the events preceding that snapshot could be safely deleted, as the AO will always be able to load from the snapshot. However, this is not yet recommended, because the AO is not yet fully stable, and if you run into any issues with your snapshots, you can always just reconstruct from the beginning of time. Later, we may set it to automatically delete the old events, which will allow the AO to fully forget deleted cards and members. Currently, traces still remain in the database and are accessible to admins (or an attacker).',
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
    'How to help':
      'Please contact an existing developer to request an account at ao.coalitionofinvisiblecolleges.org, where ao-react development goals are currently being organized.',
  },
}

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
    event.stopPropagation()
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
    console.log('selectSubTopic st is ', newSubTopic)
    setSubTopic(newSubTopic)
  }

  function renderSubTopics(heading, subTopics) {
    console.log('render subTopics is ', subTopics)
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
          forceBlock: false,
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
        {toTitleCase(gloss(tpc))}
        {typeof content !== 'string' &&
          (topic === tpc ? (
            <div className="triangle">&#9664;</div>
          ) : (
            <div className="triangle">&#9660;</div>
          ))}
      </li>
      {typeof content !== 'string' && renderSubTopics(tpc, content)}
    </React.Fragment>
  ))

  return (
    <div style={{ position: 'fixed' }}>
      <div
        onClick={!show ? showManual : hideManual}
        className="manual menu action">
        Manual
      </div>
      {show && (
        <div id="theManual">
          <div className="theX" onClick={hideManual} />
          <h1>AO User Manual</h1>
          <div className="browser">
            <ul className="topics">{renderedTopics}</ul>
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
          </div>
        </div>
      )}
    </div>
  )
}
