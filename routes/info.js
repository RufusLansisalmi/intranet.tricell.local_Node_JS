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


router.get('/', (req, res) =>
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

    var htmlinfo = readHTML('./public/text/index.html');
    res.write(htmlinfo);

    res.write(htmlinfostop);
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
   // if(req.session.loggedin){var htmlLoggedinMenu = readHTML('./html/loggedinmenu.html'); res.write(htmlLoggedinMenu); }
    if(req.session.loggedin){
    res.write(pug_loggedinmenu({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes}));
}
    res.write(htmlmenu);
    res.write(htmlinfostart);

   // var htmlinfo = readHTML('./public/text/index.html');
   const filepath = path.resolve(__dirname, '..', 'public', 'text', infotext + '.html');
    if(fs.existsSync(filepath)) {
         htmlinfo = readHTML(filepath);
    } else {
        htmlinfo = readHTML('./public/text/index.html');
    }

    res.write(htmlinfo);

    res.write(htmlinfostop);
    res.write(htmlbottom);

    res.end();

});

module.exports = router;