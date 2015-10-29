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
{
	// The path to the spritesheet. May be overriden in each child.
	// TEST: must load.
	'spritesheet': '/path/to/spritesheet.png',
	// The number of frames in the animation
	'duration': 20,
	// Whether to loop at the end. Frame rate and loop count are UI settings.
	'looping': 1,
	// An object holding an entry for all parts of the body.
	// TEST: Must be 1-1 match b/w body content and config
	'animations': {
		// The name of the part in the body hierarchy
		'manikin': {
			// source is a rectangle in the spritesheet. Format: (x1, y1, x2, y2)
			// TEST: coordinates must be within image bounds.
			'source': [20, 20, 120, 120],
			// center is an offset from the top left corner, used to nudge the image (and children) a bit.
			'center': [3, 5],
			// A list of kvp's between frame id and rotation (in degrees).
			// TEST: Keyframe ids must be lower than number of frames in animation.
			'rotation': {
				0: 0,
				5: 50,
				15: -50
				// Since there are 20 frames and the anim is looping,
				// we duplicate 0, and use that as frame 21 for calculations,
				// but we drop it from the replay and instead go back to 0.
			}
		}
	}
}