import React, { FC, useEffect, useState, useReducer } from 'react';
import { ScrollBar, Icon } from '../../component';
import { ipcRenderer, shell, clipboard } from 'electron';
import CopySvg from '.././../assets/icons/copy.svg';
import FileSvg from '.././../assets/icons/file.svg';
import { showNotification, useStores } from '../../utils';

const HistoryItem: FC<any> = (props) => {
	const { type, content, time } = props;
	let itemContent;

	switch (type) {
		case 'file':
			itemContent = (
				<div>
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-end'
					}}>
						<div><Icon src={FileSvg} style={{ width: 20, height: 'unset' }} />&nbsp;<span>文件</span></div>
						<span style={{
							paddingRight: 7,
							fontSize: 9
						}} >{time}</span>
					</div>
					<div style={{ height: 8 }} />
					<div style={{
						width: '100%',
						paddingLeft: 5
					}}>{content}</div>
				</div>
			);
			break;
		case 'clipboard':
			itemContent = (
				<div>
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-end'
					}}>
						<div>
							<Icon src={CopySvg} style={{ width: 20, height: 'unset' }} /> &nbsp;<span>剪贴板</span>
						</div>
						<span style={{
							paddingRight: 7,
							fontSize: 9
						}} >{time}</span>
					</div>
					<div style={{ height: 8 }} />
					<div style={{
						width: '100%',
						paddingLeft: 5
					}}>{content}</div>
				</div>
			);
			break;
	}

	return (
		<div
			style={{
				padding: 7,
				margin: '10px 0'
			}}
		>
			{itemContent}
		</div>
	);
};

const HistoryPage: FC<any> = function (props) {

	const [history] = useState([]);
	const [, forceUpdate] = useReducer(x => x + 1, 0);
	const { settingsStore } = useStores();

	const popOverflowHistory = () => {
		if (settingsStore.historyLimit <= history.length) {
			history.splice(settingsStore.historyLimit, history.length - settingsStore.historyLimit);
		}
	};

	useEffect(() => {
		ipcRenderer.on('clipboard-to-server', (event, msg) => {

			history.unshift({
				type: 'clipboard',
				content: msg.data,
				time: new Date().toLocaleString()
			});

			clipboard.writeText(msg.data);

			popOverflowHistory();

			forceUpdate();
		});

		ipcRenderer.on('upload-accomplish', (event, msg) => {
			showNotification(`接收到文件 ${msg?.filename}`, msg?.outDir, !settingsStore?.notificationSound).on('click', () => {
				shell.showItemInFolder(msg.outDir);
			});

			history.unshift({
				type: 'file',
				content: msg.outPath,
				time: new Date().toLocaleString()
			});

			popOverflowHistory();

			forceUpdate();
		});

	}, []);

	return (
		<	ScrollBar style={{ height: window.innerHeight - 25 }} >
			{history.map((val, index) => {
				return (
					<HistoryItem key={index} type={val.type} content={val.content} time={val.time} />
				);
			})}
			<br />
			<br />
			<br />
			<br />
			<br />
		</	ScrollBar>
	);
};

export { HistoryPage };