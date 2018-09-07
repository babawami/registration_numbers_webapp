'use strict';

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const RegnumbersFactory = require('./reg-numbers');
const session = require('express-session');
const flash = require('express-flash');
const pg = require('pg');
const Pool = pg.Pool;

// should we use a SSL connection
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}

// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/wc_reg_numbers';

const pool = new Pool({
    connectionString,
    ssl: useSSL
});

// connect database to the factory function
const RegNumbers = RegnumbersFactory(pool);

let app = express();

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());

// route

app.post('/reg_numbers', async function (req, res, next) {
    try {
        let regNumber = req.body.regNum;
        let regex = /^[a-zA-Z]{2,3}(\s)[0-9]{3}(\s)[0-9]{3}$/;
        if (regNumber.match(regex)) {
            let storeRegNum = await RegNumbers.storeRegNum(regNumber);
            let displayRegNum = await RegNumbers.returnAllReg();
            if (storeRegNum === 'matched') {
                console.log('Registration already exits');
            }
            res.render('home', { displayRegNum });
        } else {
            console.log('please enter correct format');
        }
    } catch (err) {
        next(err.stack);
    }
});

app.get('/', async function (req, res, next) {
    try {
        let displayRegNum = await RegNumbers.returnAllReg();
        res.render('home', { displayRegNum });
    } catch (err) {
        next(err.stack);
    }
});

// port set-up
let PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
    console.log('App starting on port', PORT);
});
