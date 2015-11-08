let Body = require('./body');
let Logger = require('./logger');
let ProxyDebugger = require('./proxydebugger');

let logger = new Logger();
logger.enabled = false;
let manikin = new Body('default', 'default', [100, 100], logger);

let gridCtx = document.getElementById('grid').getContext('2d');
let ctx = document.getElementById('manikin').getContext('2d');
// ctx = ProxyDebugger.instrumentContext(ctx, 'ctx', logger, {
// 	'rotate': (argsIn) => {
// 		return [argsIn[0] * 180 / Math.PI]
// 	}
// });

function drawGrid(ctx) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	logger.groupCollapsed('Drawing grid');
	for (let i = 0; i <= 200; i += 10) {
		let strokeStyle = '#000000';
		if (i == 100) {
			strokeStyle = '#ff0000';
		}
		ctx.strokeStyle = strokeStyle;
		ctx.beginPath();
		ctx.moveTo(0, i);
		ctx.lineTo(200,i);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i, 200);
		ctx.stroke();
	}
	logger.groupEnd('Drawing grid');
}

function render(frameId) {
	console.log('rendering ' + frameId)
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	manikin.renderFrame(frameId || 0, ctx);	
}

window.go = () => {
	var i = 0;	
	var fps = 1;
	function anim(){
		render(i % 40);
		i++;
		if (i <= 400) {
			handle = setTimeout(anim, 1 / fps * 1000);
		} else {
			clearTimeout(handle);
		}
	}
	let handle = setTimeout(anim, 1 / fps * 1000);
	window.handle = handle;
}

window.logger = logger;
window.render = render;
window.manikin = manikin;

drawGrid(gridCtx);