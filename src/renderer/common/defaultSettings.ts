import { remote } from "electron";

export const defaultSetting = {
	savePath: remote.app.getPath('downloads'),
	staticPath: remote.app.getPath('documents'),
	purchase: false,
	isInit: true,
	notificationSound: false,
	enableAutoConnect: true,
	enableClipboard: true,
	enableHttpFile: true,
	autoLogin: true,
};
