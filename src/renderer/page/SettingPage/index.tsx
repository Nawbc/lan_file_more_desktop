import React, { FC, useState, RefObject, useReducer, useEffect } from 'react';
import { ScrollBar, Button } from '../../component';
import { ipcRenderer } from 'electron';
import { SettingItem, Switch } from '../../component';
import { useStores, getLocalForageAllItems } from '../../utils';
import { remote } from 'electron';
import localforage from 'localforage';
import { useObserver } from 'mobx-react';
import { BottomModal, BottomModalAction } from '../../component/';
import { req } from '../../utils/req';
import { stringify } from 'querystring';
import pkg from '../../../../package.json';
import semver from 'semver';
import Notification, { NotificationInstance } from 'rc-notification/lib/Notification';
import { KEY_BOUND_URL } from '../../utils/constants';
import { clipboardEx } from '../MainPage';

const { dialog, shell } = remote;

let notification: NotificationInstance = null;
Notification.newInstance({
	style: {}
}, (n) => notification = n);

const SettingPage: FC<any> = function (props) {

	const { settingsStore, globalStore } = useStores();
	const [username, setUsername] = useState('');
	const [pwd, setPwd] = useState('');
	const [enableService, setEnableService] = useState(true);
	const bottomModalRef: RefObject<BottomModalAction> = React.createRef();

	useEffect(() => {
		setTimeout(() => {
			if (!settingsStore.purchased) {
				notification.notice({
					content: <span>请先激活</span>,
					duration: 6
				});
			}
		}, 1000);
	}, []);

	return useObserver(() => (
		<>
			<	ScrollBar style={{ height: window.innerHeight - 25 }} >
				<SettingItem
					title='开启服务'
					trailing={
						<Switch
							disabled={!settingsStore.purchased}
							checked={enableService}
							onChange={async () => {
								setEnableService(!enableService);
								const data = await getLocalForageAllItems();
								if (!enableService) {
									ipcRenderer.send('server-start', data);
								} else {
									ipcRenderer.send('server-close');
								}
							}}
						/>}
				/>
				<SettingItem
					title='服务端口'
					subtitle={`${settingsStore.filePort}`}
					trailing={
						<input
							type='number'
							value={settingsStore.filePort}
							style={{
								width: 40,
								height: 20,
								border: '1px solid #999',
								borderRadius: 5,
								padding: '6px 2px',
								fontSize: '10px',
								margin: '0 9px'
							}}
							onChange={(event) => {
								const value = event.target.value;
								settingsStore.setFilePort(parseInt(value === '' ? '0' : value));
							}}
							onBlur={async () => {
								await localforage.setItem('filePort', settingsStore.filePort);
							}}
						/>
					}
				/>
				<SettingItem
					title='剪贴板'
					subtitle='连接设备之间无缝共享剪贴板'
					trailing={
						<Switch
							checked={settingsStore.enableClipboard}
							onChange={async () => {
								settingsStore.enableClipboard = !settingsStore.enableClipboard;
								if (settingsStore.enableClipboard) {
									clipboardEx.on('changed', (data) => {
										ipcRenderer.send('clipboard-to-client', data);
									});

									clipboardEx?.start();
								} else {
									clipboardEx?.dispose();
								}
								await localforage.setItem('enableClipboard', settingsStore.enableClipboard);
							}}
						/>}
				/>
				<SettingItem
					title='历史记录'
					subtitle={`限制${settingsStore.historyLimit}条`}
					trailing={
						<input
							type='number'
							value={settingsStore.historyLimit}
							style={{
								width: 30,
								height: 20,
								border: '1px solid #999',
								borderRadius: 5,
								padding: '6px 2px',
								fontSize: '10px',
								margin: '0 9px'
							}}
							onChange={(event) => {
								const value = event.target.value;
								settingsStore.setHistoryLimit(parseInt(value === '' ? '0' : value));
							}}
							onBlur={async () => {
								await localforage.setItem('historyLimit', settingsStore.historyLimit);
							}}
						/>
					}
				/>
				<SettingItem
					title='共享本机文件服务(http)'
					subtitle='设备通过web浏览器访问本机文件'
					trailing={
						<Switch
							checked={settingsStore.enableHttpFile}
							disabled={true}
							onChange={async () => {
								settingsStore.enableHttpFile = !settingsStore.enableHttpFile;
								await localforage.setItem('enableHttpFile', settingsStore.enableHttpFile);
							}}
						/>}
				/>
				<SettingItem
					title='文件保存路径'
					subtitle={settingsStore.savePath}
					trailing={
						<Button
							style={{ padding: 8 }}
							value='选择'
							onClick={async () => {
								const dir = await dialog.showOpenDialog({
									properties: ['openDirectory']
								});
								const path = dir.filePaths?.length === 0 ? settingsStore.savePath : dir.filePaths[0];
								await localforage.setItem('savePath', path);
								settingsStore.setSavePath(path);
							}}
						/>
					}
				/>
				<SettingItem
					title='共享本机路径'
					subtitle={settingsStore.staticPath}
					trailing={
						<Button
							style={{ padding: 8 }}
							value='选择'
							disabled={true}
							onClick={async () => {
								const dir = await dialog.showOpenDialog({
									properties: ['openDirectory']
								});

								const path = dir.filePaths?.length === 0 ? settingsStore.staticPath : dir.filePaths[0];

								await localforage.setItem('staticPath', path);
								settingsStore.setStaticPath(path);
							}}
						/>
					}
				/>
				<SettingItem
					style={{
						cursor: 'pointer'
					}}
					title='按键绑定'
					subtitle='远程控制 按键绑定对照表'
					onClick={async () => {
						await shell.openExternal(KEY_BOUND_URL);
					}}
				/>
				<SettingItem
					title='通知声音'
					trailing={
						<Switch
							checked={settingsStore.notificationSound}
							onChange={async () => {
								settingsStore.setNotificationSound(!settingsStore.notificationSound);
							}}
						/>}
				/>
				<SettingItem
					title='开机启动'
					trailing={
						<Switch
							checked={settingsStore.autoLogin}
							onChange={async () => {
								settingsStore.autoLogin = !settingsStore.autoLogin;
								await localforage.setItem('autoLogin', settingsStore.autoLogin);
							}}
						/>}
				/>
				<SettingItem
					title='激活程序'
					subtitle={settingsStore.purchased ? '已激活' : '暂未激活'}
					trailing={
						<Button
							style={{ padding: 8 }}
							value='激活'
							onClick={() => {
								bottomModalRef.current.show();
							}}
						/>
					}
				/>
				<SettingItem
					title='关于'
					subtitle='局域网.文件.更多'
				// trailing={}
				/>
				<SettingItem
					title='检查更新'
					subtitle={`${pkg.version}`}
					trailing={
						<Button
							style={{ padding: 8 }}
							value={`${semver.gt(globalStore.webData.pc?.latest.version ?? pkg.version, pkg.version) ? '有更新' : '最新版'}`}
							onClick={() => {
								if (semver.gt(globalStore.webData.pc?.latest.version, pkg.version)) {
									shell.openExternal(globalStore.webData.pc?.latest.url);
								} else {
									notification.notice({
										content: <span>已经是最新版本</span>,
										duration: 4
									});
								}
							}}
						/>
					}
				/>
				<br />
				<br />
				<br />
				<br />
				<br />
			</	ScrollBar>
			<BottomModal overflowHeight={0} ref={bottomModalRef} >
				<div
					style={{
						padding: '0px 60px'
					}}
				>
					<div style={{ height: 40 }} />
					<input
						type='text'
						placeholder='账号'
						value={username}
						onChange={(event) => {
							setUsername(event.target.value);
						}}
						style={{
							width: '100%',
							height: 25,
							border: '1px solid #999',
							borderRadius: 5,
							padding: '6px 8px',
							fontSize: '10px'
						}}
					/>
					<div style={{ height: 10 }} />
					<input
						type='password'
						placeholder='密码'
						value={pwd}
						onChange={(event) => {
							setPwd(event.target.value);
						}}
						style={{
							width: '100%',
							height: 25,
							border: '1px solid #999',
							borderRadius: 5,
							padding: '6px 8px',
							fontSize: '10px'
						}}
					/>
					<div style={{ height: 10 }} />
					<Button
						onClick={async () => {

							try {
								const result = await req.post('/auth/login', stringify({
									'username': username,
									'password': pwd
								}));
								const data = result.data;
								notification.notice({
									content: <span>{data?.message}</span>
								});
								localforage.setItem('loginToken', data?.data.access_token);

								await req.get('/pay/own_app_pc', {
									params: {
										'app_name': 'lan-express'
									}
								}).then(async (ownResult) => {
									const ownData = ownResult.data;
									if (ownData.purchased) {
										settingsStore.setPurchased(true);
										notification.notice({
											content: <span>激活成功</span>,
											duration: 4
										});
										bottomModalRef.current?.hide();
										const data = await getLocalForageAllItems();
										ipcRenderer.send('app-settings', data);
									}
								}).catch((err) => {
									console.log(err);
									notification.notice({
										content: <span>激活时出现问题</span>
									});
								});

							} catch (err) {
								notification.notice({
									content: <span>登录失败, 请检查登录信息</span>
								});
							}
						}}
					>激活</Button>
					<div style={{ height: 10 }} />
					<p>
						请使用移动端注册的账号
					</p>
				</div>

			</BottomModal>
		</>
	)
	);
};

export { SettingPage };