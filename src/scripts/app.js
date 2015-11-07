let Body = require('./body');
let ProxyDebugger = require('./proxydebugger');

let ctx = document.getElementById('manikin').getContext('2d');

let manikin = new Body(window.appConfig.bodyName, [300, 300]);



ctx = ProxyDebugger.instrumentContext(ctx, 'ctx', console, {
	'rotate': (argsIn) => {
		return [argsIn[0] * 180 / Math.PI]
	}
}
);
function render() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	console.groupCollapsed('Drawing grid');
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
	console.groupEnd('Drawing grid');

	manikin.loadAnimation(window.appConfig.animation);
	manikin.calculateFrames();
	manikin.renderFrame(0, ctx);	
}

window.render = render;

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


// manikin.forEachPart((part, name) => {
// 	console.log(`Part '${name}'`, part, part.getFrameInfo());
// });

// let calculatedFrames = manikin.getCalculatedFrames();
// let expectedCalculatedFrames = {
// 	'root': {
// 		0: {
// 			'rotation': 0
// 		}
// 	},
// 	'hips': {
// 		0: {
// 			'rotation': 20
// 		}
// 	},
// 	'torso': {
// 		0: {
// 			'rotation': 20
// 		}
// 	},	
// 	'thigh-left': {
// 		0: {
// 			'rotation': -5
// 		}
// 	},
// 	'arm-left': {
// 		0: {
// 			'rotation': 55
// 		}
// 	},
// 	'forearm-left': {
// 		0: {
// 			'rotation': 100
// 		}
// 	},
// };

// for (let partName in expectedCalculatedFrames) {
// 	let got = calculatedFrames[partName][0];
// 	let expected = expectedCalculatedFrames[partName][0];

// 	if (got.position[0] != expected.position[0] || got.position[1] != expected.position[1]) {
// 		console.error(`Position for ${partName} does is incorrect.`, 'Got:', got.position, 'expected:', expected.position);
// 	}
// 	if (got.rotation != expected.rotation) {
// 		console.error(`Rotation for ${partName} does is incorrect.`, 'Got:', got.rotation, 'expected:', expected.rotation);
// 	}
// }
// console.log('Done testing');