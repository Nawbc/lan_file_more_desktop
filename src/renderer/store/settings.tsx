import { observable, action } from 'mobx';
import { remote } from 'electron';
import localforage from 'localforage';

export class SettingsStore {
	@observable
	savePath = remote.app.getPath('downloads');

	@observable
	staticPath = remote.app.getPath('documents');

	@observable
	purchased = false;

	@observable
	isInit = false;

	@observable
	notificationSound = false;

	@observable
	enableClipboard = true;

	@observable
	enableHttpFile = true;

	@observable
	autoLogin = true;

	@observable
	historyLimit = 300;

	@action.bound
	async setHistoryLimit(num: number) {
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
	setPurchased(val: boolean) {
		this.purchased = val;
	}

	@action.bound
	setNotificationSound(val: boolean) {
		this.notificationSound = val;
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

// settingsStore.setIsinit = action(() => { 

// })

// appStore.addCount = action(() => {
// 	appStore.counter += 1;
// });
// appStore.subCount = action(() => {
// 	if (appStore.counter <= 0) {
// 		return;
// 	}
// 	appStore.counter -= 1;
// });
// appStore.changeCount = action((key) => {
// 	if (key <= 0) {
// 		appStore.counter = 0;
// 	}
// 	appStore.counter = parseInt(key);
// });
// export default appStores;

// const settingsProvider = observable();
