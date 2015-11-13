class AnimationInfo {
	constructor(animationInfo, duration, parentPart) {
		this.duration = duration;
		this.rotation = animationInfo.rotation;
		this.position = animationInfo.position;
		this.parentPart = parentPart;
	}

	getInterpolatedLocalPosition(frameId) {
		return this.getInterpolatedLocalProperty_('position', frameId, [0, 0]);
	}

	getInterpolatedLocalRotation(frameId) {
		return this.getInterpolatedLocalProperty_('rotation', frameId, 0);
	}

	getInterpolatedLocalProperty_(property, frameId, defaultValue) {
		if (frameId < 0) {
			throw new Error("Negative frameId not allowed.");
		}

		if (typeof this[property] === 'undefined') {
			// Allow animations to skip properties.
			return defaultValue;
		}

		if (typeof this[property][frameId] !== 'undefined') {
			return this[property][frameId];
		}

		// 1. Find the previous keyframe.
		let previousId = frameId;
		let previousKeyFrameValue = this[property][previousId];
		while (typeof previousKeyFrameValue == 'undefined' && previousId > 0) {
			previousId--;
			previousKeyFrameValue = this[property][previousId];
		} 

		// 2. Find the next keyframe.
		let nextId = frameId + 1;
		let nextKeyFrameValue = this[property][nextId];
		while (typeof nextKeyFrameValue == 'undefined') {
			nextId++;

			if (nextId >= this.duration - 1) {
				nextId = 0;
				nextKeyFrameValue = this[property][nextId];
				break;
			}

			nextKeyFrameValue = this[property][nextId];
		} 

		// 3. Return the interpolated value.
		let ratio;
		if (nextId === 0) {
			ratio = (frameId - previousId) / (this.duration - previousId);
		} else {
			ratio = (frameId - previousId) / (nextId - previousId);
		}
		if (Array.isArray(nextKeyFrameValue)) {
			return [
				previousKeyFrameValue[0] + ratio * (nextKeyFrameValue[0] - previousKeyFrameValue[0]),
				previousKeyFrameValue[1] + ratio * (nextKeyFrameValue[1] - previousKeyFrameValue[1])
			];
		} else {
			return previousKeyFrameValue + ratio * (nextKeyFrameValue - previousKeyFrameValue);		
		}
	}
}

module.exports = AnimationInfo;