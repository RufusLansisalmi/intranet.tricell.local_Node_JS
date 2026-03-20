const express = require('express');
const router = express.Router();

var cookieParser = require('cookie-parser');
router.use(cookieParser());

 var fs = require('fs');
 const path = require('path');

const readHTML = require('../readHTML');
router.use(express.static('public'));

const pug = require('pug');
const {response} = require('express');
const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');



var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');


router.get('/:id', (req, res) =>
{
 
    const id = req.params.id;

    // Öppna databasen
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

     async function sqlQuery()
    {
    


    res.write(htmlhead);
    res.write(htmlheader);
    if(req.session.loggedin){var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html'); res.write(htmlLoggedinMenuCSS); }
    if(req.session.loggedin){var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html'); res.write(htmlLoggedinMenuJS); }
    //if(req.session.loggedin){var htmlLoggedinMenu = readHTML('./html/loggedinmenu.html'); res.write(htmlLoggedinMenu); }
      if(req.session.loggedin){
        res.write(pug_loggedinmenu({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes}));
    }
    res.write(htmlmenu);
    res.write(htmlinfostart);
      if(req.session.loggedin)
        {
            // Skicka SQL-query till databasen 
const result = await connection.execute(`DELETE FROM employee WHERE id = ${id}`);
          
            // Ge respons till användaren
            res.write("Employee deleted successfully");
        }
        else
        {
            res.write("Not logged in");
        }


  
   
    res.write(htmlinfostop);
    res.write(htmlbottom);

    res.end();
 }
    sqlQuery().catch(err => { console.error('deleteemployee error:', err); if (!res.headersSent) res.status(500).end('Server error'); });
});


module.exports = router;