const faker = require('faker');

module.exports = {
	title: 'Example',
	status: 'prototype',
	context: {
		module: {
			image: ['https://placeimg.com/370/370/nature', faker.image.nature(370)],
			heading: faker.lorem.sentence(),
			body: '<p>' + faker.lorem.paragraph() + '</p>',
			button: {
				text: 'View Now',
				theme: 'action'
			}
		}
	},
	collated: false,
	default: 'one',
	variants: [
		{
			name: 'one',
			label: 'Example 1'
		},
		{
			name: 'two',
			label: 'Example 2',
			context: {
				module: {
					heading: faker.lorem.sentence(),
					body: '<p>' + faker.lorem.paragraph() + '</p>',
					theme: 'secondary'
				}
			}
		},
		{
			name: 'three',
			context: {
				text: 'Hello World!'
			}
		}
	]
};
