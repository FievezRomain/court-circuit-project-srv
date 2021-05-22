const express = require('express');
const session = require('express-session')
const app = express();
var cors = require('cors');
var bodyParser = require("body-parser");
const User = require("./models/user");
const Product = require("./models/product");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://alim:alim@cluster0.ussbb.mongodb.net/Court-Circuit?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() =>{
        console.log("Successfully connect to DB");
    })
    .catch((error)=>{
        console.log("Unable to connect to DB");
        console.error(error);
    });
app.use(cors({credentials: true, origin: 'http://localhost:4200'}));
/* app.use((req, res, next)=>{
    res.set("Access-Control-Allow-Origin", "http://localhost:4200");
    res.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS, PATCH");
    res.set("Access-Control-Allow-Headers", "X-Requested-With, content-type");
    res.set("Access-Control-Allow-Credentials", true);
    next();
}) */
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({secret:"CourtCircuitKey", cookie:{maxAge: 24*60*60*1000}}));


//**************************Partie Auth***************************** */
app.post('/login', (request, response) => {
    User.findOne({email: request.body.email, password: request.body.password}, (error, user) => {
        if (error) return response.status(401).json({msg:"Error"});
        if(!user) return response.status(401).json({msg: "Mauvais email/password"});
        request.session.userId = user._id;
        return response.status(200).json({email: user.email, nom: user.nom, prenom: user.prenom, grade: user.grade});
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
                if(error) return console.error(error);
                request.session.userId = user._id;
                return response.status(200).json({email: user.email, nom: user.nom, prenom: user.prenom, grade: user.grade});
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

app.get('/users', (request, response) =>{
    User.find((error, users)=>{
        if(error){
            console.error(error);
        }
        console.log(users);
        response.json(users);
    });
}) 
app.get('/users/:id', (request, response) =>{
    User.findOne({_id: request.params.id},(error, user)=>{
        if(error){
            console.error(error);
        }
        console.log(user);
        response.json(user);
    });
 }) 
 app.delete('/users/:id', (request, response) =>{
    User.deleteOne({_id: request.params.id}, (error)=>{
        if(error){
            console.error(error);
        }
        console.log({msg: "delete success"});
        response.status(201).json({msg: "delete success"});
    })
 }) 
 app.put('/users/:id', (request, response)=>{
    let user = request.body;
    var updateUser = new User({
        _id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        grade: user.grade,
        password: user.password
    })

    User.updateOne({_id: user._id}, updateUser, (error, user)=>{
        if(error){
            console.error(error);
        }
        console.log(user);
        response.json(user);
    })

 })

//**************************Partie Produit***************************** */
app.get('/products', (request, response) =>{
    Product.find((error, products)=>{
        if(error){
            console.error(error);
        }
        console.log(products);
        response.json(products);
    });
}) 
app.get('/products/:id', (request, response) =>{
    Product.findOne({_id: request.params.id},(error, product)=>{
        if(error){
            console.error(error);
        }
        console.log(product);
        response.json(product);
    });
 }) 
 app.delete('/products/:id', (request, response) =>{
    Product.deleteOne({_id: request.params.id}, (error)=>{
        if(error){
            console.error(error);
        }
        console.log({msg: "delete success"});
        response.status(201).json({msg: "delete success"});
    })
 }) 
 app.put('/products/:id', (request, response)=>{
    let product = request.body;
    let updateProduct = new Product({
        _id: product._id,
        libelle: product.libelle,
        categorie: product.categorie,
        description: product.description,
        provenance: product.provenance,
        prix: product.prix,
        // urlImage: product.urlImage,
        quantity: product.quantity
    });

    Product.updateOne({_id: product._id}, updateProduct, (error, product)=>{
        if(error){
            console.error(error);
        }
        console.log(product);
        response.json(product);
    })

 })
 app.post('/products', (request, response)=>{
    let product = request.body;
    let newProduct = new Product({
        libelle: product.libelle,
        categorie: product.categorie,
        description: product.description,
        provenance: product.provenance,
        prix: product.prix,
        // urlImage: product.urlImage,
        quantity: product.quantity
    });
    newProduct.save((error, product)=>{
        if(error){
            return console.error(error);
        }
        console.log(product);
        response.json(product);
    });
})

app.listen(3000, ()=>{console.log("Listening on port 3000")});