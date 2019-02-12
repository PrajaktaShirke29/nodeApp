  // load require package
var http=require("http");
var fs=require("fs");
var express= require("express");
var mongoose=require("mongoose");
var cors=require("cors");
var jwt=require("jsonwebtoken");
var path=require("path");
var bodyParser=require("body-parser");
mongoose.Promise=global.Promise;
var instance= express()
var router = express.Router();



// configure middleware
instance.use(bodyParser.urlencoded({extented: false}));
instance.use(router);
instance.use(bodyParser.json());
instance.use(cors());

// connect to database
mongoose.connect("mongodb://localhost/ProductAppDb",
               { useNewUrlParser :true}
               
);


var dbconnect=mongoose.connection;

if(!dbconnect){
    console.log("Sorry cannot establish the connection");
    return;
}
else{
    console.log("Connection established");
}

instance.listen(4080, function(){
    console.log("Server started at 4080");
});       

//User Schema
var userSchema= mongoose.Schema({
    UserName: String,
    Password:  String
});

var userModel=mongoose.model('User', userSchema,'User');

// Create a new user
instance.post("/api/users/create", function(request, response){
    var user={
        UserName : request.body.UserName,
        Password : request.body.Password
    };

    userModel.create(user, function(err, res){
        if(err)
        {
            response.statusCode=500;
            response.send({statusCode: response.statusCode, message:err});
        }
        response.send({statusCode:200, message: res});
    });
});

//The secret for the jwt
var jwtSettings={
    jwtSecret: "jbscbihdfcifc"
} 

//The set with express
instance.set("jwtSecret", jwtSettings.jwtSecret);
var tokenStore=" ";

//Authentication user
instance.post("/api/users/auth", function(request,response){
    var user={
        UserName:request.body.UserName,
        Password:request.body.Password
    };
    

    console.log(request.body.UserName);

    console.log("In auth user", JSON.stringify(user));
    userModel.findOne({UserName:request.body.UserName}, function(err, usr){
        if(err)
        {
            console.log("Some Error has occured");
            throw err;
        }
        if(!usr){
            response.send({statusCode:404, message:"Sorry user is not available."});
        }
        else if(usr)
        {
            
            if(usr.Password != user.Password)
            {
               
                response.send({statusCode: 404, message:"Sorry! username and password not found"});
            }
            else{
                console.log("In else if", JSON.stringify(usr));
                // Sign in user and generate token
                var token=jwt.sign({usr}, 
                    instance.get("jwtSecret"),{
                    expiresIn:3600
                });
                //save token globally
                console.log("In else if", JSON.stringify(usr));
                tokenStore=token;
                console.log(tokenStore);
                response.send({authenticated: true, message: "Login Successfull", token:token});
            }
        }
    });
});

//code for productAPI
var productScheme={
    ProductId: Number,
    ProductName: String,
    CategoryName: String,
    Manufacturer: String,
    Price: Number
}

var productModel=mongoose.model("Products",productScheme,"Products");

// verify token and provide access

instance.get("/api/products",function(request, response){
    var tokenRecieved=request.headers.authorization.split(" ")[1];
    // verify token
    jwt.verify(tokenRecieved,instance.get("jwtSecret"), function(err, decoded){
        console.log("In verify");
        if(err){
            console.log("In auth error");
            response.send({Success: false, message:"Token verification error"});
        }
        else{
            console.log("login successful");
            //decode the request
            request.decoded=decoded;
            productModel.find().exec(function(err, res){
                if(err)
                {
                    response.statusCode=500;
                    response.send({statusCode: response.statusCode, error:err });
                }
                response.send({statusCode: 200, data:res});
            });

            
        }
    });
});

//Insert Product
instance.post("/api/products", function(request, response) {
    var tokenRecieved=request.headers.authorization.split(" ")[1];
    jwt.verify(tokenRecieved,instance.get("jwtSecret"), function(err, decoded){
        console.log("In verify");
        if(err){
            console.log("In auth error");
            response.send({Success: false, message:"Token verification error"});
        }
        else{
            console.log("login successful");
            //decode the request
            request.decoded=decoded;
    
    // parsing posted data into JSON
  
    var prd = {
      ProductId: request.body.ProductId,
      ProductName: request.body.ProductName,
      CategoryName: request.body.Category,
      Manufacturer: request.body.Manufacturer,
      Price: request.body.Price
    };
  
    // pass the parsed object to "create()" method
    productModel.create(prd, function(err, res) {
      if (err) {
        response.statusCode = 500;
        response.send(err);
      }
      response.send({ status: 200, data: res });
    });
  }
  });
});

  // Update
  instance.put("/api/products/:id", function(request, response) {
    // read the request id parameter
    // read the body
    // update matched record from array
    // respond array
    var tokenRecieved=request.headers.authorization.split(" ")[1];
    jwt.verify(tokenRecieved,instance.get("jwtSecret"), function(err, decoded){
        console.log("In verify");
        if(err){
            console.log("In auth error");
            response.send({Success: false, message:"Token verification error"});
        }
        else{
            console.log("login successful");
            //decode the request
            request.decoded=decoded;
    
    // parsing posted data into JSON
    var id={  ProductId:request.params.id   }
    var newvalue={$set:{ProductId:request.params.id, ProductName:request.body.ProductName,
     Category:request.body.Category, Manufacturer:request.body.Manufacturer, Price:request.body.Price}};
      productModel.updateOne(id,newvalue,function(err,res){
        if(err){
          response.statusCode=500;
          response.send({status:response.statusCode,error:err});
        }
      response.send({status:200,data:res});
      });
    }
});
  });
  instance.delete("/api/products/:id",function(request,response){
    // read the request id parameter
    // delete matched record array
    // respond array
    var tokenRecieved=request.headers.authorization.split(" ")[1];
    jwt.verify(tokenRecieved,instance.get("jwtSecret"), function(err, decoded){
        console.log("In verify");
        if(err){
            console.log("In auth error");
            response.send({Success: false, message:"Token verification error"});
        }
        else{
            console.log("login successful");
            //decode the request
            request.decoded=decoded;
    
      var prd={  ProductId:request.params.id   }
      productModel.deleteOne(prd,function(err,res){
        if(err){
          response.statusCode=500;
          response.send({status:response.statusCode,error:err});
        }
      response.send({status:200,data:res});
      });
    }
    });
});
