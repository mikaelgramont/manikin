var test = function() {};

test.log = function(message) {
	console.log(`message=${message}`);
};

module.exports = test;