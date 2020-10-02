const express= require('express');
const app=express();

//Connecting server file for AWT
let server = require('./server');
let middleware = require('./middleware');

//bodyparser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;

//DATABASE CONNECTION
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalManagement';
let db
MongoClient.connect(url, { useUnifiedTopology: true}, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

//FETCHING HOSPITAL DETAILS
app.get('/Hospital_Details', middleware.checkToken, function(req, res) {
    console.log("Fetching data from Hospital collection");
    var data = db.collection('Hospital_Details').find().toArray()
    .then(result => res.json(result));

});

//VENTILATORS DETAILS
app.get('/Ventilator_Details', middleware.checkToken, (req, res) => {
    console.log("Ventilators Information");
    var Ventilator_Details = db.collection('Ventilator_Details').find().toArray()
    .then(result => res.json(result));
});

//SEARCH VENTILATORS BY STATUS
app.post('/searchventbystatus', middleware.checkToken, (req, res) => {
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('Ventilator_Details')
    .find({"status": status}).toArray().then(result=>res.json(result));
});

//SEARCH VENTILATORS BY HOSPITAL NAME
app.post('/searchventbyname', middleware.checkToken, function(req, res) {
    var name=req.query.name;
    console.log(name);
    var Ventilator_Details=db.collection('Ventilator_Details')
    .find({"name": new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

//UPDATE VENTILATOR DETAILS
app.put('/updateventilator', middleware.checkToken, (req, res) => {
    var ventid={ vid: req.body.vid};
    console.log(ventid);
    var newvalues={ $set: {
        status: req.body.status}
    };
    db.collection("Ventilator_Details").updateOne(ventid, newvalues, function(err, result){
        res.json("1 document updated");
        if(err) throw err;
    });
});

//ADD VENTILATOR
app.post('/addventilatorbyuser', middleware.checkToken, (req, res) => {
    var hid=req.body.hid;
    var vid=req.body.vid;
    var status=req.body.status;
    var name=req.body.name;

    var item=
    {
        hid:hid, vid:vid, status:status, name:name
    };
    db.collection('Ventilator_Details').insertOne(item, function(err, result){
        res.json("Item inserted");
    });
});

//DELETE VENTILATOR BY VENTILATORID
app.delete('/deleteventbyid', middleware.checkToken, (req, res) => {
    var myquery = req.query.vid;
    console.log(myquery);

    var myquery1 = { vid: myquery };
    db.collection('Ventilator_Details').deleteOne(myquery1, function(err, obj){
        if(err) throw err;
        res.json("1 document deleted");
    });
});
app.listen(1100);
