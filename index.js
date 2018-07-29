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
const port = process.env.PORT || 8082;
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
  else if(reqBase=="/getMac")
  {
    var farmid = req.query.farmid;
    pg.connect(connectionString, function(err, client, done) {
      client.query("SELECT * from mac where farmid = "+farmid, function(err, result) {
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
    app.post("/addMac",function(req,res){
      var mac = (req.body.mac);
      var farmid = (req.body.farmid);
      var label = (req.body.label);
      var ack = (req.body.ack);
      pg.connect(connectionString, function(err, client, done) {
        var query = "insert into mac (farmid,mac,label) values ('"+farmid+"','"+mac+"','"+label+"') RETURNING farmid ";
        client.query(query, function(err, result) {
           done();
           if(err){
            var Farm = new farm();
            Farm.mac=mac;
            Farm.status=0;
            Farm.error=err;
   

            res.end(JSON.stringify(Farm));
          return console.error(err);

           }
           else
           {
            var Farm = new farm();
            Farm.mac=mac;
            Farm.status=1;
            Farm.error=0;
            Farm.ack = ack;
            Farm.id=result.rows[0].farmid;

            res.end(JSON.stringify(Farm));
           }

          
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
  io.to(socket.id).emit("registerAck",socket.id);
});
socket.on("disconnect",function(data)
{
  console.log("Connection disconnected");
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
  sendtoUser(decode.mac,data);

  //socket.broadcast.emit("sensedData",data);
});
});

function sendtoUser(mac,sensedData)
{
function forwardtoclient()
{

}
  pg.connect(connectionString, function(err, client, done) {
    var q = "select farmerid,id as farmid from farm where id = ( select farmid from mac where mac = '"+mac+"');";
    client.query(q, function(err, result) {
       done();
       if(err) return console.error(err);

       if((result.rows).length>0)
       {
        //Finding getting the socketid of user 
        var frwrd = new forwardtoclient();
        var farmerid = result.rows[0].farmerid;
        var farmid = result.rows[0].farmid;
        frwrd.farmerid = farmerid;
        frwrd.sensedData = (sensedData);
        frwrd.farmid = farmid;

        var i = 0;
        while(i<users.length)
        {
          if(users[i].userid==farmerid)
          {
           // console.log("Date To : "+JSON.stringify(frwrd));
            io.to(users[i].socketid).emit("sensedData",JSON.stringify(frwrd));
          }
          i++;
        }
       }
       //res.end(JSON.stringify(result.rows));
    });
 });
}