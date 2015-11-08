let BodyPart = require('./bodypart');
let Queue = require('./queue');
let Stack = require('./stack');

class Body {
	constructor(name, absolutePosition, logger) {
		this.name = name;
		this.absolutePosition = absolutePosition;
		this.logger = logger;

		this.root = new BodyPart('root', [-10, 0], [0, 0], null, this.logger);
		this.spritesheet = null;
		this.duration = null;
		this.looping = null;
		this.createParts();
	}

	createParts() {
		// hips: 22x15
		let hips = new BodyPart('hips', [0, 0], [11, 7], './images/hips.png', this.logger);
		this.root.addChild(hips);

		// torso: 22x39
		// [0, -39]: go up to the top left corner relative to the parent.
		// Then move locally to the bottom center.
		let torso = new BodyPart('torso', [0, -39], [11, 39], './images/torso.png', this.logger);
		hips.addChild(torso);

		// head: 22x29
		let head = new BodyPart('head', [0, -29], [11, 28], './images/head.png', this.logger);
		torso.addChild(head);

		// left arm: 16x32
		let leftArm = new BodyPart('arm-left', [3, 0], [8, 3], './images/arm-left.png', this.logger);
		torso.addChild(leftArm);

		// left forearm: 14x22
		let leftForeArm = new BodyPart('forearm-left', [1, 30], [7, 2], './images/forearm-left.png', this.logger);
		leftArm.addChild(leftForeArm);

		// left hand: 10x14
		let leftHand = new BodyPart('hand-left', [2, 21], [5, 0], './images/hand-left.png', this.logger);
		leftForeArm.addChild(leftHand);

		// right arm: 16x32
		let rightArm = new BodyPart('arm-right', [3, 0], [8, 3], './images/arm-right.png', this.logger);
		torso.addChild(rightArm);

		// left forearm: 14x22
		let rightForeArm = new BodyPart('forearm-right', [1, 30], [7, 2], './images/forearm-right.png', this.logger);
		rightArm.addChild(rightForeArm);

		// left hand: 10x14
		let rightHand = new BodyPart('hand-right', [2, 21], [5, 0], './images/hand-right.png', this.logger);
		rightForeArm.addChild(rightHand);

		// left thigh: 14x22
		let leftThigh = new BodyPart('thigh-left', [3, 13], [2, 2], './images/thigh-left.png', this.logger);
		hips.addChild(leftThigh);

		// left forearm: 14x22
		let leftLeg = new BodyPart('leg-left', [1, 30], [7, 2], './images/leg-left.png', this.logger);
		leftThigh.addChild(leftLeg);

		// left foot: 27x10
		let leftFoot = new BodyPart('foot-left', [1, 21], [5, 0], './images/foot-left.png', this.logger);
		leftLeg.addChild(leftFoot);

		// right thigh: 14x22
		let rightThigh = new BodyPart('thigh-right', [3, 13], [2, 2], './images/thigh-right.png', this.logger);
		hips.addChild(rightThigh);

		// right forearm: 14x22
		let rightLeg = new BodyPart('leg-right', [1, 30], [7, 2], './images/leg-right.png', this.logger);
		rightThigh.addChild(rightLeg);

		// right foot: 27x10
		let rightFoot = new BodyPart('foot-right', [1, 21], [5, 0], './images/foot-right.png', this.logger);
		rightLeg.addChild(rightFoot);
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
		ctx = this.instrumentContext(ctx);
	}

	renderFrame(frameId, ctx) {
		ctx.save();
		ctx.translate(this.absolutePosition[0], this.absolutePosition[1]);

		this.forEachPart((part, name) => {
			this.logger.groupCollapsed(`rendering ${name}`);
			ctx.save();
			part.positionContextForFrame(frameId, ctx);
			part.drawSpriteForFrame(frameId, ctx);
			ctx.restore();
			this.logger.groupEnd();

		});
		
		ctx.restore();
	}
}

module.exports = Body;