
const jwt= require('jsonwebtoken')
const User= require('../models/user')
const cookieParser = require('cookie-parser');

const Folder = require('../models/folder')


const auth = async(req,res,next) =>{

    try{
        console.log('djdjd')
        
        
    //    const token = req.headers.authorization.replace('Bearer ', '');
    //    console.log(token)
        cookieParser()(req, res, () => {});

        //Retrieve the token from the cookie
       token = req.cookies.token ; 
       if(token === undefined)
       token = req.headers.authorization.replace('Bearer ', '');

       



        console.log('token ye rha '+token)
        // Verify and decode the token
        const decoded = jwt.verify(token, 'ekprojectnahibanrha');
        //const decoded = jwt.verify(token,'ekprojectnahibanrha')
        const user= await User.findOne( { _id: decoded._id , 'tokens.token' : token } )
        // console.log(token)
        // console.log (decoded)
        // console.log(decoded._id)
        //console.log(user)
        

        if(!user)
        throw new Error()

        console.log('hereeee')

        req.token=token
        req.user =user

       

    // Check if the folder belongs to the user
    // const folder = await Folder.findOne({ _id: folderId, owner: user._id });

    // if (!folder) {
    //   throw new Error();
    // }

    // req.folder = folder; // Store the folder in req.folder

        

        next()
    
    }catch(e){
        res.status(401).send({error: 'Please authenticate'})
    }
    
}



module.exports = auth