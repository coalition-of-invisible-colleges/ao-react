const dctrlDb = require('../dctrlDb')


function getNodeInfo(info, callback){
    let newEvent = {
        type: "get-node-info",
        info
    }
    dctrlDb.triggerShadow(newEvent)
}

function cashIncreased(amount, notes, callback) {
  let newEvent = {
      type: "cash-increased",
      amount,
      notes,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function cashDecreased(amount, notes, callback) {
  let newEvent = {
    type: "cash-decreased",
    amount,
    notes,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function rentSet(amount, callback){
    let newEvent = {
      type: "rent-set",
      amount
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function capSet(amount, callback){
    let newEvent = {
      type: "cap-set",
      amount
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function variableSet(amount, callback){
    let newEvent = {
      type: "variable-set",
      amount
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function spotUpdated(spot, callback) {
  let newEvent = {
      type: "spot-updated",
      spot
  }
  dctrlDb.triggerShadow(newEvent)
}

function currencySwitched(currency, callback) {
  let newEvent = {
      type: "currency-switched",
      currency
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function forex(currency, callback) {
  let newEvent = {
      type: "forexed",
      currency
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function fundsSet(outputs, channels, callback) {
  let newEvent = {
      type: "funds-set",
      outputs,
      channels,
  }
  dctrlDb.triggerShadow(newEvent)
}

export default {
  cashIncreased,
  cashDecreased,
  spotUpdated,
  rentSet,
  capSet,
  variableSet,
  fundsSet,
}
