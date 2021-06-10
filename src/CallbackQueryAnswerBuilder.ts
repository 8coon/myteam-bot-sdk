import {isString} from "./types";

export class CallbackQueryAnswerBuilder {
	public textValue?: string;
	public showAlert?: boolean;
	public urlValue?: string;

	public text(value: string): this {
		this.textValue = value;
		this.showAlert = undefined;
		this.urlValue = undefined;
		return this;
	}

	public alert(text: string): this {
		this.textValue = text;
		this.showAlert = true;
		this.urlValue = undefined;
		return this;
	}

	public url(value: string): this {
		this.textValue = undefined;
		this.showAlert = undefined;
		this.urlValue = value;
		return this;
	}

	public toObject(): Record<string, string> {
		const result: Record<string, string> = {};

		if (isString(this.urlValue)) {
			result.url = this.urlValue;
		} else if (isString(this.textValue)) {
			result.text = this.textValue;

			if (this.showAlert) {
				result.showAlert = 'true';
			}
		}

		return result;
	}
}
