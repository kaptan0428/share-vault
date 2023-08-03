const express = require('express');
const router = express.Router();
const Folder = require('../models/folder');
const auth =require('../middleware/auth')
const File= require('../models/files')
const User = require('../models/user')
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const axios = require('axios')

const { v4: uuidv4 } = require('uuid');



// Route for creating a new folder
router.post('/folders', auth ,  async (req, res) => {
  const { name, parentFolder} = req.body;

console.log('sjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj')
  try {

    const publicLinkToken = uuidv4();

    // Create a new folder document
    const folder = new Folder({
      name,
      parentFolder,
      owner : req.user._id,
      publicLinkToken

    });

    // Save the folder to the database
    const savedFolder = await folder.save();

    // If the parentFolder is provided, update the parentFolder's subfolders array
    if (parentFolder) {
      const parent = await Folder.findById(parentFolder);
      if (parent) { 
        parent.subfolders.push(savedFolder._id);
        await parent.save();
      }
    }
    console.log(savedFolder)
    res.status(201).json({ folder: savedFolder });
  } catch (error) {
    res.status(500).json({ error: 'Unable to create folder' });
  }
});


  router.get('/folders/:id', auth , async (req, res) => {
    try {
      const parentFolderId = req.params.id; // Get the parent folder ID from the query parameters
      console.log('yaha tak toh thik hh folder route memmm '+ parentFolderId)
      const userId = req.user._id;

      let folders;

      if (parentFolderId !=="null" && parentFolderId!=="undefined") {
        // If parent folder ID is provided, find folders with matching parent folder ID
        folders = await Folder.find({ parentFolder: parentFolderId , isDeleted : false   });
      } else {
        // If parent folder ID is not provided, find folders with null parent folder ID
        folders = await Folder.find({ parentFolder: null , owner: userId , isDeleted : false  });
      }
      //console.log(folders)
      res.status(200).json({ folders });
    } catch (error) {
      console.error('Error retrieving folders:', error);
      res.status(500).json({ error: 'Unable to fetch folders' });
    }
  });
router.delete('/folders/:folderId', auth, async (req, res) => {
  try {
    console.log('atleast')
    const folderId = req.params.folderId;
    const userId = req.user._id;

    // Find the folder by ID and owner
    const folder = await Folder.findOne({_id: folderId, owner: userId });
    console.log(folder)
    if (!folder) {
      // Folder not found or user is not the owner
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Remove the folder from its parent's subfolders array
    if (folder.parentFolder) {
      const parentFolder = await Folder.findById(folder.parentFolder);
      if (parentFolder) {
        parentFolder.subfolders = parentFolder.subfolders.filter(
          subfolderId => subfolderId.toString() !== folderId
        );
        await parentFolder.save();
      }
    }
    

    // Delete the associated files
    await File.deleteMany({ folder: folderId });

      console.log('yaha tak ok')
    // Delete the folder
    await Folder.findByIdAndDelete(folderId);

    res.json({ message: 'Folder and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Unable to delete folder and associated files' });
  }
});






router.get('/folders/:id/download', auth , async (req, res) => {
  try {
    const folderId = req.params.id;
    
    // Retrieve folder data from the database based on folderId
    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Create a writable stream to store the ZIP file
    const zipPath = `./temp/folder_${folderId}.zip`;
    const output = fs.createWriteStream(zipPath);
    
    // Create a new archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level (optional)
    });

    // Pipe the archive to the output stream
    archive.pipe(output);
    let folderPath = ''
    // Add all files and subfolders in the folder to the archive
    await addFolderToArchive(archive, folder,req.token,folderPath);

    // Finalize the archive and close the output stream
    archive.finalize();
    
    // Set headers for the response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${folder.name}.zip"`);

    // Stream the ZIP file to the response
    fs.createReadStream(zipPath).pipe(res);
  } catch (error) {
    console.error('Error downloading folder:', error);
    res.status(500).json({ error: 'Unable to download folder' });
  }
});


// Recursive function to add files and subfolders to the archive
async function addFolderToArchive(archive, folder, token, folderPath) {
  const filesResponse = await axios.get(`http://localhost:3000/files/${folder._id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // const files = await File.find({folder : folder._id})


  if (filesResponse.status !== 200) {
    throw new Error('Failed to fetch files');
  }

  const files = filesResponse.data.files;
  console.log(files)
  if(files!=[])
  {for (const file of files) {
    if (file) {
      const filePath = `../Project/uploads/${file.uploadname}`;
      console.log('jain' + filePath)

      const archivedFilePath = folderPath + '/' + file.filename; // Include subfolder path in archived file name
      console.log('Archived file path:', archivedFilePath);
      archive.append(fs.createReadStream(filePath), { name: archivedFilePath });
    }
  }}

  const foldersResponse = await axios.get(`http://localhost:3000/folders/${folder._id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (foldersResponse.status !== 200) { 
    throw new Error('Failed to fetch folders');
  }

  const subfolders = foldersResponse.data.folders;


    // const subfolders = await Folder.find({ parentFolder: folder._id, isDeleted: false });


// Now subfoldersArray contains all the subfolders as an array
console.log(subfolders);


  for (const subfolder of subfolders) {
    console.log('andar '+ subfolder)
    const subfolderPath = folderPath + '/' + subfolder.name + '/';
    archive.append(null, { name: subfolderPath });
  }

  for (const subfolder of subfolders) {
    await addFolderToArchive(archive, subfolder, token, folderPath + '/' + subfolder.name);
  }
}



router.get('/folder/public/:token', async(req,res)=>{

  try{

    const publicLinkToken = req.params.token;

    const folder = await Folder.findOne({publicLinkToken})

    if(!folder)
    res.status(404).json({eroor: 'File not found or public link expired'})
    res.redirect(`/publicfolders/${folder._id}/download`)
  }
  catch(error)
  {
    console.error('Error downloading file using public link:', error);
  res.status(500).json({ error: 'Unable to download file' });

  }

})


router.get('/publicfolders/:id/download', async (req, res) => {
  try {
    const folderId = req.params.id;
    
    // Retrieve folder data from the database based on folderId
    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Create a writable stream to store the ZIP file
    const zipPath = `./temp/folder_${folderId}.zip`;
    const output = fs.createWriteStream(zipPath);
    
    // Create a new archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level (optional)
    });

    // Pipe the archive to the output stream
    archive.pipe(output);
    let folderPath = ''
    // Add all files and subfolders in the folder to the archive
    await addPublicFolderToArchive(archive, folder,folderPath);

    // Finalize the archive and close the output stream
    archive.finalize();
    
    // Set headers for the response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${folder.name}.zip"`);

    // Stream the ZIP file to the response
    fs.createReadStream(zipPath).pipe(res);
  } catch (error) {
    console.error('Error downloading folder:', error);
    res.status(500).json({ error: 'Unable to download folder' });
  }
});


// Recursive function to add files and subfolders to the archive
async function addPublicFolderToArchive(archive, folder, folderPath) {
  

  const fileResponse = await axios.get(`http://localhost:3000/publicfiles/${folder._id}`);

  if (fileResponse.status !== 200) { 
    throw new Error('Failed to fetch folders');
  }

  const files = fileResponse.data.files;


  console.log(files)

  for (const file of files) {
    if (file) {
      const filePath = path.join('../Project/uploads', file.uploadname);    
      console.log(filePath)  
      const archivedFilePath = folderPath + '/' + file.filename; // Include subfolder path in archived file name
      archive.append(fs.createReadStream(filePath), { name: archivedFilePath });
    }
  }

  const foldersResponse = await axios.get(`http://localhost:3000/publicfolders/${folder._id}`);

  if (foldersResponse.status !== 200) { 
    throw new Error('Failed to fetch folders');
  }

  const subfolders = foldersResponse.data.folders;
  console.log(subfolders)


  for (const subfolder of subfolders) {
    const subfolderPath = folderPath + '/' + subfolder.name + '/';
    console.log('jain' + subfolderPath)
    archive.append(null, { name: subfolderPath });
    // await addPublicFolderToArchive(archive, subfolder, folderPath + '/' + subfolder.name);
  }

  for (const subfolder of subfolders) {
    await addPublicFolderToArchive(archive, subfolder, folderPath + '/' + subfolder.name);
  }
}



router.get('/publicfolders/:id', async (req, res) => {
  try {
    const parentFolderId = req.params.id; // Get the parent folder ID from the query parameters
    console.log('yaha tak toh thik hh folder route public waala '+ parentFolderId)

    let folders;

   
      folders = await Folder.find({ parentFolder: parentFolderId, isDeleted : false  });

    res.status(200).json({ folders });
  } catch (error) {
    console.error('Error retrieving folders:', error);
    res.status(500).json({ error: 'Unable to fetch folders' });
  }
});

router.get('/publicfiles/:id', async (req, res) => {
  try {
    const parentFolderId = req.params.id; // Get the parent folder ID from the query parameters
    console.log('yaha tak toh thik hh file route public waala '+ parentFolderId)

    let files;

   
      files = await File.find({ folder: parentFolderId, isDeleted : false  });

    res.status(200).json({ files });
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ error: 'Unable to fetch folders' });
  }
});



router.post('/folder/unshare', auth, async (req, res) => {
  try { 
    console.log('hare ram 2')
    const folderId = req.body.itemId;
    const usermail = req.body.email;
    console.log(folderId)
    console.log(usermail)

    const user = await User.findOne({email : usermail})

    // Find the folder by ID and owner
    const folder = await Folder.findOne({ _id: folderId, owner: req.user._id });
    console.log('hare ram 3')
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found or user is not the owner' });
    }
    console.log('hare krishna')
    // Remove the user ID from the "sharedWith" array
    folder.sharedUsers = folder.sharedUsers.filter(sharedUserId => sharedUserId.toString() !== user._id.toString());

    await folder.save();

    console.log('Unsharing successful');
    res.status(200).json({ message: 'Folder unshared successfully' });
  } catch (error) {
    console.error('Error unsharing folder:', error);
    res.status(500).json({ error: 'Unable to unshare folder' });
  }
}); 

// router.get('/folder/sharedUsers/:folderId' , auth , async (req,res)=>{

//   try{

//     const folderId = req.params.folderId;
//   const userId  = req.user._id;

//   const folder = await Folder.findOne({ _id: folderId, owner: userId })
  
//   //console.log(folder)
  
//   const sharedUserEmails = folder.sharedUsers;
//   // const users = folder.populate('sharedUsers')
  
//   const sharedUsers = await Promise.all(
//     sharedUserEmails.map(async (email) => {

//       const user = await User.findOne({ email });

//       // Return an object with the user information you need
//       return {


//         email,
//         name: user ? user.name : 'User Not Found' // Add any other user information you need
//       };
//     })
//   );
//     console.log(sharedUsers)
//   res.render('sharedusers',{ sharedUsers });

    
//   if(!folder){
//     res.status(404).json({error: 'Folder not found'})
//   }
  
//   console.log(sharedUsers)



//   } 
//   catch(error){
//     console.error('Error fetching shared users:', error);
//     res.status(500).json({ error: 'An error occurred' });

//   }

// });




router.get('/folder/sharedUsers/:folderId', auth, async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const userId = req.user._id;

    // Find the folder in the database with the provided folderId and userId
    const folder = await Folder.findOne({ _id: folderId, owner: userId }).populate('sharedUsers', 'email name');

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    console.log(folder.sharedUsers);

    res.render('sharedusers', { sharedUsers: folder.sharedUsers });
  } catch (error) {
    console.error('Error fetching shared users:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


router.get('/folder/moveToBin/:folderId' , auth , async (req,res) =>{

  try{
    const folderId = req.params.folderId;
    console.log(folderId)
    const userId = req.user._id;
  
    const folder = await Folder.findOne({ _id: folderId, owner: userId })

  console.log(folder)
  folder.isDeleted = true;
  await folder.save();

  res.json({ folder ,  message: 'Folder moved to Recycle Bin successfully' });

  }
  catch(error){

    console.error(error)
    res.status(404).json({ message : 'Unable to move to Recycle Bin'});

  }

})  

router.get('/getfolders/recycleBin' , auth , async(req,res)=>{

  try{

    const folders = await Folder.find({owner : req.user._id , isDeleted: true});
    
    console.log(folders)

    res.status(200).json({folders});

  }
  catch(error)
  {
    console.error(error)
    res.status(400).json({message : 'An error occured'})
    
  }
})


router.post('/folders/restore/:folderId' , auth , async (req,res)=>{

  try{
    const folderId = req.params.folderId;
    console.log(folderId)
    const folder = await Folder.findOne({owner : req.user._id , _id : folderId})

    folder.isDeleted = false;
    await folder.save();
    res.status(200).json({message : 'Folder restored successfully'})

  }
  catch(error){
    console.error(error)
    res.status(400).json({message : 'Unable to restore Folder'})

  }
})


module.exports = router
