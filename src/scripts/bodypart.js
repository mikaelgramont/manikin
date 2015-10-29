let BodyPart = (name) => {
	this.parent = null;
	this.name = name;
	this.children = {};
};

BodyPart.prototype.setParent = (parent) => {
	this.parent = parent;
}

// Look into ES6 setters/getters
BodyPart.prototype.getParent = () => {
	return this.parent;
}

BodyPart.prototype.getName = () => {
	return this.name;
}

BodyPart.prototype.getChildByName = (name) => {
	return this.children[name];
}

BodyPart.prototype.addChild = (child) => {
	let childName = child.getName();
	child.setParent(this);
	if (this.children[childName]) {
		let existing = this.children[childName];
		let parentChain = existing.getParentChainAsString()
		throw new Error(`Cannot add child: '${this.name}' already has a child by the name of '${childName}': ${parentChain}`);
	}
	this.children[childName] = child;
}

BodyPart.prototype.getParentChainAsString = () => {
	let stringParts = [];
	let currentPart = this;
	do {
		stringParts.unshift(currentPart.getName());
	} while (currentPart = currentPart.getParent());

	return stringParts.join(' -> ');
};

module.exports = BodyPart;