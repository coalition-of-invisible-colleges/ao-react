import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoTicker from './ticker'
import CoinGecko from 'coingecko-api'

const CoinGeckoClient = new CoinGecko()

@observer
export default class AoTickerHud extends React.Component<{}, undefined> {
  constructor(props) {
    super(props)
  }

  render() {
    let pingIt = async () => {
      return await CoinGeckoClient.ping()
    }

    let tickers = []
    if (aoStore.member.tickers && aoStore.member.tickers.length >= 1) {
      tickers = aoStore.member.tickers.map((ticker, i) => <AoTicker />)
    }

    return (
      <div id={'tickers'}>
        {' '}
        <div className={'actionCircle'}>ping: {pingIt}</div>
        <div className={'actionCircle'}>ping: {pingIt}</div>
        <div className={'actionCircle'}>ping: {pingIt}</div>
        <div className={'actionCircle'}>ping: {pingIt}</div>
        {tickers}
      </div>
    )
  }
}
