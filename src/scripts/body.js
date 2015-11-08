let BodyPart = require('./bodypart');
let Queue = require('./queue');
let Stack = require('./stack');

class Body {
	constructor(name, absolutePosition, bodyConfig, logger) {
		this.name = name;
		this.absolutePosition = absolutePosition;
		this.bodyConfig = bodyConfig;
		this.logger = logger;

		this.root = null;
		this.spritesheet = null;
		this.duration = null;
		this.looping = null;

		this.createParts();
	}

	createParts() {
		let parts = {};
		// Step 1: build all parts.
		for (let partName in bodyConfig) {
			let partConfig = bodyConfig[partName];
			parts[partName] = new BodyPart(
				partName,
				partConfig.relativePosition,
				partConfig.centerOffset,
				partConfig.sprite,
				this.logger);

			if (partName == 'root') {
				this.root = parts[partName];
			}
		}

		// Step 2: setup parent-child relationships.
		for (let partName in parts) {
			if (partName == 'root') {
				continue;
			}
			let partConfig = bodyConfig[partName];
			let childPart = parts[partName];
			let parentPart = parts[partConfig.parentName];

			if (!parentPart) {
				throw new Error(`Cannot find parent element by name ${partConfig.parentName} for child ${partName}`);
			}

			parentPart.addChild(childPart);
		}
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