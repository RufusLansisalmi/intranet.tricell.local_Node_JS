const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var formidable = require('formidable');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const readHTML = require('../readHTML.js');
const fs = require('fs');
router.use(express.static('./public'));
const path = require('path');

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');
const pug_editvirus = pug.compileFile('./masterframe/editvirus.html');
const { getVirusImagesHTML } = require('./virusimages.js');
var htmlVirusimagesCSS = readHTML('./masterframe/virusimages_css.html');


// --------------------- Läs in Masterframen --------------------------------


var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu.html');
var htmlInfoStart = readHTML('./masterframe/infoStart.html');
var htmlInfoStop = readHTML('./masterframe/infoStop.html');
var htmlFooter = readHTML('./masterframe/footer.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

var htmlLoggedinMenuCSS = readHTML('./masterframe/loggedinmenu_css.html');
var htmlLoggedinMenuJS = readHTML('./masterframe/loggedinmenu_js.html');
var htmlLoggedinMenu = readHTML('./masterframe/loggedinmenu.html');
const ADODB = require('node-adodb');
const connection2 = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

// ---------------------- Editera person ------------------------------------------------
router.post('/:id', function(request, response)
{
    var id = request.params.id;
    
        // Array för vilka access levels som krävs, går att expandera
        const validAccessLevels = ["B", "A"];
    
        // Ta emot variablerna från formuläret
        if(request.session.loggedin && validAccessLevels.includes(request.session.securityAccessLevel))
        {
            var form = new formidable.IncomingForm();
            form.parse(request, function (err, fields, files) 
            {
                var virusNumber = fields.objectCode;
                var virusName = fields.objectName;
                var virusText = fields.objectText;
                var datasheet = fields.objectDatasheet;
                var presentation = fields.objectPresentation;
                var safety = fields.objectHandling;
            



                // Öppna databasen
                const ADODB = require('node-adodb');
                const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb;');

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
                securityaccesslevel: request.session.securityAccessLevel
              }));
                    }
                    response.write(htmlLoggedinMenu);
                    response.write(htmlHeader);
                    response.write(htmlMenu);
                    response.write(htmlInfoStart);


                        // Skriv in i databasen
                        const result = await connection.execute("UPDATE ResearchObjects SET objectNumber='"+virusNumber+"',objectName='"+virusName+"',objectText='"+virusText+"',presentationVideoLink='"+presentation+"',securityVideoLink='"+safety+"' WHERE ID="+id+"");
                        // Ladda upp filen
                        if(files.objectDatasheet.originalFilename != "")
                        {
                            var oldpath = files.objectDatasheet.filepath;
                            var newpath = path.resolve(__dirname, "../data/safetydatasheets/"+virusNumber+".pdf");
                            fs.renameSync(oldpath, newpath, function (err) 
                            {
                                if (err) throw err;
                            });
                        }

                

                        // Ge respons till användaren
                        response.write("Virus edited<br/><p /><a href=\"http://localhost:3000/api/virusdatabase\" style=\"color:#336699;text-decoration:none;\">Edit another virus</a>");


                    response.write(htmlInfoStop);
                    response.write(htmlFooter);
                    response.write(htmlBottom);
                    response.end();
                }
                sqlQuery();
            });

        }
        else
        {
            response.setHeader('Content-type','text/html');
            response.write(htmlHead);
            response.write(htmlHeader);
            response.write(htmlMenu);
            response.write(htmlInfoStart);

            response.write("Not logged in");

            response.write(htmlInfoStop);
            response.write(htmlFooter);
            response.write(htmlBottom);
            response.end();
        }
    
});


// ---------------------- Formulär för att editera person ------------------------------
router.get('/:id', (request, response) =>
{  
    var id = request.params.id;

    // Öppna databasen
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb;');
   
    async function sqlQuery()
    {
        
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
                securityaccesslevel: request.session.securityAccessLevel
              }));
        }
        response.write(htmlHead);
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        // Array för vilka access levels som krävs, går att expandera
        const validAccessLevels = ["B", "A"];
        if(request.session.loggedin && validAccessLevels.includes(request.session.securityAccessLevel))
        {
            // Läs nuvarande värden ur databasen
            const result = await connection.query("SELECT objectNumber, objectName, objectText, presentationVideoLink, securityVideoLink FROM ResearchObjects WHERE ID="+id+"");
            
            str_number = result[0]['objectNumber'];
            str_name = result[0]['objectName'];
            str_text = result[0]['objectText'];
            str_presentationVideo = result[0]['presentationVideoLink'];
            str_securityVideo = result[0]['securityVideoLink'];

        
            
  
            const path = "./data/safetydatasheets/"+str_number+".pdf";
            if(fs.existsSync(path))
            {
                datasheet = str_number+".pdf";
            }
            else
            {
                datasheet = "  No file found";
            }



            htmlNewEmployeeCSS = readHTML('./masterframe/newvirus_css.html');
            response.write(htmlNewEmployeeCSS);
            htmlNewEmployeeJS = readHTML('./masterframe/newvirus_js.html');
            response.write(htmlNewEmployeeJS);
            response.write(pug_editvirus({
                objectDatasheet: datasheet,
                objectNumber: str_number,
                objectName: str_name,
                objectText: str_text,
                presentationVideoLink: str_presentationVideo,
                securityVideoLink: str_securityVideo
            }));
            response.write(htmlVirusimagesCSS);
            response.write(getVirusImagesHTML(id));
            
        }
        else
        {
            response.write("Not logged in or not enough security clearance");
        
        }
        response.write(htmlInfoStop);
            response.write(htmlFooter);
            response.write(htmlBottom);
            response.end();

    }
    sqlQuery();

});

module.exports = router;