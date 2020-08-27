import { humanSize } from './index';
import { promises } from 'fs';
import { resolve, extname, basename } from 'path';

const { readdir, stat } = promises;

interface FileStat {
	path: string;
}

interface FileEntity {
	entity: FileStat,
	modified: Date;
	changed: Date;
	type: string;
	size: string;
	ext: string;
	filename: string;
}

export const readDir = async (root: string): Promise<FileEntity[]> => {
	const content = await readdir(root);
	const result: FileEntity[] = [];
	for await (const file of content) {
		const resultObj: FileEntity = { entity: {} } as any;
		const path = resolve(root, file);
		const fileStat = await stat(path);

		resultObj.entity.path = path;
		resultObj.size = humanSize(fileStat.size);
		resultObj.modified = fileStat.mtime;
		resultObj.changed = fileStat.ctime;
		resultObj.ext = extname(file);
		resultObj.filename = basename(file);

		if (fileStat.isDirectory()) {
			resultObj.type = 'directory';
		}

		if (fileStat.isFile()) {
			resultObj.type = 'file';
		}

		if (fileStat.isSymbolicLink()) {
			resultObj.type = 'link';
		}

		result.push(resultObj);
	}
	return result;
};

