const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.js');
const passport = require('passport');
const {saveRedirectUrl} = require('../middleware.js');
const {isLoggedIn} = require('../middleware.js');
router.get('/signup',userController.renderSignUpForm);

router.post("/signup",userController.signup);
router.get('/login',userController.renderLoginForm);

router.post("/login",saveRedirectUrl,passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true
}),userController.login);

router.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    });
});
module.exports=router;
