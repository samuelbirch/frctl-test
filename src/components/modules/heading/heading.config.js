const faker = require('faker');

module.exports = {
	title: 'heading',
	status: 'prototype',
	context: {
		module: {
			heading: faker.lorem.sentence(),
			padding: 'padding-50 pb-0'
		}
	}
};
