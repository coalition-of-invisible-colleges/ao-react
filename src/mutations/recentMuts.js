
function recentMuts(recent, ev){
		switch (ev.type) {
				case "cleanup":
						let now = Date.now()
						let offset = 0
						recent.forEach( (ev, i) => {
								let ts = parseInt(ev.timestamp)
								let msSinceEvent = now - ts
								let isOld = msSinceEvent > 1000 * 60 * 60 * 24 * 40
								if (isOld){
										offset += 1
								}
						})
						recent.splice(0, offset)
						break
				default:
						// let isMemberEv = /member.+/.test(ev.type)
						// let isTaskEv = /task.+/.test(ev.type)
						let isResourceEv = /resource.+/.test(ev.type)
						// let isCashEv = /cash.+/.test(ev.type)
						if (isResourceEv){
								recent.push(ev)
						}
		}
}

export default recentMuts
