
var Eyes = require('./eyes');
var TemplateRenderer = require('./template-renderer');

var SceneInfo = require('./scene-info');

function NavigationRenderer(worldRenderer) {
  this.setWorld(worldRenderer);
}

NavigationRenderer.prototype = new TemplateRenderer();
NavigationRenderer.prototype.next_ = function(){
  var keys = Object.keys(this.data);
  if(this.current<keys.length-1){
    this.current++;
    this.showCurrent();
  }
};

NavigationRenderer.prototype.prev_ = function(){
  if(this.current>0){
    this.current--;
    this.showCurrent();
  }
};
NavigationRenderer.prototype.showCurrent = function(){
  var current = this.data[Object.keys(this.data)[this.current]];
  var that = this;
  var loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  loader.load(current.image, function(texture){
    var leftTexture = texture.clone();
    var rightTexture = texture.clone();
    rightTexture.wrapS = rightTexture.wrapT = leftTexture.wrapS = leftTexture.wrapT = THREE.RepeatWrapping;
    if (current.is_stereo){
      leftTexture.repeat.set(0.8, 0.4);
      rightTexture.repeat.set(0.8,0.4);
      leftTexture.offset.set(0.05,0.05);
      rightTexture.offset.set(0.05,0.55);
    }else{
      leftTexture.repeat.set(0.8, 0.8);
      rightTexture.repeat.set(0.8, 0.8);
      leftTexture.offset.set(0.1,0.1);
      rightTexture.offset.set(0.1,0.1);
    }
    that.planeLeft.material.map = leftTexture;
    that.planeRight.material.map = rightTexture;
    that.planeLeft.material.needsUpdate=true;
    that.planeRight.material.needsUpdate=true;
    that.planeLeft.material.map.needsUpdate=true;
    that.planeRight.material.map.needsUpdate=true;
  });
};

NavigationRenderer.prototype.createNavigationPlane_ = function() {
  var geometry =  new THREE.PlaneGeometry( 0.2, 0.2, 0.01);
  var material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.9});
  var plane = new THREE.Mesh( geometry, material );
  plane.position.set(0,-0.1,-0.4);
  plane.lookAt(this.worldRenderer.camera.position);
  return plane;
};

NavigationRenderer.prototype.createNavigationButton_ = function() {
  var geometry =  new THREE.CylinderGeometry(0, 0.03, 0.03, 3, 2, false);
  var material = new THREE.MeshPhongMaterial({/*transparent: true, opacity: 0.9,*/ color: 0xb388ff});
  var button = new THREE.Mesh( geometry, material );
 // button.lookAt(this.worldRenderer.camera.position);
  return button;
};

NavigationRenderer.prototype.update_ = function(camera) {
  if (this.worldRenderer.isVRMode()) {
    this.pointer.set(0, 0);
  }
  // Update the picking ray with the camera and mouse position.
  this.raycaster.setFromCamera(this.pointer, camera);	
  
  if(this.update&&typeof this.update == "function")this.update();
  
  var elements = this.worldRenderer.scene.getObjectByName('nav').children;
  
  var intersects = this.raycaster.intersectObjects(elements);
  var isIntersected = (intersects.length > 0);
  
  // If newly selected, emit a focus event.
  if (isIntersected) {
    this.currentElement = intersects[0].object;
  }else{
    this.currentElement = false;
  }
};

NavigationRenderer.prototype.setup = function(data) {
  this.data = data;
  this.planeLeft = this.createNavigationPlane_();
  this.planeRight = this.createNavigationPlane_();
  this.planeLeft.name = "planeLeft";
  this.planeRight.name = "planeRight";
  this.navLeft = this.createNavigationButton_();
  this.navRight = this.createNavigationButton_();
  this.navLeft.name = "navLeft";
  this.navRight.name = "navRight";
  this.navLeft.position.set(-0.1,-0.075,-0.3);
  this.navRight.position.set(0.1,-0.075,-0.3);
  this.navLeft.rotation.set(0,-(Math.PI/4),Math.PI/2);
  this.navRight.rotation.set(0,Math.PI/4,-(Math.PI/2));
  //this.add_(this.navLeft,"navLeft");
  //this.add_(this.navRight,"navRight");
  
  // Display in left and right eye respectively.
  this.planeLeft.layers.set(Eyes.LEFT);
  this.planeLeft.eye = Eyes.LEFT;
  this.planeRight.layers.set(Eyes.RIGHT);
  this.planeRight.eye = Eyes.RIGHT;
  this.worldRenderer.scene.getObjectByName('nav').children = [this.planeLeft, this.planeRight,this.navLeft,this.navRight];
  this.current=0;
  this.showCurrent();
};































NavigationRenderer.prototype.focus = function(id) {
  
};

NavigationRenderer.prototype.blur = function(id) {
  
};

NavigationRenderer.prototype.down = function(id) {
  //alert("this is the click");
  // Become active.
};

NavigationRenderer.prototype.up = function(id) {
  if(this.currentElement&&this.currentElement.name){
    if(this.currentElement.name=="navLeft")this.prev_();
    if(this.currentElement.name=="navRight")this.next_();
    if(this.currentElement.name=="planeLeft"){
      var that = this;
      var data = this.data[Object.keys(this.data)[this.current]];
      this.navLeft.visible = false;
      this.navRight.visible = false; 
      this.planeRight.visible = false; 
      this.planeLeft.visible = false; 
      this.worldRenderer.sphereRenderer.setOpacity(0, 500).then(function() {
        // Then load the new scene.
        var scene = SceneInfo.loadFromAPIParams({
          image: data.image,
          preview: data.preview,
          is_stereo: data.is_stereo,
          is_autopan_off: true
        });
        // Remove all of the hotspots.
        that.worldRenderer.hotspotRenderer.clearAll();
        // Destroy the world
        that.worldRenderer.destroy();
        // Update the URL to reflect the new scene. This is important particularily
        // on iOS where we use a fake fullscreen mode.
        var url = scene.getCurrentUrl();
        //console.log('Updating url to be %s', url);
        window.history.pushState(null, 'VR View', url);
        // And set the new scene.
        return that.worldRenderer.setScene(scene);
      }).then(function() {
        // Then fade the scene back in.
        that.worldRenderer.sphereRenderer.setOpacity(1, 500).then(function(){
          that.navLeft.visible = true;  
          that.navRight.visible = true;  
          that.planeRight.visible = true; 
          that.planeLeft.visible = true; 
        });
      });
    }
  }
  // Become inactive.
};

NavigationRenderer.prototype.setOpacity = function(opacity, duration) {
  
};


NavigationRenderer.prototype.update = function() {
  
  // Fade hotspots out if they are really far from center to avoid overly
  // distorted visuals.
  // this.fadeOffCenterHotspots_(camera);
};

module.exports = NavigationRenderer;