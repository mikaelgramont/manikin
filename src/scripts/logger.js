let Logger = function() {
	this.enabled = true;
};
Logger.prototype.log = function() {
	if (this.enabled) {
		console.log.apply(console, arguments);
	}
}
Logger.prototype.group = function() {
	if (this.enabled) {
		console.group.apply(console, arguments);
	}
}
Logger.prototype.groupCollapsed = function() {
	if (this.enabled) {
		console.groupCollapsed.apply(console, arguments);
	}
}
Logger.prototype.groupEnd = function() {
	if (this.enabled) {
		console.groupEnd.apply(console, arguments);
	}
}

module.exports = Logger;