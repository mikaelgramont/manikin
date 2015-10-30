let Body = require('./body');

let appConfig = window.appConfig;

let manikin = new Body(appConfig.bodyName);
manikin.loadAnimation(appConfig.animation);

manikin.forEachPart((part, name) => {
	console.log(`Part '${name}'`, part, part.getFrameInfo());
});
