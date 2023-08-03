
const mongoose=require('mongoose')
const { bool } = require('sharp')
const validator=require('validator')

const fileSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      uploadname: {
        type: String,
        required: true
      },
      path: {
        type: String,
        required: true
      },
      mimetype: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
      },
      isDeleted : {
        type : Boolean,
        default : false
      },
      publicLinkToken : {
        type : String,
        unique : true
      },
      sharedUsers: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        default: []
      }]
},{
    timestamps : true
})
const File= mongoose.model('File',fileSchema)

module.exports = File