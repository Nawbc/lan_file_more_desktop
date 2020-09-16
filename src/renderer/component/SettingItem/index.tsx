import React, { FC } from 'react';
import './index.scss';
import classNames from 'classnames';

interface SettingItemProps {
	title?: string | React.ReactElement;
	subtitle?: string | React.ReactElement;
	trailing?: string | React.ReactElement;
	[index: string]: any;
}

const SettingItem: FC<SettingItemProps> = function (props) {
	const { title, subtitle, trailing, style, ...rest } = props;

	return (
		<div
			style={{
				width: '100%',
				height: 50,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderBottom: '1px solid #dedede',
				marginTop: 10,
				paddingBottom: 5,
				...style
			}}
			className="setting-item" {...rest}>
			<div>
				<div
					style={{
						fontSize: 16
					}}
				>{title}</div>
				<div style={{ height: 3 }} />
				<div
					className={classNames('ellipsis')}
					style={{
						width: 180,
						fontSize: 11,
						color: '#ababab'
					}}
				>{subtitle}</div>
			</div>
			{trailing}
		</div>
	);
};

export { SettingItem };
