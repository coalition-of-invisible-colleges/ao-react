import utils from './utils'
import validators from './validators'
import events from '../events'

// export single middleware for each type
module.exports = function(req,res, next){
  switch (req.body.type) {
      case 'invoice-created':
          specInvoiceCreated(req, res, next)
          break
      case 'invoice-requested':
          specInvoiceRequested(req, res, next)
          break
      default:
          next()
  }
}

function specInvoiceCreated(req, res, next){
  let errRes = []
  if (
    validators.isId(req.body.ownerId, errRes) &&
    validators.isNotes(req.body.memo, errRes) &&
    validators.isAmount(req.body.sats, errRes)
  ){
    if (req.body.r_hash){
        return events.resourceInvoiceCreated(
          req.body.ownerId,
          req.body.r_hash,
          req.body.payment_request,
          req.body.memo,
          req.body.sats,
          utils.buildResCallback(res)
        )
    }

    events.invoiceCreated(
      req.body.ownerId,
      req.body.memo,
      req.body.sats,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}

function specInvoiceRequested(req, res, next){
  let errRes = []
  if (
    validators.isId(req.body.ownerId, errRes) &&
    validators.isNotes(req.body.memo, errRes) &&
    validators.isAmount(req.body.sats, errRes)
  ){
    events.invoiceRequested(
      req.body.ownerId,
      req.body.memo,
      req.body.sats,
      utils.buildResCallback(res)
    )
  } else {
    res.status(200).send(errRes)
  }
}
