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
    attachTo: { element: '#tourCurrentCard', on: placeLeft },
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
    id: 'calendar',
    attachTo: { element: '#tour-calendar', on: placeRight },
    title: 'Community Calendar',
    text: 'This is the calendar. See events here!',
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
