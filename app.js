var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');

const id = Math.round((Math.random() * 1000000));

app.use('/', express.static(__dirname + '/public'));

var usernames = {};
var pairCount = 0, clientsno, pgmstart=0,varCounter;
var scores = {};

server.listen(4444);
console.log("Listening to 4444")
console.log("Connection Established !")

//Route
app.get('/',function (req,res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	console.log("New Client Arrived!");

	socket.on('addClient', function(username){
		if(username in usernames) {
			username = username + '_'
		}
		socket.username = username;
		scores[socket.username] = 0;
		varCounter = 0
		//var id = Math.round((Math.random() * 1000000));
		if(username != 'startquiz'){
			socket.join(id);
			usernames[username] = username;
			socket.room = id;
		} else {
        	pgmstart = 2;
    	}
		
		console.log(username + " joined to "+ id);

		socket.emit('updatechat', 'SERVER', 'You are connected! <br> Waiting for other player to connect...',id);
		
		socket.broadcast.to(id).emit('updatechat', 'SERVER', username + ' has joined to this game !',id);

		
		if(pgmstart ==2){
			fs.readFile(__dirname + "/lib/questions.json", "Utf-8", function(err, data){
				jsoncontent = JSON.parse(data);
				io.sockets.in(id).emit('sendQuestions',jsoncontent);
				io.sockets.in(id).emit('users', usernames)
				
			});
		console.log("Player2");
			//io.sockets.in(id).emit('game', "haaaaai");
		} else {
			console.log("Player1");

		}  
});

	socket.on('result', function (usr, rst) {
				console.log(usr, rst)
				io.sockets.in(rst).emit('viewresult', usr);	
	});



	
	
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		//io.sockets.in(id).emit('updatechat', 'SERVER', socket.username + ' has disconnected',id);
		socket.leave(socket.room);
	});
});


