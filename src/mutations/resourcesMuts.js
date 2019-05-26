import _ from 'lodash'

function resourcesMuts(resources, ev){
	switch (ev.type) {
		case "resource-created":
			resources.push(ev)
			break
		case "resource-used":
			resources.forEach( resource => {
				if (resource.resourceId == ev.resourceId){
					resource.stock -= parseInt(ev.amount)
				}
			})
			break
		case "resource-stocked":
			resources.forEach( resource => {
				if (resource.resourceId == ev.resourceId){
						resource.stock += parseInt(ev.amount)
				}
			})
			break
		case "resource-removed":
				resources.forEach( (r, i) => {
						if (r.resourceId == ev.resourceId){
								resources.splice(i, 1)
						}
				})
				break
		case "channel-created":
				resources.forEach((r, i) => {
						if (r.resourceId == ev.resourceId){
								r.pubkey = ev.pubkey
						}
				})
				break
		case "cleanup":
			break
	}
}

export default resourcesMuts
