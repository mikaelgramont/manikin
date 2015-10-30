let AnimationInfo = require('./animationInfo');

class BodyPart {
	constructor(name) {
		this.parent = null;
		this.name = name;
		this.children = {};
		this.animationInfo = null;
		this.calculatedFrames = {};
		this.duration = 0;
	}

	setParent(parent) {
		this.parent = parent;
	}

	// Look into ES6 setters/getters
	getParent() {
		return this.parent;
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
		this.animationInfo = new AnimationInfo(animationInfo);
	}

	getCalculatedFrames() {
		return this.calculatedFrames;
	}

	calculateFrames() {
		for(let f = 0; f < this.duration; f++) {
			let rotation = this.animationInfo.getInterpolatedLocalRotation(f);
			let position = this.animationInfo.getInterpolatedLocalPosition(f);

			let parent = this.getParent();
			if (parent) {
				let parentCalculatedFrames = parent.getCalculatedFrames();

				rotation += parentCalculatedFrames[f].rotation;

				// TODO: implement real calculations here.
				position[0] += parentCalculatedFrames[f].position[0];
				position[1] += parentCalculatedFrames[f].position[1];
			}

			this.calculatedFrames[f] = {
				'position': position,
				'rotation': rotation
			};
		}
	}

	getDrawInfoForFrame(frameId) {
		return {
			'position': this.calculatedFrames.position[frameId],
			'rotation': this.calculatedFrames.rotation[frameId]
		}
	}
}
module.exports = BodyPart;