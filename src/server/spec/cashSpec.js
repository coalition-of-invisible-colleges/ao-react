import utils from './utils'
import validators from './validators'
import events from '../events'
import state from '../state'

module.exports = function(req, res, next){
  switch (req.body.type){
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
      default:
          next()
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
