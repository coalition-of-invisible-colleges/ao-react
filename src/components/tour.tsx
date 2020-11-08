import * as React from 'react'
import { observer } from 'mobx-react'
import { ShepherdTourContext } from 'react-shepherd'
import { renderToStaticMarkup } from 'react-dom/server'

type PopperPlacement =
  | 'auto'
  | 'auto-start'
  | 'auto-end'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end'
const placeLeft: PopperPlacement = 'left'
const placeRight: PopperPlacement = 'right'

function cancelAction() {
  return this.cancel()
}

function backAction() {
  return this.back()
}

function nextAction() {
  return this.next()
}

function completeAction() {
  return this.next()
}

const cancelButton = {
  text: 'Skip Tour',
  classes: 'action',
  action: cancelAction
}

const backButton = {
  text: 'Back',
  classes: 'action',
  action: backAction
}

const nextButton = {
  text: 'Next',
  classes: 'action',
  action: nextAction
}

const standardButtons = [cancelButton, backButton, nextButton]

function renderHTMLElement(element): HTMLElement {
  const output = document.createElement('div')
  const staticElement = renderToStaticMarkup(element)
  output.innerHTML = `<div>${staticElement}</div>`
  return output
}

export const steps = [
  {
    id: 'welcome',
    attachTo: { element: '#tour-current-card' },
    title: 'Welcome!',
    text: renderHTMLElement(
      <div>
        <p>
          The AO, or <strong>Autonomous Organization</strong> is an open-source
          tool for online and offline communities.
        </p>
        <p>
          <em>Let's start!</em>
        </p>
      </div>
    ),
    buttons: [cancelButton, nextButton]
  },
  {
    id: 'mainMenu',
    attachTo: { element: '#mainMenu', on: placeLeft },
    title: 'Main Menu',
    text:
      'The main menu allows you to change your username and password. You should change your password now if you havent done so yet. You can also set your RFID fob number here.',
    buttons: standardButtons
  },
  {
    id: 'chatroom',
    attachTo: { element: '#chatroom', on: placeLeft },
    title: 'Secure Video Chat',
    text:
      "Jitsi is an open-source, end-to-end encrypted video chat that can be installed alongside the AO on a server. Click 'chat' to open up a live video chatroom! You can also do audio-only or use the text chat box within Jitsi. If you want more than one room, go to meet.yourdomain.com to manually create additional rooms (guildhalls coming soon).",
    buttons: standardButtons
  },
  {
    id: 'hub',
    attachTo: { element: '#tour-hub', on: placeRight },
    title: 'The Hub',
    text:
      'Ah, the Hub! The beating hearmt of the community! Visit the Community Hub often to stay up-to-date, like a shared newspaper.',
    buttons: standardButtons
  },
  {
    id: 'missions',
    attachTo: { element: '#tour-missions', on: placeRight },
    title: 'Missions Index',
    text:
      "Put it on the Index! Missions, also known as groups, guilds, categories, or rooms, are a basic way to organize cards. Any card with a mission title shows up here. Click 'add mission title' in a card's menu to give it a title and upgrade it to a mission",
    buttons: standardButtons
  },
  {
    id: 'members',
    attachTo: { element: '#tour-members', on: placeRight },
    title: 'Members',
    text:
      "This panel contains a list of every member on the server. You can vouch for other members by grabbing their card (clicking the sun/moon). You can sort members alphabetically, by recent events (account creation, fob tap, or bark), by number of vouches from other members, or by 'order'. The order can change consensually, but starts out as the order accounts are created in.",
    buttons: standardButtons
  },
  {
    id: 'calendar',
    attachTo: { element: '#tour-calendar', on: placeRight },
    title: 'Community Calendar',
    text:
      "This is the calendar. See events here! Schedule an event on a card by clicking 'schedule event' in its card menu. Events that you hodl (mooned) will remain as 'overdue' until you check them off or drop the card (unmoon).",
    buttons: standardButtons
  },
  {
    id: 'proposals',
    attachTo: { element: '#tour-proposals', on: placeRight },
    title: 'Proposals',
    text:
      'Sign cards and they show up here: most signatures first. Work with your community to craft an evolving, distributed constitution, and form a voluntary self-govenment!',
    buttons: standardButtons
  },
  {
    id: 'bounties',
    attachTo: { element: '#tour-bounties', on: placeRight },
    title: 'Bounties',
    text:
      "Need some points? Open up Bounties and see what the community has put rewards on. When you check off a card, you will immediately get the points, so don't click the checkmark until the job is done!",
    buttons: standardButtons
  },
  {
    id: 'controls',
    attachTo: { element: '#tour-controls', on: placeLeft },
    title: 'Server Controls',
    text:
      "The Bull represents the physical server hardware (the element of Earth). Whoever controls the server could delete everything or manually read the database. The Bull allows you to connect to hardware resources, connect two AOs over tor, connect the AO to the lightning network, and control monthly memberships. Anyone can edit server settings, reflecting the AO's do-ocratic and trust-oriented design.",
    buttons: standardButtons
  },
  {
    id: 'tickers',
    attachTo: { element: '#tickers', on: placeLeft },
    title: 'Crypto Tickers',
    text:
      'The AO comes equipped with convenient and comprehensive crypto tickers, so you can monitor the relative worthlessness of various shitcoins. Click a crypto ticker to set it (and display further instructions).',
    buttons: standardButtons
  },
  {
    id: 'the_end',
    title: 'End of Tour',
    text:
      'Help make the tour longer by suggesting tour stops in the AO Guild card!',
    buttons: [
      backButton,
      { text: 'End Tour', classes: 'action', action: completeAction }
    ]
  }
]

export const tourOptions = {
  defaultStepOptions: { scrollTo: true },
  useModalOverlay: false
}

export default function AoTour() {
  const tour = React.useContext(ShepherdTourContext)

  return (
    <div onClick={tour.start} className={'tour menu action'} id="tourStart">
      Start Tour
    </div>
  )
}
