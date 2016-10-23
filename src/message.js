/**
 * Messages from the API to the embed.
 */
var Message = {
  PLAY: 'play',
  PAUSE: 'pause',
  ADD_HOTSPOT: 'addhotspot',
  SET_CONTENT: 'setimage',
  SET_VOLUME: 'setvolume',
  DEVICE_MOTION: 'devicemotion',
  SETUP_NAVIGATION: 'navigation',
  ENABLE_MULTIPLAYER_MODE: 'multiplayer-enable',
  JOIN_MULTIPLAYER_ROOM: 'multiplayer-join',
  LEAVE_MULTIPLAYER_ROOM: 'multiplayer-leave',
  SET_MULTIPLAYER_ME: 'multiplayer-me'
};
var Callbacks = {};
for(type in Message){
  Callbacks[Message[type]] = function(){};
}
Message.callbacks = Callbacks;
module.exports = Message;
