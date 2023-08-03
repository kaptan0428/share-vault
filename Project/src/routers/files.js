const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth =require('../middleware/auth')
const File= require('../models/files')
const User= require('../models/user')

const Folder= require('../models/folder')
const fs= require('fs')
const mongoose = require('mongoose')
const path = require('path');

const { v4: uuidv4 } = require('uuid');

const { ObjectId } = mongoose.Types;

const archiver = require('archiver');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Set the destination folder for storing files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = uniqueSuffix + '-' + file.originalname;
    cb(null, fileName); // Set the file name
  }
});

// Create a multer upload instance with the configured storage
const upload = multer({ storage });

// File upload route
router.post('/files/upload', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('aa bhi rha hh kya>')
    
    // Extract the file information from the request
    const { originalname, filename, path, mimetype, size } = req.file;
    console.log('alalala')
    

    
    console.log(req.body.folderId)
    let folderId = req.body.folderId;
    if (!ObjectId.isValid(folderId)) {
      folderId = null; // Set to null if the folderId is not valid
    } else {
      folderId = new ObjectId(folderId); // Convert to ObjectId if it's a valid string
    }
    
    const publicLinkToken = uuidv4();

    const file = new File({
      owner: req.user._id,
      filename: originalname,
      uploadname: filename,
      path,
      mimetype,
      size,
      folder : folderId ,
      publicLinkToken
    });

    console.log(file) 
    console.log('kahdd')
    // Save the file to the database
    const savedFile = await file.save();
    console.log('hdhhd')
    console.log('Are uaha hun mai file upload router me')
    res.status(201).json({ message: 'File uploaded successfully', file: savedFile });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Unable to upload file' });
  }
});

router.get('/files/:folderId', auth, async (req, res) => {
  try {
    console.log('file router me ')
    const userId = req.user._id;
    const folderId = req.params.folderId; // Get the folder ID from the query parameters
    
    let files;

    if (folderId !=="null" && folderId!=="undefined") {
      // If parent folder ID is provided, find folders with matching parent folder ID
      files = await File.find({ folder: folderId   , isDeleted: false });
    } else {
      // If parent folder ID is not provided, find folders with null parent folder ID
      files = await File.find({ folder: null , owner: userId , isDeleted: false });
    }

    
    res.json({ files });
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ error: 'Unable to fetch files' });
  }
});

router.delete('/files/:id', auth, async (req, res) => {
  try {
    const fileId = req.params.id;

    // Find the file by ID
    const file = await File.findById(fileId);

    // Check if the file exists
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file from the file system
    fs.unlinkSync(file.path);

    // Delete the file from the database
    await File.findByIdAndDelete(fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Unable to delete file' });
  }
});





// router.get('/files/:id/download', auth,  async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     console.log('owner'  + req.user._id)
//     // Retrieve file data from the database based on fileId
//     const file = await File.findById(fileId);

//     if (!file) {
//       return res.status(404).json({ error: 'File not found' });
//     }
//     console.log(file)
//     // Set headers for the response
//     res.setHeader('Content-Type', 'application/octet-stream');
//     res.setHeader('Content-Disposition', `attachment; filename="${file.uploadname}"`);

//     // Stream the file content to the response
//      const filePath = path.join(__dirname, '../../uploads', file.uploadname );

//     fs.createReadStream(filePath).pipe(res);
//   } catch (error) {
//     console.error('Error downloading file:', error);
//     res.status(500).json({ error: 'Unable to download file' });
//   }
// });


router.get('/files/:id/download', async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get the file path
    const filePath = `./uploads/${file.uploadname}`;

    // Use res.download() to serve the file for download
    res.download(filePath, file.filename); // `file.originalName` is the desired name of the downloaded file

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Unable to download file' });
  }
});

router.get('/file/public/:token', async(req,res)=>{

  try{

    const publicLinkToken = req.params.token;

    const file = await File.findOne({publicLinkToken})

    if(!file)
    res.status(404).json({eroor: 'File not found or public link expired'})
    const filePath = `./uploads/${file.uploadname}`;

    // Use res.download() to serve the file for download
    res.download(filePath, file.filename); 
  }
  catch(error)
  {
    console.error('Error downloading file using public link:', error);
  res.status(500).json({ error: 'Unable to download file' });

  }

})



// Share file or folder with another user
// router.post('/share', auth , async (req, res) => {
//   try {
//     console.log('share me ')
//     const { fileId, folderId, email } = req.body;

//     // Check if either fileId or folderId is provided
//     if (!fileId && !folderId) {
//       return res.status(400).json({ error: 'Please provide a valid fileId or folderId' });
//     }

//     // Find the file or folder based on provided ID
//     let item;
//     if (fileId) {
//       item = await File.findById(fileId);
//     } else {
//       item = await Folder.findById(folderId);
//     }

//     if (!item) {
//       return res.status(404).json({ error: 'File or folder not found' });
//     }
//     console.log(item)
//     // Add the email to sharedUsers array in the item
//     if (!item.sharedUsers.includes(email)) {
//       item.sharedUsers.push(email);
//       await item.save();
//     }

//     res.status(200).json({ message: 'File or folder shared successfully' });
//   } catch (error) {
//     console.error('Error sharing file/folder:', error);
//     res.status(500).json({ error: 'Unable to share file or folder' });
//   }
// });


router.post('/share', auth, async (req, res) => {
  try {
    const { fileId, folderId, email } = req.body;

    // Check if either fileId or folderId is provided
    if (!fileId && !folderId) {
      return res.status(400).json({ error: 'Please provide a valid fileId or folderId' });
    }

    // Find the file or folder based on provided ID
    let item;
    if (fileId) {
      item = await File.findById(fileId);
    } else {
      item = await Folder.findById(folderId);
    }

    if (!item) {
      return res.status(404).json({ error: 'File or folder not found' });
    }

    // Find the user based on the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add the user ID to sharedUsers array in the item
    if (!item.sharedUsers.includes(user._id)) {
      item.sharedUsers.push(user._id);
      await item.save();
    }

    res.status(200).json({ message: 'File or folder shared successfully' });
  } catch (error) {
    console.error('Error sharing file/folder:', error);
    res.status(500).json({ message: 'Unable to share file or folder' });
  }
});



router.get('/shared',auth, async (req, res) => {
  try {
    console.log('hare ram')
    const userId = req.user.id; // Assuming you have implemented authentication and have access to user's email

    
    // Find all files and folders where the user's email is in the sharedUsers array
    const sharedFiles = await File.find({ sharedUsers: userId });
    const sharedFolders = await Folder.find({ sharedUsers: userId });

    // Send the shared files and folders to the client
    res.status(200).json({ sharedFiles, sharedFolders });
  } catch (error) {
    console.error('Error fetching shared items:', error);
    res.status(500).json({ error: 'Unable to fetch shared items' });
  }
}); 


router.get('/file/sharedUsers/:fileId' , auth , async (req,res)=>{
  try{
    const fileId = req.params.fileId;
  const userId  = req.user._id;

  //console.log(folder)
  // const users = folder.populate('sharedUsers')
  const files = await File.findOne({_id : fileId , owner : userId}).populate('sharedUsers','email name')
    console.log(files.sharedUsers)
  res.render('sharedusers',{ sharedUsers : files.sharedUsers });

    
  if(!files){
    console.log('yaha bhi aa rha hh')
    res.status(404).json({error: 'Folder not found'})
  }
   



  } 
  catch(error){
    console.error('Error fetching shared users:', error);
    res.status(500).json({ error: 'An error occurred' });

  }

});




router.post('/file/unshare', auth, async (req, res) => {
  try {
    console.log('hare ram hare krishnaaa')
    const fileId = req.body.itemId;
    const usermail = req.body.email;
    
    console.log(usermail)
    const user  = await User.findOne({email : usermail})
    // Find the folder by ID and owner
    const file = await File.findOne({ _id: fileId, owner: req.user._id });
    console.log('hare ram 3')
    if (!file) {
      return res.status(404).json({ error: 'Folder not found or user is not the owner' });
    }
    console.log('hare krishna')
    // Remove the user ID from the "sharedWith" array
    file.sharedUsers = file.sharedUsers.filter(sharedUserId => sharedUserId.toString() !== user._id.toString());

    await file.save();

    console.log('Unsharing successful');
    res.status(200).json({ message: 'File unshared successfully' });
  } catch (error) {
    console.error('Error unsharing folder:', error);
    res.status(500).json({ error: 'Unable to unshare folder' });
  }
}); 


router.get('/file/moveToBin/:fileId' , auth , async (req,res) =>{

  try{
    const fileId = req.params.fileId;
    console.log(fileId)
    const userId = req.user._id;
  
    const file = await File.findOne({ _id: fileId, owner: userId })

  console.log(file)
  file.isDeleted = true;
  await file.save();

  res.json({ file ,  message: 'Folder moved to Recycle Bin successfully' });

  }
  catch(error){

    console.error(error)
    res.status(404).json({ message : 'Unable to move to Recycle Bin'});

  }

})  


router.get('/getfiles/recycleBin' , auth , async(req,res)=>{

  try{

    const files = await File.find({owner : req.user._id , isDeleted: true});
    
    console.log(files)

    res.status(200).json({files});

  }
  catch(error)
  {
    console.error(error)
    res.status(400).json({message : 'An error occured'})
    
  }
})


router.post('/files/restore/:fileId' , auth , async (req,res)=>{

  try{
    const fileId = req.params.fileId;
    console.log(fileId)
    const file = await File.findOne({owner : req.user._id , _id : fileId})

    file.isDeleted = false;
    await file.save();
    res.status(200).json({message : 'Folder restored successfully'})

  }
  catch(error){
    console.error(error)
    res.status(400).json({message : 'Unable to restore Folder'})

  }
}) 




// handle the public link download link

// Server-side code
router.get('/public/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const file = await File.findOne({ publicLinkToken: token });

    if (!file) {
      return res.status(404).json({ error: 'Invalid or expired public link' });
    }

    const filePath = `./uploads/${file.filename}`;

    // Use res.download() to serve the file for download
    res.download(filePath, file.originalName);

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Unable to download file' });
  }
});





module.exports = router;
