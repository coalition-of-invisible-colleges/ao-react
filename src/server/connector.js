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
          console.log("got response from eventpost:", resBody)
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
          console.log("state res body", res.body)
          console.log("also state resBody", resBody)
          callback(null, resBody)
  })

}

module.exports = {
    postEvent,
    getState
}
