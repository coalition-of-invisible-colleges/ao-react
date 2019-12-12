import utils from './utils'
import validators from './validators'
import events from '../events'
import state from '../state'
import connector from '../connector'

module.exports = function(req, res, next){
  switch (req.body.type){
      case 'ao-disconnected':
          specAoDisconnected(req, res, next)
          break
      case 'ao-named':
          specAoNamed(req, res, next)
          break
      case 'cash-increased':
          specCashIncreased(req, res, next)
          break
      case 'cash-decreased':
          specCashDecreased(req, res, next)
          break
      case 'rent-set':
          specRentSet(req, res, next)
          break
      case 'cap-set':
          specCapSet(req, res, next)
          break
      case 'ao-connected':
          specAOConnect(req, res, next)
          break
      case 'ao-subscribed':
          specAOSubscribed(req, res, next)
          break
      case 'ao-relay':
          let secret
          state.serverState.ao.forEach(a => {
              if (a.address == req.body.address){
                  secret = a.secret
              }
          })
          if (secret){
            console.log('ao relay attempt', req.body.address, req.body.ev)
            connector.postEvent(req.body.address, secret, req.body.ev, (connectorRes) => {
                console.log("connection response: ", {connectorRes})
                if (connectorRes.lastInsertRowid){
                    events.aoEvs.aoRelayAttempted(
                      req.body.address,
                      true,
                      utils.buildResCallback(res)
                    )
                } else {
                    events.aoEvs.aoRelayAttempted(
                      req.body.address,
                      false,
                      utils.buildResCallback(res)
                    )
                }
            })
          } else {
              console.log("no connection for ", req.body.address)
          }
          break
      case "ao-updated":
          specAoUpdated(req, res, next)
          break
      default:
          next()
  }
}

function specAoNamed(req, res, next){
    let errRes = []
    if (validators.isNotes(req.body.alias, errRes)){
        events.aoEvs.aoNamed(req.body.alias, utils.buildResCallback(res))
    } else {
        res.status(200).send(errRes)
    }
}

function specCashIncreased(req, res, next){
  let errRes = []
  if (
    validators.isAmount(req.body.amount, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.cashEvs.cashIncreased(
      req.body.amount,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specCashDecreased(req, res, next){
  let errRes = []
  if (
    validators.isAmount(req.body.amount, errRes) &&
    validators.isNotes(req.body.notes, errRes)
  ){
    events.cashEvs.cashDecreased(
      req.body.amount,
      req.body.notes,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specRentSet(req, res, next){
  let errRes = []
  if (
    validators.isAmount(req.body.amount, errRes)
  ){
    events.cashEvs.rentSet(
      req.body.amount,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specCapSet(req, res, next){
  let errRes = []
  if (
    validators.isAmount(req.body.amount, errRes)
  ){
    events.cashEvs.capSet(
      req.body.amount,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specAOSubscribed(req, res, next){
  let errRes = []
  if (
      validators.isNotes(req.body.address, errRes) &&
      validators.isNotes(req.body.secret, errRes)
  ){
    events.aoEvs.aoSubscribed(
      req.body.address,
      req.body.secret,
      utils.buildResCallback(res)
    )
  } else {
      res.status(200).send(errRes)
  }
}

function specAoDisconnected(req, res, next){
    let errRes = []
    if (
      validators.isAddress(req.body.address, errRes)
    ){
      console.log("making disconnected ev")
      events.aoEvs.aoDisconnected(
        req.body.address,
        utils.buildResCallback(res)
      )
    } else {
      res.status(200).send(errRes)
    }
}

function specAOConnect(req, res, next){
  let errRes = []
  console.log('attempt post to ', req.body.address)
  connector.postEvent(req.body.address, req.body.secret, {
      type: 'ao-subscribed',
      address: state.serverState.cash.address,
      secret: req.body.secret, //
  }, (subscriptionResponse) => {
      if (!subscriptionResponse.lastInsertRowid){
          return res.status(200).send(['ao-connect failed'])
      }
      console.log('subscribe success, attempt ao connect')
      events.aoEvs.aoConnected(
        req.body.address,
        req.body.secret,
        utils.buildResCallback(res)
      )
  })
}


function specAoUpdated(req, res, next){
    state.serverState.ao.forEach(a => {
        if (a.address === req.body.address){
            connector.getState(a.address, a.secret, (err, state) => {
                if (err){
                    return events.aoEvs.aoRelayAttempted(a.address, false, utils.buildResCallback(res))
                }
                console.log("adding state for:", {state})
                events.aoEvs.aoUpdated(a.address, state, utils.buildResCallback(res))
            })

        }
    })

}
