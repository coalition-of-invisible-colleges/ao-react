function isSun(router) {
    let mainroute = router.currentRoute.path.split('/')[1]
    return mainroute === 'front'
}

function isUni(router) {
    let mainroute = router.currentRoute.path.split('/')
    let isUni = mainroute[0] === '' && (mainroute[1] === 'doge' || mainroute[1] === 'boat' || mainroute[1] === 'badge' || mainroute[1] === 'chest' || mainroute[1] === 'timecube')
    return isUni
}

function isBull(router) {
    let mainroute = router.currentRoute.path.split('/')[1]
    let isBull = mainroute === 'dash'
    return isBull
}

function isFront(router, mode) {
	console.log("mode is ", mode)
	let route = router.currentRoute.path.split('/')
	console.log("routes are ", route[1], " ", route[2])
    return route[1] === 'front' && route[2] === mode
}

function isDeck(router, mode) {
    let mainroute = router.currentRoute.path.split('/')
    console.log("mainroute is", mainroute)
    console.log("router.currentRoute.path.split('/')[1] is ", router.currentRoute.path.split('/')[0])
    let isDeck = mainroute[0] === '' && mainroute[1] === mode
    return isDeck
}

function isDash(router, mode) {
	let route = router.currentRoute.path.split('/')
	console.log("routes are ", route[1], " ", route[2])
    return route[1] === 'dash' && route[2] === mode
}

export default {
	isSun,
	isUni,
	isBull,
	isFront,
	isDeck,
	isDash,
}