const fetch = require('node-fetch');
const {URL} = require('url');
const fs = require('fs');
const path = require('path');

const baseURL = 'https://img.shields.io/static/v1';

function badgeURL(args) {
	const url = new URL(baseURL);
	for (const key of Object.keys(args)) {
		url.searchParams.set(key, args[key]);
	}
	return url.toString();
}

function fetchFile(src, dst) {
	return fetch(src).then(async (response) => {
		fs.writeFileSync(dst, await response.buffer());
	});
}

async function main() {
	const badgesPath = path.resolve(__dirname, '..', 'docs', 'badges');

	if (!fs.existsSync(badgesPath)) {
		fs.mkdirSync(badgesPath);
	}

	// Читаем данные о покрытии
	const coverage = require(path.resolve(__dirname, '..', 'coverage', 'coverage-summary.json'));

	// Бейдж покрытия
	await fetchFile(
		badgeURL({label: 'coverage', message: `${coverage.total.branches.pct}%`, color: 'brightgreen'}),
		path.resolve(badgesPath, 'coverage.svg'),
	);

	// Читаем данные о поддерживаемой версии ноды
	const pkg = require(path.resolve(__dirname, '..', 'package.json'));

	// Бейдж покрытия
	await fetchFile(
		badgeURL({label: 'node', message: pkg.engines.node, color: 'brightgreen'}),
		path.resolve(badgesPath, 'node.svg'),
	);
}

main().then(() => console.log('All badges downloaded'));
