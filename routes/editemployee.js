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
const pug_editemployee = pug.compileFile('./html/editemployee.html');



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
    const result = await connection.query(`SELECT * FROM employee WHERE id = ${id}`);

      str_employeecode = result[0]['employeecode'];
    str_name = result[0]['name'];
    str_rank = result[0]['rank'];
    str_securityLevel = result[0]['securityLevel'];
    str_signatureDate = result[0]['signatureDate'];
    str_dateofbirth = result[0]['dateofbirth'];
    str_sex = result[0]['sex'];
    str_bloodtype = result[0]['bloodtype'];
    str_height = result[0]['height'];
    str_weight = result[0]['weight'];
    str_department = result[0]['department'];
    str_background = result[0]['background'];
    str_strengths = result[0]['strengths'];
    str_weaknesses = result[0]['weaknesses'];
    

    
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

  
    res.write(pug_editemployee({
      id: id,
      employeecode: str_employeecode,
      name: str_name,
      rank: str_rank,
      securityLevel: str_securityLevel,
      signatureDate: str_signatureDate,
      dateofbirth: str_dateofbirth,
      sex: str_sex,
      bloodtype: str_bloodtype,
      height: str_height,
      weight: str_weight,
      department: str_department,
      background: str_background,
      strengths: str_strengths,
      weaknesses: str_weaknesses
    }));

    res.write(htmlinfostop);
    res.write(htmlbottom);

    res.end();
    }
	sqlQuery().catch(err => { console.error('editemployee GET error:', err); if (!res.headersSent) res.status(500).end('Server error'); });


});


// router för uppdatering av databasen
router.post('/', function(request, response)

{

  const id = req.params.id;
    // Ta emot variablerna från formuläret
    const employeecode = request.body.femployeecode;
    const name = request.body.fname;
    const dateofbirth = request.body.dateofbirth;
    const height = request.body.fheight;
    const weight = request.body.fweight;
    const bloodtype = request.body.fbloodtype;
    const sex = request.body.fsex;
    const rank = request.body.frank;
    const department = request.body.fdepartment;
    const securitylevel = request.body.fsecuritylevel;
    const background = request.body.fbackground;
    const strengths = request.body.fstrengths;
    const weaknesses = request.body.fweaknesses;
    const file = request.body.ffile;

  

    // Öppna databasen
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');
    

    

    async function sqlQuery()
    {
        response.setHeader('Content-type','text/html');
        response.write(htmlHead);
        if(request.session.loggedin)
        {
            response.write(htmlLoggedinMenuCSS);
            response.write(htmlLoggedinMenuJS);
            //response.write(htmlLoggedinMenu);
            response.write(pug_loggedinmenu({
                employeecode: request.cookies.employeecode,
                name: request.cookies.name,
                logintimes: request.cookies.logintimes,
                lastlogin: request.cookies.lastlogin,
              }));
        }
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        if(request.session.loggedin)
        {
            // Skicka SQL-query till databasen 
            await connection.execute(`UPDATE employee SET  employeecode = '${employeecode}', name = '${name}', dateofbirth = '${dateofbirth}', height = '${height}', weight = '${weight}', bloodtype = '${bloodtype}', sex = '${sex}', rank = '${rank}', department = '${department}', securitylevel = '${securitylevel}', background = '${background}', strengths = '${strengths}', weaknesses = '${weaknesses}' WHERE id = ${id}`);
            // Ge respons till användaren
            response.write("Employee edited successfully!");
        }
        else
        {
            response.write("Not logged in");
        }

        response.write(htmlInfoStop);
        
        response.write(htmlBottom);
        response.end();
    }
    sqlQuery().catch(err => { console.error('editemployee POST error:', err); if (!response.headersSent) response.status(500).end('Server error'); });
});


module.exports = router;