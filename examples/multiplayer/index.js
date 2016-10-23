var vrView;
var imageBase = '/examples/gallery/';

// All the scenes for the experience
var scenes = {
  petra: {
    image: imageBase + 'petra.jpg',
    preview: imageBase + 'petra-preview.jpg',
    is_stereo: false
  },
  christTheRedeemer: {
    image: imageBase + 'christ-redeemer.jpg',
    preview: imageBase + 'christ-redeemer-preview.jpg',
    is_stereo: false
  },
  machuPicchu: {
    image: imageBase + 'machu-picchu.jpg',
    preview: imageBase + 'machu-picchu-preview.jpg',
    is_stereo: false
  },
  chichenItza: {
    image: imageBase + 'chichen-itza.jpg',
    preview: imageBase + 'chichen-itza-preview.jpg',
    is_stereo: false
  },
  tajMahal: {
    image: imageBase + 'taj-mahal.jpg',
    preview: imageBase + 'taj-mahal-preview.jpg',
    is_stereo: false
  },
  whale_right: {
    image: imageBase + 'whale-right.jpg',
    preview: imageBase + 'whale-right-preview.jpg',
    is_stereo: true
  },
  dolphins: {
    image: imageBase + 'dolphins.jpg',
    preview: imageBase + 'dolphins-preview.jpg',
    is_stereo: true
  },
};

function onLoad() {
  vrView = new VRView.Player('#vrview', {
    width: '100%',
    height: 480,
    image: 'examples/gallery/blank.png',
    is_stereo: false,
    is_autopan_off: true
  });

  vrView.on('ready', onVRViewReady);
  vrView.on('modechange', onModeChange);
  vrView.on('error', onVRViewError);
}

function loadScene(id) {
  console.log('loadScene', id);

  // Set the image
  vrView.setContent({
    image: scenes[id].image,
    preview: scenes[id].preview,
    is_stereo: scenes[id].is_stereo,
    is_autopan_off: true
  });

  // Unhighlight carousel items
  var carouselLinks = document.querySelectorAll('ul.carousel li a');
  for (var i = 0; i < carouselLinks.length; i++) {
    carouselLinks[i].classList.remove('current');
  }

  // Highlight current carousel item
  document.querySelector('ul.carousel li a[href="#' + id + '"]')
      .classList.add('current');
}

function onVRViewReady(e) {
  console.log('onVRViewReady');

  vrView.setupNavigation(scenes);
  
  document.getElementById("submit").onclick = function(){
    vrView.setMultiplayerMe({name:document.getElementById("name").value,face:"examples/multiplayer/"+document.getElementById("name").value+".png"});
    vrView.enableMultiplayer();
    vrView.joinMultiplayerRoom("test-room");
  };
  console.log("multiplayer setup");
  // Create the carousel links
  var carouselItems = document.querySelectorAll('ul.carousel li a');
  for (var i = 0; i < carouselItems.length; i++) {
    var item = carouselItems[i];
    item.disabled = false;

    item.addEventListener('click', function(event) {
      event.preventDefault();
      loadScene(event.target.parentNode.getAttribute('href').substring(1));
    });
  }

  loadScene('petra');
}

function onModeChange(e) {
  console.log('onModeChange', e.mode);
}

function onVRViewError(e) {
  console.log('Error! %s', e.message);
}

window.addEventListener('load', onLoad);
