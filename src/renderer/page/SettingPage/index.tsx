import React, { FC, useEffect, useState } from 'react';
import { ScrollBar, Button } from '../../component';
import { ipcRenderer } from 'electron';
import { SettingItem, Switch } from '../../component';
import { useStores, getLocalForageAllItems } from '../../utils';
import { remote } from 'electron';
import localforage from 'localforage';
import { useObserver } from 'mobx-react';
import { defaultSetting } from '../../common/defaultSettings';

const { dialog } = remote;

const SettingPage: FC<any> = function (props) {

	const { settingsStore } = useStores();
	const [enableService, setEnableService] = useState(true);

	return useObserver(() => (
		<	ScrollBar style={{ height: window.innerHeight - 25 }} >
			<SettingItem
				title='开启服务'
				trailing={
					<Switch
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
				title='剪贴板'
				subtitle='连接设备之间无缝共享剪贴板'
				trailing={
					<Switch
						checked={settingsStore.enableClipboard}
						onChange={async () => {
							settingsStore.enableClipboard = !settingsStore.enableClipboard;
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
							const path = dir.filePaths?.length === 0 ? defaultSetting.savePath : dir.filePaths[0];
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

							const path = dir.filePaths?.length === 0 ? defaultSetting.staticPath : dir.filePaths[0];

							await localforage.setItem('staticPath', path);
							settingsStore.setStaticPath(path);
						}}
					/>
				}
			/>
			<SettingItem
				title='通知声音'
				trailing={
					<Switch
						checked={settingsStore.notificationSound}
						onChange={async () => {
							settingsStore.notificationSound = !settingsStore.notificationSound;
							await localforage.setItem('notificationSound', settingsStore.notificationSound);
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
					settingsStore.purchased ? <span /> : <Button
						style={{ padding: 8 }}
						value='激活' />
				}
			/>
			<SettingItem
				title='关于'
				subtitle='局域网.文件.更多'
			// trailing={}
			/>
			<SettingItem
				title='检查更新'
				subtitle='package'
				trailing={
					<Button
						style={{ padding: 8 }}
						value='检查'
						onClick={() => {

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
	)
	);
};

export { SettingPage };