const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');



const pug = require('pug');
const {response} = require('express');
const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');

app.use(session({secret: 'thisisasecret', saveUninitialized: true, resave: true})); 
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var cookieParser = require('cookie-parser');
app.use(cookieParser());


//läser in routers
const info = require('./routes/info');
const login = require('./routes/login');
const logout = require('./routes/logout');
const personnelRegistry = require('./routes/personnelregistry');
const virusDatabase = require('./routes/virusdatabase');
const newEmployee = require('./routes/newemployee');
const editEmployee = require('./routes/editemployee');
const deleteEmployee = require('./routes/deleteemployee');
const getchat = require('./routes/getchat');
const chat = require('./routes/chat');
const newvirus = require('./routes/newvirus');
const editvirus = require('./routes/editvirus');
const deletevirus = require('./routes/deletevirus');
const entries = require('./routes/entries');
const fileuploadvirus = require('./routes/fileuploadvirus');
const editvirusimage = require('./routes/editvirusimage');
const panic = require('./routes/panic');
const activityLog = require('./routes/activityLog');
const userdatabase = require('./routes/userdatabase');
const livestream = require('./routes/livestream');


//läser in MAster-frame
 var fs = require('fs');
 const path = require('path');

const readHTML = require('./readHTML');
app.use(express.static(path.join(__dirname, 'public')));



var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');

//deafualt router
app.get('/', (req, res) =>
{
    //utskrift av master-frame
    res.write(htmlhead);
    res.write(htmlheader);
    if(req.session.loggedin){var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html'); res.write(htmlLoggedinMenuCSS); }
    if(req.session.loggedin){var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html'); res.write(htmlLoggedinMenuJS); }
   // if(req.session.loggedin){var htmlLoggedinMenu = readHTML('./html/loggedinmenu.html'); res.write(htmlLoggedinMenu); }
    if(req.session.loggedin){
    res.write(pug_loggedinmenu({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes, securityAccessLevel: req.session.securityAccessLevel}));
}
    res.write(htmlmenu);
    res.write(htmlinfostart);

    var htmlinfo = readHTML('./text/index.html');
    res.write(htmlinfo);


    //utskrift av master-frame nedre del
    res.write(htmlinfostop);
    res.write(htmlbottom);

    res.end();

});

app.use('/api/info', info);
app.use('/api/login', login);
app.use('/api/logout', logout);
app.use('/api/personnelregistry', personnelRegistry);
app.use('/api/virus', virusDatabase)
app.use('/api/newemployee', newEmployee);
app.use('/api/editemployee', editEmployee);
app.use('/api/deleteemployee', deleteEmployee);
app.use('/api/getchat', getchat);
app.use('/api/chat', chat);

app.use('/api/newvirus', newvirus);
app.use('/api/editvirus', editvirus);
app.use('/api/deletevirus', deletevirus);
app.use('/api/entries', entries);
app.use('/api/fileuploadvirus', fileuploadvirus);
app.use('/api/editvirusimage', editvirusimage);
app.use('/api/panic', panic);
app.use('/api/activitylog', activityLog);
app.use('/api/userdatabase', userdatabase);
app.use('/api/livestream', livestream);


const server = app.listen(3000, () =>
{
    console.log('Server is running on http://localhost:3000');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('Error: Port 3000 is already in use. Kill the existing process and try again.');
    } else {
        console.error('Server error:', err.message);
    }
    process.exit(1);
});
