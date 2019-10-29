function isSun(router) {
    let mainroute = router.currentRoute.path.split('/')[1]
    return mainroute === "front"
}

function isBull(router) {
    let mainroute = router.currentRoute.path.split('/')[1]
    let isBull = mainroute === "dash"
    return isBull
}

export default {
	isSun,
	isBull,
}