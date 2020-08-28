/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useEffect, useState } from 'react';
import Notification, { NotificationInstance } from 'rc-notification/lib/Notification';
import { TitleBar, BottomModalAction, BottomModal, Button } from './component';
import { getLocalForageAllItems, initLocalForage } from './utils';
import { SettingPage } from './page/SettingPage';
import { HistoryPage } from './page/HistoryPage';
import { MainPage } from './page/MainPage';
import { useStores } from './utils/hooks';
import Tabs, { TabPane } from 'rc-tabs';
import semver from 'semver';
import pkg from '../../package.json';
import { req } from './utils/req';
import { remote } from 'electron';
import localforage from 'localforage';

import './stylesheet/index.scss';

let notification: NotificationInstance = null;
Notification.newInstance({
	style: {}
}, (n) => notification = n);

const App: FC = function () {

	const { settingsStore, globalStore } = useStores();
	const updateRef = React.createRef<BottomModalAction>();
	const msgRef = React.createRef<BottomModalAction>();
	const [desc, setDesc] = useState([]);
	const [msg, setMsg] = useState([]);

	useEffect(() => {
		initLocalForage().then(async () => {
			const data = await getLocalForageAllItems();

			for (const key in data) {
				const name = 'set' + key.replace(/^./, key[0].toUpperCase());
				if (typeof settingsStore[name] === 'function') {
					settingsStore[name](data[key]);
				}
			}
		});
	}, []);

	useEffect(() => {
		req.get('/assets/index.json').then(async (val) => {
			const data = val?.data;
			if (!!!data) {
				throw new Error();
			}

			globalStore.setWebData(data);

			if (!!data?.pc.disable) {

			}
			console.log(data.pc.message.join(''), (await localforage.getItem('lastMessage')));
			try {
				if (data.pc.message.join('') !== (await localforage.getItem('lastMessage'))) {
					msgRef.current?.show();
					setMsg(data.pc.message);
					await localforage.setItem('lastMessage', data.pc.message.join(''));
				}
			} catch (_err) { }

			try {
				if (semver.gt(data.pc.latest.version, pkg.version)) {
					updateRef.current?.show();
					setDesc(data.pc.latest?.desc ?? []);
				}
			} catch (_err) { }
		}).catch((err) => {
			notification.notice({
				content: <span>配置请求出错</span>
			});
		});
	}, []);

	const height = window.innerHeight;

	return (
		<div >
			<TitleBar height={25} />
			<Tabs defaultActiveKey="1" >
				<TabPane tab="主页" key="1" style={{ height: height - 25 }} forceRender={true}>
					<MainPage />
				</TabPane>
				<TabPane tab="历史" key="2" style={{ height: height - 25 }} forceRender={true}>
					<HistoryPage />
				</TabPane>
				<TabPane tab="设置" key="3" style={{ height: height - 25 }} forceRender={true}>
					<SettingPage />
				</TabPane>
			</Tabs>
			<BottomModal overflowHeight={0} ref={updateRef} >
				<div style={{ height: 25 }} />
				<div style={{
					height: 35,
					display: 'flex',
					fontSize: 18,
					justifyContent: 'center',
					alignItems: 'center'
				}} >发现新更新</div>
				<ul>
					{
						desc.map((val, index) => <li key={index}>{val}</li>)
					}
				</ul>
				<Button
					className="clear-float"
					style={{
						float: 'right',
						paddingRight: '20px'
					}}
					onClick={() => {
						remote.shell.openExternal(globalStore.webData.pc.latest.url);
					}}>前去下载</Button>
			</BottomModal>
			<BottomModal overflowHeight={0} ref={msgRef} >
				<div style={{ height: 25 }} />
				<div style={{
					height: 35,
					display: 'flex',
					fontSize: 18,
					justifyContent: 'center',
					alignItems: 'center'
				}} >消息</div>
				<ul>
					{
						msg.map((val, index) => <li key={index}>{val}</li>)
					}
				</ul>
			</BottomModal>
		</div>

	);
};

export default App;