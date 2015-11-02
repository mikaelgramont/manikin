let BodyPart = require('./bodypart');
let Queue = require('./queue');
let Stack = require('./stack');

class Body {
	constructor(name, absolutePosition) {
		this.name = name;
		this.absolutePosition = absolutePosition;

		// TODO: create a frame information object to pass around

		this.root = new BodyPart('root', [0, 0], [0, 0], '#000000');
		this.spritesheet = null;
		this.duration = null;
		this.looping = null;
		this.createParts();
	}

	createParts() {
		let hips = new BodyPart('hips', [20, 20], [0, 0], '#ff0000');
		this.root.addChild(hips);

		let torso = new BodyPart('torso', [20, 60], [0, -60], '#00ff00');
		hips.addChild(torso);

		// let neck = new BodyPart('neck');
		// torso.addChild(neck);

		// let head = new BodyPart('head');
		// neck.addChild(head);


		let leftArm = new BodyPart('arm-left', [10, 35], [5, 0], '#0000ff');
		torso.addChild(leftArm);

		let leftForeArm = new BodyPart('forearm-left', [10, 35], [0, 35], '#ffff00');
		leftArm.addChild(leftForeArm);

		// let leftHand = new BodyPart('hand-left');
		// leftForeArm.addChild(leftHand);


		// let rightArm = new BodyPart('arm-right');
		// torso.addChild(rightArm);

		// let rightForeArm = new BodyPart('forearm-right');
		// rightArm.addChild(rightForeArm);

		// let rightHand = new BodyPart('hand-right');
		// rightForeArm.addChild(rightHand);


		let leftThigh = new BodyPart('thigh-left', [20, 50], [0, 20], '#ff00ff');
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

	forEachPart(fn, onpop, onpush) {
		this.forEachPartDFS(fn, onpop, onpush);
	}

	forEachPartDFS(fn, onpop, onpush) {
		this._forEachPart(fn, new Stack(onpop, onpush));
	}

	forEachPartBFS(fn, onpop, onpush) {
		this._forEachPart(fn, new Queue(onpop, onpush));
	}

	_forEachPart(fn, storage, onpop, onpush) {
		var explored = [];
		storage.flush();
		storage.push(this.root);
		fn(this.root, this.root.getName());
		var currentPart;

		while((currentPart = storage.pop()) !== undefined) {
			let currentName = currentPart.getName();
			let children = currentPart.getChildren();

			for(let name in children) {
				let child = children[name];
				if (!explored[name]) {
					explored[name] = true;
					fn(child, name);
					storage.push(child);
				}
			}
		}
		storage.flush();
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
			part.loadAnimationInfo(this.duration, animObject.frames[name]);
		});
	}

	calculateFrames() {
		this.forEachPart((part) => {
			part.calculateFrames();
		});
	}

	getCalculatedFrames() {
		let calculatedFrames = {};
		this.forEachPart((part, name) => {
			calculatedFrames[name] = part.getCalculatedFrames();
		});
		return calculatedFrames;
	}

	renderFrame(frameId, ctx) {
		ctx.save();
		ctx.translate(this.absolutePosition[0], this.absolutePosition[1]);

		this.forEachPart((part, name) => {
			let frameInfo = part.getCalculatedFrames()[frameId];
			ctx.fillStyle = part.color;
			ctx.fillRect(frameInfo.absolutePosition[0], frameInfo.absolutePosition[1], part.size[0], part.size[1]);
		});

		ctx.restore();
	}
}

module.exports = Body;