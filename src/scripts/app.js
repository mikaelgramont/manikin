let Body = require('./body');

let appConfig = window.appConfig;

let manikin = new Body(appConfig.bodyName);
manikin.loadAnimation(appConfig.animation);
manikin.calculateFrames();

// manikin.forEachPart((part, name) => {
// 	console.log(`Part '${name}'`, part, part.getFrameInfo());
// });

let calculatedFrames = manikin.getCalculatedFrames();
let expectedCalculatedFrames = {
	'root': {
		0: {
			'position': [3, 5],
			'rotation': 0
		}
	},
	'hips': {
		0: {
			'position': [3, 5],
			'rotation': 20
		}
	},
	'torso': {
		0: {
			'position': [3, 5],
			'rotation': 20
		}
	},	
	'thigh-left': {
		0: {
			'position': [3, 5],
			'rotation': -5
		}
	},
	'arm-left': {
		0: {
			'position': [3, 5],
			'rotation': 55
		}
	},
	'forearm-left': {
		0: {
			'position': [3, 5],
			'rotation': 100
		}
	},
};

for (let partName in expectedCalculatedFrames) {
	let got = calculatedFrames[partName][0];
	let expected = expectedCalculatedFrames[partName][0];

	if (got.position[0] != expected.position[0] || got.position[1] != expected.position[1]) {
		console.error(`Position for ${partName} does is incorrect.`, 'Got:', got.position, 'expected:', expected.position);
	}
	if (got.rotation != expected.rotation) {
		console.error(`Rotation for ${partName} does is incorrect.`, 'Got:', got.rotation, 'expected:', expected.rotation);
	}
}
console.log('Done testing');