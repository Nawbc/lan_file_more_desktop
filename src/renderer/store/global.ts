import { observable, action } from 'mobx';

export class GlobalStore {

	@observable
	webData: any = {};

	@action.bound
	async setWebData(data: Record<string, any>) {
		this.webData = data;
	}

	@observable
	internalIp = '';

	async setInternalIp(ip: string) {
		this.internalIp = ip;
	}
}
