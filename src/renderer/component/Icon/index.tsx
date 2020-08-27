import React, { FC, CSSProperties } from 'react';
import SVG from 'react-inlinesvg';
import classNames from 'classnames';

interface IconProps {
	className?: string;
	src?: string;
	style?: CSSProperties;
	[key: string]: any;
}

const Icon: FC<IconProps> = function (props) {
	const { src, style, className, ...rest } = props;

	return (
		<i className={classNames('svg', className)} style={{
			display: 'inline-flex'
		}}>
			<SVG src={src} style={{ width: 14, height: 14, ...style }} {...rest} />
		</i>
	);
};

export { Icon };
