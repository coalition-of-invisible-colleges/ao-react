const express = require('express')
const router = express.Router()
const tr = require('tor-request');
const crypto = require('../crypto')

function postEvent(address, secret, body, callback){
  tr.request({
      url: 'http://' + address + '/events',
      headers: {"Authorization": secret},
      method: 'post',
      body,
      json: true,
    }, function (err, res, resBody) {
          if (err){
              console.log("error res", err)
              return callback(err)
          }
          callback(resBody)
  })
}

function getState(address, secret, callback){

  tr.request({
      url: 'http://' + address + '/state',
      headers: {"Authorization": secret},
      method: 'post',
      body: { x: true },
      json: true
    }, function (err, res, resBody) {
          if (err){
              console.log("error res", err)
              return callback(err)
          }
          console.log(res.body)
          console.log(resBody)
          callback(null, resBody)
  })

}

// router.post('/connect', (req, res) => {
//     post(req.body.address, req.body.secret, {
//         type: 'ao-connected',
//         address: req.body.address,
//         secret:  req.body.secret
//     })
// })

router.post('/relay', (req, res) => {})

module.exports = {
    postEvent,
    getState
}
