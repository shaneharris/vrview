
var EventEmitter = require('eventemitter3');


function TemplateRenderer() {
}
TemplateRenderer.prototype = new EventEmitter();

TemplateRenderer.prototype.setWorld = function(worldRenderer){
  
  this.worldRenderer = worldRenderer;
  // Note: this event must be added to document.body and not to window for it to
  // work inside iOS iframes.
  var body = document.body;
  // Bind events for hotspot interaction.
  if (!Util.isMobile()) {
    // Only enable mouse events on desktop.
    body.addEventListener('mousedown', this.onMouseDown_.bind(this), false);
    body.addEventListener('mousemove', this.onMouseMove_.bind(this), false);
    body.addEventListener('mouseup', this.onMouseUp_.bind(this), false);
  }
  body.addEventListener('touchstart', this.onTouchStart_.bind(this), false);
  body.addEventListener('touchend', this.onTouchEnd_.bind(this), false);

  // Add a placeholder for hotspots.
  this.root = new THREE.Group();
  // Align the center with the center of the camera too.
  this.root.rotation.y = Math.PI / 2;
  this.worldRenderer.scene.add(this.root);

  // All element IDs.
  this.elements = {};

  // Currently selected elements.
  this.selectedElements = {};

  // Elements that the last touchstart / mousedown event happened for.
  this.downElements = {};

  // For raycasting. Initialize mouse to be off screen initially.
  this.pointer = new THREE.Vector2(1, 1);
  this.raycaster = new THREE.Raycaster();
  // TODO: Tween this animation.
  this.setVisibility(false);
}

TemplateRenderer.prototype.setVisibility = function(isVisible) {
  this.root.visible = isVisible;
};

TemplateRenderer.prototype.onTouchStart_ = function(e) {
  // In VR mode, don't touch the pointer position.
  if (!this.worldRenderer.isVRMode()) {
    this.updateTouch_(e);
  }

  // Force a camera update to see if any hotspots were selected.
  this.update(this.worldRenderer.camera);

  this.downElements = {};
  for (var id in this.selectedHotspots) {
    this.downElements[id] = true;
    if(this.down&&typeof this.down == "function")this.down(id);
  }
  return false;
};

TemplateRenderer.prototype.onTouchEnd_ = function(e) {
  // If no hotspots are pressed, emit an empty click event.
  
    if(this.up&&typeof this.up == "function")this.up();
};

TemplateRenderer.prototype.updateTouch_ = function(e) {
  var size = this.worldRenderer.renderer.getSize();
  var touch = e.touches[0];
	this.pointer.x = (touch.clientX / size.width) * 2 - 1;
	this.pointer.y = - (touch.clientY / size.height) * 2 + 1;	
};

TemplateRenderer.prototype.onMouseDown_ = function(e) {
  this.updateMouse_(e);
  if(this.down&&typeof this.down == "function")this.down();
};

TemplateRenderer.prototype.onMouseMove_ = function(e) {
  this.updateMouse_(e);
};

TemplateRenderer.prototype.onMouseUp_ = function(e) {
  this.updateMouse_(e);
  if(this.up&&typeof this.up == "function")this.up();
};

TemplateRenderer.prototype.updateMouse_ = function(e) {
  var size = this.worldRenderer.renderer.getSize();
	this.pointer.x = (e.clientX / size.width) * 2 - 1;
	this.pointer.y = - (e.clientY / size.height) * 2 + 1;	
};

TemplateRenderer.prototype.add_ = function(element, id/*, image, is_stereo*/) {
    // If a hotspot already exists with this ID, stop.
    if (this.elements[id]) {
      // TODO: Proper error reporting.
      console.error('Attempt to add element with existing id %s.', id);
      return;
    }
    if(element){
        element.name = id;
        this.root.add(element);
        this.elements[id] = element;
    }
};


TemplateRenderer.prototype.remove = function(id) {
  // If there's no hotspot with this ID, fail.
  if (!this.elements[id]) { 
    // TODO: Proper error reporting.
    console.error('Attempt to remove non-existing hotspot with id %s.', id);
    return;
  }
  // Remove the mesh from the scene.
  this.root.remove(this.elements[id]);

  // If this hotspot was selected, make sure it gets unselected.
  delete this.selectedElements[id];
  delete this.downElements[id];
  delete this.elements[id];
  this.emit('blur', id);
};

/**
 * Clears all hotspots from the pano. Often called when changing panos.
 */
TemplateRenderer.prototype.clearAll = function() {
  for (var id in this.elements) {
    this.remove(id);
  }
};

TemplateRenderer.prototype.getCount = function() {
  var count = 0;
  for (var id in this.elements) {
    count += 1;
  }
  return count;
};

module.exports = TemplateRenderer;