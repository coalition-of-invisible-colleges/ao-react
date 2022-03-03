/*import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import AoContextCard from './contextCard'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
// import AoReserve from './reserve'
import AoOptions from './options'

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
      <div id="controls">
        <AoPopupPanel
          iconSrc={Bull}
          tooltipText="Server Controls"
          tooltipPlacement="left"
          panelPlacement="left-start"
          id="tour-controls"
          alsoHideHub={true}>
          <React.Fragment>

            <div className="controlPanel">{renderedPage}</div>
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
*/