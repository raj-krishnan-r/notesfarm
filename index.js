var app = require('express')();
var server = require('http').Server(app);
var url = require('url');
var io = require('socket.io')(server);
var fs = require('fs');
var process = require('process');
var pg = require('pg');
var mime = require('mime');
var connectionString = "postgres://raj:dbase001@localhost/farm";
var bodyParser = require('body-parser');
const express = require('express');
var moment = require('moment');
app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

var host = process.env.HOST | "0.0.0.0";


//userstack
var users = new Array();

//User object
function user(socketid,userid)
{
  this.socketid=socketid;
  this.userid=userid;
}


moment().format();
moment().utcOffset("+05:30");




//Message object
function message(data,targetid) {
 
/*
var dated = new Date();
var hour = dated.getHours();
var min = dated.getMinutes();

var formattedTime = hour+":"+min;
	this.data = data,
	this.serverTimed = serverTime,
  this.ftime = formatted,
  this.targetid=targetid
*/

}
function farm()
{
  
}
const port = process.env.PORT || 8081;
console.log("port assigned : "+port);
server.listen(port);
app.get("*",function(req,res){
var reqBase = url.parse(req.url).pathname;
console.log("getting contents of "+reqBase);
  if(reqBase=="/")
  {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      else
      {
        res.writeHead(200);
        res.render(reqBase,{weather: "weatherText", error: null},function(data,err){
          res.end(data);
        });
      }
    });
  }
  else if(reqBase=="/home")
  {
    res.render("profile",{datum:"Raj Krishnan ",userid:"1"});
  }
  else if(reqBase=="/data")
  {
    pg.connect(connectionString, function(err, client, done) {
      client.query("SELECT * from farm", function(err, result) {
         done();
         if(err) return console.error(err);
         res.end(JSON.stringify(result.rows));
      });
   });
  }
  else
  {
    fs.readFile(__dirname + reqBase,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading '+reqBase);
      }
    else
    {
      res.writeHead(200);
      //res.contentType(mime.lookup(__dirname+reqBase));
        res.end(data);
    }
    });
      }
    });

    app.post("/createUser",function(req,res){
      var title = (req.body.title);
      var desc = (req.body.description);
      pg.connect(connectionString, function(err, client, done) {
        var query = "insert into farm (title,farmerid,description) values ('"+title+"',"+1+",'"+desc+"') RETURNING id";
        client.query(query, function(err, result) {
           done();
           if(err) return console.error(err);
           var Farm = new farm();
           Farm.title=title;
           Farm.description = desc;
           Farm.id=result.rows[0].id;
           Farm.farmerid=1;
           res.end(JSON.stringify(Farm));
        });
     });

    });

io.on('connection', function (socket) {
//Activities to do on socket connection
socket.on("register",function(data){
  var usr = new user();
  console.log("Client Registered");
  usr.userid=data;
  usr.socketid=socket.id;
  users.push(usr);
  console.log("Users list size : "+users.length);

});
socket.on("disconnect",function(data)
{
  console.log("Connection Disconnected");
  var i =0;
  while(i<users.length)
  {
    if(users[i].socketid==socket.id)
    {
      users.splice(i,1);
    }
    i++;
  }
  console.log("Users list size : "+users.length);
});

socket.on("sensedData",function(data){
  
  var decode = JSON.parse(data);
  macLookup(decode.mac);

  //socket.broadcast.emit("sensedData",data);
});
});

function macLookup(mac)
{

  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT * from mac where mac = '"+mac+"'", function(err, result) {
       done();
       if(err) return console.error(err);

       if((result.rows).length>0)
       {
  
       }
       //res.end(JSON.stringify(result.rows));
    });
 });
}