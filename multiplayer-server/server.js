var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
app.use(express.static(__dirname + '/../'));
app.get('/', function(req, res) {  
	res.sendFile(__dirname + '/../index.html');
});
server.listen(8082);
var rooms = {};
io.sockets.on("connection",function(socket){
	console.log("vr-user connected.");
	var socketId = socket.id;
	socket.on("join-room",function(msg){
		socket.name=msg.me.name;
		socket.room=msg.room;
		var room;
		if(rooms[msg.room]){
			room = rooms[msg.room];
		}else{
			room = rooms[msg.room] = {numberOfPeople:0,sphere:msg.sphere,gallery:msg.gallery,people:{}};
			room.render = setInterval(function(){
				io.to(msg.room).emit('room-render-data',rooms[msg.room]);
			},200);
			console.log("opening room:"+msg.room+" because "+msg.me.name+" was the first to join");
		}
		socket.join(msg.room);
		if(!(rooms[msg.room].people[msg.me.name])){
			rooms[msg.room].numberOfPeople++;
			console.log("add to room:"+msg.room+" "+msg.me.name+" is person "+rooms[msg.room].numberOfPeople+" in that room");
			rooms[msg.room].people[msg.me.name] = {me:msg.me,position:msg.position,quaternion:msg.quaternion,leftHand:msg.leftHand,rightHand:msg.rightHand,socketId:socketId,number:rooms[msg.room].numberOfPeople};
		}
		socket.emit("room-joined",socket.id);
	});
	var leaveRoom = function(msg){
		if(rooms[msg.room]){
			socket.leave(msg.room);
			delete rooms[msg.room].people[msg.me.name];
			rooms[msg.room].numberOfPeople--;
			if(!(Object.keys(rooms[msg.room].people).length)){
				console.log("closing room:"+msg.room+" because "+msg.me.name+" was the last one and he/she left");
				clearInterval(rooms[msg.room].render);
				delete rooms[msg.room];
			}
		}
	};
	socket.on("leave-room",function(msg){
		leaveRoom(msg);
	});
	socket.on("room-render",function(msg){
		if(rooms[msg.room]){
			if(rooms[msg.room].people[msg.me.name]){
				rooms[msg.room].people[msg.me.name] = {me:msg.me,position:msg.position,quaternion:msg.quaternion,leftHand:msg.leftHand,rightHand:msg.rightHand,socketId:socketId,number:rooms[msg.room].people[msg.me.name].number};
			}
		}
	});
	
	socket.on('disconnect', function () {
		if(socket.name&&socket.room){
			leaveRoom({room:socket.room,me:{name:socket.name}});
		}
	});
});
