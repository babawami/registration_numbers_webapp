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

app.use(session({
    secret: 'Not in database',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

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
        let regID = await RegNumbers.getTownCode();
        let displayRegNum = await RegNumbers.returnAllReg();
        let regNumber = req.body.regNum;
        let regex = /^[a-zA-Z]{2,3}(\s)[0-9]{3}(\s)[0-9]{3}$/;
        if (regNumber.match(regex)) {
            let storeRegNum = await RegNumbers.storeRegNum(regNumber);
            if (storeRegNum === 'matched') {
                req.flash('error', 'Registration already exits');
            }
            res.render('home', { displayRegNum, regID });
        } else {
            req.flash('error', 'Entered Registatration Has Invalid Pattern!!');
            res.render('home', { displayRegNum, regID });
        }
    } catch (err) {
        next(err.stack);
    }
});

app.post('/reg_numbers/town', async function (req, res, next) {
    try {
        let townReg = req.body.town;
        let regID = await RegNumbers.getTownCode();
        let displayRegNum = await RegNumbers.filterReg(townReg);
        console.log(displayRegNum.length);

        // loop through the regID list
        // check if the current entry match townReg
        // if it does add a selected property selected = 'selected'
        for (let index = 0; index < regID.length; index++) {
            const currentTown = regID[index];
            if (currentTown.towncode === townReg) {
                currentTown.selected = 'selected';
                break;
            }
        }
        if (displayRegNum.length === 0) {
            console.log('No resgistrations where entred');
        }

        res.render('home', { displayRegNum, regID });
    } catch (err) {
        next(err.stack);
    }
});

app.get('/', async function (req, res, next) {
    try {
        let regID = await RegNumbers.getTownCode();
        let displayRegNum = await RegNumbers.returnAllReg();
        res.render('home', { displayRegNum, regID });
    } catch (err) {
        next(err.stack);
    }
});

// port set-up
let PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
    console.log('App starting on port', PORT);
});
