const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const dotenv = require('dotenv');
// var logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const nocache = require('nocache');
// import swal from 'sweetalert2';
const app = express();
// dotenv path
dotenv.config({ path: '.env' });

// set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// static files
app.use(express.static('public/user'));
app.use(express.static('public'));

// connect to MongoDB
// const dbURI = "mongodb://0.0.0.0:27017/Project";
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to db'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.use(nocache());
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressLayouts);
app.set('layout', '../views/layout/layout.ejs');

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

// session handling
app.use(
  session({
    secret: 'thisismysecretkey',
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
    resave: false,
  }),
);

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('*', (req, res) => {
  res.render('404');
});

// server port settings
app.listen(PORT, () => console.log(`server started on ${PORT}`));
