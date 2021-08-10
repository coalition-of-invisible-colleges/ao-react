import Signal from '@throneless/libsignal-service'
import events from './events.js'
import state from './state.js'
const serverState = state.serverState
import ByteBuffer from 'bytebuffer'
import fs from 'fs'
import path from 'path'
import config from '../../configuration.js'
import { exec } from 'child_process'

export function sendNotification(memberId, message) {
	const member = serverState.members.find(
		member => member.memberId === memberId
	)
	if (!member || !member.phone) {
		console.log(
			"Attempted to notify a member who hasn't entered a phone number!"
		)
		return
	}
	const dir = exec(
		`signal-cli -u ${process.env.SIGNAL_PHONE} send -m "${message}" ${member.phone}`,
		function (err, stdout, stderr) {
			if (err) {
				console.log(`Signal send to ${member.name} at ${member.phone} failed`)
			}
			console.log(stdout)
		}
	)

	dir.on('exit', function (code) {
		if (code === 0) {
			console.log(`Signal sent to ${member.name} at ${member.phone}!`)
		} else {
			console.log(
				`Signal send to ${member.name} at ${member.phone} failed with code ${code}`
			)
		}
	})
	// send(member.phone, message)
}

// The rest of this is a complete implementation of @throneless/libsignal-service-javascript
// The only problem is that it seems like registration must be completed via the same
// program that then sends the message, maybe because registration saves a local private key (?)
// and so when I registered with signal-cli, I wasn't able to send messages with this library.this
// It gave code 401, "Failed to retrieve new device keys for number" which might also just be
// rate limiting, so worth another shot. This library does not implement captcha registration, though.
// This library is maybe more elegant than requiring the user to install signal-cli, let's fix it.
// function printError(error) {
// 	console.log(error)
// }

// const protocolStore = new Signal.ProtocolStore(
// 	new Storage(config.signal.storePath || '/home/$USER/.ao/signaldata')
// )
// protocolStore.load()

// let accountManager
// let messageSender
// let messageReceiver

// // console.log('envs are', process.env.SIGNAL_PHONE, process.env.SIGNAL_PASSWORD)
// if (process.env.SIGNAL_PHONE && process.env.SIGNAL_PASSWORD) {
// 	accountManager = new Signal.AccountManager(
// 		process.env.SIGNAL_PHONE,
// 		process.env.SIGNAL_PASSWORD,
// 		protocolStore
// 	)
// 	messageSender = new Signal.MessageSender(protocolStore)
// 	messageSender.connect()
// 	console.log('Signal connected')

// 	// messageReceiver = new Signal.MessageReceiver(protocolStore)
// 	// messageReceiver.connect()
// }

// export async function requestSMS(username, password, captcha) {
// 	await accountManager.requestSMSVerification().catch(printError)
// }

// function requestVoice(username, password) {
// 	accountManager
// 		.requestVoiceVerification()
// 		.then(result => {
// 			console.log('Calling for verification.')
// 		})
// 		.catch(printError)
// }

// export async function register(username, password, code) {
// 	await accountManager.registerSingleDevice(code).catch(printError)
// }

// function send(number, text, attachment) {
// 	if (!messageSender) {
// 		console.log('Signal was not initialized')
// 	}
// 	let attachments = []
// 	// messageSender.connect().then(() => {
// 	if (attachment) {
// 		Signal.AttachmentHelper.loadFile(attachment)
// 			.then(file => {
// 				attachments.push(file)
// 			})
// 			.then(() => {
// 				messageSender
// 					.sendMessageToNumber({
// 						number,
// 						body: text,
// 						attachments,
// 					})
// 					.then(result => {
// 						console.log(result)
// 					})
// 					.catch(printError)
// 			})
// 	} else {
// 		messageSender
// 			.sendMessageToNumber({
// 				number,
// 				body: text,
// 				attachments,
// 			})
// 			.then(result => {
// 				console.log(result)
// 			})
// 			.catch(printError)
// 	}
// 	// })
// }

// // Numbers is an array of phone numbers in `+15556667777` format
// function sendToGroup(groupId, numbers, text, attachment) {
// 	let attachments = []
// 	// messageSender.connect().then(() => {
// 	if (attachment) {
// 		Signal.AttachmentHelper.loadFile(attachment)
// 			.then(file => {
// 				attachments.push(file)
// 			})
// 			.then(() => {
// 				messageSender
// 					.sendMessageToGroup({
// 						groupId,
// 						recipients: numbers,
// 						body: text,
// 						attachments,
// 					})
// 					.then(result => {
// 						console.log(result)
// 					})
// 					.catch(printError)
// 			})
// 	} else {
// 		messageSender
// 			.sendMessageToGroup({
// 				groupId,
// 				recipients: numbers,
// 				body: text,
// 			})
// 			.then(result => {
// 				console.log(result)
// 			})
// 			.catch(printError)
// 	}
// 	// })
// }

// function expire(number, expire) {
// 	// messageSender.connect().then(() => {
// 	messageSender
// 		.sendExpirationTimerUpdateToNumber(number, parseInt(expire))
// 		.then(result => {
// 			console.log(result)
// 		})
// 		.catch(printError)
// 	// })
// }

// // Numbers is an array of phone numbers in `+15556667777` format
// function createGroup(name, numbers) {
// 	// messageSender.connect().then(() => {
// 	groupId = Signal.KeyHelper.generateGroupId()
// 	messageSender
// 		.createGroup(numbers, groupId, name)
// 		.then(result => {
// 			console.log('Created group with ID: ', groupId)
// 		})
// 		.catch(printError)
// 	// })
// }

// // Numbers is an array of phone numbers in `+15556667777` format
// function leaveGroup(groupId, numbers) {
// 	// messageSender.connect().then(() => {
// 	messageSender
// 		.leaveGroup(groupId, numbers)
// 		.then(result => {
// 			console.log(result)
// 			console.log('Left group with ID: ', groupId)
// 		})
// 		.catch(printError)
// 	// })
// }

// function receive() {
// 	// messageReceiver.connect().then(() => {
// 	messageReceiver.addEventListener('message', ev => {
// 		console.log('*** EVENT ***:', ev)
// 		ev.data.message.attachments.map(attachment => {
// 			messageReceiver.handleAttachment(attachment).then(attachmentPointer => {
// 				Signal.AttachmentHelper.saveFile(attachmentPointer, './').then(
// 					fileName => {
// 						console.log('Wrote file to: ', fileName)
// 					}
// 				)
// 			})
// 		})
// 		if (ev.data.message.group) {
// 			console.log(ev.data.message.group)
// 			console.log(
// 				`Received message in group ${ev.data.message.group.id}: ${ev.data.message.body}`
// 			)
// 		} else {
// 			console.log('Received message: ', ev.data.message.body)
// 		}
// 		ev.confirm()
// 	})
// 	messageReceiver.addEventListener('configuration', ev => {
// 		console.log('Received configuration sync: ', ev.configuration)
// 		ev.confirm()
// 	})
// 	messageReceiver.addEventListener('group', ev => {
// 		console.log('Received group details: ', ev.groupDetails)
// 		ev.confirm()
// 	})
// 	messageReceiver.addEventListener('contact', ev => {
// 		console.log(
// 			`Received contact for ${ev.contactDetails.number} who has name ${ev.contactDetails.name}`
// 		)
// 		ev.confirm()
// 	})
// 	messageReceiver.addEventListener('verified', ev => {
// 		console.log('Received verification: ', ev.verified)
// 		ev.confirm()
// 	})
// 	messageReceiver.addEventListener('sent', ev => {
// 		console.log(
// 			`Message successfully sent from device ${ev.data.deviceId} to ${ev.data.destination} at timestamp ${ev.data.timestamp}`
// 		)
// 		ev.confirm()
// 	})
// 	messageReceiver.addEventListener('delivery', ev => {
// 		console.log(
// 			`Message successfully delivered to number ${ev.deliveryReceipt.source} and device ${ev.deliveryReceipt.sourceDevice} at timestamp ${ev.deliveryReceipt.timestamp}`
// 		)
// 		ev.confirm()
// 	})
// 	messageReceiver.addEventListener('read', ev => {
// 		console.log(
// 			`Message read on ${ev.read.reader} at timestamp ${ev.read.timestamp}`
// 		)
// 		ev.confirm()
// 	})
// 	// })
// }
