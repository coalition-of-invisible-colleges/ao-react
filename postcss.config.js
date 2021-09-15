// postcss.config.js
const autoprefixer = require('autoprefixer')

export default {
	plugins: [autoprefixer({ browsers: ['last 2 versions'] })],
}
