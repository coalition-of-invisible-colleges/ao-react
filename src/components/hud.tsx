import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { observer, Observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoDoing from './doing'
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
import AoSidebarButton from './sidebarButton'
import AoChatroom from './chatroom'
import AoStatus from './status'
import Sun from '../assets/images/sun.svg'
import Bird from '../assets/images/mailbox.svg'
import Badge from '../assets/images/bulletin.svg'
import Timecube from '../assets/images/timecube.svg'
import Chest from '../assets/images/chest.svg'
import Manual from '../assets/images/manual.svg'
import MemberIcon from '../assets/images/heartnet.svg'
import MagnifyingGlass from '../assets/images/search.svg'
import Scroll from '../assets/images/scroll.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { gloss } from '../semantics'
import config from '../../configuration'

interface State {
  theme: number
  redirect?: string
}

const themeCount = config?.themes?.length

@observer
class MainMenu extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = { theme: 0 }
    if (this.state.theme !== 0) {
      document.body.className = config.themes[this.state.theme]
    }
  }

  changeTheme = () => {
    let newTheme = this.state.theme + 1
    if (newTheme >= themeCount) {
      newTheme = 0
    }
    this.setState({ theme: newTheme })
    document.body.className = config.themes[newTheme]
    console.log(
      'setting theme to',
      newTheme,
      'which is',
      config.themes[newTheme],
      'and themeCount is',
      themeCount
    )
  }

  onLogout = () => {
    console.log('calling api logout')
    api.logout().then(() => {
      this.setState({ redirect: '/login' })
    })
    console.log('logged out', aoStore.state.loggedIn)
  }

  render() {
    if (this.state.redirect !== undefined) {
      return <Redirect to={this.state.redirect} />
    }

    return (
      <div id="mainMenu">
        <AoUsername />
        <AoPassword />
        <AoPhone />
        <AoFob />
        <AoReactivator />
        <AoVolume />
        {themeCount >= 2 && (
          <div onClick={this.changeTheme} id="themer" className="action">
            Theme: {config.themes[this.state.theme]}
          </div>
        )}
        <AoTicker
          ticker={null}
          index={aoStore.member?.tickers ? aoStore.member.tickers.length : 0}
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
    this.renderSidebar = this.renderSidebar.bind(this)
  }

  focusSearchbox() {
    this.searchRef.current.focus()
  }

  updateProposalCount(proposals: number) {
    this.setState({ proposals })
  }

  renderSidebar() {
    if (!aoStore.leftSidebar) {
      return null
    }

    let rendered

    switch (aoStore.leftSidebar) {
      // case 'hub':
      // maybe hub
      // break
      case 'gifts':
        rendered = <AoGifts />
        break
      case 'members':
        rendered = <AoMembers />
        break
      case 'guilds':
        rendered = <AoMissions />
        break
      case 'calendar':
        rendered = <AoCalendar />
        break
      case 'bounties':
        rendered = <AoBounties />
        break
      case 'search':
        rendered = <AoSearch ref={this.searchRef} />
        break
      case 'manual':
        rendered = <AoManual />
        break
    }
    return (
      <div id="leftSidebar" className={aoStore.leftSidebar}>
        <div className="leftBorder" />
        {rendered}
      </div>
    )
  }

  render() {
    console.log('hud render')

    let { now, today, tomorrow, overdue } = aoStore.eventsAsAgenda
    const eventCount =
      now.length + today.length + tomorrow.length + overdue.length
    const renderedCalendarBadge =
      eventCount >= 1 ? <React.Fragment>{eventCount}</React.Fragment> : null

    // const renderedProposalsBadge =
    //   this.state.proposals && this.state.proposals >= 1 ? (
    //     <React.Fragment>{this.state.proposals}</React.Fragment>
    //   ) : null

    const giftsPercentChanged = Math.min(
      Math.floor(aoStore.allChanges.length / 10),
      10
    )
    const giftsButtonClass = 'red' + giftsPercentChanged.toString()
    const giftsRenderedBadge = aoStore.myGifts.length >= 1 && (
      <React.Fragment>{aoStore.myGifts.length}</React.Fragment>
    )

    const guildsPercentChanged = Math.floor(
      (10 * aoStore.changedMissions.length) / aoStore.myMissions.length
    )
    const guildsButtonClass = 'red' + guildsPercentChanged.toString()
    console.log('returning render')
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
        <AoDoing />
        <AoHub />
        {this.renderSidebar()}
        <AoControls />
        <Observer>
          {() => {
            return <AoDock />
          }}
        </Observer>
        {aoStore.member?.tutorial || <AoTour />}
        <AoSidebarButton
          sidebarTab="gifts"
          iconSrc={Bird}
          tooltipText={aoStore.myGifts.length < 1 ? 'Send Gift' : 'Gifts'}
          badge={giftsRenderedBadge}
          tooltipPlacement="right"
          id="tour-gifts"
          buttonClass={giftsButtonClass}
        />
        <AoSidebarButton
          sidebarTab="members"
          iconSrc={MemberIcon}
          tooltipText="Members"
          tooltipPlacement="right"
          id="tour-members"
        />
        <AoSidebarButton
          sidebarTab="guilds"
          iconSrc={Badge}
          tooltipText={gloss('Guilds')}
          tooltipPlacement="right"
          id="tour-missions"
          buttonClass={guildsButtonClass}
        />
        <AoSidebarButton
          sidebarTab="calendar"
          iconSrc={Timecube}
          tooltipText="Calendar"
          badge={renderedCalendarBadge}
          tooltipPlacement="right"
          id="tour-calendar"
        />
        <AoSidebarButton
          sidebarTab="bounties"
          iconSrc={Chest}
          tooltipText="Bounties"
          tooltipPlacement="right"
          id="tour-bounties"
        />
        <AoSidebarButton
          sidebarTab="search"
          iconSrc={MagnifyingGlass}
          tooltipText="Search"
          tooltipPlacement="top"
          onShown={this.focusSearchbox}
          id="tour-search"
        />
        <AoSidebarButton
          sidebarTab="manual"
          iconSrc={Manual}
          tooltipText="Manual"
          tooltipPlacement="right"
          id="tour-manual"
        />
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
