import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const external = ['events', 'node-fetch']

export default {
	input: './src/index.ts',
	output: [{
		format: 'commonjs',
		file: 'dist/index.js'
	}],
	external,
	plugins: [
		typescript({
			include: '**/*.{ts,js}',
		}),
		nodeResolve({
			skip: external,
		}),
	],
	perf: true,
};
