const express = require('express');
const cors = require('cors')
const multer = require('multer')
const mongoose = require('mongoose')
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const upload = multer()
const app = express()
require('dotenv').config()
const port = process.env.PORT
mongoose.connect(process.env.MONGODB_URI)


const bucket = process.env.BUCKET
const bucketRegion = process.env.REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials:{
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
})

app.use(express.json())
app.use(cors())


app.get('/',(req, res)=>{
    res.send('home route')
})

app.post('/upload-image', upload.any(), async(req, res)=>{
    const {files} = req;
    const {title, description} = req.body

    const image = files.find((item) => item.fieldname === 'image');
    console.log(image)
    const params = {
        Bucket: bucket,
        Key: `demo/${image.originalname}`,
        Body: image.buffer,
        ContentType: image.mimetype,
    }

    const command = new PutObjectCommand(params)
    await s3.send(command)

    res.send('upload done')
})

app.get('/image', async(req, res)=>{
    res.send('get route')
})

app.delete('/delete-image', async(req, res)=>{
    res.send('delete route')
})

const db = mongoose.connection;

db.on("error", (error)=>{
    console.log(error)
})
db.once("connected", ()=>{
    console.log("Data Base Connected");
})

app.listen(port, ()=>{
    console.log(`server started ${port}`)
})
