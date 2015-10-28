var BodyPart = require('./bodypart');

var root = new BodyPart('manikin');

var hips = new BodyPart('hips');
root.addChild(hips);

var torso = new BodyPart('torso');
hips.addChild(torso);

var neck = new BodyPart('neck');
torso.addChild(neck);

var head = new BodyPart('head');
neck.addChild(head);


var leftArm = new BodyPart('arm-left');
torso.addChild(leftArm);

var leftHand = new BodyPart('hand-left');
leftArm.addChild(leftHand);


var rightArm = new BodyPart('arm-right');
torso.addChild(rightArm);

var rightHand = new BodyPart('hand-right');
rightArm.addChild(rightHand);


var leftThigh = new BodyPart('thigh-left');
hips.addChild(leftThigh);

var leftLeg = new BodyPart('leg-left');
leftThigh.addChild(leftLeg);

var leftFoot = new BodyPart('foot-left');
leftLeg.addChild(leftFoot);


var rightThigh = new BodyPart('thigh-right');
hips.addChild(rightThigh);

var rightLeg = new BodyPart('leg-right');
leftThigh.addChild(rightLeg);

var rightFoot = new BodyPart('foot-right');
rightLeg.addChild(rightFoot);







var rightArm2 = new BodyPart('arm-right');
torso.addChild(rightArm2);

console.log(rightArm.getParentChainAsString());
