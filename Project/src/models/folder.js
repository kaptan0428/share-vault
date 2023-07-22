const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  subfolders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted : {
    type : Boolean,
    default : false
  },
  sharedUsers: [{ 
    type: String,
    default: [] 
  }]
});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;
