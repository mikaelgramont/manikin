let BodyPart = require('./bodypart');
let Queue = require('./queue');
let Stack = require('./stack');

class Body {
	constructor(name, absolutePosition) {
		this.name = name;
		this.absolutePosition = absolutePosition;

		// TODO: create a frame information object to pass around

		this.root = new BodyPart('root', [0, 0], [0, 0], [0, 0], '#000000');
		this.spritesheet = null;
		this.duration = null;
		this.looping = null;
		this.createParts();
	}

	createParts() {
		let hips = new BodyPart('hips', [20, 20], [0, 0], [0, 0], '#ff0000');
		this.root.addChild(hips);

		let torso = new BodyPart('torso', [20, 60], [0, -60], [0, 0], '#00ff00');
		hips.addChild(torso);

		// let neck = new BodyPart('neck');
		// torso.addChild(neck);

		// let head = new BodyPart('head');
		// neck.addChild(head);


		let leftArm = new BodyPart('arm-left', [10, 35], [5, 0], [0, 0], '#0000ff');
		torso.addChild(leftArm);

		let leftForeArm = new BodyPart('forearm-left', [10, 35], [0, 35], [0, 0], '#ffff00');
		leftArm.addChild(leftForeArm);

		// let leftHand = new BodyPart('hand-left');
		// leftForeArm.addChild(leftHand);


		// let rightArm = new BodyPart('arm-right');
		// torso.addChild(rightArm);

		// let rightForeArm = new BodyPart('forearm-right');
		// rightArm.addChild(rightForeArm);

		// let rightHand = new BodyPart('hand-right');
		// rightForeArm.addChild(rightHand);


		let leftThigh = new BodyPart('thigh-left', [20, 50], [0, 20], [0, 0], '#ff00ff');
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

	forEachPart(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
		this.forEachPartDFS(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn);
	}

	forEachPartDFS(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
		this._forEachPart(fn, new Stack(), beforeLoopOverChildrenFn, afterLoopOverChildrenFn);
	}

	forEachPartBFS(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
		this._forEachPart(fn, new Queue(), beforeLoopOverChildrenFn, afterLoopOverChildrenFn);
	}

	_forEachPart(fn, storage, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
		var explored = [];
		storage.flush();
		storage.push(this.root);
		fn(this.root, this.root.getName());
		var currentPart;

		while((currentPart = storage.pop()) !== undefined) {
			if (beforeLoopOverChildrenFn) {
				beforeLoopOverChildrenFn(currentPart);
			}

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

			if (afterLoopOverChildrenFn) {
				afterLoopOverChildrenFn(currentPart);
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

		let beforeFn = function(part) {
			let frameInfo = part.getCalculatedFrames()[frameId];
			ctx.translate(part.centerOffset[0], part.centerOffset[1]);
			ctx.rotate((Math.PI / 180) * frameInfo.rotation);
			ctx.save();
		}

		let afterFn = function(part) {
			ctx.restore();
		}

		this.forEachPart((part, name) => {
			let frameInfo = part.getCalculatedFrames()[frameId];
			ctx.save();
			ctx.fillStyle = part.color;
			ctx.fillRect(frameInfo.absolutePosition[0], frameInfo.absolutePosition[1], part.size[0], part.size[1]);
			ctx.restore();
		}, beforeFn, afterFn);

		ctx.restore();
	}
}

module.exports = Body;