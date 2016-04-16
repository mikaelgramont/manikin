let Logger = require("../scripts/logger");

describe("Logger", () => {
	it("should call console.log", () => {
		let logger = new Logger(window);
		spyOn(window.console, 'log');

		logger.log("some message");
		expect(window.console.log).toHaveBeenCalledWith("some message");
	});

	it("should call console.group", () => {
		let logger = new Logger(window);
		spyOn(window.console, 'group');

		logger.group("some group name");
		expect(window.console.group).toHaveBeenCalledWith("some group name");
	});

	it("should call console.groupCollapsed", () => {
		let logger = new Logger(window);
		spyOn(window.console, 'groupCollapsed');

		logger.groupCollapsed("some group name");
		expect(window.console.groupCollapsed).toHaveBeenCalledWith("some group name");
	});

	it("should call console.groupEnd", () => {
		let logger = new Logger(window);
		spyOn(window.console, 'groupEnd');

		logger.groupEnd("some group name");
		expect(window.console.groupEnd).toHaveBeenCalledWith("some group name");
	});

	it("should do nothing when disabled", () => {
		let logger = new Logger(window);
		spyOn(window.console, 'log');

		logger.disable();

		logger.log("some message");
		expect(window.console.log).not.toHaveBeenCalled();

		logger.enable();

		logger.log("some message");
		expect(window.console.log).toHaveBeenCalledWith("some message");
	});
});