import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Ticker } from '../client/store'
import api from '../client/api'
import CoinGecko from 'coingecko-api'
import _ from 'lodash'
import { isAddress } from 'web3-utils'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

const CoinGeckoClient = new CoinGecko()

interface TickerInfo {
  from: string
  to: string
  exchangeRate?: number
}

interface TickerProps {
  // ticker: TickerInfo
  ticker: Ticker
  index: number
  // validator: (string) => boolean
}

interface TickerState {
  editing: boolean
  text: string
  error?: boolean
  fromSymbol?: string
  toSymbol?: string
  exchangeRate?: number
}

const defaultTickerState: TickerState = {
  editing: false,
  text: '',
  error: undefined,
  fromSymbol: undefined,
  toSymbol: undefined,
  exchangeRate: undefined
}

@observer
class AoTicker extends React.PureComponent<TickerProps, TickerState> {
  constructor(props) {
    super(props)
    this.state = defaultTickerState
    this.isValidCoin = this.isValidCoin.bind(this)
    this.startEditing = this.startEditing.bind(this)
    this.stopEditing = this.stopEditing.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  async componentDidMount() {
    console.log('ticker loading')

    this.loadTickerData()
    setInterval(() => {
      console.log('Refreshing tickers')
      this.loadTickerData()
    }, 300000)

    // this.setState({ extendedTickerData: extendedResults })
  }

  async loadTickerData() {
    const ticker = this.props.ticker
    console.log('loadTickerData, ticker is ', ticker)
    let allExchangeRates
    let toIsSimple = false
    let toBtcExchange

    if (!_.has(ticker, 'to.length') || !_.has(ticker, 'from.length')) {
      console.log('invalid ticker, skipping')
      return
    }
    console.log('valid ticker, loading...')
    if (ticker.to.length <= 5) {
      allExchangeRates = await CoinGeckoClient.exchangeRates.all()
      if (_.has(allExchangeRates, 'data.rates.' + ticker.to)) {
        this.setState({ toSymbol: ticker.to })
        toIsSimple = true
        toBtcExchange = allExchangeRates.data.rates[ticker.to].value
        console.log(
          'loaded simple to symbol: ',
          ticker.to,
          ' with exchange rate',
          toBtcExchange
        )
      } else {
        console.log('Invalid symbol. Contract address is required for tokens')
        return
      }
    } else if (isAddress(ticker.to)) {
      console.log('to is an ETH address')
      const symbolData = await CoinGeckoClient.coins.fetchCoinContractInfo(
        ticker.to
      )
      const symbol = symbolData.data.symbol

      console.log('to symbol info is ', symbolData, 'and symbol is ', symbol)

      const toBtcExchangeData = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: ticker.to,
        vs_currencies: ['btc', 'usd', 'cad', 'eth']
      })
      console.log('price data is', toBtcExchangeData)
      toBtcExchange = Object.values(toBtcExchangeData.data)[0]['btc']
      console.log('extracted price is ', toBtcExchange)
      this.setState({ toSymbol: symbol })
    }

    if (ticker.from.length <= 5) {
      console.log(
        'from symbol is simple, allExchangeRates is ',
        allExchangeRates
      )
      if (!_.has(allExchangeRates, 'data.rates.' + ticker.from)) {
        allExchangeRates = await CoinGeckoClient.exchangeRates.all()
      }
      console.log('already have exchange rates:', allExchangeRates)
      let denominator =
        allExchangeRates.data.rates[ticker.from].value < 1
          ? 1 / allExchangeRates.data.rates[ticker.from].value
          : allExchangeRates.data.rates[ticker.from].value
      const exchangeRate = toBtcExchange / denominator
      this.setState({
        fromSymbol: ticker.from,
        exchangeRate: exchangeRate
      })
      console.log(
        'loaded simple from symbol & set exchangeRate: ',
        exchangeRate
      )
    } else if (isAddress(ticker.from)) {
      console.log('from is an ETH address')
      const symbolData = await CoinGeckoClient.coins.fetchCoinContractInfo(
        ticker.from
      )

      const symbol = symbolData.data.symbol

      console.log('from symbol info is ', symbolData, 'and symbol is ', symbol)

      const priceData = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: ticker.from,
        vs_currencies: 'btc'
      })

      const price = Object.values(priceData.data)[0]['btc']

      let denominator = price < 1 ? 1 / price : price
      let exchangeRate = toBtcExchange / denominator

      this.setState({ fromSymbol: symbol, exchangeRate: exchangeRate })
      console.log(
        'set exchangeRate to ',
        exchangeRate,
        ' based on price ',
        price
      )
    }
  }

  async isValidCoin(symbolOrContractAddress: string) {
    const trimmed = symbolOrContractAddress.trim()
    if (symbolOrContractAddress.length <= 5) {
      // It's a symbol, so check if it in our list of exchange rates
      const allExchangeRates = await CoinGeckoClient.exchangeRates.all()
      return _.has(
        allExchangeRates,
        'data.rates.' + symbolOrContractAddress.trim().toLowerCase()
      )
    }

    // It's longer, so check if it's a valid and existing Solidity contract isAddress
    if (!isAddress(symbolOrContractAddress)) {
      return false
    }

    const priceData = await CoinGeckoClient.simple.fetchTokenPrice({
      contract_addresses: trimmed,
      vs_currencies: ['btc', 'usd', 'cad', 'eth']
    })

    const price = Object.values(priceData.data)[0]['btc']

    console.log('price is', price)
    return !!price
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
      if (trimmed.length <= 0) {
        api.setTicker(null, null, this.props.index)
        this.setState(defaultTickerState)
      }
      const split = trimmed.split('/')

      if (split.length != 2) {
        this.setState({ error: true, text: undefined })
        return
      }

      split[0] = split[0].trim()
      split[1] = split[1].trim()

      if (
        split[0].length < 1 ||
        split[1].length < 1 ||
        !this.isValidCoin(split[0]) ||
        !this.isValidCoin(split[1])
      ) {
        this.setState({ error: true, text: undefined })
        return
      }
      // Replace the user's ticker at this index
      api
        .setTicker(split[0], split[1], this.props.index)
        .then(() => this.loadTickerData())

      this.stopEditing()
    }
  }

  ignoreEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  render() {
    const ticker = this.props.ticker

    if (this.state.editing) {
      return (
        <Tippy
          zIndex={4}
          theme="translucent"
          delay={[475, 200]}
          content={
            'Type a pair of currencies, such as USD/CAD, ETH/BTC, or BTC/USD. You can also type a Solidity contract address to add an ERC-20 token. For example, paste in "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 / 0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e" to see $YFI in $UNI.'
          }
          placement="left"
          maxWidth="30em"
          showOnCreate={true}
          hideOnClick={false}
          trigger="manual">
          <div className={'ticker'}>
            <textarea
              autoFocus
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              onKeyPress={this.ignoreEnter}
              onBlur={this.stopEditing}
              minLength={7}
              placeholder={
                this.state.toSymbol ? this.state.toSymbol.toUpperCase() : 'SYMB'
              }
            />
            {this.state.error ? <div className={'error'}>wut?</div> : ''}
          </div>
        </Tippy>
      )
    }

    if (!ticker) {
      return (
        <div className={'ticker'}>
          <div className={'actionCircle newEntry'} onClick={this.startEditing}>
            <p>+</p>
          </div>
        </div>
      )
    }

    if (this.state.exchangeRate === undefined) {
      return (
        <div className={'ticker'}>
          <div className={'actionCircle'} onClick={this.startEditing}>
            <p>Loading&hellip;</p>
          </div>
        </div>
      )
    }

    let decimalPlaces = 2
    if (this.state.exchangeRate >= 10000) {
      decimalPlaces = 0
    } else if (this.state.exchangeRate < 1) {
      decimalPlaces = 6
    }
    const exchangeRate = this.state.exchangeRate.toLocaleString('en-US', {
      maximumFractionDigits: decimalPlaces
    })
    return (
      <div className={'ticker'}>
        <div className={'actionCircle'} onClick={this.startEditing}>
          <p>
            1 {this.state.fromSymbol.toUpperCase()} = {exchangeRate}{' '}
            {this.state.toSymbol.toUpperCase()}
          </p>
        </div>
      </div>
    )
  }
}

@observer
export default class AoTickerHud extends React.Component {
  render() {
    const myTickers: Ticker[] = aoStore.member.tickers

    let tickers = []
    if (myTickers && myTickers.length >= 1) {
      tickers = myTickers.map((ticker, i) => {
        if (!_.has(ticker, 'to') || !_.has(ticker, 'from')) {
          return null
        }
        return (
          <AoTicker
            ticker={ticker}
            index={i}
            key={ticker.to + '-' + ticker.from}
          />
        )
      })
    }

    return (
      <div id={'tickers'}>
        {tickers}
        <AoTicker ticker={null} index={myTickers ? myTickers.length : 0} />
      </div>
    )
  }
}
