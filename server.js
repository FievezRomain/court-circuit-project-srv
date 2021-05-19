const express = require('express');
const session = require('express-session')
const app = express();
var cors = require('core');
var bodyParser = require("body-parser");
const User = require("./models/user");
const mongoose = require("mongoose");
const { response, request } = require('express');

mongoose.connect("mongodb+srv://alim:alim@cluster0.ussbb.mongodb.net/Court-Circuit?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() =>{
        console.log("Successfully connect to DB");
    })
    .catch((error)=>{
        console.log("Unable to connect to DB");
        console.error(error);
    });
app.use(cors({credential: true, origin: 'http://localhost:4200'}));
app.use((req, res, next)=>{
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS, PATCH");
    res.set("Access-Control-Allow-Headers", "X-Requested-With, content-type");
    res.set("Access-Control-Allow-Credentials", true);
    next();
})
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({secret:"CourtCircuitKey", cookie:{maxAge: 24*60*60*1000}}));

app.post('/login', (request, response) => {
    User.findOne({email: request.body.email, password: request.body.password}, (error, user) => {
        if (error) return response.status(401).json({msg:"Error"});
        if(!user) return response.status(401).json({msg: "Mauvais email/password"});
        request.session.userId = user._id;
        response.status(200).json({email: user.email, nom: user.nom, prenom: user.prenom, grade: user.grade});
    })
})

app.post('/register', (request, response) =>{
    var newUser = new User({
        email: request.body.email,
        nom: request.body.nom,
        prenom: request.body.prenom,
        grade: "utilisateur",
        password: request.body.password
    })
    User.countDocuments({email: newUser.email}, function(err, count) {
        if(err) return response.status(401).json({msg:"Error"});
        if(count>0){
            return response.status(409).json({msg:"L'utilisateur existe déjà"});
        }else{
            newUser.save((error, user) =>{
                if(error) return console.error(err);
                request.session.userId = user._id;
                response.status(200).json({email: user.email, nom: user.nom, prenom: user.prenom, grade: user.grade});
            })
        }
    })
})

app.get('/logout', (request, response) =>{
    request.session.destroy(error =>{
        if(error) return response.status(409).json({msg:"Error"});
        response.status(200).json({msg:"Déconnexion OK"});
    })
})

app.get('/islogged', (request, response) =>{
    if(!request.session.userId) return response.status(401).json();

    User.findOne({_id: request.session.userId}, (error, user)=>{
        if(error) return response.status(401).json({msg: "Error"});
        if(!user) return response.status(401).json({msg: "Error"});
        request.session.userId = user._id;
        response.status(200).json({email: user.email, nom: user.nom, prenom:user.prenom, grade:user.grade});
    })
})

//**************************Partie Produit***************************** */
let produits= [];
var product1 = {id : 0, libelle : "PommeServeur", categorie : "FruitServeur", description : "Mon premier produit", provenance : "sFrance", prix : '150', urlImage : "assets/img/product1.jpg", quantity :'10' }
var product2 = {id : 1, libelle: "Pomme2Serveur", categorie : "FruitServeur", description : "Mon second produit", provenance : "Italie", prix : 15, urlImage : "assets/img/product1.jpg", quantity :0 }
produits.push(product1);
produits.push(product2);

app.get('/products', (request, response) =>{
   response.json({data : produits})
}) 
app.get('/products/:id', (request, response) =>{
    id = request.params.id;
    var index;
    for(var i in produits) {
      if (produits[i].id == id)
        index = i; }
    response.json({data : produits[index]})
 }) 
 app.delete('/products/:id', (request, response) =>{
    id = request.params.id;
    var index;
    for(var i in produits) {
      if (produits[i].id == id)
        index = i; }
        produits.splice(index,1);
        response.json({data:'DELETE notes:id entry'})
 }) 
 app.put('/products/:id', (request, response)=>{

     let newProduct = request.body;
    id = request.params.id;
    var index;
    for(var i in produits) {
      if (produits[i].id == id)
        index = i; }
    produits[index]= newProduct;
    response.json({data : produits[index]})


 })
 app.post('/products', (request, response)=>{

    let newProduct = request.body;
    produits.push(newProduct);


})


app.listen(3000, ()=>{console.log("Listening on port 3000")});