const faker = require('faker');

module.exports = {
	title: '@@name',
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
	}
};
