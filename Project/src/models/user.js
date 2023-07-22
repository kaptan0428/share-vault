
const mongoose=require('mongoose') //iske lie npm i mongoose karna hhh
const validator=require('validator')// npm i 
const bcrypt =require('bcrypt')
const jwt = require ('jsonwebtoken')
//const Task= require('./tasks')


const userSchema = new mongoose.Schema({
    name:{
        type: String
        
    },
    email: {

        type: String,
        required :true,
        trim: true, 
        unique : true,
        lowerCase: true,
        validate(value){
            if(!validator.isEmail(value))
            throw new Error('Invalid Email')
        }

    },
    password: {
        type: String,
        required : true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('Password cannot be password')
            }  

        }


    },
    tokens: [{
        token : {
            type : String,
            require: true 
        }
    }],
 },{
    timestamps: true
 })


 userSchema.methods.generateAuthToken = async function () {
    const user = this
    //console.log(user._id.toString())
    const token = jwt.sign({ _id : user._id.toString() }, 'ekprojectnahibanrha' )
    user.tokens =  user.tokens.concat({token})
    await user.save()
    console.log('token'+ token)
    return token

 
 }


 /// removing unnesccary data showed to users
 userSchema.methods.toJSON= function () {
    const user =this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
 }

 

userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email})
    //console.log(user)
    if(!user)
    {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password,user.password) 
    //console.log(isMatch)
    if(!isMatch) 
    {
        throw new Error('Unable to login')
    }

    return user

}
 //hash the plain text password before saving
 userSchema.pre('save',async function(next){
    const user=this
    //console.log('here')
    if(user.isModified('password'))
    {
        console.log('inside')
        user.password = await bcrypt.hash(user.password,8)
    }
    //console.log(user.password)
    next()
 } )

const User=mongoose.model('User',userSchema)
 
 module.exports= User