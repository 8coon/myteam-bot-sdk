import { URL } from 'url';

export class URLBuilder {
	private _url: URL;

	constructor(url: string, baseUrl?: string) {
		this._url = new URL(url, baseUrl);
	}

	appendQuery(name: string, value: string | number) {
		this._url.searchParams.append(name, String(value));
		return this;
	}

	appendQueryIfTruthy(name: string, value?: string | number) {
		if (!value) {
			return this;
		}
		return this.appendQuery(name, value);
	}

	appendQueryObject(value: Record<string | number, string | number>) {
		const keys = Object.keys(value);

		for (const key of keys) {
			this.appendQuery(key, value[key]);
		}

		return this;
	}

	toString() {
		return this._url.toString();
	}
}
