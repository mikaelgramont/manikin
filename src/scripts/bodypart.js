let FrameInfo = require('./frameinfo');

class BodyPart {
	constructor(name) {
		this.parent = null;
		this.name = name;
		this.children = {};
		this.frameInfo = null;
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

	loadFrameInfo(info) {
		this.frameInfo = new FrameInfo(info);
	}

	getFrameInfo() {
		return this.frameInfo;
	}

	getDrawInfoForFrame(frameId) {
		return {
			'position': [0, 0],
			'rotation': 0
		}
	}
}
module.exports = BodyPart;