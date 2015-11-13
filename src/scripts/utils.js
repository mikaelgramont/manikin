let Utils = {
	// From https://gist.github.com/rauschma/1bff02da66472f555c75
	getGlobalObject: function() {
	    // Workers don’t have `window`, only `self`
	    if (typeof self !== 'undefined') {
	        return self;
	    }
	    if (typeof global !== 'undefined') {
	        return global;
	    }
	    // Not all environments allow eval and Function
	    // Use only as a last resort:
	    return new Function('return this')();
	}
};
module.exports = Utils;