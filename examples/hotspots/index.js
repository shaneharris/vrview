var vrView;
var imageBase = 'examples/hotspots/';

// All the scenes for the experience
var scenes = {
  dolphins: {
    image: imageBase + 'dolphins.jpg',
    preview: imageBase + 'dolphins-preview.jpg',
    is_stereo:true,
    hotspots: {
      whaleRight: {
        pitch: 0,
        yaw: 110,
        radius: 0.05,
        distance: 2
      },
      whaleLeft: {
        pitch: 0,
        yaw: 150,
        radius: 0.05,
        distance: 2
      },
      walrus: {
        pitch: 0,
        yaw: 170,
        radius: 0.05,
        distance: 2
      }
    }
  },
  whaleLeft: {
    image: imageBase + 'whale-left.jpg',
    preview: imageBase + 'whale-left-preview.jpg',
    is_stereo:true,
    hotspots: {
      whaleRight: {
        pitch: 0,
        yaw: 125,
        radius: 0.05,
        distance: 2
      },
      dolphins: {
        pitch: 0,
        yaw: 110,
        radius: 0.05,
        distance: 2
      },
      walrus: {
        pitch: 0,
        yaw: 30,
        radius: 0.05,
        distance: 2
      }
    }
  },
  whaleRight: {
    image: imageBase + 'whale-right.jpg',
    preview: imageBase + 'whale-right-preview.jpg',
    is_stereo:true,
    hotspots: {
      dolphins: {
        pitch: 0,
        yaw: 305,
        radius: 0.05,
        distance: 2
      },
      whaleLeft: {
        pitch: 0,
        yaw: 180,
        radius: 0.05,
        distance: 2
      },
      walrus: {
        pitch: 0,
        yaw: 210,
        radius: 0.05,
        distance: 2
      }
    }
  },
  walrus: {
    image: imageBase + 'walrus.jpg',
    preview: imageBase + 'walrus-preview.jpg',
    is_stereo:true,
    hotspots: {
      whaleLeft: {
        pitch: 0,
        yaw: 20,
        radius: 0.05,
        distance: 2
      },
      whaleRight: {
        pitch: 0,
        yaw: 340,
        radius: 0.05,
        distance: 2
      },
      dolphins: {
        pitch: 0,
        yaw: 320,
        radius: 0.05,
        distance: 2
      }
    }
  }
};

function onLoad() {
  vrView = new VRView.Player('#vrview', {
    image: imageBase + 'blank.png',
    preview: imageBase + 'blank.png',
    is_stereo: true,
    is_autopan_off: true
  });

  vrView.on('ready', onVRViewReady);
  vrView.on('modechange', onModeChange);
  vrView.on('click', onHotspotClick);
  vrView.on('error', onVRViewError);
}

function onVRViewReady(e) {
  console.log('onVRViewReady');
  loadScene('walrus');
}

function onModeChange(e) {
  console.log('onModeChange', e.mode);
}

function onHotspotClick(e) {
  console.log('onHotspotClick', e.id);
  loadScene(e.id);
}

function loadScene(id) {
  console.log('loadScene', id);

  // Set the image
  vrView.setContent({
    image: scenes[id].image,
    preview: scenes[id].preview,
    is_stereo: scenes[id].is_stereo,
    is_autopan_off: true
  },function(){
    // Add all the hotspots for the scene
    var newScene = scenes[id];
    var sceneHotspots = Object.keys(newScene.hotspots);
    for (var i = 0; i < sceneHotspots.length; i++) {
      var hotspotKey = sceneHotspots[i];
      var hotspot = newScene.hotspots[hotspotKey];
  
      vrView.addHotspot({
        id:hotspotKey,
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        radius: hotspot.radius,
        distance: hotspot.distance,
        image:scenes[hotspotKey].preview,
        is_stereo:scenes[hotspotKey].is_stereo
      });
    }
  });

  
}

function onVRViewError(e) {
  console.log('Error! %s', e.message);
}

window.addEventListener('load', onLoad);
