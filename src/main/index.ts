import { Tray, screen, nativeImage } from 'electron';
/* eslint-disable indent */
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { resolve, basename } from 'path';
import { fork, ChildProcess } from 'child_process';
// import * as robot from 'robotjs';
import os from 'os';

export const logoImage = nativeImage.createFromPath(resolve(__dirname, '../renderer/assets/logo.png'));

const windowPath = resolve(app.getAppPath(), './index.html');
const setAutoLogin = (isAuto = true) => {
	app.setLoginItemSettings({
		openAtLogin: isAuto,
		openAsHidden: true,
		path: process.execPath,
		args: ['--processStart', `${basename(process.execPath)}`]
	});
};

// interface AppSettings {
// 	savePath: string;
// 	purchase: boolean;
// 	isInit: boolean;
// }

let mainWindow: BrowserWindow;
let tray: Tray;

let srvProcess: ChildProcess;

const showAtPos = (mainWindow: BrowserWindow) => {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;
	mainWindow.setAlwaysOnTop(true);
	mainWindow.setPosition(width - 310, height - 610, true);
};

const createInitWindow = (): void => {

	mainWindow = new BrowserWindow({
		frame: false,
		width: 300,
		height: 600,
		resizable: false,

		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			webviewTag: true,
			sandbox: false
		}
	});

	mainWindow.loadURL(windowPath);

	showAtPos(mainWindow);

	Menu.setApplicationMenu(null);

	ipcMain.on('app-settings', (event, data) => {
		srvProcess?.send({
			signal: 'server-start', settings: data
		});
	});

	ipcMain.on('no-auto-login', () => {
		setAutoLogin(false);
	});

	ipcMain.on('auto-login', () => {
		setAutoLogin(true);
	});

	ipcMain.on('server-start', (event, data) => {
		srvProcess?.send({
			signal: 'server-start',
			settings: data
		});
	});

	ipcMain.on('server-close', () => {
		srvProcess?.send({
			signal: 'server-close'
		});
	});

	ipcMain.on('window-min', () => {
		mainWindow?.minimize();
	});

	ipcMain.on('window-close', () => {
		// mainWindow?.hide();
	});

	ipcMain.on('clipboard-to-client', (event, data) => {
		event.preventDefault();
		srvProcess?.send({ signal: 'clipboard-to-client', data: data });
	});

	ipcMain.on('window-direct-close', () => {
		mainWindow?.destroy();
	});

	// ipcMain.on('keyboard', (event, data) => {
	// 	console.debug(data);
	// 	// console.log(robot.keyTap(''));
	// 	robot.setMouseDelay(2);

	// 	const twoPI = Math.PI * 2.0;
	// 	const screenSize = robot.getScreenSize();
	// 	const height = (screenSize.height / 2) - 10;
	// 	const width = screenSize.width;

	// 	for (let x = 0; x < width; x++) {
	// 		const y = height * Math.cos((twoPI * x) / width) + height;
	// 		robot.moveMouse(x, y);
	// 	}
	// });

	///-------------------------------------------------------------------------------------------

	srvProcess = fork(resolve(app.getAppPath(), './server.js'), ['--sub']);

	srvProcess?.on('message', (msg) => {
		console.debug(msg);
		switch (msg.signal) {
			case 'local-ip-error':
				break;
			case 'upload-accomplish':
				mainWindow?.webContents.send('upload-accomplish', msg);
				break;
			case 'socket-connect':
				mainWindow?.webContents.send('socket-connect', msg);
				break;
			case 'clipboard-to-server':
				mainWindow?.webContents.send('clipboard-to-server', msg);
				break;
			case 'local-ip-found':
				{
					mainWindow?.webContents.send('local-ip-found', msg);
				}
				break;
		}
	});

	srvProcess?.on('error', (err) => {
		console.error(err);
	});

	srvProcess?.stdout?.on('data', (data) => {
		console.debug(data);
	});

	srvProcess?.stderr?.on('data', (data) => {
		console.debug(data);
	});

	srvProcess?.on('exit', (code) => {
		console.debug(`server exit ${code}`);
		mainWindow.webContents.send('server-exit');
	});

	//------------------------------------------------------------------------------------------
	tray = new Tray(logoImage);

	const contextMenu = Menu.buildFromTemplate([
		{
			label: '显示',
			click: () => {
				showAtPos(mainWindow);
				mainWindow?.show();
			}
		},
		{
			label: '退出',
			click: () => {
				mainWindow?.destroy();
			}
		}
	]);

	tray.setToolTip('局域网快递');
	tray.setContextMenu(contextMenu);

	tray.on('click', () => {
		if (mainWindow?.isVisible()) {
			mainWindow.hide();
			mainWindow.setSkipTaskbar(false);
		} else {
			showAtPos(mainWindow);
			mainWindow?.show();
			mainWindow?.setSkipTaskbar(true);
		}
	});

};

// app.commandLine.appendSwitch('disable-site-isolation-trials');

app.allowRendererProcessReuse = true;

if (require('electron-squirrel-startup')) { app.quit(); }

if (!app.requestSingleInstanceLock()) {
	app.quit();
} else {
	app.on('second-instance', () => {
		if (mainWindow) {
			if (mainWindow?.isMinimized()) mainWindow?.restore();
			mainWindow?.focus();
		}
	});
	app.on('ready', createInitWindow);
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createInitWindow();
	}
});

