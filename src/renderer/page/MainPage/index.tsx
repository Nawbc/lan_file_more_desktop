import React, { FC, useEffect, useState, useReducer } from 'react';
import { Icon, Button } from '../../component';
import { ipcRenderer } from 'electron';
import { ClipboardEx } from '../../utils/clipboard';
import { getLocalForageAllItems } from '../../utils';
import computerSvg from '../../assets/icons/computer.svg';
import castSvg from '../../assets/icons/cast.svg';
import castBlueSvg from '../../assets/icons/cast_blue.svg';
import netSvg from '../../assets/icons/net.svg';
import classNames from 'classnames';
// import * as robot from 'robotjs';
// const robot = require('robotjs');
import './index.scss';

const clipboardEx = new ClipboardEx();

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
	const { children } = props;
	const [localAddr, setLocalAddr] = useState('');
	const [modal, setModal] = useState(false);
	const [devices] = useState([]);
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	useEffect(() => {
		(async () => {
			const data = await getLocalForageAllItems();

			ipcRenderer.on('local-ip-found', (event, msg) => {
				ipcRenderer.send('app-settings', data);
				clipboardEx.start();
				setLocalAddr(msg.host + ':' + msg.port);
			});

			ipcRenderer.on('socket-connect', (event, msg) => {
				if (!devices.includes(msg.host)) {
					devices.push(msg.host);
					forceUpdate();
				}
			});

			ipcRenderer.on('local-ip-error', () => {
				setLocalAddr('未知地址');
			});

			clipboardEx.on('changed', (data) => {
				ipcRenderer.send('clipboard-to-client', data);
			});
		})();

	}, []);

	return (
		<>
			<div style={{ padding: 20 }}>
				<div style={{
					display: 'inline-flex',
					justifyContent: 'space-between'
				}}>
					<Icon src={computerSvg} style={{ width: 20, height: 'unset' }} />&nbsp;:&nbsp;{localAddr}&nbsp;<span>服务地址</span>
				</div>
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
										console.log('demo');
										// robot.keyTap("home");
										// console.log((robot as any).default);
										ipcRenderer.send('keyboard', 'home');
										// console.log(robot.keyTap);
										// console.log(robot);

									}}

								>暂无设备</span>
							</ColCenter>

					}
				</div>
			</div >

			<div>
				<div
					style={Object.assign({},
						modal ? {
							position: 'absolute',
							top: 0,
							right: 0,
							bottom: 0,
							left: 0
						} : {}
					) as any}
					className={classNames('mask', 'modal')}
					onClick={() => {

						if (modal) {
							setModal(false);
						}
					}} />
				<div
					className={classNames('bottom-modal', {
						'close': modal
					})}

					onClick={() => {
						if (!modal) {
							setModal(true);
						}
					}}
				>
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
							<Button value="断开" />
						</div>)}
				</div>
			</div>
		</>
	);
};

export { MainPage };