
var EventEmitter = require('eventemitter3');


function MultiplayerMode(worldRenderer) {
    this.worldRenderer = worldRenderer;
    this.camera = this.worldRenderer.camera;
}
MultiplayerMode.prototype = new EventEmitter();

MultiplayerMode.prototype.enableMultiplayerMode = function(){
    this.camera = this.worldRenderer.camera;
    this.leapMotion();
    if(this.me){
        var that = this;
        this.socket = io();
        this.socket.on("room-render-data",function(room){
            that.renderMe();
            that.renderRoom(room);
        });
        this.socket.on("room-joined",function(socketId){
            that.socketId = socketId;
        });
    }
};

MultiplayerMode.prototype.joinRoom = function(room){
    if(this.me){
        this.room = room;
        this.socket.emit("join-room",{room:room,me:{name:this.me.me.name,face:this.me.me.face},position:{x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z},quaternion:{w:this.camera.quaternion._w,x:this.camera.quaternion._x,y:this.camera.quaternion._y,z:this.camera.quaternion._z},leftHand:[],rightHand:[]});
    }
};

MultiplayerMode.prototype.leaveRoom = function(room){
    this.socket.emit("leave-room",{room:room,me:{name:this.me.me.name,face:this.me.me.face}});
};

MultiplayerMode.prototype.renderMe = function(){
    this.me = {room:this.room,me:{name:this.me.me.name,face:this.me.me.face},position:{x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z},quaternion:{w:this.camera.quaternion._w,x:this.camera.quaternion._x,y:this.camera.quaternion._y,z:this.camera.quaternion._z},leftHand:this.me.leftHand,rightHand:this.me.rightHand};
    this.socket.emit("room-render",this.me);
};
MultiplayerMode.prototype.update = function(){
    for(var id in MultiplayerMode.prototype.players){
        var player = MultiplayerMode.prototype.players[id];
        player.quaternion.copy(player.person.quaternion);
        //player.rotation.set(-(player.person.rotation.z),player.person.rotation.y,player.person.rotation.x);
    }
};
MultiplayerMode.prototype.players = {};
MultiplayerMode.prototype.renderRoom = function(room){
    var personCount = 0;
    for(var id in room.people){
        personCount++;
        var angle = 360*(room.people[id].number/2);
        if(id!=this.me.me.name){
            var cube;
            var person = room.people[id];
            if(!(this.players[person.me.name])){
                var geometry = new THREE.SphereGeometry( 15, 24, 24 );
                var material = new THREE.MeshPhongMaterial( {color: 0xefefef} );
                geometry.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.2, 0.2 ) );
                cube = new THREE.Group();
                cube.cube = new THREE.Mesh( geometry, material );
                cube.add(cube.cube);
                cube.leftMeshes=[];
                cube.rightMeshes=[];
                cube.originalPosition = {x:100*Math.cos(angle),z:100*Math.sin(angle)};
                cube.position.set(cube.originalPosition.x,0,cube.originalPosition.z);
                cube.person = person;
                this.players[person.me.name] = cube;
                this.worldRenderer.scene.add( cube );
                var loader = new THREE.TextureLoader();
                loader.crossOrigin = 'anonymous';
                loader.load(person.me.face, function(texture){
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    texture.offset.x = 0.75;
                    cube.cube.material.map = texture;
                    texture.needsUpdate=true;
                    cube.cube.material.needsUpdate=true;
                });
            }else{
                this.players[person.me.name].person = person;
                this.renderHands(this.players[person.me.name],person,false);
            }
        }else{
            var originalPosition = {x:100*Math.cos(angle),z:100*Math.sin(angle)};
            this.camera.parent.position.set(originalPosition.x,0,originalPosition.z);
        }
    }
    for(var id in MultiplayerMode.prototype.players){
        if(!(id in room.people)){
            this.worldRenderer.scene.remove( MultiplayerMode.prototype.players[id] );
            delete MultiplayerMode.prototype.players[id];
        }
    }
};

MultiplayerMode.prototype.setMe = function(data){
    this.me = {me:{name:data.name,face:data.face},position:{x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z},quaternion:{w:this.camera.quaternion._w,x:this.camera.quaternion._x,y:this.camera.quaternion._y,z:this.camera.quaternion._z},leftHand:[],rightHand:[]};
};
MultiplayerMode.prototype.renderHands = function(object,frame,isLeap){
    var countBones = 0;
    //var countArms = 0;
    var that = this;
    if(isLeap){
        object.armMeshes.forEach(function(item){object.remove(item);});
        object.boneMeshes.forEach(function(item){object.remove(item);});
        this.me.leftHand=[];
        this.me.rightHand=[];
        frame.hands.forEach(function(hand){
        //for ( var hand of frame.hands ) {
            hand.fingers.forEach(function(finger){
            //for ( var finger of hand.fingers ) {
                finger.bones.forEach(function(bone){
                //for ( var bone of finger.bones ) {
                    //if (  === 0 ) { continue; }
                    bone.center_ = bone.center();
                    bone.matrix_ = bone.matrix();
                    //var boneMesh = object.boneMeshes [ countBones ] || that.addBoneMesh( object.boneMeshes );
                    var boneMesh;
                    if(object.boneMeshes [ countBones ]){
                         boneMesh = object.boneMeshes [ countBones ];
                    }else{
                         boneMesh = that.addBoneMesh( object.boneMeshes );
                         object.add( boneMesh );
                    }
                    that.updateBoneMesh( bone, boneMesh, object, isLeap );
                    that.addHandToMe(hand.type,bone);
                    countBones++;
                });
            });
            //var arm = hand.arm;
            //arm.center_ = arm.center();
            //arm.matrix_ = arm.matrix();
            //var armMesh = object.armMeshes [ countArms++ ] || this.addBoneMesh( object.armMeshes );
            ////this.addHandToMe(hand.type,arm);
            //this.updateBoneMesh( arm, armMesh, object, isLeap );
            //armMesh.scale.set( arm.width / 4, arm.width / 2, arm.length );
        });
    }else{
        object.leftMeshes.forEach(function(item){object.remove(item);});
        object.rightMeshes.forEach(function(item){object.remove(item);});
        frame.leftHand.forEach(function(bone,i){
            var boneMesh;
            if(object.leftMeshes [ i ]){
                 boneMesh = object.leftMeshes [ i ];
            }else{
                 boneMesh = that.addBoneMesh( object.leftMeshes );
                 object.add( boneMesh );
            }
            that.updateBoneMesh( bone, boneMesh, object, isLeap );
        });
        frame.rightHand.forEach(function(bone,i){
             var boneMesh;
            if(object.rightMeshes [ i ]){
                 boneMesh = object.rightMeshes [ i ];
            }else{
                 boneMesh = that.addBoneMesh( object.rightMeshes );
                 object.add( boneMesh );
            }
            that.updateBoneMesh( bone, boneMesh, object, isLeap);
        });
    }
};

MultiplayerMode.prototype.addHandToMe = function( side, bone ) {
    this.me[side+"Hand"].push({center_: bone.center_});
};

MultiplayerMode.prototype.addBoneMesh = function( meshes ) {
    var geometry = new THREE.SphereGeometry( 0.4, 20, 20 );
    var material = new THREE.MeshPhongMaterial( {color: 0xefefef} );
    var mesh = new THREE.Mesh( geometry, material );
    meshes.push( mesh );
    return mesh;
};

MultiplayerMode.prototype.updateBoneMesh = function( bone, mesh, parent, isLeap) {
        if(isLeap){
            mesh.setRotationFromMatrix( new THREE.Matrix4().fromArray( bone.matrix_ ) );
            mesh.quaternion.multiply( new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, 0, Math.PI / 2 ) ) );
           // mesh.scale.set( bone.width/1000, bone.width/1000, bone.length);
            mesh.scale.set( bone.width/4, bone.width/4, bone.length);
            mesh.position.set( bone.center_[0],bone.center_[1],bone.center_[2]);
        }else{
            mesh.scale.set(5,5,5);
            mesh.position.set( bone.center_[0],bone.center_[1],bone.center_[2]);
        }
        parent.add(mesh);
};

MultiplayerMode.prototype.leapMotion = function(){
    var that = this;
    that.camera.armMeshes = [];
	that.camera.boneMeshes = [];
    
    Leap.loop({enableGestures:true,optimizeHMD: true,background: true}, function(frame){
        that.renderHands(that.camera,frame,true);
    }).use('transform', {
        quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.PI * -0.3), 0, Math.PI, 'ZXY')),
        //position: new THREE.Vector3(0, -50,-100),
        scale:0.18
        //scale:100,
        //vr: true,
        //effectiveParent:that.camera
    })
    /*.use('boneHand', {
      // If you already have a scene or want to create it yourself, you can pass it in here
      // Alternatively, you can pass it in whenever you want by doing
      // Leap.loopController.plugins.boneHand.scene = myScene.
        scene: this.worldRenderer.scene,
      // Display the arm
        arm: true
    })*/;
};
module.exports = MultiplayerMode;