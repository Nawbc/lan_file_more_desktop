import React, { Component, FC } from 'react';

interface InputProps {
	type?: string;
	[index: string]: any;
}

const Input: FC<InputProps> = (props) => {
	const { type } = props;
	return (
		<input type={type} />
	);
};

export { Input };
