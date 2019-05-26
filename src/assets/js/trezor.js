import TrezorConnect from '../../assets/js/TrezorConnect'

// server-side generated and randomized challenges
var hosticon = 'https://example.com/icon.png';
var challenge_hidden = '';
var challenge_visual = '';

var address = "m/44'/0'/2'"
var coin = "Testnet"
var segwit = true
//
TrezorConnect.getAddress(address, coin, segwit, (response) => {
  console.log({response}) // window closed instantly
})
