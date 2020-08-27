import localforage from 'localforage';
import { remote } from 'electron';
import { resolve } from 'path';
import { SettingsStore } from '../store/settings';
const { Notification, nativeImage } = remote;

export const logoImage = nativeImage.createFromPath(resolve(__dirname, '../assets/logo.png'));

export const getLocalForageAllItems = async (): Promise<Record<string, unknown>> => {
	const result = {};
	await localforage.iterate((value, key) => {
		result[key] = value;
	});
	return result;
};

export const initLocalForage = async () => {
	for await (const [key, value] of Object.entries(new SettingsStore())) {
		if (await localforage.getItem(key) === null || await localforage.getItem(key) === undefined) {
			await localforage.setItem(key, value);
		}
	}
};

export const is = {
	type(obj: unknown, str: string): boolean {
		return Object.prototype.toString.call(obj) === `[object ${str}]`;
	},
	string(obj: unknown): obj is string {
		return this.type(obj, 'String');
	},
	object(obj: unknown): obj is object {
		return this.type(obj, 'Object');
	},
	function(obj: unknown): obj is Function {
		return this.type(obj, 'Function');
	},
	null(obj: unknown): obj is null {
		return this.type(obj, 'Null');
	},
	undefined(obj: unknown): obj is undefined {
		return this.type(obj, 'Undefined');
	},
	number(obj: unknown): obj is number {
		return this.type(obj, 'Number');
	}
};

export const showNotification = (title: string, body: string, silent: boolean) => {
	// console.log(notificationSound);
	const n = new Notification({ title, body, icon: logoImage, silent });
	n.show();
	return n;
};
export * from './hooks';