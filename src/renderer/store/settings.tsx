import { observable, action } from 'mobx';
import { remote } from 'electron';
import localforage from 'localforage';
import { BASE_URL } from '../utils/constants';

export class SettingsStore {
	lastMessage;

	@observable
	savePath = remote.app.getPath('downloads');

	@observable
	staticPath = remote.app.getPath('documents');

	@observable
	purchased = false;

	@observable
	isInit = false;

	@observable
	notificationSound = true;

	@observable
	enableClipboard = true;

	@observable
	enableHttpFile = true;

	@observable
	autoLogin = true;

	@observable
	historyLimit = 50;

	@observable
	baseUrl = BASE_URL;

	@observable
	filePort = 20201;

	@action.bound
	async setFilePort(port: number) {
		this.filePort = port;
		await localforage.setItem('filePort', port);
	}

	@action.bound
	async setBaseUrl(url: string) {
		this.baseUrl = url;
		await localforage.setItem('baseUrl', url);
	}

	@action.bound
	setHistoryLimit(num: number) {
		this.historyLimit = num;
	}

	@action.bound
	setSavePath(path: string) {
		this.savePath = path;
	}

	@action.bound
	setIsInit(init: boolean) {
		this.isInit = init;
	}

	@action.bound
	setStaticPath(path: string) {
		this.staticPath = path;
	}

	@action.bound
	async setPurchased(val: boolean) {
		this.purchased = val;
		await localforage.setItem('purchased', val);
	}

	@action.bound
	async setNotificationSound(val: boolean) {
		this.notificationSound = val;
		await localforage.setItem('notificationSound', val);
	}

	@action.bound
	setEnableClipboard(val: boolean) {
		this.enableClipboard = val;
	}

	@action.bound
	setEnableHttpFile(val: boolean) {
		this.enableHttpFile = val;
	}

	@action.bound
	setAutoLogin(val: boolean) {
		this.autoLogin = val;
	}
}
