const express = require('express');
const cors = require('cors')
const multer = require('multer')
const mongoose = require('mongoose')
const {S3Client, PutObjectCommand, GetObjectCommand} = require('@aws-sdk/client-s3')
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner')
const imageModel = require('./models')
const crypto = require('crypto')
const upload = multer()
const app = express()
require('dotenv').config()
const port = process.env.PORT
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
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

    const imageName = randomImageName();
    const params = {
        Bucket: bucket,
        Key: `demo/${imageName}`,
        Body: image.buffer,
        ContentType: image.mimetype,
    }
    const getObjParams = {
        Bucket: bucket,
        Key: `demo/${imageName}`,
    }

    const command = new PutObjectCommand(params)
    await s3.send(command)

    const getImageUrl = new GetObjectCommand(getObjParams)
    console.log(getImageUrl)
    const url = await getSignedUrl(s3, getImageUrl)

    const createImageData = await imageModel.create({
        title,
        description,
        image: imageName,
        imageUrl: url
    })

    console.log(createImageData)
    res.send('upload done')
})

app.get('/images', async(req, res)=>{
    console.log("a")
    const allImages = await imageModel.find({})
    console.log(allImages)
    res.status(200).json({data: allImages})
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
