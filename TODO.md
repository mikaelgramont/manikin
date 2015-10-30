- How to pass data between parent page (index.html) and a Babel-compiled ES6 bundle?


Use http://www.pixijs.com/

ES6 compilation resources:

- https://gist.github.com/danharper/3ca2273125f500429945
- https://github.com/ampproject/amphtml/blob/master/gulpfile.js

Animation setup
- center is set once and for all
- rotations are defined once per frame.
- frames are interpolated between keyframes.


for each frame:
- interpolate rotation values from the last keyframe before using them
- from root, BFS over all children (including root) and for each child:
	- calculate child pos and rotation based on parent and child settings in the current frame
=> We end up with calculations for each frame, nothing stored. Image rotations can be baked before running the animation (like K&P). They can be stored on separate canvases in order to give the user a chance to redraw them. This wil complicate things a lot because we need to store an array of images instead of one that we rotate on the fly.


each part needs to be have:
- an image
- an offset from the parent

animation config (json):
rotation about a point:
	If you rotate point (px, py) around point (ox, oy) by angle theta you'll get:
	p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
	p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy

	let r = parent.rotation;
	let pp = parent.rotation;
	let cp = child.position;
	child.position.x = Math.cos(r) * (cp.x - pp.x) - Math.sin(r) * (cp.y - pp.y) + pp.x;
	child.position.y = Math.sin(r) * (cp.x - pp.x) + Math.cos(r) * (cp.y - pp.y) + pp.y;


