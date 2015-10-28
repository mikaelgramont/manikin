var BodyPart = require('./bodypart');

var root = new BodyPart('manikin');
var torso = new BodyPart('torso');
root.addChild(torso);

var leftArm = new BodyPart('arm-left');
var rightArm = new BodyPart('arm-right');
torso.addChild(leftArm);
torso.addChild(rightArm);

var rightArm2 = new BodyPart('arm-right');
torso.addChild(rightArm2);

console.log(rightArm.getParentChainAsString());
