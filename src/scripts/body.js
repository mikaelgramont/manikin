let BodyPart = require('./bodypart');
let Stack = require('./stack');

class Body {
	constructor(bodyConfig, absolutePosition, logger) {
		this.name = bodyConfig.name;
		this.absolutePosition = absolutePosition;
		this.bodyConfig = bodyConfig;
		this.logger = logger;

		this.root = null;
		this.duration = null;
		this.looping = null;

		this.createParts();
	}

	createParts() {
		let parts = {};
		// Step 1: build all parts.
		for (let partName in bodyConfig.parts) {
			let partConfig = bodyConfig.parts[partName];
			parts[partName] = new BodyPart(
				partName,
				partConfig.relativePosition,
				partConfig.centerOffset,
				partConfig.sprite,
				partConfig.layer,
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
			let partConfig = bodyConfig.parts[partName];
			let childPart = parts[partName];
			let parentPart = parts[partConfig.parentName];

			if (!parentPart) {
				throw new Error(`Cannot find parent element by name ${partConfig.parentName} for child ${partName}`);
			}

			parentPart.addChild(childPart);
		}
	}

	forEachPart(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
		var explored = [];
		let storage = new Stack();
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

		// Build a list of parts, ordered by layer.
		let parts = []
		this.forEachPart((part, name) => {
			parts.push(part);
		});

		parts.sort((a, b) => {
			return a.layer - b.layer;
		});

		parts.forEach((part) => {
			let name = part.getName();
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