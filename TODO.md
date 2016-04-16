# High-level things to build

## Body creator

This will allow to build the tree of body parts.
Maybe use SVG for easy DOM manipulation for things like drag & drop.
Loads individual images for each body part, generates a spritesheet.
Outputs a body.json.

Will need a view to create the tree, and another one for positioning of parts. Need to be able to move parts around, and set the rotation center. Toggles for visibility because front layers might obfuscate back layers.

Steps:

- load an existing file
- create a representation: http://bl.ocks.org/mbostock/4339184
- need to accomodate creation and deletion of children parts, maybe copying too.
- creation of part involves picking an image out of a list (loaded on page load).
- need a new canvas to show parent part with the currently selected part on top
- show a representation of the json file
- sprite creation: https://draeton.github.io/stitches/


## Animation creator

This will load a body.json, and create an animation.json
Render another canvas with a color per body part. Clicking on the real canvas triggers a color lookup in the other one, and with a color-to-part map, we can determine which part is selected.

Animations can emit certain events with data (sound, visual effect) on marked keyframes.

## Animation player

Loads a body.json, an animation.json and one single spritesheet.
Plays one (maybe) looping animation.
Available in an iframe for distribution.
Can export animation into one image file (or a video file via backend - needs to run on node). Files are named manikin-animation-walk-80x64.png, where 80x64 is the size of each cell. Export may need things like optional padding, cropping.

Add possibility to listen to keyframe events to react to them while playing.


# Implementation

The page should list all bodies and the animations they can load (compatibility testing is done on the server).