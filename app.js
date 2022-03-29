// HexaNotDecimal
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/userSchema');
const middleware = require('./middleware');
const multer  = require('multer')
const upload = multer({ dest: 'face_detection/image_set/' })
const uploadInput = multer({ dest: 'face_detection/input_image/' })
const fs = require('fs');
const path = require('path');

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
    res.redirect('/missing');
});

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/missing', (req, res) => {
    const payload = {missing: true};
    res.render('missingReport', payload);
});

app.post('/missing', upload.array('recentImages'), (req, res) => {
    for(let i = 0; i < req.files.length; i++) {
        const filePath = req.files[i].originalname;
        const tempPath = req.files[i].path;
        try {
            if (!fs.existsSync('./face_detection/image_set/vikas')) {
                fs.mkdirSync('./face_detection/image_set/vikas');
            }
        } catch(err) {
            console.log(err);
            res.sendStatus(400);
        }
        const targetPath = path.join(__dirname, `./face_detection/image_set/vikas/${filePath}`);
        fs.rename(tempPath, targetPath, function(err) {
            if(err){
                console.log(err);
                return res.sendStatus(400);
            }
        });
    }
    res.redirect('/');
})

app.get('/facescan', (req, res) => {
    const payload = {facescan: true};
    res.render('faceScan', payload);
})

app.post('/facescan', uploadInput.single('inputImg') , (req, res) => {
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
    pythonProcess.stdout.on('data', (data) => {
        const result = JSON.parse(data);
        res.send(result);
    });
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
