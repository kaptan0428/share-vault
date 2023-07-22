const mongoose=require('mongoose') //iske lie npm i mongoose karna hhh


mongoose.connect('mongodb://127.0.0.1:27017/gdrive',{
    ///userNewUrlParser: true,
    //userCreateIndex: true
})
 // isse upar ka hissa mongoose ko setup karne me kaam aaya hh

 
//  const me= new User({
//     name: 'Abhinandan',
//     age: 21,
//     password: 'Password'
//  })

//  me.save().then(()=>{

//     console.log(me)

//  }).catch((error)=>{
//     console.log(error)

//  })

// const tasks=mongoose.model(('tasks'),{
//     description:{
//         type: String,
//         required: true,
//         trim: true
//     },
//     status: {
//         type:Boolean,
//         default: false
//     }
// })

// const task=new tasks({
//     description: 'Doing Dishes',
//     status: false
// })
// task.save().then(()=>{
//     console.log(task)

// }).catch((error)=>{
//     console.log(error)
// })
