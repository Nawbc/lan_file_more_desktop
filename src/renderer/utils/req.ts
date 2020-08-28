import { BASE_URL } from './constants';
import axios from 'axios';
import localforage from 'localforage';

export const req = axios.create({
	baseURL: BASE_URL,
	timeout: 8000
});

req.interceptors.request.use(async (config) => {
	const token = await localforage.getItem('loginToken');
	const baseUrl = await localforage.getItem('baseUrl');
	if (!!baseUrl) {
		config.baseURL = baseUrl as string;
	}
	if (!!token) {
		config.headers['Authorization'] = `Bearer ${token}`;
		config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
	}
	return config;
}, function (error) {
	return Promise.reject(error);
});

