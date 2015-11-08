let Body = require('./body');
let Logger = require('./logger');
let ProxyDebugger = require('./proxydebugger');

let logger = new Logger();
logger.enabled = false;
let manikin = new Body(window.bodyConfig, [300, 300], logger);

let gridCtx = document.getElementById('grid').getContext('2d');
let ctx = document.getElementById('manikin').getContext('2d');
ctx = ProxyDebugger.instrumentContext(ctx, 'ctx', logger, {
	'rotate': (argsIn) => {
		return [argsIn[0] * 180 / Math.PI]
	}
});

function drawGrid(ctx) {
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
}

function render(frameId) {
	manikin.loadAnimation(window.appConfig.animation);
	manikin.calculateFrames();
	manikin.renderFrame(frameId || 0, ctx);	
}

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

window.logger = logger;
window.render = render;
window.manikin = manikin;

observeNested(window.appConfig, render);
drawGrid(gridCtx);