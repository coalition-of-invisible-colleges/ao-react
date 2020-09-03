import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import Bull from '../assets/images/bull.svg'
import AoContextCard from './contextCard'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
import AoResources from './resources'
import AoConnect from './connect'
import AoLightning from './lightning'
import AoRent from './rent'
// import AoReserve from './reserve'

interface State {
  page: ServerPage
}

type ServerPage =
  | 'Resources'
  | 'Connect P2P'
  | 'Lightning'
  | 'Rent'
  | 'Reserve'
  | 'Options'

@observer
export default class AoControls extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = { page: 'Resources' }
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

  renderPageButton(page: ServerPage) {
    if (this.state.page === page) {
      return <p className={'action selected'}>{page}</p>
    } else {
      return (
        <p onClick={this.goToPage} data-page={page} className={'action'}>
          {page}
        </p>
      )
    }
  }

  render() {
    const title = aoStore.state.cash.alias
      ? aoStore.state.cash.alias + ' Server Controls'
      : 'Server Controls'

    let renderedPage

    switch (this.state.page) {
      case 'Connect P2P':
        renderedPage = <AoConnect />
        break
      case 'Lightning':
        renderedPage = <AoLightning />
        break
      case 'Rent':
        renderedPage = <AoRent />
        break
      case 'Reserve':
        // renderedPage = <AoReserve />
        break
      case 'Options':
        renderedPage = (
          <React.Fragment>
            <h3>Server Options</h3>
            <p>No options yet.</p>
          </React.Fragment>
        )
        break
      case 'Resources':
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
          id={'controls'}>
          <React.Fragment>
            <h2>{title}</h2>
            <div className={'toolbar'}>
              {this.renderPageButton('Resources')}
              {this.renderPageButton('Connect P2P')}
              {this.renderPageButton('Lightning')}
              {this.renderPageButton('Rent')}
              {/*this.renderPageButton('Reserve')*/}
              {this.renderPageButton('Options')}
            </div>
            <div className={'controlPanel'}>{renderedPage}</div>
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
