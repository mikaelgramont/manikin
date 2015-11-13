let Grid = {
	drawGrid: function(ctx, logger) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		logger.groupCollapsed('Drawing grid');
		for (let i = 0; i <= 200; i += 10) {
			let strokeStyle = '#000000';
			if (i == 100) {
				strokeStyle = '#ff0000';
			}
			ctx.strokeStyle = strokeStyle;
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(200,i);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, 200);
			ctx.stroke();
		}
		logger.groupEnd('Drawing grid');
	},
};

module.exports = Grid;