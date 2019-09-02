const express = require('express')
const router = express.Router()
const tr = require('tor-request');
const crypto = require('../crypto')

function post(address, secret, body){

  tr.request({
      url: 'http://' + address + '/events',
      headers: {"Authorization": secret},
      method: 'post',
      body
    }, function (err, res, resBody) {
          console.log(res.body)
          console.log(resBody)
  })

}

router.post('/connect', (req, res) => {
    // 
    // post(req.body.address, req.body.secret, {
    //     type: 'ao-connected',
    //     address,
    // })
})

router.post('/relay', (req, res) => {

})

module.exports = router
