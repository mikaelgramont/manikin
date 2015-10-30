let BodyPart = require('./bodypart');
let Queue = require('./queue');

class Body {
	constructor(name, queue) {
		this.name = name;
		this.queue = new Queue();

		// TODO: create a frame information object to pass around

		this.root = new BodyPart('root');
		this.spritesheet = null;
		this.duration = null;
		this.looping = null;
		this.createParts();
	}

	createParts() {
		let hips = new BodyPart('hips');
		this.root.addChild(hips);

		// let torso = new BodyPart('torso');
		// hips.addChild(torso);

		// let neck = new BodyPart('neck');
		// torso.addChild(neck);

		// let head = new BodyPart('head');
		// neck.addChild(head);


		let leftArm = new BodyPart('arm-left');
		torso.addChild(leftArm);

		let leftForeArm = new BodyPart('forearm-left');
		leftArm.addChild(leftForeArm);

		// let leftHand = new BodyPart('hand-left');
		// leftForeArm.addChild(leftHand);


		// let rightArm = new BodyPart('arm-right');
		// torso.addChild(rightArm);

		// let rightForeArm = new BodyPart('forearm-right');
		// rightArm.addChild(rightForeArm);

		// let rightHand = new BodyPart('hand-right');
		// rightForeArm.addChild(rightHand);


		let leftThigh = new BodyPart('thigh-left');
		hips.addChild(leftThigh);

		// let leftLeg = new BodyPart('leg-left');
		// leftThigh.addChild(leftLeg);

		// let leftFoot = new BodyPart('foot-left');
		// leftLeg.addChild(leftFoot);


		// let rightThigh = new BodyPart('thigh-right');
		// hips.addChild(rightThigh);

		// let rightLeg = new BodyPart('leg-right');
		// leftThigh.addChild(rightLeg);

		// let rightFoot = new BodyPart('foot-right');
		// rightLeg.addChild(rightFoot);
	}

	forEachPart(fn) {
		// TODO: build a queue of body parts, and run fn on them.
		var explored = [];
		this.queue.flush();
		this.queue.push(this.root);
		fn(this.root, this.root.getName());
		var currentPart;

		while((currentPart = this.queue.pop()) !== undefined) {
			let currentName = currentPart.getName();
			let children = currentPart.getChildren();

			for(let name in children) {
				let child = children[name];
				if (!explored[name]) {
					explored[name] = true;
					fn(child, name);
					this.queue.push(child);
				}
			}
		}
		this.queue.flush();
	}

	loadAnimation(animObject) {
		this.spritesheet = animObject.spritesheet;
		this.duration = animObject.duration;
		this.looping = animObject.looping;
		this.forEachPart((part, name) => {
			if (!animObject.frames[name]) {
				//throw new Error(`No frame info for body part ${name} in animation object:`, animObject);
				return;
			}

			part.loadFrameInfo(animObject.frames[name]);
		});
	}

	getDrawInfoForFrame(frameId) {
		return {
			'root': {
				'position': [3, 5],
				'rotation': 0
			},
			'hips': {
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
		}
	}
}

module.exports = Body;