// For importing .svg files in .tsx files
declare module '*.svg' {
	const content: string
	export default content
}

// Needed to import .png image files in .tsx files without throwing an error
declare module '*.png'
