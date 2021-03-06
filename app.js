const express = require('express')
const path = require('path')
const crypto = require('crypto')//to generate file name
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const { ReadStream } = require('tty')
const app = express();
var MultiStream = require('multistream');
const uri  = "mongodb+srv://Shantanu:bb0pD4SFebUd72gd@cluster0-fzxvj.mongodb.net/idhardekho?retryWrites=true&w=majority";


mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  },function(err){
  if(err){
    //throw err;
    console.log(err);
  }else{
    console.log ('Database connection succeeded');
  }
});
let conn = mongoose.connection;
let gfs;
conn.once('open', () => {
    //initialize our stream
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection('Images')
})

let storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
      return new Promise(
          (resolve, reject) => {
                     const fileInfo = {
                  filename: file.originalname,
                  bucketName: "Images"
              }
              resolve(fileInfo)

          }
      )
  }
})

const upload = multer({ storage })


app.post("/upload",upload.single("upload"),(req,res)=>{
  gfs.files.find().toArray((err, files) => {
    //check if files exist
    if (!files || files.length == 0) {
        return res.status(404).json({
            err: "No files exist"
        })
    }
    console.log("files",files);
    res.redirect('/index');
})
})

app.get('/index',(req,res)=>{
  gfs.files.find().toArray((err, files) => {
    //check if files exist
    if (!files || files.length == 0) {
        return res.status(404).json({
            err: "No files exist"
        })
    }
    console.log("files",files);
    res.render("index.ejs",{files:files})
})
})


  app.get('/files/:filename', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //check if files exist
        if (!files || files.length == 0) {
            return res.status(404).json({
                err: "No files exist"
            })
        }
        // files exist
        let stream = [];
        console.log("files length",files.length);
        files.map(file =>{
           let createReadStream = gfs.createReadStream(req.params.filename);
           //console.log("logs",createReadStream.pipe(index.txt));
           stream.push(createReadStream)
        })
        console.log("stream size",stream.length);
        return new MultiStream(stream).pipe(res);
   
    })
})

app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
      //check if files exist
      if (!files || files.length == 0) {
          return res.status(404).json({
              err: "No files exist"
          })
      }
      // files exist
      res.render("index.ejs",{file:filename});

  })
})

// other code here

const PORT = 5000
app.listen(PORT,()=>console.log(`Server started on port ${PORT}`))