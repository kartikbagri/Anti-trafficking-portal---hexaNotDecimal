// HexaNotDecimal
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/userSchema');
const middleware = require('./middleware');

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

app.get('/missing', middleware.isLoggedIn, (req, res) => {
    const payload = {missing: true};
    res.render('missingReport', payload);
});

app.get('/facescan', middleware.isLoggedIn, (req, res) => {
    const payload = {facescan: true};
    res.render('faceScan', payload);
})

app.post('/facescan', (req, res) => {
    const pythonProcess = spawn('python',["./face_detection/script.py", "./face_detection/k1.webp", "./face_detection/k2.jpeg"]);
    pythonProcess.stdout.on('data', (data) => {
        res.send(data);
    });
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
