const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const ejs= require('ejs')
const auth=require('./middleware/auth')
const path= require('path')
const cookieParser = require('cookie-parser');

const userRouter= require('./routers/user')
const fileRouter = require('./routers/files')
const folderRouter = require('./routers/folders')
const http = require('http')
const bodyParser = require('body-parser');



const app = express()
app.use(cookieParser())

 app.use(express.static('public'));

require('./db/mongoose.js')
 

const port =process.env.PORT || 3000
 
// mongoose.connect('mongodb://localhost:27017/gdrive', {
//   useNewUrlParser: true, 
//   useUnifiedTopology: true,
// });    
const db = mongoose.connection;  

app.use(express.json())
// set views engine
const viewsPath = path.join(__dirname,'../Public/views')

app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies
app.use(bodyParser.json());


console.log(__dirname)
app.set('view engine', 'ejs');
app.set('views', viewsPath);


//set prefix route 
app.use(fileRouter)
app.use(userRouter) 
app.use(folderRouter)


  // Serve static files from the 'public' directory
  //app.use(express.static('public')); 

  // Serve the index.html file for the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,'../Public/login.html'));
  });
  
  // Serve the index.ejs file for the root URL (home page)
  app.get('/', (req, res) => {
    res.render('index');
  });
  // app.get('/dashboard' ,auth, (req, res) => {
  //   console.log('lalala')
  //   console.log(req.user.name)
  //   const user=req.user

    
    
  //   res.render('dashboard',{user});

  // });
  
  


  const axios = require('axios');

  app.get('/dashboard', auth, async (req, res) => {
    try {
      // Fetch folders with folderId as null
      const folderId = null;
  
      const response = await axios.get('http://localhost:3000/folders/null', {
        headers: {
          Authorization: `Bearer ${req.token}`,
        }
      });
      //console.log(response)
      if (response.status!==200) {
        throw new Error('Failed to fetch folders');
      }
  
      const folders = response.data.folders;
      //console.log(folders)
      const filesResponse = await axios.get('http://localhost:3000/files/null', {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      });
      if (filesResponse.status !== 200) {
        throw new Error('Failed to fetch files');
      }
      const files = filesResponse.data.files;
      //console.log(files)
  
      res.render('dashboard', { user: req.user, folders, files });
    } catch (error) {
      //console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    }

  });

  app.get('/folder/:folderId', auth, async (req, res) => {
    try {
      const folderId = req.params.folderId;
  
      // Fetch folders
      console.log('lwlwlwlwlwlwl')
      const foldersResponse = await axios.get(`http://localhost:3000/folders/${folderId}`, {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      });
      if (foldersResponse.status !== 200) {
        throw new Error('Failed to fetch folders');
      }
      const folders = foldersResponse.data.folders;
      
      console.log('hallllllll')
      // Fetch files based on folderId
      const filesResponse = await axios.get(`http://localhost:3000/files/${folderId}`, {
        headers: {
          Authorization: `Bearer ${req.token}`,
        }, 
      });
      if (filesResponse.status !== 200) {
        throw new Error('Failed to fetch files');
      }
      const files = filesResponse.data.files;
      //console.log(files)
  
      res.render('dashboard', { user: req.user, folders, files });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  app.get('/users/shared', auth , async (req , res )=>{

    try{
      console.log('shared route me')
      const response = await axios.get(`http://localhost:3000/shared` , {
        headers : {
          'Authorization' : `Bearer ${req.token}` 
        },

      });
      
      if(response.status!==200)
      throw new Error('Cannot fetch Folders')

      const folders = response.data.sharedFolders
      const files = response.data.sharedFiles
      
      res.render('sharedPage' , {folders,files});
      //res.render('sharedPage');
  


    }
    catch(error){
      console.error('Error:' , error)
      res.status(500).json({error : 'An error occurred'})

    }
  })

  app.get('/recycleBin' ,auth , async(req,res)=>{

    try{

      const foldersResponse = await axios.get(`http://localhost:3000/getfolders/recycleBin` , {
        headers : {
          'Authorization' : `Bearer ${req.token}` 
        },

      });

      if (foldersResponse.status !== 200) {
        throw new Error('Failed to fetch folders');
      }

      const filesResponse = await axios.get(`http://localhost:3000/getfiles/recycleBin` , {
        headers : {
          'Authorization' : `Bearer ${req.token}` 
        },

      });

      if (filesResponse.status !== 200) {
        throw new Error('Failed to fetch files');
      }

      const folders = foldersResponse.data.folders;
      const files = filesResponse.data.files;

      res.render('recycleBin' , {folders,files})



    }catch(error){
      console.error('Error ' , error)
      res.status(500).json({error : 'An error occurred'})
      
    }
  })



app.listen(port,()=>{

    console.log('Server is up on port '+port)
}) 
 
 