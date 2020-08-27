import React, { FC, CSSProperties } from 'react';
import './index.scss';

import { ClickEffect } from '../ClickEffect';
import classNames from 'classnames';

interface ButtonProps {
	className?: string;
	src?: string;
	style?: CSSProperties;
	value?: string;
	disabled?: boolean;
	[key: string]: any;
}

const Button: FC<ButtonProps> = function (props) {
	const { children, value, style, disabled, ...rest } = props;

	return (
		<ClickEffect style={{ ...style }}>
			<button
				className={classNames({
					'bth-disabled': disabled
				})}
				disabled={disabled}
				style={{ color: disabled ? '#9e9e9e' : '#007aff' }}
				{...rest}>{children || value}</button>
		</ClickEffect>
	);
};

export { Button };
