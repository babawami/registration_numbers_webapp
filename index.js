'use strict';

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const RegnumbersFactory = require('./reg-numbers');
const RegistrationRoutes = require('./registration-routes');
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
const regnumbers = RegnumbersFactory(pool);
const regroutes = RegistrationRoutes(regnumbers);

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

app.post('/reg_numbers', regroutes.regNumbersStored);

app.post('/reg_numbers/town', regroutes.filterRegNumbers);

app.get('/', regroutes.showRegNumbers);

app.get('/clear', regroutes.clearAll);

// port set-up
let PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
    console.log('App starting on port', PORT);
});
