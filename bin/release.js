'use strict';

const builder = require('electron-builder');
const path = require('path');
const rm = require('rimraf');
const webpack = require('webpack');
const { promisify } = require('util');
const fs = require('fs');
const log = require('../scripts/utils/output');
const mainConfig = require('../scripts/webpack/webpack.main');
const rendererConfig = require('../scripts/webpack/webpack.renderer');
const serverConfig = require('../scripts/webpack/webpack.server');

const Platform = builder.Platform;

const buildRenderer = () => new Promise((resolve, reject) => {
	const compiler = webpack(rendererConfig);

	compiler.run((err, status) => {
		(!!err) ? reject(err) : resolve(status);
	});
});

const buildMain = () => new Promise((resolve, reject) => {
	const compiler = webpack(mainConfig);

	compiler.run((err, status) => {
		(!!err) ? reject(err) : resolve(status);
	});
});

const buildServer = () => new Promise((resolve, reject) => {
	const compiler = webpack(serverConfig);
	compiler.run((err, status) => {
		(!!err) ? reject(err) : resolve(status);
	});
});

(async () => {
	await promisify(rm)(path.resolve(__dirname, '../dist/')).catch(err => {
		!!err && log.error('Dev.js', err);
	});

	await promisify(rm)(path.resolve(__dirname, '../release/')).catch(err => {
		!!err && log.error('Dev.js', err);
	});

	await buildMain().then((stats) => {
		log.reportWebpackLog(stats.toJson(), 'Build Main');
	}).catch((err) => {
		log.error('Build Main', err);
	});

	await buildServer().then((stats) => {
		log.reportWebpackLog(stats.toJson(), 'Build Server');
	}).catch((err) => {
		log.error('Build Server', err);
	});

	await buildRenderer().then((stats) => {
		log.reportWebpackLog(stats.toJson(), 'Build Renderer');
	}).catch((err) => {
		log.error('Build Renderer', err);
	});

	// await fs.promises.copyFile(path.resolve(__dirname, '../src/renderer/assets/logo.ico'), path.resolve(__dirname, '../dist/logo.ico'));
	// await fs.promises.copyFile(path.resolve(__dirname, '../src/renderer/assets/tray.png'), path.resolve(__dirname, '../dist/tray.png'));

	await builder.build({
		targets: Platform.WINDOWS.createTarget(['nsis']),
		config: {
			productName: '局域网.文件.更多',
			appId: 'com.sewerganger.lan_express_desktop',
			icon: 'res/icons/win/icon.ico',
			files: [
				{
					from: 'dist',
					to: '.'
				},
				{
					from: 'res/icons/',
					to: 'icons'
				},
				'!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
				'!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
				'!**/node_modules/*.d.ts',
				'!**/node_modules/.bin',
				'!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
				'!.editorconfig',
				'!**/._*',
				'!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
				'!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output,.vscode}',
				'!**/{appveyor.yml,.travis.yml,circle.yml}',
				'!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
				'!temp/',
				'!test/',
				'!src/',
				'!release/',
				'!package-lock.json',
				'!.eslintrc',
				'!.eslintignore',
				'!tsconfig.json',
				'!*.md',
				'!scripts/',
				'!bin/',
				'!dist/',
				'!res/'
			],

			directories: {
				// buildResources: '/dist/**/*',
				output: path.resolve(__dirname, '../release')
			},

			nsis: {
				// runAfterFinish: true,
				perMachine: true,
				allowToChangeInstallationDirectory: true,
				oneClick: false,
				installerIcon: path.resolve(__dirname, '../res/icons/win/icon.ico'),
				uninstallerIcon: path.resolve(__dirname, '../res/icons/win/icon.ico')
			},
			asar: true,
			artifactName: '${name}-setup-${version}.${ext}'
		}
	})
		.then((val) => {
			console.log(val);
		})
		.catch((err) => {
			console.log(err);
		});

})();
