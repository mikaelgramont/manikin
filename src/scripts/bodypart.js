let AnimationInfo = require('./animationInfo');

class BodyPart {
	constructor(name, size, relativePosition, color) {
		this.name = name;
		// Dimensions of the body part.
		this.size = size;

		// Vector going from parent to this part.
		this.relativePosition = relativePosition;

		this.color = color;
		
		this.parent = null;
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
			let	rotation;
			let absolutePosition;

			let localRotation = this.animationInfo.getInterpolatedLocalRotation(f);
			let relativePosition = this.relativePosition;

			let parentPart = this.getParent();
			if (parentPart) {
				let parentCalculatedFrames = parentPart.getCalculatedFrames();
				rotation = localRotation + parentCalculatedFrames[f].rotation;
				let angleRad = rotation * Math.PI / 180;

				// TODO: implement real calculations here.
				let parentPosition = parentCalculatedFrames[f].absolutePosition;
				// let newX = Math.cos(angleRad) * (relativePosition[0] - parentPosition[0]) - Math.sin(angleRad) * (relativePosition[1] - parentPosition[1]) + parentPosition[0];
				// let newY = Math.sin(angleRad) * (relativePosition[0] - parentPosition[0]) + Math.cos(angleRad) * (relativePosition[1] - parentPosition[1]) + parentPosition[1];
				let newX = relativePosition[0] + parentPosition[0];
				let newY = relativePosition[1] + parentPosition[1];
				absolutePosition = [newX | 0, newY | 0];

			} else {
				rotation = localRotation;
				absolutePosition = relativePosition;
			}

			this.calculatedFrames[f] = {
				'absolutePosition': absolutePosition,
				'rotation': rotation
			};
		}
	}

	getDrawInfoForFrame(frameId) {
		return {
			'absolutePosition': this.calculatedFrames.absolutePosition[frameId],
			'rotation': this.calculatedFrames.rotation[frameId]
		}
	}
}
module.exports = BodyPart;