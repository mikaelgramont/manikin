class CompatibilityTester {
	constructor(bodies, animations) {
		this.bodies = bodies;
		this.animations = animations;

		this.compatibilityLists = {};
	}

	buildCompatibilityLists() {
		this.bodies.forEach((bodyName) => {
			this.compatibilityLists[bodyName] = [];
			this.animations.forEach((animationName) => {
				if (this.isCompatible(bodyName, animationName)) {
					this.compatibilityLists[bodyName].push(animationName);
				}
			});
		});
	}

	isCompatible(bodyName, animationName) {
		let isCompatible = true;
		for (let prop in this.bodies[bodyName]) {
			if (typeof this.animations[animationName][prop] === 'undefined') {
				return false;
			}
		}
		return true;		
	}
}
module.exports = CompatibilityTester;