class Logger {
	constructor(global) {
		this.enabled_ = typeof(global.console) != 'undefined';
		this._logger = global.console;
	}

	enable() {
		this.enabled_ = true;
	}

	disable() {
		this.enabled_ = false;
	}

	log() {
		if (this.enabled_) {
			this._logger.log.apply(this._logger, arguments);
		}
	}

	group() {
		if (this.enabled_) {
			this._logger.group.apply(this._logger, arguments);
		}
	}

	groupCollapsed() {
		if (this.enabled_) {
			this._logger.groupCollapsed.apply(this._logger, arguments);
		}
	}

	groupEnd() {
		if (this.enabled_) {
			this._logger.groupEnd.apply(this._logger, arguments);
		}
	}
}
module.exports = Logger;