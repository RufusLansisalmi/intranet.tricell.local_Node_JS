const express = require('express');
const router = express.Router();

var cookieParser = require('cookie-parser');
router.use(cookieParser());

 var fs = require('fs');
 const path = require('path');

const readHTML = require('../readHTML');
router.use(express.static(__dirname + '/..'));

const pug = require('pug');
const {response} = require('express');
const pug_loggedinmenu_aside = pug.compileFile('./html/loggedinmenu_aside.html');



var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');


router.get('/', (req, res) =>
{

    res.write(htmlhead);
    res.write(htmlheader);
    if(req.session.loggedin){var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html'); res.write(htmlLoggedinMenuCSS); }
    if(req.session.loggedin){var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html'); res.write(htmlLoggedinMenuJS); }
    res.write(htmlmenu);
    res.write(htmlinfostart);

    var htmlinfo = readHTML('./text/index.html');
    res.write(htmlinfo);

    if(req.session.loggedin){
        res.write(pug_loggedinmenu_aside({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes, securityAccessLevel: req.session.securityAccessLevel}));
    } else {
        res.write(htmlinfostop);
    }
    res.write(htmlbottom);

    res.end();

});

router.get('/:infotext', (req, res) =>
{
    const infotext = req.params.infotext;

    if (infotext =="")
    {
        var htmlmenu = readHTML('html/menu.html');
    }
    else
    {
        var htmlmenu = readHTML('html/menu_back.html');
    }

    res.write(htmlhead);
    res.write(htmlheader);
    if(req.session.loggedin){var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html'); res.write(htmlLoggedinMenuCSS); }
    if(req.session.loggedin){var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html'); res.write(htmlLoggedinMenuJS); }
    res.write(htmlmenu);
    res.write(htmlinfostart);

   const filepath = path.resolve(__dirname, '..', 'text', infotext + '.html');
    if(fs.existsSync(filepath)) {
         htmlinfo = readHTML(filepath);
    } else {
        htmlinfo = readHTML('./text/index.html');
    }

    res.write(htmlinfo);

    if(req.session.loggedin){
        res.write(pug_loggedinmenu_aside({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes, securityAccessLevel: req.session.securityAccessLevel}));
    } else {
        res.write(htmlinfostop);
    }
    res.write(htmlbottom);

    res.end();

});

module.exports = router;
