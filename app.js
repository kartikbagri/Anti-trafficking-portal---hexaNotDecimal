// HexaNotDecimal
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/userSchema');
const Report = require('./models/reportSchema');
const middleware = require('./middleware');
const multer  = require('multer')
const upload = multer({ dest: 'face_detection/image_set/' })
const uploadInput = multer({ dest: 'face_detection/input_image/' })
const fs = require('fs');
const path = require('path');

// Facial Recognition
// const canvas = require('canvas');
// const faceapi = require('face-api.js');

// Python
const spawn = require("child_process").spawn;

const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

const sessionConfig = {
    secret: 'SESSION_SECRET',
    resave: false,
    saveUninitialized: false,
}
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://localhost:27017/sihDatabase').then(() => {
    console.log('Database Connection Successful');
}).catch((err) => {
    console.log(`Error setting up connection to database: ${err}`);
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    try {
        const {email: username, password} = req.body;
        const user = new User({username, password});
        await User.register(user, password);
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.redirect('/signup');
    }
});

app.get('/login', (req, res) => {
    const payload = {login: true};
    res.render('login', payload);
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
    res.redirect('/');
});

app.get('/', middleware.isLoggedIn, (req, res) => {
    res.render('home');
})

app.get('/about', (req, res) => {
    res.render('aboutUs');
})

app.get('/missing', middleware.isLoggedIn, (req, res) => {
    const payload = {missing: true};
    res.render('missingReport', payload);
});

app.post('/missing', upload.array('recentImages'), async (req, res) => {
    const data = { missingPersonName, gender, age, aadhaarNumber, reporterName, reporterPhoneNumber, reporterAadhaarNumber, reporterAddress } = req.body;
    const newReport = new Report(data);
    try {
        const response = await newReport.save();
        for(let i = 0; i < req.files.length; i++) {
            const filePath = req.files[i].originalname;
            const tempPath = req.files[i].path;
            try {
                if (!fs.existsSync(`./face_detection/image_set/${response._id.toString()}`)) {
                    fs.mkdirSync(`./face_detection/image_set/${response._id.toString()}`);
                }
            } catch(err) {
                console.log(err);
                res.sendStatus(400);
            }
            const targetPath = path.join(__dirname, `./face_detection/image_set/${response._id.toString()}/${filePath}`);
            fs.rename(tempPath, targetPath, function(err) {
                if(err){
                    console.log(err);
                    return res.sendStatus(400);
                }
            });
        }
    } catch(err) {
        console.log(err);
        res.sendStatus(400);
    }
    res.redirect('/');
})

app.get('/facescan', middleware.isLoggedIn, (req, res) => {
    const payload = {facescan: true};
    res.render('faceScan', payload);
})

app.post('/facescan', uploadInput.single('inputImg') , async (req, res) => {
    const filePath = req.file.filename;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `./face_detection/input_image/${filePath}.png`);
    fs.rename(tempPath, targetPath, function(err) {
        if(err){
            console.log(err);
            return res.sendStatus(400);
        }
    });
    const pythonProcess = spawn('python', ["./face_detection/face_recog.py", `./face_detection/input_image/${filePath}.png`]);
    pythonProcess.stdout.on('data', async (data) => {
        const result = JSON.parse(data);
        if(result.verified) {
            result.report = await Report.findById(result.reportId);
        }
        res.send(result);
    });
    // await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights')
    // await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights')
    // await faceapi.nets.faceRecognitionNet.loadFromDisk('./weights')
    // const { Canvas, Image, ImageData } = canvas
    // faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
    
    // const queryImg = await canvas.loadImage('face_detection/input_image/' + filePath + '.png');
    // const referenceImg = await canvas.loadImage('face_detection/image_set/person/photo.jpeg');
    // const referenceResults = await faceapi.detectSingleFace(referenceImg).withFaceLandmarks().withFaceDescriptor();
    // const faceMatcher = new faceapi.FaceMatcher(referenceResults)
    // const queryResults = await faceapi.detectSingleFace(queryImg).withFaceLandmarks().withFaceDescriptor();
    // const bestMatch = faceMatcher.findBestMatch(queryResults.descriptor);
    // console.log(bestMatch);
    // res.send(bestMatch);
    // console.log(detection);
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
