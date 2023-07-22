const express = require ('express')
const router =new express.Router()
const User= require('../models/user')
const multer  = require('multer')
const sharp = require('sharp')
const path=require('path')

const auth =require('../middleware/auth')


router.get('/',(req,res)=>{
    res.render('index' , {title : 'Home Page'})
})

router.post('/users/signup', async (req,res)=>{

    const user=new User(req.body)
    //console.log(req.body)
    try{

        await user.save()
        console.log('fifif')
        const token= await user.generateAuthToken()
        res.status(201).send({user,token})

    } catch(e){ 
        //console.log(user.password)
        //console.log('helkfjkdfjvdre')
        res.status(400).send(e)
    }
    // user.save().then(()=>{
    //     res.send(user)

    // }).catch((e)=>{
    //     res.status(400).send(e)
    //     //res.send(e)
    // })
    // console.log(req.body)
    //res.send('Testing')
})


router.get('/users/me', auth , async (req,res)=>{

    // try{
    //     const users = await User.find({})
 
    //     res.send(users)  
    // }catch(e){
    //     res.status(500).send(e)

    // }
    console.log('ayya ha')
    res.send(req.user)
    // User.find({}).then((user)=>{

    //     res.send(user)

    // }).catch((e)=>{
    //     res.status(500).send()

    // }) 
})


router.patch('/users/me', auth , async (req,res)=>{

    const updates=Object.keys(req.body)
    const allowedUpdates=['name','email','password','age']
    const isValid= updates.every((update)=> allowedUpdates.includes(update))

    if(!isValid)
    {
        return res.status(400).send({error: 'Invalid Update'})
    } 
    try{

        // const user=await User.findById(req.params.id)
        //console.log(user)
        updates.forEach(function (update){ console.log(update)})
        updates.forEach((update)=> req.user[update]=req.body[update])
        await req.user.save()
        //const user=await User.findByIdAndUpdate(req.params.id,req.body,{new: true, runValidators : true})

        // if(!user)
        // return res.status(404).send()
        res.send(req.user) 
        
    } catch(e){
        res.status(400).send(e)

    }
})

router.post('/users/login',async(req,res) => {

    //res.sendFile(path.join(__dirname, '../public', 'index.html'))
    try{
        console.log('jdd')
        console.log(req.body.email,req.body.password)
        const user =await User.findByCredentials(req.body.email,req.body.password) 
        console.log('fjfjf')
        const token = await user.generateAuthToken();
        res.send({user,token})
    } catch(e){  

        res.status(400).send()

    }
})





router.post('/users/logout',auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !==req.token
        })

        await req.user.save()
        res.send(req.user)

    }catch(e){
        res.status(500).send()


    }
})


router.post('/users/logoutAll' , auth , async(req , res) => {

    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    } catch(e){

        res.status(500).send()

    }
})
// router.get('/users/:id', async  (req,res)=>{
//     const _id=req.params.id

//     try{

//         const user= await User.findById(_id)
//         if(user===undefined)
//         return res.status(404).send()
//         res.send(user)
//     } catch(e) {
//         res.status(500).send(e)
//     }

//     // User.findById(_id).then((user)=>{
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)

//     // }).catch((e)=>{
//     //     res.status(404).send()

//     // }) 
// })

router.delete('/users/me', auth , async (req,res)=>{
    
    try{
        const user = await User.findByIdAndDelete(req.user._id)

         // Delete associated tasks
        await Task.deleteMany({ owner: req.user._id });
        console.log('djdjd')
        if(!user)
        return res.status(404).send()
        res.send(user)   //abhi yahi use karna padega remove funciton depricate hogya hh

        // await req.user.remove()

        
    } catch(e){
        res.status(500).send()
    }
}) 


module.exports= router   