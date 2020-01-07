const faker = require('faker');

const sizes = [300, 350, 400, 450, 500, 550];

module.exports = {
	title: 'gallery',
	status: 'prototype',
	context: {
		module: {
			images: Array.from({ length: 24 }, (v, k) => 'https://placeimg.com/400/' + sizes[Math.floor(Math.random() * sizes.length)] + '/any/grayscale?t=' + k),
			heading: faker.lorem.sentence(),
			summary: faker.lorem.paragraph(),
			listingColumns: 4,
			tint: false,
			theme: 'dark'
		}
	},
	collated: false,
	default: 'masonry',
	variants: [
		{
			name: 'masonry',
			label: 'Masonry',
			context: {
				module: {
					heading: 'Masonry layout'
				}
			}
		},
		{
			name: 'grid',
			label: 'Grid',
			context: {
				module: {
					heading: 'Grid layout',
					images: Array.from({ length: 12 }, (v, k) => 'https://placeimg.com/600/600/any/grayscale?t=' + k),
					tint: true
				}
			}
		},
		{
			name: 'rows',
			label: 'Rows',
			context: {
				module: {
					heading: 'Rows layout',
					theme: 'light',
					rows: [
						{ images: Array.from({ length: 2 }, (v, k) => 'https://placeimg.com/600/350/any?t=1-' + k), layout: [6, 6] },
						{ images: Array.from({ length: 3 }, (v, k) => 'https://placeimg.com/600/350/any?t=2-' + k), layout: [4, 4, 4] },
						{ images: Array.from({ length: 1 }, (v, k) => 'https://placeimg.com/800/250/any?t=3-' + k), layout: [12] },
						{ images: ['https://placeimg.com/800/342/any?t=4-1', 'https://placeimg.com/400/350/any?t=4-2'], layout: [8, 4] },
						{ images: ['https://placeimg.com/400/350/any?t=5-1', 'https://placeimg.com/800/342/any?t=5-2'], layout: [4, 8] }
					],
					tint: true
				}
			}
		}
	]
};
