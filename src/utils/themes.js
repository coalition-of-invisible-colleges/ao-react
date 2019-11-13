const themes = ['dctrl', 'occult', 'baseball']
let theme = themes[0]

function setTheme(newTheme) {
    if(newTheme > themes.length) return
    theme = themes[theme]
    console.log("theme set to ", theme)
}

function nextTheme() {
    let index = themes.indexOf(theme)
    theme = themes[(index + 1) % themes.length]
    console.log("theme advanced to ", theme)
}

export default {
    setTheme,
    nextTheme,
}