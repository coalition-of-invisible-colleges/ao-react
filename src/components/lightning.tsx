import * as React from 'react'
import { observer } from 'mobx-react'
import request from 'superagent'
import aoStore, { LightningChannel, SatInfo } from '../client/store'
import api from '../client/api'
import { cadToSats } from '../calculations'

function getSats() {
  return cadToSats(1, aoStore.state.cash.spot)
}

function getNn() {
  let totals = {
    channel_sat: 0,
    channel_total_sat: 0
  }
  aoStore.state.cash.info.channels.forEach(n => {
    if (n.state === 'CHANNELD_NORMAL') {
      totals.channel_sat += n.channel_sat
      totals.channel_total_sat += n.channel_total_sat
    }
  })
  if (totals.channel_sat + totals.channel_total_sat === 0) {
    totals.channel_sat = 0.5
    totals.channel_total_sat = 1
  }
  return totals
}

function areChannels() {
  return aoStore.state.cash.info.channels
}

export default function AoLightning() {
  if (
    !aoStore.state.cash.info ||
    !aoStore.state.cash.info.hasOwnProperty('blockheight')
  ) {
    return (
      <React.Fragment>
        <h3>Lightning Status: Not Connected</h3>
        <p>state.cash.info is empty or does not contain blockheight</p>
      </React.Fragment>
    )
  }

  interface TId {
    txid: string
    value: number
    scriptPubKey: { addresses: string[] }
  }

  interface Transaction {
    txid: string
    utxo: TId[]
    vout: TId[]
    memPool: { fee; vsize }
  }
  const [showOutputs, setShowOutputs] = React.useState(false)
  const [fetchedTxn, setFetchedTxn] = React.useState<Transaction>()
  const [txnCheck, setTxnCheck] = React.useState('')
  const [selectedPeer, setSelectedPeer] = React.useState<number>()
  const [open, setOpen] = React.useState(false)
  const [sampleIndex, setSampleIndex] = React.useState(0)

  function unSelectPeer() {
    setSelectedPeer(null)
  }

  function filteredOut() {
    if (fetchedTxn?.utxo) {
      console.log(
        'filtering outs becasuse there are unspents',
        fetchedTxn.utxo.length
      )
      let unspents = fetchedTxn.utxo.filter(x => x !== null).map(x => x.txid)
      return fetchedTxn.vout.filter(y => {
        return unspents.indexOf(y.txid) === -1
      })
    } else {
      console.log('returing vout?')
      return fetchedTxn.vout.slice()
    }
  }

  function fetchedTxnStatus() {
    if (fetchedTxn.memPool) {
      return 'unconfirmed'
    }
    if (fetchedTxn.utxo) {
      return 'confirmed, unspent'
    }
    return 'confirmed, spent'
  }

  function getFeeColor(x) {
    if (x > 100) return 'high'
    if (x > 50) return 'midhigh'
    if (x > 10) return 'mid'
    return 'low'
  }

  function sampler() {
    let checkId =
      aoStore.state.cash.info.mempool.sampleTxns[
        sampleIndex % aoStore.state.cash.info.mempool.sampleTxns.length
      ]
    checkTxid(checkId)
    setSampleIndex(sampleIndex + 1)
  }

  function checkTxid(x) {
    request
      .post('/bitcoin/transaction')
      .send({ txid: x })
      .set('Authorization', aoStore.state.token)
      .end((err, res) => {
        if (!err) {
          setFetchedTxn(res.body)
        }
      })
    setTxnCheck('')
  }

  function toggleOpen() {
    setOpen(!open)
  }

  function toggleShowOutputs() {
    setShowOutputs(!showOutputs)
    console.log('toggleded', showOutputs)
  }

  function selectPeer(pId) {
    if (pId === selectedPeer) {
      setSelectedPeer(null)
      return
    }
    setSelectedPeer(pId)
  }

  function requestChannel() {
    request
      .post('/lightning/channel')
      .send({ id: selectedPeer })
      .set('Authorization', aoStore.state.loader.token)
      .end((err, res) => {
        console.log('response from channel', res.body)
      })
    setSelectedPeer(null)
  }

  function r(n: LightningChannel, nolimits?) {
    let local = n.channel_sat // parseFloat
    let remote = n.channel_total_sat - n.channel_sat // parseFloat

    let capacity = local + remote
    let remotePercent = remote / capacity

    if (!nolimits && remotePercent < 0.2 && remotePercent > 0) {
      remotePercent = 0.2
    }

    let w = (remotePercent * 100).toFixed(7) + '%'
    return {
      width: w
    }
  }

  function l(n, nolimits?) {
    let local = parseFloat(n.channel_sat)
    let remote = parseFloat(n.channel_total_sat) - parseFloat(n.channel_sat)

    let capacity = local + remote
    let localPercent = n.channel_sat / capacity

    if (!nolimits && localPercent > 0.8 && localPercent < 1) {
      localPercent = 0.8
    }
    let w = (localPercent * 100).toFixed(7) + '%'
    return {
      width: w
    }
  }

  const selectedChannel = aoStore.state.cash.info.channels[selectedPeer]
  const sats = getSats()
  const confirmedBalance = aoStore.confirmedBalance.toLocaleString()
  const blockHeight = aoStore.state.cash.info.blockheight.toLocaleString()
  const nn = getNn()
  const leftStyle = l(nn)
  const rightStyle = r(nn)
  const leftStyleT = l(nn, true)
  const rightStyleT = r(nn, true)

  const renderedChannels = aoStore.state.cash.info.channels.map((n, i) => (
    <div className="ptr" key={n.peer_id}>
      {selectedPeer === i && (
        <div className="localremote" onClick={unSelectPeer}>
          <div
            className={
              'localbar tall' +
              (n.state !== 'CHANNELD_NORMAL' ? 'abnormal' : '')
            }
            style={leftStyle}>
            {n.channel_sat.toLocaleString()}
          </div>
          <div
            className={
              'remotebar tall' +
              (n.state !== 'CHANNELD_NORMAL' ? 'abnormal' : '')
            }
            style={leftStyle}>
            {(n.channel_total_sat - n.channel_sat).toLocaleString()}
          </div>
        </div>
      )}
      {selectedPeer !== i && (
        <div className="localRemote" onClick={() => setSelectedPeer(i)}>
          <div
            className={
              'localbar' + (n.state !== 'CHANNELD_NORMAL' ? 'abnormal' : '')
            }
            style={leftStyleT}
          />
          <div
            className={
              'remotebar' + (n.state !== 'CHANNELD_NORMAL' ? 'abnormal' : '')
            }
            style={leftStyleT}
          />
        </div>
      )}
    </div>
  ))

  const renderedOutputs = aoStore.state.cash.info.outputs.map((n, i) => (
    <div onClick={() => checkTxid(n.txid)}>
      txid: {n.txid} : {n.output}
    </div>
  ))

  const renderedThings = fetchedTxn?.utxo?.map(u => {
    if (u && u.value > 0 && u.scriptPubKey.addresses) {
      return <div>{u.value}</div>
    } else {
      return <div>{u.scriptPubKey.addresses} - unspent</div>
    }
  })

    if (fetchedTxn === undefined) {
        return (
                <>
                <h3>Lightning Status: { aoStore.state.cash.info ? "Active" : "Inactive"}</h3>
                {sats > 0 && sats !== Infinity
                ? '0.01 ' +
                aoStore.state.cash.currency +
                ' ~ ' +
                (sats / 100).toFixed(0) + ' sats'
                : '1.0 BTC = 100,000,000 sats'}
                <br/>
                {aoStore.state.cash.info.mempool && (
                        <button onClick={sampler}>
                        Double Click Me To Open Lightning Controls
                        </button>
                        )}
                </>
               )}


    const renderedOutPs = filteredOut().map(outp => (
                <div>{outp.value && outp.scriptPubKey.addresses}</div>
                ))

  return (
    <React.Fragment>
      <h3>Lightning Status</h3>
      {sats > 0 && sats !== Infinity
        ? '0.01 ' +
          aoStore.state.cash.currency +
          ' ~ ' +
          (sats / 100).toFixed(0)
        : '1.0 BTC = 100,000,000'}
      {aoStore.state.cash.info.mempool && (
        <React.Fragment>
          <div>on chain</div>
          <div onClick={toggleShowOutputs} className="action">
            {confirmedBalance}
          </div>
          <div>{blockHeight} verified blocks</div>
          <div onClick={sampler}>
            {aoStore.state.cash.info.mempool.size} unconfirmed (
            {(aoStore.state.cash.info.mempool.bytes / 1000000).toFixed(1)} MB)
          </div>
          <div>
            fee percentile{' '}
            {(
              (Date.now() - aoStore.state.cash.info.blockfo.time * 1000) /
              60 /
              1000
            ).toFixed(1)}
            min old
          </div>
          <div>p 90th</div>
          <div
            className={getFeeColor(
              aoStore.state.cash.info.blockfo.feerate_percentiles[4]
            )}>
            {aoStore.state.cash.info.blockfo.feerate_percentiles[4]}
          </div>
          <div>p 75th</div>
          <div
            className={getFeeColor(
              aoStore.state.cash.info.blockfo.feerate_percentiles[3]
            )}>
            {' '}
            {aoStore.state.cash.info.blockfo.feerate_percentiles[3]}
          </div>
          <div>p 50th</div>
          <div
            className={getFeeColor(
              aoStore.state.cash.info.blockfo.feerate_percentiles[2]
            )}>
            {aoStore.state.cash.info.blockfo.feerate_percentiles[2]}
          </div>
          <div> p 25th</div>
          <div
            className={getFeeColor(
              aoStore.state.cash.info.blockfo.feerate_percentiles[1]
            )}>
            {aoStore.state.cash.info.blockfo.feerate_percentiles[1]}
          </div>
          <div> p 10th</div>
          <div
            className={getFeeColor(
              aoStore.state.cash.info.blockfo.feerate_percentiles[0]
            )}>
            {aoStore.state.cash.info.blockfo.feerate_percentiles[0]}
          </div>
          {aoStore.state.cash.info.channels && (
            <React.Fragment>
              <div
                onClick={unSelectPeer}
                className={selectedPeer >= 0 ? 'ptr' : ''}>
                in channels
              </div>
              <div onClick={unSelectPeer}>
                <div style={leftStyle}>{nn.channel_sat.toLocaleString()}</div>
                <div style={rightStyle}>
                  {(nn.channel_total_sat - nn.channel_sat).toLocaleString()}
                </div>
                {selectedPeer < 0 && (
                  <div className="chanfo">
                    pubkey: {aoStore.state.cash.info.id}
                  </div>
                )}
                {renderedChannels}
              </div>
            </React.Fragment>
          )}
          {selectedPeer >= 0 && areChannels && selectedChannel && (
            <div className="chanfo">
              <div>pubkey: {selectedChannel.peer_id}</div>
              <div onClick={() => checkTxid(selectedChannel.funding_txid)}>
                txid: {selectedChannel.funding_txid}
              </div>
              <span>{selectedChannel.connected ? 'online' : 'offline'}</span>
              {selectedChannel.state !== 'CHANNELD_NORMAL' && (
                <div>state: {selectedChannel.state}</div>
              )}
            </div>
          )}
          {showOutputs && <div className="chanfo">{renderedOutputs}</div>}
          <input
            value={txnCheck}
            type="text"
            placeholder="check txid"
            onKeyPress={event => {
              if (event.key === 'enter') {
                checkTxid(txnCheck)
              }
            }}
          />
          {txnCheck && (
            <button onClick={() => checkTxid(txnCheck)}>get transaction</button>
          )}
          {fetchedTxn.txid && (
            <div className="chanfo">
              <div>txid:{fetchedTxn.txid}</div>
              <div>status: {fetchedTxnStatus}</div>
              {fetchedTxn.memPool && (
                <div
                  className={
                    'chain' +
                    getFeeColor(
                      (fetchedTxn.memPool.fee * 100000000) /
                        fetchedTxn.memPool.vsize
                    )
                  }>
                  fee:{' '}
                  {(
                    (fetchedTxn.memPool.fee * 100000000) /
                    fetchedTxn.memPool.vsize
                  ).toFixed()}{' '}
                </div>
              )}
              {fetchedTxn?.utxo && fetchedTxn.utxo?.length > 0 && renderedThings}
              {renderedOutPs}
            </div>
          )}
          <div className="chanfo">
            {aoStore.state.cash.info.id}@
            {aoStore.state.cash.info.address[0].address}
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
