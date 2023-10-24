const express=require('express');
const ejs=require('ejs');
const app=express();
const env=require('dotenv')
const cookieParser=require('cookie-parser');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const jwt=require('jsonwebtoken')
const PORT= process.env.PORT || 8080
app.use(express.static(__dirname+'/public/css'));
app.use(express.static(__dirname+'/public/assets'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser());
app.use(express.json())

require('dotenv').config();



mongoose.connect("mongodb+srv://abishchhetri2502:tjbxS2WW2KrhyYD0@cluster0.w19rcgq.mongodb.net/?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log('connected successful')}).catch((err)=>{
        console.log(err)
})
// mongoose.set('useCreateIndex',true);

const userSchema=mongoose.Schema({
    Name:{
        type:String
    },
    phoneNumber:{
        type:Number
    },
    email:{
        required:true,
        type:String
    },
    password:{
        type:String
    },
    address:{
        type:String,
        
    },
    hName:{
        type:String
    },
    doctorId:{
        type:Number,
    },


},

{
    timestamps:true
});



const User=new mongoose.model('user', userSchema);

app.get("/logout",(req,res)=>{
    res.clearCookie(`__token`);
    res.redirect('/')
})

app.get("/login",(req,res)=>{
    res.render('login');
})

app.get("/patients",(req,res)=>{
    res.render('patients');
})

app.get("/upload",(req,res)=>{
    res.render('upload');
})

app.get("/index",(req,res)=>{
    res.render('upload');
})

app.get("/doctor",(req,res)=>{
    res.render('doctor');
})







app.get("/",(req,res)=>{
    res.render('index');
})

// post method starts here

app.post("/register",async(req,res)=>{
    
    try{
        const userSave=new User({
            Name:req.body.fullName,
            phoneNumber:req.body.phoneNumber,
            email:req.body.email,
            password:req.body.password
            
        })

        userSave.save()
        res.redirect('/login')

    }
    catch(err){
        console.log(err)
    }



})

const checkAuth = (req, res, next)=> {
    const authHeader = req.cookies.__token;
    const token = req.cookies.__token;
    if(!token){
        res.redirect("/login")
        return false
    }
    jwt.verify(token, process.env.secretKey, async(err,decoded) => {
        if(err) throw err;
        console.log(decoded)
        if(decoded.ID){
            await User.findOne({
                _id:decoded.ID
            }).then((response)=>{
                console.log(response,'response')
                req.user=response;
                next()
            }).catch((errs)=>{
                console.log(errs)
            })
        }else{
            res.send('Invalid signature');
            return redirect('/login')
        }
   
   
    })
  }


  app.get("/Account",checkAuth,(req,res)=>{
    if(req.user){
       
        res.render('account',{name:req.user.Name, email:req.user.email, phone:req.user.phoneNumber, Address:req.user.Address});

    }else{
        res.redirect('/login')
    }
   
   
})

app.get("/Questions",checkAuth,(req,res)=>{
    if(req.user){
        
        res.render('Questions',{name:req.user.Name, email:req.user.email, phone:req.user.phoneNumber});

    }else{
        res.redirect('/login')
    }
   
   
})


app.post("/login",async(req,res)=>{

    const result=await User.findOne({email:req.body.email});
   
    if(!result)
     {
      res.redirect(`/login`)}
    else { 
        const token = jwt.sign({ID:result._id}, process.env.secretKey, { expiresIn: '30d' });
                res.cookie('__token',token);
                // console.log(res);
                res.redirect('/Account');

    } 

    // const user=new User({
    //     username:req.body.email,
    //     passpord:req.body.passpord
    // })
// console.log(user)
    // req.login(user,function(err){
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         passport.authenticate("local")(req,res,function(){
    //             console.log(user)
    //             res.redirect("/Questions")
    //         })
    //     }
    // })
})









app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});