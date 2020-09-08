import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import Bull from '../assets/images/bull.svg'
import Dolphins from '../assets/images/loader.svg'
import RedBoat from '../assets/images/boatbtnselected.svg'
import LightningBolt from '../assets/images/lightning.svg'
import GoldenDoge from '../assets/images/goldendoge.svg'
import AoContextCard from './contextCard'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
import AoResources from './resources'
import AoConnect from './connect'
import AoLightning from './lightning'
import AoRent from './rent'
// import AoReserve from './reserve'
// import AoOptions from './options'

interface State {
  page: ServerPage
}

type ServerPage =
  | 'resources'
  | 'connect'
  | 'lightning'
  | 'rent'
  | 'reserve'
  | 'options'

@observer
export default class AoControls extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = { page: 'resources' }
    this.goToPage = this.goToPage.bind(this)
    this.renderPageButton = this.renderPageButton.bind(this)
  }

  goToPage(event) {
    const page = event.currentTarget.getAttribute('data-page')
    if (this.state.page === page) {
      return
    }
    this.setState({ page: page })
  }

  renderPageButton(page: ServerPage, label: string, imgSrc?: string) {
    if (this.state.page === page) {
      return (
        <p className={'action selected'}>
          {imgSrc && <img src={imgSrc} />}
          {label}
        </p>
      )
    } else {
      return (
        <p onClick={this.goToPage} data-page={page} className={'action'}>
          {imgSrc && <img src={imgSrc} />}
          {label}
        </p>
      )
    }
  }

  render() {
    let renderedPage

    switch (this.state.page) {
      case 'connect':
        renderedPage = <AoConnect />
        break
      case 'lightning':
        renderedPage = <AoLightning />
        break
      case 'rent':
        renderedPage = <AoRent />
        break
      case 'reserve':
        // renderedPage = <AoReserve />
        break
      case 'options':
        renderedPage = <AoOptions />
        break
      case 'resources':
      default:
        renderedPage = <AoResources />
    }
    return (
      <div id={'controls'}>
        <AoPopupPanel
          iconSrc={Bull}
          tooltipText={'Server Controls'}
          tooltipPlacement={'left'}
          panelPlacement={'left-start'}
          id={'controls'}
          alsoHideHub={true}>
          <React.Fragment>
            <div className={'toolbar'}>
              {this.renderPageButton('resources', 'Hardware', Dolphins)}
              {this.renderPageButton('connect', 'AO p2p', RedBoat)}
              {this.renderPageButton('lightning', 'Crypto', LightningBolt)}
              {this.renderPageButton('rent', 'Membership', GoldenDoge)}
              {/*this.renderPageButton('Reserve')*/}
              {/*this.renderPageButton('options', 'Options')*/}
            </div>
            <div className={'controlPanel'}>{renderedPage}</div>
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
