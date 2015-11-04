class AnimationInfo {
	constructor(animationInfo) {
		// this.source = animationInfo.source;
		this.rotation = animationInfo.rotation;
	}

	getInterpolatedLocalRotation(frameId) {
		return this.rotation[frameId];
	}

	getInterpolatedLocalPosition(frameId) {
		return this.center;
	}
}

module.exports = AnimationInfo;