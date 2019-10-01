import _ from 'lodash'

function sessionsMuts(sessions, ev){
		switch (ev.type) {
				case "session-created":
						let idHasSession = sessions.some(session => {
								// replace that sessions creds,
								let match = false
								if (session.ownerId === ev.ownerId){
										match = true
										_.merge(session, ev)
								}
								return match // true terminates the some loop & idHasSession->true too
						})

						if (idHasSession){
							 // edited in session
						} else {
								// id didn't previously have session
								sessions.push(ev)
						}
						break
				case "session-killed":
						sessions.forEach( (s, i) => {
								if (s.session == ev.session){
										_.pullAt(sessions, i)
								}
						})
						break
				case "ao-subscribed":
						let hasSession = sessions.some(session => {
								// replace that sessions creds,
								let match = false
								if (session.ownerId === ev.address){
										match = true
										_.merge(session, ev)
								}
								return match // true terminates the some loop & idHasSession->true too
						})

						if (hasSession){
							 // edited in session
						} else {
								// id didn't previously have session
								sessions.push({
										ownerId: ev.address,
										session: ev.address,
										secret: ev.secret,
								})
						}
						break
	}
}

export default sessionsMuts
