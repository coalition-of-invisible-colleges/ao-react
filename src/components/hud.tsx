import * as React from 'react'
import { observer, Observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoHub from './hub'
import AoControls from './controls'
import AoDock from './dock'
import AoGifts from './gifts'
import AoMissions from './missions'
import AoMembers from './members'
import AoCalendar from './calendar'
import AoProposals from './proposals'
import AoBounties from './bounties'
import AoSearch from './search'
import AoTickerHud, { AoTicker } from './tickerHud'
import AoScore from './score'
import AoUsername from './username'
import AoPassword from './password'
import AoPhone from './phone'
import AoFob from './fob'
import AoVolume from './volume'
import AoReactivator from './reactivator'
import AoTour from './tour'
import AoManual from './manual'
import AoPopupPanel from './popupPanel'
import AoChatroom from './chatroom'
import AoStatus from './status'
import MemberIcon from '../assets/images/loggedWhite.svg'
import MagnifyingGlass from '../assets/images/search.svg'
import Scroll from '../assets/images/scroll.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { gloss } from '../semantics'

interface State {
  theme: number
}

@observer
class MainMenu extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = { theme: aoStore.state.cash.theme }
    if (this.state.theme !== 1) {
      document.body.className = 'theme-' + this.state.theme
    }
  }

  changeTheme = () => {
    if (this.state.theme == 4) {
      this.setState({ theme: 1 })
      document.body.className = 'theme-1'
    } else {
      const newTheme = this.state.theme + 1
      document.body.className = 'theme-' + newTheme
      this.setState({ theme: newTheme })
    }
  }

  onLogout = () => {
    api.logout()
    console.log('logged out', aoStore.state.loggedIn)
  }

  render() {
    return (
      <div id="mainMenu">
        <AoUsername />
        <AoPassword />
        <AoPhone />
        <AoFob />
        <AoReactivator />
        <AoVolume />
        <div onClick={this.changeTheme} id="themer" className="action">
          Next Theme
        </div>
        <AoTicker
          ticker={null}
          index={aoStore.member.tickers ? aoStore.member.tickers.length : 0}
        />
        <AoTour />
        <div onClick={this.onLogout} id="logout" className="action">
          Log Out
        </div>
      </div>
    )
  }
}

interface HudState {
  proposals?: number
}

@observer
export default class AoHud extends React.Component<{}, HudState> {
  private searchRef = React.createRef<AoSearch>()

  constructor(props) {
    super(props)
    this.state = {}
    this.focusSearchbox = this.focusSearchbox.bind(this)
    this.updateProposalCount = this.updateProposalCount.bind(this)
  }

  focusSearchbox() {
    this.searchRef.current.focus()
  }

  updateProposalCount(proposals: number) {
    this.setState({ proposals })
  }

  render() {
    const renderedBadge =
      this.state.proposals && this.state.proposals >= 1 ? (
        <React.Fragment>{this.state.proposals}</React.Fragment>
      ) : null

    return (
      <div id="hud">
        <div id="mainMenu-tour">
          <Tippy
            content={<MainMenu />}
            interactive={true}
            trigger="click"
            placement="top-end"
            theme="white"
            appendTo={() => document.body}>
            <div id="mainMenuButton">&#x22EE;</div>
          </Tippy>
        </div>
        <AoHub />
        {/*!aoStore.member.tutorial ? <AoTour /> : <AoManual />*/}

        <AoControls />

        <Observer>
          {() => {
            return <AoDock />
          }}
        </Observer>
        <AoGifts />
        <AoMissions />

        <div id="members">
          <AoPopupPanel
            iconSrc={MemberIcon}
            tooltipText="Members"
            tooltipPlacement="right"
            panelPlacement="right"
            id="tour-members">
            <AoMembers />
          </AoPopupPanel>
        </div>

        <AoCalendar />

        <AoBounties />

        <div id="search">
          <AoPopupPanel
            iconSrc={MagnifyingGlass}
            tooltipText="Search"
            tooltipPlacement="top"
            panelPlacement="top"
            onShown={this.focusSearchbox}
            id="tour-search">
            <AoSearch ref={this.searchRef} />
          </AoPopupPanel>
        </div>

        <AoTickerHud />

        {/*        <div id="proposals">
            <AoPopupPanel
              iconSrc={Scroll}
              tooltipText="Proposals"
              badge={renderedBadge}
              tooltipPlacement="right"
              panelPlacement="right"
              id="tour-proposals">
              <AoProposals updateBadge={this.updateProposalCount} />
            </AoPopupPanel>
          </div>
          */}

        <AoChatroom taskId={aoStore.currentChatroom} />
        {
          //<AoScore prefix={<span>Points: </span>} />
        }
        {
          //<AoStatus />
        }
      </div>
    )
  }
}
