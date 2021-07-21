const User = require('../models/User')
const gravatar=require('gravatar')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')
const validateRegisterInput=require('../validation/register')
const validateLoginInput=require('../validation/login')

//keyOrSECRET
const key = require('../config/Key')

// @Route   /api/users/registre
//@desc     sign up user
//@access   public 

module.exports.userRegister=(req,res)=>{
 
    const { name, email, password, password2, avatar } = req.body;
    const {isValid,errors}=validateRegisterInput(req.body);
     
    //check validations :
    if(!isValid){
     return res.status(400).json(errors)}

    // verifying if the email already exists in the DB
    User.findOne({ email: email }).then((user) => {
        if (user) {
            res.status(409).json({ msg: "email already exists" });
        } else if (password !== password2) {
            res.status(400).json({ msg: "passwords are not the same" });
        } else {
            const avatar=gravatar.url(req.body.email,{
                s:'200',//size,
                r:'pg',//rating
                d:'mm' //default
            
            })
            const newUser = new User({
                name,
                email,
                password,
                avatar
            });
            bcrypt.genSalt(10, function (err, salt) {
                if (err) throw err;
                bcrypt.hash(newUser.password, salt, (err, cryptedPassword) => {
                    if (err) throw err;
                    newUser.password = cryptedPassword;
                    newUser.save((err) => {
                        if (err) throw err;
                    });
                    res.status(200).json({
                        status: 200,
                        msg: "user registered successfully",
                        user: newUser,
                    });
                });
            });
        }
    });
}

// @Route   /api/users/login
//@desc     sign in user / returning the token
//@access   public
module.exports.userLogin=(req,res)=>{
  const{email,password}=req.body

  const {isValid,errors}=validateLoginInput(req.body);
     
  //check validations :
   if(!isValid){
   return res.status(400).json(errors)}

  //find user
  User.findOne({email})
  //checkuser
  .then(user=>{
      if(!user){
      errors.email='User  is not found'
      res.status(404).json(errors)}
  //check password : remember one password is given by user , the other is hushed
  bcrypt.compare(password, user.password)
  .then(isMatch=>{
      if(isMatch){
       //user matched
      const payload={id:user.id,name:user.name,avatar:user.avatar} //jwt payload
       //jwt sign
       jwt.sign(
           payload,
           key.SECRETORKEY,
           {expiresIn:1800},
           (err,token)=>{
             res.json({
                success:true, 
                token:'Bearer '+ token
             })
           })
    }
      else{
          errors.password='password incorrect'
          return res.status(400).json(errors)
      }
  })
  ;    
  })
}

// @Route   /api/users/current
//@desc     return current user/a test using the token
//@access   private
module.exports.userCurrent=(req,res)=>{

    res.json({name:req.user.name,
              email:req.user.email,
              id:req.user.id})
 }