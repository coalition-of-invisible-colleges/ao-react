import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
// import AoTicker from './ticker'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import CoinGecko from 'coingecko-api'

const CoinGeckoClient = new CoinGecko()

interface TickerInfo {
  fromCoin: string
  toCoin: string
  exchangeRate?: number
}

interface TickerProps {
  ticker: TickerInfo
  index: number
  validator: (string) => boolean
}

interface TickerState {
  editing: boolean
  text: string
  error?: boolean
}

const defaultTickerState: TickerState = {
  editing: false,
  text: '',
  error: undefined
}

@observer
class AoTicker extends React.Component<TickerProps, TickerState> {
  constructor(props) {
    super(props)
    this.state = defaultTickerState
    this.startEditing = this.startEditing.bind(this)
    this.stopEditing = this.stopEditing.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  startEditing() {
    this.setState({ editing: true })
  }

  stopEditing() {
    this.setState({ editing: false, text: undefined, error: false })
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  onKeyDown(event) {
    if (event.key === 'Escape') {
      this.stopEditing()
    }

    if (event.key === 'Enter') {
      const trimmed =
        this.state.text && this.state.text.length >= 1
          ? this.state.text.trim()
          : ''
      if (this.props.validator(trimmed) || trimmed.length === 0) {
        // Replace the user's ticker string at this index
        api.setTicker(trimmed, this.props.index)

        this.stopEditing()
      } else {
        this.setState({ error: true, text: undefined })
      }
    }
  }

  ignoreEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  render() {
    if (this.state.editing) {
      return (
        <div className={'ticker'}>
          <textarea
            autoFocus
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            onKeyPress={this.ignoreEnter}
            onBlur={this.stopEditing}
            minLength={3}
            maxLength={5}
            placeholder={
              this.props.ticker
                ? this.props.ticker.toCoin.toUpperCase()
                : 'SYMB'
            }
          />
          {this.state.error ? <div className={'error'}>wut?</div> : ''}
        </div>
      )
    }

    if (this.props.ticker === undefined) {
      return (
        <div className={'ticker'}>
          <div className={'actionCircle newEntry'} onClick={this.startEditing}>
            <p>+</p>
          </div>
        </div>
      )
    }

    if (this.props.ticker.exchangeRate === undefined) {
      return (
        <div className={'ticker'}>
          <div className={'actionCircle'} onClick={this.startEditing}>
            <p>{this.props.ticker.toCoin}</p>
          </div>
        </div>
      )
    }

    const decimalPlaces = this.props.ticker.exchangeRate >= 10000 ? 0 : 2
    const exchangeRate = this.props.ticker.exchangeRate.toLocaleString(
      'en-US',
      {
        maximumFractionDigits: decimalPlaces
      }
    )
    return (
      <div className={'ticker'}>
        <div className={'actionCircle'} onClick={this.startEditing}>
          <p>
            1 {this.props.ticker.fromCoin} = {exchangeRate}{' '}
            {this.props.ticker.toCoin.toUpperCase()}
          </p>
        </div>
      </div>
    )
  }
}

interface TickerHudState {
  tickerData?: any
  extendedTickerData?: any
}

@observer
export default class AoTickerHud extends React.Component<{}, TickerHudState> {
  constructor(props) {
    super(props)
    this.state = {}
    this.validateCoinSymbol = this.validateCoinSymbol.bind(this)
  }

  async componentDidMount() {
    const allExchangeRates = await CoinGeckoClient.exchangeRates.all()
    this.setState({ tickerData: allExchangeRates })

    let querySymbols = []
    aoStore.member.tickers.forEach((ticker, i) => {
      if (!this.validateCoinSymbol(ticker)) {
        querySymbols.push(ticker)
      }
    })
    const extendedResults = await CoinGeckoClient.simple.price({
      ids: ['bitcoin'],
      vs_currencies: querySymbols
    })
    this.setState({ extendedTickerData: extendedResults })
  }

  validateCoinSymbol(symbol) {
    return this.state.tickerData.data.rates.hasOwnProperty(
      symbol.trim().toLowerCase()
    )
  }

  render() {
    const myTickers = aoStore.member.tickers

    let tickers = []
    if (myTickers && myTickers.length >= 1) {
      if (this.state.tickerData && this.state.tickerData.code === 200) {
        tickers = myTickers.map((ticker, i) => {
          if (!this.state.tickerData.data.rates.hasOwnProperty(ticker)) {
            return (
              <AoTicker
                ticker={undefined}
                index={i}
                key={i}
                validator={this.validateCoinSymbol}
              />
            )
          }
          return (
            <AoTicker
              ticker={{
                fromCoin: 'BTC',
                toCoin: ticker,
                exchangeRate: this.state.tickerData.data.rates[ticker].value
              }}
              index={i}
              key={i}
              validator={this.validateCoinSymbol}
            />
          )
        })
      }
    }

    return (
      <div id={'tickers'}>
        {tickers}
        <AoTicker
          ticker={undefined}
          index={myTickers.length}
          validator={this.validateCoinSymbol}
        />
      </div>
    )
  }
}
