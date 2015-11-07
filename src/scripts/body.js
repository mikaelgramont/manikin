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
		// hips: 20x14
		let hips = new BodyPart('hips', [0, 0], [10, 7], './images/hips.png', this.logger);
		this.root.addChild(hips);

		// torso: 21x39
		// [0, -39]: go up to the top left corner relative to the parent.
		// Then move locally to the bottom center.
		let torso = new BodyPart('torso', [0, -39], [10, 39], './images/torso.png', this.logger);
		hips.addChild(torso);

		// let neck = new BodyPart('neck');
		// torso.addChild(neck);

		// let head = new BodyPart('head');
		// neck.addChild(head);

		// left arm: 11x24
		let leftArm = new BodyPart('arm-left', [5, 0], [6, 8], './images/arm-left.png', this.logger);
		torso.addChild(leftArm);

		// left forearm: 11x22
		// let leftForeArm = new BodyPart('forearm-left', [0, 35], [5, 35], '#ffff40', './images/forearm-left.png');
		// leftArm.addChild(leftForeArm);

		// let leftHand = new BodyPart('hand-left');
		// leftForeArm.addChild(leftHand);


		// let rightArm = new BodyPart('arm-right');
		// torso.addChild(rightArm);

		// let rightForeArm = new BodyPart('forearm-right');
		// rightArm.addChild(rightForeArm);

		// let rightHand = new BodyPart('hand-right');
		// rightForeArm.addChild(rightHand);


		// let leftThigh = new BodyPart('thigh-left', [20, 50], [0, 20], [10, 20], '#ff40ff');
		// hips.addChild(leftThigh);

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