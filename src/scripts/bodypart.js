let AnimationInfo = require('./animationInfo');

class BodyPart {
	constructor(name, isRoot, relativePosition, centerOffset, sprite, layer, logger) {
		this.name = name;

		// Vector going from parent to this part.
		this.relativePosition = relativePosition;

		// Offset to allow parts to rotate around the joints.
		this.centerOffset = centerOffset;

		this.layer = layer;

		if (typeof sprite === "string") {
			// Individual sprite
			let img = document.createElement('img');
			img.src = sprite;
			img.addEventListener('load', (e) => {
				this.logger.log('image loaded', e);
			})
			document.getElementById('images').appendChild(img);
			this.sprite = img;		
		} else {
			// Store dimensions, we'll refer to root for the image.
			this.sprite = sprite;
		}

		this.logger = logger;

		this.parent = null;
		this.isRoot = isRoot;
		this.root = null;
		this.children = {};
		
		this.animationInfo = null;
		this.calculatedFrames = {};
		this.duration = 0;
	}

	setParent(parent) {
		this.parent = parent;
		this.root = parent.getRoot();
	}

	getParent() {
		return this.parent;
	}

	getRoot() {
		if (this.isRoot) {
			return this;
		}
		return this.root;
	}

	getName() {
		return this.name;
	}

	getChildren() {
		return this.children;
	}

	getChildByName(name) {
		return this.children[name];
	}

	addChild(child) {		
		let childName = child.getName();
		child.setParent(this);
		if (this.children[childName]) {
			let existing = this.children[childName];
			let parentChain = existing.getParentChainAsString()
			throw new Error(`Cannot add child: '${this.name}' already has a child by the name of '${childName}': ${parentChain}`);
		}
		this.children[childName] = child;
	}

	getParentChain() {
		let chain = [];
		let currentPart = this;
		while (currentPart = currentPart.getParent()) {
			chain.unshift(currentPart);
		}

		return chain;
	}

	getParentChainAsString() {
		let stringParts = [];
		let currentPart = this;
		do {
			stringParts.unshift(currentPart.getName());
		} while (currentPart = currentPart.getParent());

		return stringParts.join(' -> ');
	}

	getAnimationInfo() {
		return this.animationInfo;
	}

	loadAnimationInfo(duration, animationInfo) {
		this.duration = duration;
		this.animationInfo = new AnimationInfo(animationInfo, duration, this);
	}

	getCalculatedFrame(frameId) {
		if (frameId >= this.duration) {
			throw new Error(`Requested frameId (${frameId}) too high. Duration is ${this.duration}.`)
		}
		return this.calculatedFrames[frameId];
	}

	calculateFrames() {
		for(let f = 0; f < this.duration; f++) {

			let localRotation = this.animationInfo.getInterpolatedLocalRotation(f);
			let relativePosition = this.relativePosition;

			this.calculatedFrames[f] = {
				'position': relativePosition,
				'rotation': localRotation
			};
		}
	}

	getDrawInfoForFrame(frameId) {
		if (frameId >= this.duration) {
			throw new Error(`Requested frameId (${frameId}) too high. Duration is ${this.duration}.`)
		}
		return {
			'position': this.calculatedFrames.position[frameId],
			'rotation': this.calculatedFrames.rotation[frameId]
		}
	}

	/*
	 * Starts from the root element, and positions the context
	 * so that (0, 0) coincides with the origin of the current part.
	 */
	positionContextForFrame(frameId, ctx) {
		let parentParts = this.getParentChain();
		parentParts.forEach((parentPart) => {
			this.logger.groupCollapsed(`positioning canvas according to ${parentPart.getName()}`);
			let frameInfo = parentPart.getCalculatedFrame(frameId);
			ctx.translate(parentPart.relativePosition[0], parentPart.relativePosition[1]);
			ctx.translate(parentPart.centerOffset[0], parentPart.centerOffset[1]);
			ctx.rotate((Math.PI / 180) * frameInfo.rotation);
			ctx.translate(- parentPart.centerOffset[0], - parentPart.centerOffset[1]);
			this.logger.groupEnd();
		});
	}

	/*
	 * Draws the sprite for this part relative to the current
	 * context origin.
	 */
	drawSpriteForFrame(frameId, ctx) {
		if (!this.sprite) {
			return;
		}
		let frameInfo = this.getCalculatedFrame(frameId);
		ctx.translate(this.relativePosition[0], this.relativePosition[1]);
		ctx.translate(this.centerOffset[0], this.centerOffset[1]);
		ctx.rotate((Math.PI / 180) * frameInfo.rotation);
		ctx.translate(- this.centerOffset[0], - this.centerOffset[1]);
		if (typeof this.sprite === "string") {
			ctx.drawImage(this.sprite, 0, 0);
		} else {
			let sprite = this.getRoot().sprite;
			ctx.drawImage(sprite, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3], 0, 0, this.sprite[2], this.sprite[3]);
		}
	}
}
module.exports = BodyPart;