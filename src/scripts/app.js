let Body = require('./body');
let ProxyDebugger = require('./proxydebugger');

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
let logger = new Logger();
let manikin = new Body(window.appConfig.bodyName, [300, 300], logger);

let ctx = document.getElementById('manikin').getContext('2d');
ctx = ProxyDebugger.instrumentContext(ctx, 'ctx', logger, {
	'rotate': (argsIn) => {
		return [argsIn[0] * 180 / Math.PI]
	}
});

function render() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	logger.groupCollapsed('Drawing grid');
	for (let i = 200; i <= 400; i+=10) {
		let strokeStyle = '#000000';
		if (i == 300) {
			strokeStyle = '#ff0000';
		}
		ctx.strokeStyle = strokeStyle;
		ctx.beginPath();
		ctx.moveTo(200, i);
		ctx.lineTo(400,i);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(i, 200);
		ctx.lineTo(i, 400);
		ctx.stroke();
	}
	logger.groupEnd('Drawing grid');

	manikin.loadAnimation(window.appConfig.animation);
	manikin.calculateFrames();
	manikin.renderFrame(0, ctx);	
}

window.logger = logger;
window.render = render;
window.manikin = manikin;

function observeNested(obj, callback) {
	for(let prop in obj) {
		if (!obj.hasOwnProperty(prop)) {
			continue;
		}
		if (obj[prop] === null) {
			continue;
		}
		if (typeof obj[prop] === 'object') {
		    Object.observe(obj[prop], function(changes){
		        callback();
		    });
			observeNested(obj[prop], callback);
		}
	}
}

observeNested(window.appConfig, render);