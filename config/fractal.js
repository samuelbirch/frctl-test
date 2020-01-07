'use strict';

/*
 * Require the path module
 */
const path = require('path');
const fs = require('fs');

/*
 * Require the Fractal module
 */
const fractal = (module.exports = require('@frctl/fractal').create());

const twigAdapter = require('@frctl/twig')({
	//base: '../',

	// register custom functions
	functions: {
		// usage: {{ source(url) }}
		source: function(url) {
			if (!url) return '';

			return '<style type="text/css">' + fs.readFileSync(path.join(__dirname, '../public' + url), 'utf8') + '</style>';
		},
		// usage: {{ attr({}) }}
		attr: function(obj) {
			if (!obj) return '';

			var obj2Attr = function(ns, obj) {
				var str = '';
				Object.keys(obj).forEach(function(key) {
					if (key != '_keys') {
						if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
							str += ns + '="' + obj[key].join(' ') + '"';
						} else if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
							str += obj2Attr(ns + '-' + key, obj[key]);
						} else {
							str += ns + '-' + key + '="' + obj[key] + '"';
						}
					}
				});
				return str;
			};

			var str = '';

			Object.keys(obj).forEach(function(key) {
				if (key != '_keys') {
					if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
						str += key + '="' + obj[key].join(' ') + '"';
					} else {
						str += obj2Attr(key, obj[key]);
					}
				}
			});

			return str;
		}
	},
	// register custom tags
	tags: {
		do: function(Twig) {
			// usage: {% do "url" %}
			return {
				// unique name for tag type
				type: 'do',
				// regex match for tag (flag white-space anything)
				regex: /^do\s+(.+)$/,
				// this is a standalone tag and doesn't require a following tag
				next: [],
				open: true,

				// runs on matched tokens when the template is loaded. (once per template)
				compile: function(token) {
					var expression = token.match[1];

					// Compile the expression. (turns the string into tokens)
					token.stack = Twig.expression.compile.apply(this, [
						{
							type: Twig.expression.type.expression,
							value: expression
						}
					]).stack;

					delete token.match;
					return token;
				},

				// Runs when the template is rendered
				parse: function(token, context, chain) {
					// parse the tokens into a value with the render context
					var name = Twig.expression.parse.apply(this, [token.stack, context]),
						output = '';

					//flags[name] = true;
					token.stack.forEach(function(el) {
						if (el.type == 'Twig.expression.type.key.period') {
							if (el.key == 'registerCssFile') {
								output = '<link rel="stylesheet" href="/' + name + '" type="text/css">';
							}
							if (el.key == 'inlineCss') {
								output = '<style type="text/css">' + fs.readFileSync(path.join(__dirname, '../public/assets/' + name), 'utf8') + '</style>';
							}
						}
					});

					return {
						chain: false,
						output: output
					};
				}
			};
		}
	}
});

fractal.components.engine(twigAdapter);
fractal.components.set('ext', '.twig');

/*
 * Give your project a title.
 */
fractal.set('project.title', 'Kurious Digital');

/*
 * Tell Fractal where to look for components.
 */
fractal.components.set('path', path.join(__dirname, '../src/components'));
fractal.components.set('engine', '@frctl/twig');

/*
 * Tell Fractal where to look for documentation pages.
 */
fractal.docs.set('path', path.join(__dirname, '../src/docs'));

/*
 * Tell the Fractal web preview plugin where to look for static assets.
 */
fractal.web.set('static.path', path.join(__dirname, '../public/assets'));

fractal.web.set('builder.dest', path.join(__dirname, '../public/templates'));

fractal.components.set('default.preview', '@layout');

function componentsMap(done) {
	const app = this.fractal;
	const items = app.components.flattenDeep().toArray();
	const map = {};

	for (const item of items) {
		if (item.viewPath.includes('_helpers/')) {
			map[`@${item.handle}`] = `${item.relViewPath.replace('helpers--', '')}`;
		} else if (!item.viewPath.includes('pages/') && item.view !== '_layout.twig' && item.view !== '_base.twig') {
			//console.log(item);
			//const dest = path.resolve(process.env.PWD, item.viewDir).split('modules/')[1];
			//item.isDefault
			//item.isVariant
			if (item.isDefault) {
				map[`@${item.handle.includes('--') ? item.handle.split('--')[0] : item.handle}`] = `_${item.relViewPath}`;
				map[`@${item.handle.includes('--default') ? item.handle.split('--default')[0] : item.handle}`] = `_${item.relViewPath}`;
			} else {
				map[`@${item.handle}`] = `_${item.relViewPath}`;
			}
		}
	}

	fs.writeFile(path.resolve(process.env.PWD, './../templates/components-map.json'), JSON.stringify(map, null, 2), err => {
		err && console.error('something has gone awfully wrong', err);
	});

	return map;
}

fractal.cli.command('map', componentsMap, {
	description: 'Map component templates',
	options: []
});
