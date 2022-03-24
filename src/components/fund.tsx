import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import QRCode from 'qrcode.react'

interface Props {
  taskId: string
}

interface State {
  qrCode?: boolean
}

@observer
export default class AoFund extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    // makeObservable(this)
    this.state = {}
    this.requestQr = this.requestQr.bind(this)
  }

  componentDidMount() {}

  requestQr() {
    api.requestBtcQr(this.props.taskId)
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) {
      console.log('Attempt to access lightning QR code on mssing card.')
      return null
    }
    if (card.address) {
      return (
        <div className="fund menu">
          <div>Send mainnet BTC here to fund this card:</div>
          <QRCode value={card.address} />
        </div>
      )
    } else {
      return (
        <div className="fund menu">
          <div onClick={this.requestQr} className="action">
            send BTC here
          </div>
        </div>
      )
    }
  }
}
