const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

 var fs = require('fs');
 const path = require('path');

const readHTML = require('../readHTML');
router.use(express.static('public'));



var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');


router.get('/', (req, res) =>
{
    const employeecode = req.cookies.employeecode;
    const name = req.cookies.name;

    const logConnection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/activity_log.mdb;');
    const d = new Date();
    const loginDate = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
    const timeOfLogout = d.getHours() + ":" + String(d.getMinutes()).padStart(2, '0');
    logConnection.execute("INSERT INTO [Log] (EmployeeCode, [Name], [Date], [Time], Activity) VALUES ('" + employeecode + "', '" + name + "', '" + loginDate + "', '" + timeOfLogout + "', 'Logout')");

    req.session.destroy();

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(htmlhead);
    res.write(htmlheader);
   // if(req.session.loggedin){var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html'); res.write(htmlLoggedinMenuCSS); }
   // if(req.session.loggedin){var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html'); res.write(htmlLoggedinMenuJS); }
   // if(req.session.loggedin){var htmlLoggedinMenu = readHTML('./html/loggedinmenu.html'); res.write(htmlLoggedinMenu); }
    res.write(htmlmenu);
    res.write(htmlinfostart);

    res.write("You have been logged out");
    

    res.write(htmlinfostop);
    res.write(htmlbottom);

    res.end();

});


module.exports = router;