var BodyPart = function(name) {
	this.parent = null;
	this.name = name;
	this.children = {};
};

BodyPart.prototype.setParent = function(parent) {
	this.parent = parent;
}

// Look into ES6 setters/getters
BodyPart.prototype.getParent = function() {
	return this.parent;
}

BodyPart.prototype.getName = function() {
	return this.name;
}

BodyPart.prototype.getChildByName = function(name) {
	return this.children[name];
}

BodyPart.prototype.addChild = function(child) {
	var childName = child.getName();
	child.setParent(this);
	if (this.children[childName]) {
		var existing = this.children[childName];
		var parentChain = existing.getParentChainAsString()
		throw new Error(`Cannot add child: '${this.name}' already has a child by the name of '${childName}': ${parentChain}`);
	}
	this.children[childName] = child;
}

BodyPart.prototype.getParentChainAsString = function() {
	var stringParts = [];
	var currentPart = this;
	do {
		stringParts.unshift(currentPart.getName());
	} while (currentPart = currentPart.getParent());

	return stringParts.join(' -> ');
};

module.exports = BodyPart;