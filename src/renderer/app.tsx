/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useEffect, useState } from 'react';
import { getLocalForageAllItems, initLocalForage, showNotification } from './utils';
import Tabs, { TabPane } from 'rc-tabs';
import { TitleBar } from './component';

import './stylesheet/index.scss';
import { MainPage } from './page/MainPage';
import { SettingPage } from './page/SettingPage';
import { HistoryPage } from './page/HistoryPage';
import { useStores } from './utils/hooks';

const App: FC = () => {

	const { settingsStore } = useStores();

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

	const height = window.innerHeight;

	return (

		<div >
			<TitleBar height={25} />
			{/* <button></button> */}
			{/* <ScrollBar style={{ height: window.innerHeight - 25 }} /> */}
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
		</div>

	);
};

export default App;