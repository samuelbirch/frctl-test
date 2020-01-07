import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import globImport from 'rollup-plugin-glob-import';

const isProduction = process.env.BUILD === 'production';

export default (async () => ({
	input: 'src/js/app.js',
	output: {
		file: 'public/assets/js/app.js',
		name: 'app',
		format: 'iife'
	},
	plugins: [
		resolve(),
		commonjs(),
		globImport({ format: 'default' }),
		json(),
		eslint({
			exclude: ['src/styles/**']
		}),
		babel({
			runtimeHelpers: true,
			babelrc: false,
			exclude: ['node_modules/@babel/**', 'node_modules/core-js/**'],
			presets: [
				[
					'@babel/preset-env',
					{
						useBuiltIns: 'usage',
						corejs: 3
					}
				]
			],
			plugins: [
				'@babel/plugin-external-helpers',
				'@babel/plugin-syntax-dynamic-import',
				[
					'@babel/plugin-transform-runtime',
					{
						useESModules: true
					}
				]
			]
		}),
		replace({
			ENV: JSON.stringify(process.env.BUILD || 'development')
		}),
		isProduction && (await import('rollup-plugin-terser')).terser({ sourcemap: false })
	]
}))();
