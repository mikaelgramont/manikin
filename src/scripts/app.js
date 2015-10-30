let Body = require('./body');

let appConfig = window.appConfig;

let manikin = new Body(appConfig.bodyName);
manikin.loadAnimation(appConfig.animation);

// manikin.forEachPart((part, name) => {
// 	console.log(`Part '${name}'`, part, part.getFrameInfo());
// });

let frameInfo = manikin.getDrawInfoForFrame(0);
let expectedFrameInfo = {
	'root': {
		'position': [3, 5],
		'rotation': 0
	},
	'hips': {
		'position': [0, 0],
		'rotation': 20
	},
	'torso': {
		'position': [0, 0],
		'rotation': 20
	},	
	'thigh-left': {
		'position': [0, 0],
		'rotation': -5
	},
	'arm-left': {
		'position': [0, 0],
		'rotation': 35
	},
	'arm-left': {
		'position': [0, 0],
		'rotation': 80
	},
};

for (let partName in expectedFrameInfo) {
	let got = frameInfo[partName];
	let expected = expectedFrameInfo[partName];
	if (got.position[0] != expected.position[0] || got.position[1] != expected.position[1]) {
		console.error(`Position for ${partName} does is incorrect.`, 'Got:', got.position, 'expected:', expected.position);
	}
	if (got.rotation != expected.rotation) {
		console.error(`Rotation for ${partName} does is incorrect.`, 'Got:', got.rotation, 'expected:', expected.rotation);
	}
}
console.log('Done testing');