module.exports = ctx => ({
	map: ctx.env === 'production' ? false : ctx.options.map,
	plugins: {
		autoprefixer: {},
		cssnano: ctx.env === 'production' ? { preset: 'default' } : false
	}
});
