function isSun(router) {
    let mainroute = router.currentRoute.path.split('/')[1]
    return mainroute === 'front'
}

function isBull(router) {
    let mainroute = router.currentRoute.path.split('/')[1]
    let isBull = mainroute === 'dash'
    return isBull
}

function isNewspaper(router) {
	let route = router.currentRoute.path.split('/')
	console.log("routes are ", route[1], " ", route[2])
    return route[1] === 'front' && route[2] === 'doge'
}

function isFrontDash(router) {
	let route = router.currentRoute.path.split('/')
	console.log("routes are ", route[1], " ", route[2])
    return route[1] === 'dash' && route[2] === 'doge'
}

export default {
	isSun,
	isBull,
	isNewspaper,
	isFrontDash,
}