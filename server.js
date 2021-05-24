const express = require('express');
const session = require('express-session')
const app = express();
var cors = require('cors');
var bodyParser = require("body-parser");
const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
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

//**************************Partie Panier***************************** */
app.post('/carts', (request, response) =>{
    if(!request.session.userId) return response.status(401).json();

    Cart.findOne({idUser: request.session.userId}, (error, cart)=>{
        if(error) return response.status(401).json({msg: "Error"});
        if(!cart) {
            let orderLine = request.body;
            let newCart = new Cart({
                items: [{
                    idProduct: orderLine._id,
                    idUser: request.session.userId,
                    quantity: 1,
                    price: orderLine.prix * 1
                }],
                idUser: request.session.userId,
                subTotal: orderLine.prix
            })
            newCart.save((error, cart)=>{
                if(error){
                    return console.error(error);
                }
                console.log(cart);
                response.json(cart);
            });
        };
        if(cart){
            let orderLine = request.body;
            //---- Check if index exists ----
            const indexFound = cart.items.findIndex(item => item.idProduct == orderLine._id);
            //----------Check if product exist, just add the previous quantity with the new quantity and update the total price-------
            if (indexFound !== -1) {
                cart.items[indexFound].quantity = Number(cart.items[indexFound].quantity) + 1;
                cart.items[indexFound].price = cart.items[indexFound].quantity * orderLine.prix;
                cart.subTotal = cart.items.map(item => item.price).reduce((acc, next) => acc + next);
            }
            //----Check if quantity is greater than 0 then add item to items array ----
            else if (indexFound == -1) {
                cart.items.push({
                    idProduct: orderLine._id,
                    idUser: request.session.userId,
                    quantity: 1,
                    price: orderLine.prix * 1,
                })
                cart.subTotal = cart.items.map(item => item.price).reduce((acc, next) => acc + next);
            }
            Cart.updateOne({_id: cart._id}, cart, (error, cart)=>{
                if(error){
                    console.error(error);
                }
                console.log(cart);
                response.json(cart);
            })
        }
    })
})

app.get('/carts', (request, response) =>{
    if(!request.session.userId) return response.status(401).json();

    Cart.findOne({idUser: request.session.userId}, (error, cart)=>{
        if(error) return response.status(401).json({msg: "Error"});
        if(!cart) return response.status(401).json({msg: "Empty"});
        if(cart){
            Cart.find({idUser: request.session.userId}).populate("items.idProduct", "libelle categorie description provenance prix").exec(function (err, cart) {
                if (err) {
                  console.log(err);
                }
                response.json(cart[0]);
            });
        }
    })
})

app.delete('/carts/:id', (request, response) =>{
    if(!request.session.userId) return response.status(401).json();

    Cart.findOne({idUser: request.session.userId}, (error, cart)=>{
        if(error) return response.status(401).json({msg: "Error"});
        if(!cart) return response.status(401).json({msg: "Empty"});
        if(cart){
            const indexFound = cart.items.findIndex(item => item.idProduct._id == request.params.id);
            console.log(indexFound);
            //------This removes an item from the the cart if the quantity is set to zero, We can use this method to remove an item from the list  -------
            if (indexFound !== -1) {
                if(cart.items.length == 1){
                    cart.items = [];
                    cart.subTotal = 0;
                } else{
                    cart.items = cart.items.splice(indexFound, 1);
                    cart.subTotal = cart.items.map(item => item.price).reduce((acc, next) => acc + next);
                }
                Cart.updateOne({_id: cart._id}, cart, (error, cart)=>{
                    if(error){
                        console.error(error);
                    }
                    console.log(cart);
                })
            }
            Cart.find({idUser: request.session.userId}).populate("items.idProduct", "libelle categorie description provenance prix").exec(function (err, cart) {
                if (err) {
                  console.log(err);
                }
                response.json(cart[0]);
            });
        }
    })
})
app.listen(3000, ()=>{console.log("Listening on port 3000")});