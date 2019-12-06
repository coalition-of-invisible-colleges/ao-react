
function cashMuts(cash, ev){
		switch (ev.type) {
			case "ao-disconnected":
				console.log('ao-disconnected', ev)
				cash.subscribed.forEach( (ao, i) => {
						if (ao.address === ev.address) {
								console.log("attempting to remove subscription")
								cash.subscribed.splice(i, 1)
						}
				})
				break
			case "ao-subscribed":
				cash.subscribed.push(ev)
				break
			case "ao-named":
				cash.alias = ev.alias
				break
			case "cash-increased":
				cash.cash += parseFloat(ev.amount)
				break
			case "cash-decreased":
				cash.cash -= parseFloat(ev.amount)
				break
			case "member-paid":
				if (ev.isCash) {
					cash.cash += parseFloat(ev.paid)
				}
				break
			case "task-claimed":
			 	cash.variable += parseFloat(ev.paid)
				break
			case "spot-updated":
				cash.spot = ev.spot
				break
			case "currency-switched":
				cash.currency = ev.currency
				break
			case "rent-set":
				cash.rent = parseFloat(ev.amount)
				break
			case "cap-set":
				cash.cap = ev.amount
				break
			case "variable-set":
				cash.variable = ev.amount
				break
			case "funds-set":
				cash.outputs = ev.outputs
				cash.channels = ev.channels
				break
			case "task-boosted":
				cash.usedTxIds.push(ev.txid)
				break
			case "task-boosted-lightning":
				cash.pay_index = ev.pay_index
				break
			case "get-node-info":
				cash.info = ev.info
				break
		}
}

export default cashMuts
