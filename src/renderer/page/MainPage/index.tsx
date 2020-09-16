import React, { FC, useEffect, useState, useReducer } from 'react';
import { Icon, Button } from '../../component';
import { ipcRenderer, remote } from 'electron';
import { ClipboardEx } from '../../utils/clipboard';
import { getLocalForageAllItems, useStores } from '../../utils';
import computerSvg from '../../assets/icons/computer.svg';
import castSvg from '../../assets/icons/cast.svg';
import castBlueSvg from '../../assets/icons/cast_blue.svg';
import netSvg from '../../assets/icons/net.svg';
import vscodeSvg from '../../assets/icons/vscode.svg';
import { BottomModal } from '../../component/BottomModal';
// import * as robot from 'robotjs';
// const robot = require('robotjs');

export const clipboardEx = new ClipboardEx();

export const ColCenter = (props) => {
	const { children } = props;
	return (
		<div style={{
			justifyContent: 'center',
			alignItems: 'center',
			flexDirection: 'column',
			display: 'flex'
		}}>{children}</div>
	);
};

const MainPage: FC<any> = function (props) {
	const [localAddr, setLocalAddr] = useState('');
	const { settingsStore } = useStores();

	const [devices] = useState([]);
	const [codeSrvAddr, setCodeSrvAddr] = useState(null);

	const [, forceUpdate] = useReducer(x => x + 1, 0);

	useEffect(() => {

		(async () => {
			ipcRenderer.on('local-ip-found', async (event, msg) => {
				const data = await getLocalForageAllItems();
				ipcRenderer.send('app-settings', data);
				if (settingsStore.enableClipboard) {
					clipboardEx.start();
				}
				setLocalAddr(msg.host + ':' + settingsStore.filePort);
			});

			ipcRenderer.on('socket-connect', (event, msg) => {
				if (!devices.includes(msg.deviceIp)) {
					devices.push(msg.deviceIp);
					forceUpdate();
				}

				if (!!!codeSrvAddr) {
					setCodeSrvAddr(msg.codeSrvIp);
				}
			});

			ipcRenderer.on('local-ip-error', () => {
				setLocalAddr('未知地址');
			});

			clipboardEx.on('changed', (data) => {
				ipcRenderer.send('clipboard-to-client', data);
			});

			(navigator as any).connection.onchange = () => {
				ipcRenderer.send('connection-change');
			};

		})();
	}, []);

	return (
		<>
			<div style={{ padding: 20 }}>
				<div style={{
					display: 'flex'
				}}>
					<Icon src={computerSvg} style={{ width: 20, height: 'unset' }} />&nbsp;:&nbsp;{localAddr}&nbsp;<span>服务</span>
				</div>
				<div style={{ height: 10 }} />

				{
					!!codeSrvAddr ?
						<div style={{
							display: 'flex'
						}}>
							<Icon src={vscodeSvg} style={{ width: 20, height: 'unset' }} />&nbsp;:&nbsp;{codeSrvAddr}&nbsp;<span>
								<Button onClick={async () => {
									await remote.shell.openExternal(`http://${codeSrvAddr}`);
								}}>打开</Button>
							</span>
						</div> : null
				}
				<div style={{
					height: 400,
					display: 'flex',
					justifyContent: 'center'
				}}>
					{
						devices.length > 0 ?
							<ColCenter>
								<Icon src={castBlueSvg} style={{ width: 80, height: 'unset' }} />
								<div style={{ height: 10 }} />
								<span>已有连接</span>
							</ColCenter>
							:
							<ColCenter>
								<Icon src={castSvg} style={{ width: 80, height: 'unset' }} />
								<div style={{ height: 10 }} />
								<span
									onClick={() => {
										ipcRenderer.send('keyboard', 'c');
									}}

								>暂无设备</span>
							</ColCenter>

					}
				</div>
			</div >
			<BottomModal overflowHeight={35}>
				<div style={{
					height: 35,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				}} >已连接设备</div>
				{devices.map((val, index) =>
					<div
						key={index}
						style={{
							padding: 10,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Icon src={netSvg} style={{ width: 20, height: 'unset' }} />
						<div style={{ width: 10 }} />
						<span>{val}</span>
						<div style={{ width: 10 }} />

					</div>)}
			</BottomModal>
		</>
	);
};

export { MainPage };