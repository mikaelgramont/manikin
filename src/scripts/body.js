var Body = function(name) {
	this.name = name;
	this.children = {};
};

Body.prototype.addChild = function(child) {
	var childName = child.getName();
	if (this.children[childName]) {
		throw new Exception(`child ${childName} already exists on body ${this.name}`);
	}
	this.children[childName] = child;
	child.setParent(this);
}

module.exports = Body;
