function isSun(path) {
    let mainroute = path.split('/')[1]
    return mainroute === 'front'
}

function isUni(path) {
    let mainroute = path.split('/')
    let isUni = mainroute[0] === '' && (mainroute.length < 2 || mainroute[1] === '' || mainroute[1] === 'doge' || mainroute[1] === 'boat' || mainroute[1] === 'badge' || mainroute[1] === 'chest' || mainroute[1] === 'timecube')
    return isUni
}

function isBull(path) {
    let mainroute = path.split('/')[1]
    let isBull = mainroute === 'dash'
    return isBull
}

function isFront(path, mode) {
	console.log("mode is ", mode)
	let route = path.split('/')
	console.log("routes are ", route[1], " ", route[2])
    return route[1] === 'front' && route[2] === mode
}

function isDeck(path, mode) {
    let mainroute = path.split('/')
    console.log("mainroute is", mainroute)
    console.log("router.currentRoute.path.split('/')[1] is ", path.split('/')[0])
    let isDeck = mainroute[0] === '' && mainroute[1] === mode
    return isDeck
}

function isDash(path, mode) {
	let route = path.split('/')
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