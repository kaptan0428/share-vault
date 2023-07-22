const express = require('express');
const router = express.Router();
const Folder = require('../models/folder');
const auth =require('../middleware/auth')
const File= require('../models/files')
const User = require('../models/user')
const archiver = require('archiver');
const fs= require('fs')
const axios = require('axios')


// Route for creating a new folder
router.post('/folders', auth ,  async (req, res) => {
  const { name, parentFolder} = req.body;

console.log('sjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj')
  try {
    // Create a new folder document
    const folder = new Folder({
      name,
      parentFolder,
      owner : req.user._id
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

  if (filesResponse.status !== 200) {
    throw new Error('Failed to fetch files');
  }

  const files = filesResponse.data.files;

  for (const file of files) {
    if (file) {
      const filePath = `../Project/uploads/${file.uploadname}`;
      const archivedFilePath = folderPath + '/' + file.filename; // Include subfolder path in archived file name
      archive.append(fs.createReadStream(filePath), { name: archivedFilePath });
    }
  }

  const foldersResponse = await axios.get(`http://localhost:3000/folders/${folder._id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (foldersResponse.status !== 200) {
    throw new Error('Failed to fetch folders');
  }

  const subfolders = foldersResponse.data.folders;

  for (const subfolder of subfolders) {
    const subfolderPath = folderPath + '/' + subfolder.name + '/';
    archive.append(null, { name: subfolderPath });
  }

  for (const subfolder of subfolders) {
    await addFolderToArchive(archive, subfolder, token, folderPath + '/' + subfolder.name);
  }
}

router.post('/folder/unshare', auth, async (req, res) => {
  try {
    console.log('hare ram 2')
    const folderId = req.body.itemId;
    const usermail = req.body.email;
    console.log(folderId)
    console.log(usermail)

    // Find the folder by ID and owner
    const folder = await Folder.findOne({ _id: folderId, owner: req.user._id });
    console.log('hare ram 3')
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found or user is not the owner' });
    }
    console.log('hare krishna')
    // Remove the user ID from the "sharedWith" array
    folder.sharedUsers = folder.sharedUsers.filter(sharedUserId => sharedUserId.toString() !== usermail.toString());

    await folder.save();

    console.log('Unsharing successful');
    res.status(200).json({ message: 'Folder unshared successfully' });
  } catch (error) {
    console.error('Error unsharing folder:', error);
    res.status(500).json({ error: 'Unable to unshare folder' });
  }
}); 

router.get('/folder/sharedUsers/:folderId' , auth , async (req,res)=>{

  try{

    const folderId = req.params.folderId;
  const userId  = req.user._id;

  const folder = await Folder.findOne({ _id: folderId, owner: userId })
  
  //console.log(folder)
  
  const sharedUserEmails = folder.sharedUsers;
  // const users = folder.populate('sharedUsers')
  
  const sharedUsers = await Promise.all(
    sharedUserEmails.map(async (email) => {

      const user = await User.findOne({ email });

      // Return an object with the user information you need
      return {


        email,
        name: user ? user.name : 'User Not Found' // Add any other user information you need
      };
    })
  );
    console.log(sharedUsers)
  res.render('sharedusers',{ sharedUsers });

    
  if(!folder){
    res.status(404).json({error: 'Folder not found'})
  }
  
  console.log(sharedUsers)



  } 
  catch(error){
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


module.exports = router
