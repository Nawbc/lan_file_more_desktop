import React, { FC } from 'react';
import minSvg from '../../assets/icons/down.svg';
import './style/index.scss';
import { ipcRenderer } from 'electron';
import { ClickEffect } from '../ClickEffect';
import { Icon } from '../Icon';

interface TitleBarProps {
	height: number | string;
}

const TitleBar: FC<TitleBarProps> = function (props) {
	const { height } = props;

	return (
		<div
			style={{
				width: '100%',
				height: height,
				top: 0,
				WebkitAppRegion: 'drag',
				position: 'relative',
				textAlign: 'center'
			} as any
			}
			onClick={() => {
				console.log(11111);
			}}
		>
			<div
				style={{
					position: 'absolute',
					display: 'inline-flex',
					alignItems: 'center',
					height: '100%',
					right: 10
				}}
			>
				<ClickEffect
					style={{
						WebkitAppRegion: 'no-drag'
					}}
					onClick={() => {
						ipcRenderer.send('window-close');
					}}>
					<Icon className="close-svg" src={minSvg} />
				</ClickEffect>
			</div>
		</div>
	);
};

export { TitleBar };
