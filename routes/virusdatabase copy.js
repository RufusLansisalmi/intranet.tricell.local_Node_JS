const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(express.static('./public'));

const readHTML = require('../readHTML.js');
const pug = require('pug');

const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');

// Masterframe
var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');


router.get('/', (req, res) =>
{

if (!req.session.loggedin || !['A','B'].includes(req.session.securityAccessLevel)) {
    return res.status(403).send('Access denied.');
}

let str_objectNumber, str_objectName, str_objectCreator, str_objectCreatedDate, str_objectStatus;

const connection = ADODB.open(
'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
);

async function sqlQuery()
{

// masterframe top
res.write(htmlhead);
res.write(htmlheader);

if(req.session.loggedin)
{
var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html');
res.write(htmlLoggedinMenuCSS);
}

if(req.session.loggedin)
{
var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html');
res.write(htmlLoggedinMenuJS);
}

if(req.session.loggedin)
{
res.write(pug_loggedinmenu({
employeecode: req.cookies.employeecode,
name: req.cookies.name,
lastlogin: req.cookies.lastlogin,
logintimes: req.cookies.logintimes,
securityAccessLevel: req.session.securityAccessLevel
}));
}

res.write(htmlmenu);
res.write(htmlinfostart);


// PAGE CONTENT

let htmloutput = 
"<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>";

if(req.session.loggedin)
{

htmloutput += "<table border=\"0\">";

htmloutput += "<tr><td width=\"350\" align=\"left\">";

htmloutput += "<h2>Research Database:</h2>";

htmloutput += "</td><td width=\"350\" align=\"right\">";

htmloutput += "<a href=\"http://localhost:3000/api/newvirus\" style=\"color:#336699;text-decoration:none;\">Add New Research Object</a>";

htmloutput += "</td></tr></table>";

}
else
{
htmloutput += "<h2>Research Database:</h2>";
}


htmloutput += 
"<table id=\"personnel\">"+
"<tr>"+
"<td class=\"infoheadinglight\" width=\"150\">OBJECT NUMBER</td>"+
"<td class=\"infoheadingdark\" width=\"220\">OBJECT NAME</td>"+
"<td class=\"infoheadinglight\" width=\"150\">CREATED BY</td>"+
"<td class=\"infoheadinglight\" width=\"150\">CREATED DATE</td>"+
"<td class=\"infoheadinglight\" width=\"120\">STATUS</td>";

if(req.session.loggedin)
{

htmloutput += 
"<td class=\"table-header-cell-light\">Edit</td>"+
"<td class=\"table-header-cell-light\">Delete</td>";

}

htmloutput += "</tr>";


// DATABASE QUERY

try
{

const result = await connection.query(`
SELECT
ID,
objectNumber,
objectName,
objectCreator,
objectCreatedDate,
objectText,
objectStatus,
presentationVideoLink,
securityVideoLink
FROM ResearchObjects
`);

var count = result.length;

for(let i=0;i<count;i++)
{

let id = result[i]['ID'];

str_objectNumber = result[i]['objectNumber'];
str_objectName = result[i]['objectName'];
str_objectCreator = result[i]['objectCreator'];
str_objectCreatedDate = result[i]['objectCreatedDate'];
str_objectStatus = result[i]['objectStatus'];

htmloutput +=
"<tr>"+
"<td class=\"infolight\">"+str_objectNumber+"</td>"+
"<td class=\"infodark\">"+
"<a href=\"/api/virus/"+encodeURIComponent(str_objectNumber)+"\" style=\"color:#336699;\">"+
str_objectName+
"</a></td>"+
"<td class=\"infolight\">"+str_objectCreator+"</td>"+
"<td class=\"infolight\">"+str_objectCreatedDate+"</td>"+
"<td class=\"infolight\">"+str_objectStatus+"</td>";

if(req.session.loggedin)
{

htmloutput +=
"<td style=\"text-align:center;\"><a href=\"http://localhost:3000/api/editvirus/"+id+"\" style=\"color:#000000;\"><i class=\"fa-solid fa-pen\"></i></a></td>"+
"<td><a href=\"http://localhost:3000/api/deletevirus/"+id+"\" style=\"color:#336699;\">D</a></td>";

}

htmloutput += "</tr>";

}

}
catch(err)
{

console.error("ADODB query failed:",err);

htmloutput += "<tr><td colspan=\"6\">Database error</td></tr>";

}

htmloutput += "</table>";

res.write(htmloutput);


// masterframe bottom
res.write(htmlinfostop);
res.write(htmlbottom);
res.end();

}

sqlQuery().catch(err => { console.error('virusdatabase error:', err); if (!res.headersSent) res.status(500).end('Server error'); });

});

router.get('/:id', (req, res) =>
{
    const objectNumber = decodeURIComponent(req.params.id);

    const connection = ADODB.open(
    'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
    );

    async function sqlQuery()
    {
        res.write(htmlhead);
        res.write(htmlheader);
        res.write(htmlmenu);
        res.write(htmlinfostart);

        try
        {
            const result = await connection.query(`
                SELECT *
                FROM ResearchObjects
                WHERE objectNumber='${objectNumber}'
            `);

            if(result.length === 0)
            {
                res.write("<h1>Object not found</h1>");
            }
            else
            {
                let v = result[0];

                let htmloutput = `
                <h2>${v.objectNumber} ${v.objectName}</h2>

                <div style="border:1px solid #333;padding:15px;width:600px;background:#f5f5f5;">

                    <div style="background:#cfe2ff;padding:10px;margin-bottom:10px;">
                        ${v.objectText || "No description"}
                    </div>

                    ${req.session.loggedin ? `
                        <a href="/api/editvirus/${v.ID}" style="color:#336699;">Edit Info</a>
                    ` : ""}

                    <p><b>PDF:</b>
                        ${v.pdfFile ? `<a href="/pdf/${v.pdfFile}" target="_blank">Open</a>` : "None"}
                    </p>

                    <p><b>Presentation Video:</b>
                        ${v.presentationVideoLink ? `<a href="${v.presentationVideoLink}" target="_blank">Watch</a>` : "None"}
                    </p>

                    <p><b>Security Video:</b>
                        ${v.securityVideoLink ? `<a href="${v.securityVideoLink}" target="_blank">Watch</a>` : "None"}
                    </p>

                </div>
                `;

                res.write(htmloutput);
            }

        }
        catch(err)
        {
            console.error(err);
            res.write("<h1>Error loading object</h1>");
        }

        entriesCSS = readHTML('./html/researchentries_css.html');
        res.write(entriesCSS);
        entriesJS = readHTML('./html/researchentries_js.html');
        res.write(entriesJS);
        entriesHTML = readHTML('./html/researchentries.html');
        res.write(entriesHTML);

        res.write(htmlinfostop);
        res.write(htmlbottom);
        res.end();
    }

    sqlQuery();
});


module.exports = router;
