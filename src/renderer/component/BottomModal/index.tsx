
import React, { FC, useState, useImperativeHandle } from "react";
import classNames from "classnames";
import './index.scss';

interface BottomModalProps {
	overflowHeight?: number;
	[index: string]: any;
}

export type BottomModalAction = { hide: () => void, show: () => void };

export const BottomModal: FC<BottomModalProps> = React.forwardRef(function (props: BottomModalProps, ref) {
	const { overflowHeight, children } = props;
	const [modal, setModal] = useState(false);

	useImperativeHandle(
		ref,
		() => ({
			hide: () => {
				setModal(false);
			},
			show: () => {
				setModal(true);
			}
		}),
		[]
	);

	return (
		<div>
			<div
				style={Object.assign({},
					modal ? {
						position: 'absolute',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0
					} : {}
				) as any}
				className={classNames('mask', 'modal')}
				onClick={() => {
					if (modal) {
						setModal(false);
					}
				}} />
			<div
				className={classNames('bottom-modal')}
				style={{
					'transform': modal ? 'translateY(0px)' : `translateY(${400 - overflowHeight}px)`
				}}
				onClick={() => {
					if (!modal) {
						setModal(true);
					}
				}}
			>
				{children}
			</div>
		</div>

	);
});

