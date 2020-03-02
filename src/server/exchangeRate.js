// https://apiv2.bitcoinaverage.com/#requests
const crypto = require('crypto');
const request = require('superagent')
const config = require('../../configuration')
const events = require('./events')
const state = require('./state')
const validators = require('./validators')

function watchSpot(){
    getRecordSpot()
    setInterval( getRecordSpot, 500000 )
}

function getRecordSpot(){
    getPrice( (err, spot)=> {
        if (!err){
            events.spotUpdated(spot)
        }
    })
}

function createBitcoinAverageSignature(){
    // Step 1 - Create a payload consisting of “timestamp.public_key”:
    const msSince1970 = Date.now()
    const unixTime = (Date.now() / 1000).toFixed(0)
    const step1 = unixTime +'.'+ config.bitcoinAverage.pub

    // Step 2 - The payload needs to be HMAC encrypted with the sha256 algorithm
    // using your API secret key that corresponds to the given public key in the
    // payload. This result is called a ‘digest_value’ and needs to be in hex
    const hmac = crypto.createHmac('sha256', config.bitcoinAverage.secret)
    hmac.update(step1);
    const step2 = hmac.digest('hex')

    // Step 3 - Finally we can compose the value that needs to be used in the
    // X-signature header. It’s contents need to be in the format:
    // timestamp.public_key.digest_value (step1 cat step2)
    return step1 + step2
}

function getPrice(callback){
    request
        .get('https://apiv2.bitcoinaverage.com/indices/global/ticker/BTC' + state.serverState.cash.currency)
        // Something seemed to break api keys? Use free / unauthed account
        // .set('X-signature', createBitcoinAverageSignature())
        .end((err, res)=> {
            if (err) return callback(err);
            if ( validators.isAmount(res.body.last) ) {
                callback(null, res.body.last)
            } else {
                callback('invalid res?')
            }
        })
}

module.exports = {
    getPrice,
    watchSpot
}

// success: {
// ask: 3080.86,
// bid: 3076.03,
// last: 3078.76,
// high: 3265.27,
// low: 3060.76,
// open:
//  { hour: 3232.12,
//    day: 3232.12,
//    week: 3226.95,
//    month: 3676.67,
//    month_3: 1558.4,
//    month_6: 1173.11,
//    year: 835.03 },
// averages: { day: 3178.81, week: 3290.95, month: 3262.79 },
// volume: 78742.56,
// changes:
//  { price:
//     { hour: -153.37,
//       day: -153.37,
//       week: -148.2,
//       month: -597.91,
//       month_3: 1520.35,
//       month_6: 1905.64,
//       year: 2243.72 },
//    percent:
//     { hour: -4.75,
//       day: -4.75,
//       week: -4.59,
//       month: -16.26,
//       month_3: 97.56,
//       month_6: 162.44,
//       year: 268.7 } },
// volume_percent: 1.21,
// timestamp: 1499720478,
// display_timestamp: '2017-07-10 21:01:18' }
