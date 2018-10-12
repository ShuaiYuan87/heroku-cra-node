// var tls = require('tls');
var fs = require('fs');
var express = require('express')();
var https = require('https');
var options = {
  key: fs.readFileSync('file.pem'),
  cert: fs.readFileSync('file.crt'),
  requestCert: false,
  rejectUnauthorized: false
};

// var app = require('https').createServer(options, express)
// var io = require('socket.io').listen(app)
// , url = require('url')
var app = https.createServer(options, express);
var io = require('socket.io').listen(app)
var msg = require('./lib/msg.js');
var state = require('./lib/player_state.js');
var action = require('./lib/player_action.js');

var last_player_time; //in seconds
var last_server_time;
var latency = {};
var current_state = state.PAUSED;
var users = [];

var port = 8989;
process.argv.forEach(function (val, index, array) {
  if (index == 2) {
    port = parseInt(val, 10);
  }
});

console.error('Start listening at port: ' + port.toString());
app.listen(port);

last_player_time = 0;

last_server_time = Date.now();

var owner_map = {};

var videoUrlByRoomID = {};

function sendMessage(message, room, type, owner_only) {

    var msg_id = Math.floor(Math.random() * 10000);
    message.msgID = msg_id;

    var msg_str = JSON.stringify(message);

    if (message.playerAction == action.SEEK) {
        console.error("=====================");
    }
    console.error('sending message ' + msg_str + 'to ' + room);
    owner_only = typeof owner_only !== 'undefined' ? owner_only : false;
    if (owner_only) {
        owner_map[room].emit(type, {'message': msg_str});
        console.error(room);
        console.error('owner_only');
    }
    else {
        io.sockets.in(room).emit(type, {'message': msg_str});
    }
}
function sleepFor( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
}
io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('create', function (room) {
        if (!(room in owner_map)) {
            console.error('new ' + room);
            owner_map[room] = socket;
        }
        else {
            console.error('join ' + room);
            var message = {
                videoId : videoUrlByRoomID[room],
            };
            sendMessage(message, room, 'check_state', true);
        }

        socket.join(room);
        socket.room = room;
        console.log('socket joining ' + room);
    });

    socket.on('postData', function (data) {
        console.error('received message ' + data);
        var data = JSON.parse(data);
        // Too much POST data, kill the connection!
        if (data.length > 1e6)
            request.connection.destroy();
        var msgType = data.msgType;
        // if the message is to request
        if (msgType == msg.MsgType.REQUEST) {
            data.msgType = msg.MsgType.ACTION;
            console.log(socket.room);
            sendMessage(data, socket.room, 'notification');
        }
        // ack latency check
        else if (msgType == msg.MsgType.ACK) {
            latency[data.clientId] = (Date.now()-data.timestamp)/2;
        }
    });
    socket.on('reload', function (data) {
        console.error('received reload message ' + data);
        var data = JSON.parse(data);
        // Too much POST data, kill the connection!
        if (data.length > 1e6)
            request.connection.destroy();
        videoUrlByRoomID[socket.room] = data.videoId;
        console.log('reload' + data.videoId);
        sendMessage(data, socket.room, 'reload');
    });
    socket.on('init', function (data) {
        console.error('received init message ' + data);
        var data = JSON.parse(data);
        // Too much POST data, kill the connection!
        if (data.length > 1e6)
            request.connection.destroy();
        sendMessage(data, socket.room, 'init');
    });
    socket.on('disconnect', function(){
        console.log('socket leaving ' + socket.room);
        socket.leave(socket.room);
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    socket.on('login', function(nickname) {
        console.error('received nickname message ' + nickname);
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });

    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});

/*setInterval(function checkLatency() {
    var message = {
        msgType: msg.MsgType.CHECK_LATENCY,
        timestamp: Date.now()
    };
 //   sendMessage(message);
}, 300000);*/
