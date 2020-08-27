import React, { FC } from 'react';
import './style/index.scss';

const ClickEffect: FC<any> = function (props) {
	const { children, ...rest } = props;

	return (
		<div className="click-down" {...rest}>
			{children}
		</div>
	);
};

export { ClickEffect };
