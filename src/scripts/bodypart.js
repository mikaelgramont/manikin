let AnimationInfo = require('./animationInfo');

class BodyPart {
	constructor(name, size, relativePosition, centerOffset, color, sprite) {
		this.name = name;
		// Dimensions of the body part.
		this.size = size;

		// Vector going from parent to this part.
		this.relativePosition = relativePosition;

		// Offset to allow parts to rotate around the joints.
		this.centerOffset = centerOffset;

		this.color = color;
		
		if (sprite) {
			let img = document.createElement('img');
			img.src = sprite;
			img.addEventListener('load', (e) => {
				console.log('image loaded', e);
			})
			document.getElementById('images').appendChild(img);
			this.sprite = img;		
		} else {
			this.sprite = null;
		}

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
		this.animationInfo = new AnimationInfo(animationInfo);
	}

	getCalculatedFrames() {
		return this.calculatedFrames;
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
		return {
			'position': this.calculatedFrames.position[frameId],
			'rotation': this.calculatedFrames.rotation[frameId]
		}
	}
}
module.exports = BodyPart;