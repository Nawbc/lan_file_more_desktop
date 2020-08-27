/* eslint-disable indent */
import os from 'os';
import net from 'net';
import ipUtil from 'ip';
import request from 'request-promise';
import ping from '../external/net-ping';

const session = ping.createSession();

// 获取本机局域网的地址
export const getSeeminglyLanAddress = (): { seemsIp: string, allIpv4: string[] } => {
	const seemsIps = [];
	const bIp = [];
	const valid = {} as any;

	for (let index = 16; index < 32; index++) {
		bIp.push(`172.${index}.0.0/16`);
	}

	const normalInternalIps = ['10.0.0.0/0', '192.168.0.0/16'].concat(bIp).map((val) => ipUtil.cidrSubnet(val));

	const netInterfaces = os.networkInterfaces();

	for (const adapter of Object.values(netInterfaces)) {

		for (const instance of adapter) {
			if (!instance.internal && net.isIPv4(instance.address)) {
				seemsIps.push(instance.address);
			}
		}
	}

	valid.allIpv4 = seemsIps;

	for (const ip of seemsIps) {
		normalInternalIps.forEach((val) => {
			val.contains(ip) && (valid.seemsIp = ip);
		});
	}

	return valid;
};

/**
 * 
 * 获取局域网内存活的ip
 * 
 */
export const getAliveIps = async () => {
	const ip = getSeeminglyLanAddress();
	const subnet = ip.seemsIp.substring(0, ip.seemsIp.lastIndexOf('.'));
	const aliveIpsInLan: string[] = [];
	const ipPromise = new Array(255).fill('').map((val, index) => new Promise((resolve, reject) => {
		const ip = `${subnet}.${index}`;
		session.pingHost(ip, function (error: any) {
			if (error) {
				reject();
			} else {
				aliveIpsInLan.push(ip);
				resolve();
			}
		});
	}));

	await Promise.all(ipPromise).catch((err) => {
		console.log(err);
	});
	console.debug(aliveIpsInLan);
	return aliveIpsInLan;
};

export const humanSize = (value) => {
	if (!!!value) {
		return "0B";
	}
	const unitArr = ['B', 'K', 'M', 'G'];
	let index = 0;
	while (value > 1024) {
		index++;
		value = value / 1024;
	}
	const size = value.toFixed(2);
	return size + unitArr[index];
};

interface AliveDeviceInfo {
	url: string;
	ip: string;
	port: number;
}

export const findAliveDevices = async (port): Promise<AliveDeviceInfo[]> => {
	const ips = await getAliveIps();
	const aliveDevices: AliveDeviceInfo[] = [];

	for await (const ip of ips) {
		const targetPort = port + 1;
		const url = 'http://' + ip + ':' + targetPort + '/check';
		await request(url).then(() => {
			aliveDevices.push({
				url,
				ip,
				port: targetPort
			});
		}).catch(() => { });
	}
	return aliveDevices;
};

export * from './filesHandler';