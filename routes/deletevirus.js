const express = require('express');
const router = express.Router();

router.use(express.static('./public'));
const path = require('path');

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');

// --------------------- Läs in Masterframen --------------------------------
const readHTML = require('../readHTML.js');
const fs = require('fs');

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


// ---------------------- Radera person ------------------------------------------------
router.get('/:id', function(request, response)
{
    const id = parseInt(request.params.id);

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
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);
        // Array för vilka access levels som krävs, går att expandera
        const validAccessLevels = ["B", "A"];
        if(request.session.loggedin && validAccessLevels.includes(request.session.securityAccessLevel))
        {
            
            //Ta reda på Virusets kod (för att kunna radera pdf)
            const result = await connection.query("SELECT objectNumber FROM ResearchObjects WHERE ID="+id+"");
            let objectNumber = "" + result[0]['objectNumber'];
            

            // Skicka SQL-query till databasen 
            const result2 = await connection.execute("DELETE FROM ResearchObjects WHERE ID="+id+"");

            
            // Radera filen
            const path = "./data/safetydatasheets/"+objectNumber+".pdf";
            if(fs.existsSync(path))
            {
                fs.unlinkSync(path)
            }

            var imagePath = `./public/virusphoto/${id}`;
            if(fs.existsSync(imagePath))
            {
                fs.rmdirSync(imagePath, { recursive: true });
            }
            
            // Ge respons till användaren
            response.write("Virus data deleted<br/><p /><a href=\"http://localhost:3000/api/virusdatabase\" style=\"color:#336699;text-decoration:none;\">Delete another virus</a>");
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