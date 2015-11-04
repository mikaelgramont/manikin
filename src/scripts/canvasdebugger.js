let CanvasDebugger = {
	instrumentContext: (ctx) => {
		// Substitute the original object with our proxy,
		// We'll return the proxy at the end of the function.
		let _ctx = ctx;
		ctx = {};
		
		let propWhitelist = ['fillStyle'];
		propWhitelist.forEach((propName) => {
			Object.defineProperty(ctx, propName, {
				set: function(value) {
				 	_ctx[propName] = value;
					console.log(`ctx.${propName} = ${value}`);
				}		  
			});    
		});

		let fnWhitelist = [
			'save', 'restore', 'translate',	'rotate', 'fillRect'];
		fnWhitelist.forEach((fnName) => {
			ctx[fnName] = (...args) => {
			  console.log('ctx.' + fnName, args);  
			  _ctx[fnName].apply(_ctx, args);
			};
		});
		return ctx;
	}
}

module.exports = CanvasDebugger;