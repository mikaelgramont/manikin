let BodyPart = require('./bodypart');

let Body = (name) => {
	this.name = name;
	this.root = new BodyPart('manikin');
}

Body.prototype.init = () => {
	let hips = new BodyPart('hips');
	this.root.addChild(hips);

	let torso = new BodyPart('torso');
	hips.addChild(torso);

	let neck = new BodyPart('neck');
	torso.addChild(neck);

	let head = new BodyPart('head');
	neck.addChild(head);


	let leftArm = new BodyPart('arm-left');
	torso.addChild(leftArm);

	let leftHand = new BodyPart('hand-left');
	leftArm.addChild(leftHand);


	let rightArm = new BodyPart('arm-right');
	torso.addChild(rightArm);

	let rightHand = new BodyPart('hand-right');
	rightArm.addChild(rightHand);


	let leftThigh = new BodyPart('thigh-left');
	hips.addChild(leftThigh);

	let leftLeg = new BodyPart('leg-left');
	leftThigh.addChild(leftLeg);

	let leftFoot = new BodyPart('foot-left');
	leftLeg.addChild(leftFoot);


	let rightThigh = new BodyPart('thigh-right');
	hips.addChild(rightThigh);

	let rightLeg = new BodyPart('leg-right');
	leftThigh.addChild(rightLeg);

	let rightFoot = new BodyPart('foot-right');
	rightLeg.addChild(rightFoot);
}

module.exports = Body;