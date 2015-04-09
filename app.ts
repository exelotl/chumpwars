///<reference path='defs/node/node.d.ts' />
///<reference path='defs/express/express.d.ts' />
///<reference path='defs/socket.io/socket.io.d.ts' />

import express = require('express');
import http = require('http');
import path = require('path');

import Socket = SocketIO.Socket;

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server); 

app.use(express.static('public')); 

//var seed = Date.now() % 65536;
var seed  = 54655; // this is a cool one :)
console.log('initialised with seed '+seed);

module ClientData {
	var datas: Object = {};
	export function set(client:Socket, data:any):void {
		datas[client.id] = data;
	}
	export function get(client:Socket, key:string):any {
		return datas[client.id];
	}
	export function remove(client:Socket):void {
		delete datas[client.id];
	}
}

io.on('connection', function (client:Socket) {
	
	var locals:any = {};
	ClientData.set(client, locals);
	console.log('new connection from client  '+client.id);
	
	
	client.on('user_info', function (data) {
		locals.name = data.name;
	});
	
	client.on('message', function (text) {
		io.emit('message', locals.name + ': ' + text);
	});
	
	client.on('disconnect', function () {
		ClientData.set(client, undefined);
	});
	
	
	client.emit('message', 'welcome!');
	
	client.emit('start_game', {
		seed: seed
	});
});

server.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Listening at http://%s:%s', host, port); 
});
