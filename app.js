const express = require('express')
const hbs = require('hbs');
const session = require("express-session");
var bodyParser = require('body-parser');
var path = require('path');

var MongoClient = require('mongodb').MongoClient

const app = express();
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname +'/views/partials')
app.use(express.static(__dirname + '/public'))


var url = "mongodb+srv://bach:tuantai12345@cluster0.0hpdy.mongodb.net/test";


app.get('/', async (req, res)=>{
    res.render('login')
})

app.get('/index', async (req, res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("productDB").find({}).toArray();
    res.render('index', {model:results})

    ////
    if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.name + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
})

app.get('/insert', (req,res)=>{
    res.render('newProduct');
})

var bodyParser = require("body-parser");
const { Script } = require('vm');
app.use(bodyParser.urlencoded({extended: false}));

app.post('/doInsert', async (req, res)=>{
    let nameInput = req.body.txtName;
    let originInput = req.body.txtOrigin;
    let priceInput = req.body.txtPrice;


    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let newProduct = {name : nameInput, price: priceInput, origin: originInput};
    await dbo.collection("productDB").insertOne(newProduct);
    
    res.redirect('index');
})

app.get('/search', (req, res)=>{
    res.render('search');
})
app.post('/doSearch', async (req, res)=>{
    let nameInput = req.body.txtName;
    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("productDB").find({name: nameInput}).toArray();
    res.render('index', {model:results})
})

app.get('/delete', async (req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id": ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    await dbo.collection("productDB").deleteOne(condition)
    console.log(condition);
    res.redirect('index');
})

app.get('/edit',async (req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("productDB").findOne({_id : ObjectID(id)});
    res.render('update', {ProductDB:results});
})
app.post('/doUpdate', async (req, res)=>{
    let id =req.body.id;
    let name = req.body.txtNames;
    let price = req.body.txtPrices;
    let origin = req.body.txtOrigin;

    let newValue = {$set : {name: name, price: price, origin: origin}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    await dbo.collection("productDB").updateOne(condition,newValue)

    res.redirect('index');
})
app.get('/register', (req,res)=>{
    res.render('register');
})

app.post('/doRegister',async (req,res)=>{
    let names = req.body.txtName;
    let pass = req.body.txtPass;


    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let newProduct = {name : names, password: pass};
    await dbo.collection("account").insertOne(newProduct);
    
    res.redirect('login');
})
//////////
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
//////////
app.get('/login', (req,res)=>{
    res.render('login');
})

app.post('/doLogin', async function(request, response) {
	var username = request.body.txtName;
	var password = request.body.txtPass;
	if (username && password) {
        let client = await MongoClient.connect(url);
        let dbo = client.db("ProductDB");

        var query = { name: username, password: password };
        dbo.collection("account").find(query).toArray(function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.name = username;
				response.redirect('index');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/logout',  function (req, res, next)  {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });

var PORT = process.env.PORT || 3000
app.listen(PORT)
console.log("server running...")