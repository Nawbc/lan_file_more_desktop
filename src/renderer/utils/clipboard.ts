import events from 'events';
import { clipboard } from 'electron';

export class ClipboardEx extends events.EventEmitter {

	listener: NodeJS.Timeout;
	cachedText: string;
	cachedImage: string;

	dispose = () => {
		this.removeAllListeners();
		clearInterval(this.listener);
	}

	start = () => {
		this.listener = setInterval(() => {
			const nowText = clipboard.readText();
			const nowImage = clipboard.readImage();
			if (this.cachedText !== nowText) {
				this.emit('changed', nowText);
				this.cachedText = nowText;
			}
			if (this.cachedImage !== nowImage?.toDataURL()) {
				this.emit('changed', nowImage);
				this.cachedImage = nowImage?.toDataURL();
			}
		}, 500);
	}

}
