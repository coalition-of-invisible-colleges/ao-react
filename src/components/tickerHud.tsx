import * as React from 'react'
import { observer } from 'mobx-react'
import { computed } from 'mobx'
import ReactDOM from 'react-dom'
import aoStore, { Ticker } from '../client/store'
import api from '../client/api'
import CoinGecko from 'coingecko-api'
import _ from 'lodash'
import { isAddress } from 'web3-utils'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

const CoinGeckoClient = new CoinGecko()

// interface TickerInfo {
//   from: string
//   to: string
//   exchangeRate?: number
// }

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
  fromCoinId?: string
  toSymbol?: string
  exchangeRate?: number
  loadedScript?: boolean
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
export class AoTicker extends React.Component<TickerProps, TickerState> {
  private infoRef
  private tippyRef
  private tickerRef

  constructor(props) {
    super(props)
    this.state = defaultTickerState
    this.isValidCoin = this.isValidCoin.bind(this)
    this.startEditing = this.startEditing.bind(this)
    this.stopEditing = this.stopEditing.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.loadScript = this.loadScript.bind(this)

    this.tickerRef = React.createRef()
  }

  async componentDidMount() {
    this.loadTickerData()
    setInterval(() => {
      console.log('Refreshing tickers')
      this.loadTickerData()
    }, 300000)
  }

  loadScript() {
    if (!this.state.loadedScript) {
      const script = document.createElement('script')
      script.src =
        'https://widgets.coingecko.com/div/coingecko-coin-price-chart-widget-div.js'
      script.async = false
      this.tickerRef.current.appendChild(script)
      this.setState({ loadedScript: true })

      const el = document.getElementById('ticker-' + this.props.index)
      if (el) {
        el.innerHTML = ''
      }
    }
  }

  async loadTickerData() {
    const ticker = this.props.ticker
    let allExchangeRates
    let toIsSimple = false
    let toBtcExchange

    if (!_.has(ticker, 'to.length') || !_.has(ticker, 'from.length')) {
      console.log('invalid ticker, skipping (clean up your database)')
      return
    }
    if (ticker.to.length <= 5) {
      allExchangeRates = await CoinGeckoClient.exchangeRates.all()
      if (_.has(allExchangeRates, 'data.rates.' + ticker.to)) {
        this.setState({ toSymbol: ticker.to })
        toIsSimple = true
        toBtcExchange = allExchangeRates.data.rates[ticker.to].value
      } else {
        console.log('Invalid symbol. Contract address is required for tokens')
        return
      }
    } else if (isAddress(ticker.to)) {
      const symbolData = await CoinGeckoClient.coins.fetchCoinContractInfo(
        ticker.to
      )
      const symbol = symbolData.data.symbol

      const toBtcExchangeData = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: ticker.to,
        vs_currencies: ['btc', 'usd', 'cad', 'eth']
      })
      toBtcExchange = 1 / Object.values(toBtcExchangeData.data)[0]['btc']
      this.setState({ toSymbol: symbol })
    }

    if (ticker.from.length <= 5) {
      if (!_.has(allExchangeRates, 'data.rates.' + ticker.from)) {
        allExchangeRates = await CoinGeckoClient.exchangeRates.all()
      }
      const exchangeRate =
        toBtcExchange / allExchangeRates.data.rates[ticker.from].value

      const coin = allExchangeRates.data.rates[ticker.from]
      let coinName
      let coinId
      if (coin) {
        coinName = coin.name.toLowerCase()
        if (coinName === 'ether') {
          coinName = 'ethereum'
        }
        const list = await CoinGeckoClient.coins.list()
        let match = list.data.find(coin => coin.name.toLowerCase() === coinName)
        if (match) {
          coinId = match.id
        }
      }
      this.setState({
        fromSymbol: ticker.from,
        fromCoinId: coinId,
        exchangeRate: exchangeRate
      })
    } else if (isAddress(ticker.from)) {
      const symbolData = await CoinGeckoClient.coins.fetchCoinContractInfo(
        ticker.from
      )

      const symbol = symbolData.data.symbol
      const coinId = symbolData.data.id

      const priceData = await CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: ticker.from,
        vs_currencies: 'btc'
      })

      const price = 1 / Object.values(priceData.data)[0]['btc']
      let exchangeRate = toBtcExchange / price

      this.setState({
        fromSymbol: symbol,
        fromCoinId: coinId,
        exchangeRate: exchangeRate
      })
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
      event.stopPropagation()
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

  @computed get renderInfo() {
    return (
      <div
        id={'ticker-' + this.props.index}
        data-background-color=""
        data-currency={this.state.toSymbol ? this.state.toSymbol : 'usd'}
        data-coin-id={this.state.fromCoinId ? this.state.fromCoinId : 'bitcoin'}
        data-locale="en"
        data-height="300"
        data-width="400"
        className="coingecko-coin-price-chart-widget"
        style={{ maxWidth: '100%' }}>
        loading info...
      </div>
    )
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
          <div className="ticker">
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
            {this.state.error ? <div className="error">wut?</div> : ''}
          </div>
        </Tippy>
      )
    }

    if (!ticker) {
      return (
        <div className="ticker menu action" onClick={this.startEditing}>
          Add Crypto Ticker
        </div>
      )
    }

    if (this.state.exchangeRate === undefined) {
      return (
        <div className="ticker">
          <div className="actionCircle" onClick={this.startEditing}>
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

    const actionCircle = (
      <div className="actionCircle" onClick={this.startEditing}>
        <p>
          1 {this.state.fromSymbol.toUpperCase()} = {exchangeRate}{' '}
          {this.state.toSymbol.toUpperCase()}
        </p>
      </div>
    )

    return (
      <div className="ticker" ref={this.tickerRef}>
        <Tippy
          zIndex={4}
          placement="left"
          theme="translucent"
          maxWidth="30em"
          interactive={true}
          content={this.renderInfo}
          onShown={this.loadScript}>
          {actionCircle}
        </Tippy>
      </div>
    )
  }
}

@observer
export default class AoTickerHud extends React.Component {
  constructor(props) {
    super(props)
  }

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

    return <div id="tickers">{tickers}</div>
  }
}
