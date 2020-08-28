/* eslint-disable prefer-const */
/* eslint-disable no-empty */
/* eslint-disable indent */
import express from 'express';
import http from 'http';
import { resolve, format } from 'path';
import consolidate from 'consolidate';
import { testRouter } from './routes';
import socketIo from 'socket.io';
import ss from 'socket.io-stream';
import { createWriteStream } from 'fs';
import { homedir } from 'os';
import { getSeeminglyLanAddress } from './utils';

const port = 20201;
const localIp = getSeeminglyLanAddress();

export interface Options {
	staticPath?: string;
	savePath?: string;
	enableAutoConnect?: boolean;
}

let httpServer;
let socketServer: socketIo.Server;

const isSub = process.argv[2] === '--sub';

if (isSub) {
	if (localIp?.seemsIp) {
		process.send({
			signal: 'local-ip-found',
			host: localIp?.seemsIp,
			port: port
		});
	} else {
		process.send({
			signal: 'local-ip-error'
		});
	}
}

const createLocalServer = async (options: Options): Promise<http.Server> => {
	const app = express();
	let connectCount = 0;

	// app.get('/', (req, res) => {
	// 	res.render('index.ejs', {});
	// });

	app.use('/test', testRouter);

	app.use('/assets', express.static(resolve(__dirname, './assets')));
	// app.set("view engine", "html");
	// app.set("views", __dirname + "/views");
	// app.engine("html", consolidate.ejs);

	const srv = http.createServer(app);

	srv.listen(port, localIp.seemsIp, async () => {
		const addr = srv.address() as any;
		console.log(`=========${addr.address}:${addr.port}==========`);
	});

	srv.on('error', (err: any) => {
		console.error(err);
		switch (err.code) {
			case 'EADDRINUSE':
				process.send({ signal: 'addr-in-use', error: err.toString() });
				break;
			case 'ACCESS':
				break;
		}
	});

	srv.on('close', () => {
		console.log('server closed');
	});

	//---------------------------------------------------------------------------
	socketServer = socketIo();

	socketServer.attach(srv);

	socketServer.on('connection', function (socket) {
		connectCount++;
		console.log(`${socket.handshake.headers.host} ${connectCount} connected`);

		socket.on('disconnect', function () {
			console.log('socket disconnected');
		});

		process.on('message', (msg) => {
			if (msg.signal === 'clipboard-to-client') {
				socketServer?.emit('clipboard-to-client', msg.data);
			}
		});

		socket.on('clipboard-to-server', (msg) => {
			process.send({ signal: 'clipboard-to-server', data: msg });
		});

		socket.on('connected-address', (msg) => {
			process.send({
				signal: 'socket-connect',
				host: msg
			});
		});

		socket.on('will-upload-file', (msg) => {
			if (msg?.filename) {
				const dir = resolve(options.savePath ?? homedir());
				const base = msg.filename;
				const outPath = format({
					dir,
					base
				});

				const target = createWriteStream(outPath);

				socket.on('upload-file', (msg: Buffer) => {
					if (!target.writableEnded) {
						target.write(msg);
					}
				});

				socket.once('upload-file-done', () => {
					setTimeout(() => {
						target.end();
						target.destroy();
						if (target.destroyed) {
							process.send({ signal: 'upload-accomplish', outDir: dir, filename: base, outPath });
						}
					}, 20);
				});
			}
		});

	});

	return srv;
};

process.on('message', async (msg) => {
	// console.log('server process msg: ', msg);
	switch (msg.signal) {
		case 'server-start':
			if (msg.settings?.purchased) {
				httpServer = await createLocalServer(msg.settings);
			}
			break;
		case 'server-close':
			httpServer.close();
			socketServer.close();
			break;
	}
});

