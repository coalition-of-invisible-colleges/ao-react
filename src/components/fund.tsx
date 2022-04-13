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


export default function AoFund (props: Props) {
  const [tab, setTab] = React.useState(false)
  const [text, setText] = React.useState('0')
  const [valid, setValid] = React.useState(true)
  
  const goFirstTab = () => {
    setTab(false)
  }
  
  const goOtherTab = () => {
    setTab(true)
  }
  
  const requestBtcQr = () => {
    api.requestBtcQr(props.taskId)
  }
  
  const requestLightningInvoice = () => {
    const amount = parseInt(text) 
    api.requestLightningInvoice(props.taskId, amount)
  }
  
  const onChange = (event) => {
    setText(event.target.value)
    if(isNaN(event.target.value)) {
      setValid(false)
    } else {
      setValid(true)
    }
  }

  const handleFocus = (event) => event.target.select()

  const card = aoStore.hashMap.get(props.taskId)
  if (!card) {
    console.log('Attempt to access funding tab on missing card.')
    return null
  }
  
  let contents
  if(!tab) {
    if (card.address) {
      contents = (
        <React.Fragment>
          <div>Send mainnet BTC here to fund this card:</div>
          <QRCode value={card.address} />
          <div>{card.address}</div>
        </React.Fragment>
      )
    } else {
      contents = (
        <React.Fragment>
          <div onClick={requestBtcQr} className="action">
            send BTC here
          </div>
        </React.Fragment>
      )
    }
  } else {
    if (card.bolt11) {
      contents = (
        <React.Fragment>
          <div>Send lightning network BTC here to fund this card:</div>
          <QRCode value={card.bolt11} />
          <textarea readOnly={true} value={card.bolt11} />
        </React.Fragment>
      )
    } else {
      contents = (
        <React.Fragment>
          <label htmlFor='invoiceAmount'>Amount:</label>
          <input type='text' disabled={!valid} size={3} id='invoiceAmount' value={text} onChange={onChange} autoFocus onFocus={handleFocus} />
          <button onClick={requestLightningInvoice} className="action">
            Generate Invoice
          </button>
        </React.Fragment>
      )
    }
  }
  
  return (
    <div className="fund menu">
      <div className='toolbar'>
        <div onClick={goFirstTab} className={'action' + (!tab ? ' selected' : '')}>BTC</div>
        <div onClick={goOtherTab} className={'action'+ (tab ? ' selected' : '')}>Lightning</div>
      </div>
      {contents}
    </div>
  )
}
