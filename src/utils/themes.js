const themes = ['dctrl', 'occult', 'baseball']
let theme = themes[0]

function setTheme(newTheme) {
    if(newTheme > themes.length) return
    theme = themes[newTheme]
    console.log("theme set to ", theme)
}

function nextTheme() {
    let index = themes.indexOf(theme)
    theme = themes[(index + 1) % themes.length]
    console.log("theme advanced to ", theme)
}

function imagesPath(depth) {
	let up = ''
	for(let i = 0; i < depth; i++) {
		up += '../'
	}
	let path = up + '' + theme + '/images/'
	return path
}

export default {
    setTheme,
    nextTheme,
    imagesPath,
}