let Logger = function(global) {
	this.enabled = true;

	this._logger = global.console || {
		log: function() {},
		group: function() {},
		groupCollapsed: function() {},
		groupEnd: function() {},
	};
};
Logger.prototype.log = function() {
	if (this.enabled) {
		this._logger.log.apply(console, arguments);
	}
}
Logger.prototype.group = function() {
	if (this.enabled) {
		this._logger.group.apply(console, arguments);
	}
}
Logger.prototype.groupCollapsed = function() {
	if (this.enabled) {
		this._logger.groupCollapsed.apply(console, arguments);
	}
}
Logger.prototype.groupEnd = function() {
	if (this.enabled) {
		this._logger.groupEnd.apply(console, arguments);
	}
}

module.exports = Logger;