const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var formidable = require('formidable');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use(express.static('./public'));
const path = require('path');

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');


// --------------------- Läs in Masterframen --------------------------------
const readHTML = require('../readHTML.js');
const fs = require('fs');

var htmlHead = readHTML('./html/head.html');
var htmlHeader = readHTML('./html/header.html');
var htmlMenu = readHTML('./html/menu.html');
var htmlInfoStart = readHTML('./html/infoStart.html');
var htmlInfoStop = readHTML('./html/infoStop.html');
var htmlBottom = readHTML('./html/bottom.html');

var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html');
var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html');
var htmlLoggedinMenu = readHTML('./html/loggedinmenu.html');

// ---------------------- Lägg till ny person ------------------------------------------------
router.post('/', function(request, response)
{
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {

        var employeecode = fields.femployeecode;
        var name = fields.fname;
        var dateofbirth = fields.dateofbirth;
        var height = fields.fheight;
        var weight = fields.fweight;
        var bloodtype = fields.fbloodtype;
        var sex = fields.fsex;
        var rank = fields.frank;
        var department = fields.fdepartment;
        var securitylevel = fields.fsecuritylevel;
        var background = fields.fbackground;
        var strengths = fields.fstrengths;
        var weaknesses = fields.fweaknesses;
      
      




    /*
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
    const file = request.body.ffile; */

    // Skapa inskrivningsdatumn
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    const signaturedate = date+"."+month+"."+year;

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
const result = await connection.execute(`
    INSERT INTO employee (
     employeecode,
    [name],
     signaturedate,
     dateofbirth,
     height,
     weight,
     bloodtype,
     sex,
     [rank],
     department,
     securitylevel,
     background,
     strengths,
     weaknesses
    )
    VALUES (
    '${employeecode}',
    '${name}',
    '${signaturedate}',
    '${dateofbirth}',
    '${height}',
    '${weight}',
    '${bloodtype}',
    '${sex}',
    '${rank}',
    '${department}',
    '${securitylevel}',
    '${background}',
    '${strengths}',
    '${weaknesses}'
)
`);


//ladda upp foto-filen
if(files.ffile.originalFilename != "")
{
    var oldpath = files.ffile.filepath;
    var newpath = path.resolve(__dirname, '../public/photos/' + employeecode + ".jpg");
    fs.renameSync(oldpath, newpath, function (err) 
    {
        if (err) throw err;
    });
}



           
            // Ge respons till användaren
            response.write("Employee created successfully");
        }
        else
        {
            response.write("Not logged in");
        }

        response.write(htmlInfoStop);
        
        response.write(htmlBottom);
        response.end();
    }
    sqlQuery().catch(err => { console.error('newemployee error:', err); if (!response.headersSent) response.status(500).end('Server error'); });
});

  });
// ---------------------- Formulär för att lägga till ny person ------------------------------
router.get('/', (request, response) =>
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

    // Läs in formuläret
    if(request.session.loggedin)
    {
        htmlNewEmployeeCSS = readHTML('./html/newemployee_css.html');
        response.write(htmlNewEmployeeCSS);
        htmlNewEmployeeJS = readHTML('./html/newemployee_js.html');
        response.write(htmlNewEmployeeJS);
        htmlNewEmployee = readHTML('./html/newemployee.html');
        response.write(htmlNewEmployee);
    }
    else
    {
        response.write("Not logged in");
    }
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

module.exports = router;