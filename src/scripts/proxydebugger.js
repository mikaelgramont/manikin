let ProxyDebugger = {
	instrumentContext: (original, logName, logger, modifiers) => {
		// The object that all calls will go through
		let proxyObj = {};

		for (let propName in original) {
			if (original[propName] instanceof Function) {
				// Proxying methods.
				proxyObj[propName] = (...args) => {
					let argsForLogging = args;
					if (propName in modifiers) {
						argsForLogging = modifiers[propName](args);
					}
					logger.log(`${logName}.${propName}`, argsForLogging);  
					original[propName].apply(original, args);
				};
			} else {
				// Setters and getters for proxy'ed properties.
				Object.defineProperty(proxyObj, propName, {
					set: function(value) {
					 	original[propName] = value;
						logger.log(`${logName}.${propName} = ${value}`);
					},
					get: function(name)	{
						return original[propName];
					}
				});    
			}
		}
		return proxyObj;
	}
}

module.exports = ProxyDebugger;