module.exports = {
	globDirectory: 'public/',
	globPatterns: ['**/*.{css,js,ttf,woff,woff2,ico,png,gif,jpg}'],
	swDest: './public/assets/js/sw/sw.js',
	globIgnores: ['assets/js/sw/*', 'cpresources/**/*', 'image-cache/**/*', 'assets/img/demo/**/*'],
	importWorkboxFrom: 'cdn',
	modifyURLPrefix: {
		'': '/'
	},
	runtimeCaching: [
		{
			urlPattern: /https:\/\/fonts.googleapis.com\/(.*)/,
			handler: 'CacheFirst',
			options: {
				cacheName: 'googleapis',
				expiration: {
					maxEntries: 10
				}
			}
		},
		{
			urlPattern: /\.(?:png|gif|jpg|jpeg|svg)$/,
			handler: 'CacheFirst',
			options: {
				cacheName: 'images',
				expiration: {
					maxEntries: 60,
					maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
				}
			}
		},
		{
			urlPattern: /\.(?:js|css)$/,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-resources'
			}
		}
	]
};
