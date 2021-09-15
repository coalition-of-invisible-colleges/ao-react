// This script might work but doesn't work with captchas
// So, just use signal-cli to register the phone number
// Then put the password in your configuration.js file
// Run this script with `npm run registerSignal`

import * as readline from 'readline'
import { requestSMS, register } from '../src/server/signal.js'
import config from '../configuration.js'

// const [captcha] = process.argv.slice(1)

let rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

console.log(
	`This script will register an existing phone number to Signal,
so that the AO can use it to send secure notifications to AO users.

If you get Error 402, please follow instructions at https://github.com/AsamK/signal-cli/wiki/Registration-with-captcha
to complete captcha at https://signalcaptchas.org/registration/generate.html
You can put the captcha code as the first argument when calling this script.\n\n`
)

const username = config.signal.phoneNumber
const password = config.signal.password
const captcha =
	'03AGdBq263H7dLBCPHJ8JqYpMBqFF6rwqE5CA7hz2-dWgq4RmUNEDQx__pMXSA1Jih2uJ6DelAm8I3kJfk_TOxOvcSJaR8I1HG_8gjSVPrg5gTJSqoM3kK9a-vq4f1o8vUDTx0SU5OQMEDXtL733kCilwbwwz5znKmkP_tzV3J5P8qQRL0gWNnlTe-5PKLTMnplEtaCQI4ghV-g9nCfkKTdiu-2JPm7pHzvavzL0eIU0229zxXOsjt-hp82HfApwiVQhDGjEIvB34X1euTCsxq_QB99JZfLDP3b0Y4T3Ud8ch-KwKlKk_gAnEdQtpu9aouwkxj3df9AoIr6doghLvavKxjL4_9K5aeyT4JXl5nXoHDDcy5Oo25pCxcx9WtrHFWPnUhZz-zonUHyHWKmy7cefkf6zyovScQc2x5BdOFyix06zFcCcmx1yNE5mbh0Wp5FV8_DGPRTQX4YljSz0oeqT1-OSTh0HkmFw'

if (username && password) {
	console.log(`Your current phone number and password in configuration.js are:
phoneNumber: ${username}
password: ${password}\n`)
} else {
	console.log(`Before running this script, modify configuration.js to add a new signal section:
}

signal: {
\tphoneNumber: '+14445558888',
\tpassword: 'myrandompassword442%',
\tstorePath: '/home/username/.ao/signaldata'
}`)
	process.exit(1)
}

function questions() {
	rl.question(`Press Enter to continue or Ctrl-C to exit`, response => {
		console.log(`Requesting SMS verification of ${username}...`)

		// await requestSMS(username, password, captcha)

		rl.question('Please enter the code from the SMS you receive:', code => {
			if (code) {
				register(username, password, code).then(() => {
					rl.close()
					process.exit(0)
				})
			}
		})
	})
}

questions()
