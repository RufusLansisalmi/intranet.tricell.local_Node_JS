const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(express.static('./public'));

const readHTML = require('../readHTML.js');
const pug = require('pug');
const backupVirus = require('../backup.js');
const {getVirusImagesHTML} = require('./virusimages.js');
const {getAttachmentsHTML} = require('./fileuploadvirus.js');

const pug_loggedinmenu_aside = pug.compileFile('./html/loggedinmenu_aside.html');

// Masterframe
var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');
var htmlVirusimagesCSS = readHTML('./html/virusimages_css.html');


router.get('/', (req, res) =>
{

if (!req.session.loggedin || !['A','B'].includes(req.session.securityAccessLevel)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(htmlhead);
    res.write(htmlheader);
    if (req.session.loggedin) {
        res.write(readHTML('./html/loggedinmenu_css.html'));
        res.write(readHTML('./html/loggedinmenu_js.html'));
    }
    res.write(htmlmenu);
    res.write(htmlinfostart);
    res.write('<h2>You are not authorised to access this.</h2>');
    if (req.session.loggedin) {
        res.write(pug_loggedinmenu_aside({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes, securityAccessLevel: req.session.securityAccessLevel}));
    } else {
        res.write(htmlinfostop);
    }
    res.write(htmlbottom);
    return res.end();
}

let str_objectNumber, str_objectName, str_objectCreator, str_objectCreatedDate, str_objectStatus;
const userLevel = req.session.securityAccessLevel;

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

res.write(htmlmenu);
res.write(htmlinfostart);


// PAGE CONTENT

let htmloutput =
"<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>" +
"<style>.row-archived td { background-color: #e0e0e0 !important; color: #777 !important; } .row-archived a { color: #666 !important; }</style>";

if(req.session.loggedin)
{

htmloutput += "<table border=\"0\">";

htmloutput += "<tr><td width=\"350\" align=\"left\">";

htmloutput += "<h2>Research Database:</h2>";

htmloutput += "</td><td width=\"350\" align=\"right\">";

htmloutput += "<a href=\"/api/newvirus\" class=\"icon_add\" title=\"Add\" style=\"font-size:14px;vertical-align:middle;\">&#43;</a> <a href=\"/api/newvirus\" style=\"color:#336699;text-decoration:none;\">Add New Research Object</a>";

htmloutput += "</td></tr></table>";

}
else
{
htmloutput += "<h2>Research Database:</h2>";
}


htmloutput += 
"<table id=\"personnel\">"+
"<tr>"+
"<td class=\"infoheadinglight\" width=\"120\">OBJECT NUMBER</td>"+
"<td class=\"infoheadingdark\" width=\"200\">OBJECT NAME</td>"+
"<td class=\"infoheadinglight\" width=\"120\">CREATED BY</td>"+
"<td class=\"infoheadinglight\" width=\"120\">CREATED DATE</td>"+
"<td class=\"infoheadinglight\" width=\"100\">STATUS</td>";

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

if (str_objectStatus === 'archive' && userLevel !== 'A') {
    continue;
}
const archiveClass = (str_objectStatus === 'archive') ? 'row-archived' : '';

htmloutput +=
"<tr class=\"" + archiveClass + "\">"+
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
"<td style=\"text-align:center;\"><a href=\"/api/editvirus/"+id+"\" class=\"icon_edit\" title=\"Edit\">&#9998;</a></td>"+
"<td style=\"text-align:center;\"><a href=\"/api/deletevirus/"+id+"\" class=\"icon_delete\" title=\"Delete\">&#10005;</a></td>";

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
if(req.session.loggedin){
    res.write(pug_loggedinmenu_aside({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes, securityAccessLevel: req.session.securityAccessLevel}));
} else {
    res.write(htmlinfostop);
}
res.write(htmlbottom);
res.end();

}

sqlQuery().catch(err => { console.error('virusdatabase error:', err); if (!res.headersSent) res.status(500).end('Server error'); });

});

// --------------------- Växla Open/Archive -------------------
router.get('/toggle/:id', async function(req, res) {
    const targetId = req.params.id;
    const userLevel = req.session.securityAccessLevel;

    if (userLevel !== 'A') {
        return res.status(403).send("Behörighet saknas.");
    }

    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    try {
        const result = await connection.query(`SELECT objectNumber, objectStatus FROM ResearchObjects WHERE ID=${targetId}`);
        if (result.length > 0) {
            const newStatus = (result[0].objectStatus === 'open') ? 'archive' : 'open';
            await connection.execute(`UPDATE ResearchObjects SET objectStatus='${newStatus}' WHERE ID=${targetId}`);
            res.redirect('/api/virus/' + encodeURIComponent(result[0].objectNumber));
        } else {
            res.redirect('/api/virus');
        }
    } catch(err) {
        if (!res.headersSent) res.status(500).send("Update failed: " + err.message);
    }
});

// --------------------- Läs en virus efter backup -----------------------------
router.get('/backup/:id', async function(req, res) {
    const targetId = req.params.id;

    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    res.write(htmlhead);
    res.write(htmlheader);
    if(req.session.loggedin){res.write(readHTML('./html/loggedinmenu_css.html')); }
    if(req.session.loggedin){res.write(readHTML('./html/loggedinmenu_js.html')); }
    res.write(htmlmenu);
    res.write(htmlVirusimagesCSS);
    res.write(htmlinfostart);

    try {
        const result = await connection.query(`SELECT * FROM ResearchObjects WHERE ID=${targetId}`);

        if (result.length === 0) {
            res.write("<h1>Object not found</h1>");
        } else {
            const v = result[0];

            let backupSuccess = false;
            if (req.session.securityAccessLevel === 'A' || req.session.securityAccessLevel === 'B') {
                backupSuccess = await backupVirus(result);
            }

            let htmlOutput = `
                <link rel="stylesheet" href="css/viruscss.css">
                <div class="page-container">
                    <h2>${v.objectNumber} ${v.objectName}</h2>
                    <p style="font-size:14px; margin:20px 0; padding:12px; border:1px solid ${backupSuccess ? '#2a7a2a' : '#cc0000'}; background:${backupSuccess ? '#e8f5e9' : '#fde8e8'};">
                        ${backupSuccess ? '<b>Backup completed successfully.</b><br>Files saved to C:/secretbackup/' + v.ID + '/' : '<b>Error:</b> Backup failed.'}
                    </p>
                    <a href="/api/virus/${encodeURIComponent(v.objectNumber)}" class="edit-btn">Back to virus</a>
                </div>
            `;

            res.write(htmlOutput);
        }
    } catch(err) {
        console.error(err);
        res.write("<h1>Error during backup</h1>");
    }

    if(req.session.loggedin){
        res.write(pug_loggedinmenu_aside({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes, securityAccessLevel: req.session.securityAccessLevel}));
    } else {
        res.write(htmlinfostop);
    }
    res.write(htmlbottom);
    res.end();
});

router.get('/:id', (req, res) =>
{
    const objectNumber = decodeURIComponent(req.params.id);
    const userLevel = req.session.securityAccessLevel;

    const connection = ADODB.open(
    'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb'
    );

    let virusNumericId = null;

    async function sqlQuery()
    {
        res.write(htmlhead);
        res.write(htmlheader);
        if(req.session.loggedin){var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html'); res.write(htmlLoggedinMenuCSS); }
        if(req.session.loggedin){var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html'); res.write(htmlLoggedinMenuJS); }
        res.write(htmlmenu);
        res.write(htmlVirusimagesCSS);
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
                virusNumericId = v.ID;

                let htmloutput = `
                <link rel="stylesheet" href="css/viruscss.css">

                <div class="virusRow" style="justify-content:space-between; align-items:flex-start;">
                    <div>
                        <span id="virus_number">${v.objectNumber}</span>
                        <span id="virus_name">${v.objectName}</span>
                    </div>
                    <div class="dateTimeCreator">
                        Created ${v.objectCreatedDate || ''}<br>
                        By ${v.objectCreator || ''}
                    </div>
                </div>

                <div id="objectText">
                    ${v.objectText || "No description"}
                </div>

                ${(userLevel === 'A' || userLevel === 'B') ? `
                <div id="editbutton" style="display:flex; align-items:center; justify-content:space-between; margin-top:10px; width:632px;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <a href="/api/editvirus/${v.ID}" class="edit-btn">Edit info</a>
                        ${userLevel === 'A' ? `
                        <span style="font-size:13px;">
                            Status: <select onchange="window.location='/api/virus/toggle/${v.ID}'" style="padding:4px; border:1px solid #000;">
                                <option ${v.objectStatus === 'open' ? 'selected' : ''}>Open</option>
                                <option ${v.objectStatus === 'archive' ? 'selected' : ''}>Archived</option>
                            </select>
                        </span>
                        ` : ''}
                    </div>
                    <a href="/api/virus/backup/${v.ID}" class="edit-btn">Backup this virus</a>
                </div>
                ` : ''}

                <div id="sources_container">
                    <div class="source_row">
                        <span class="source_label">Security data sheet:</span>
                        <span class="source_value">${v.pdfFile || 'None'}</span>
                        <span class="source_size"></span>
                        <span class="source_date"></span>
                        <div class="source_icons">
                            ${v.pdfFile ? `<a href="/pdf/${v.pdfFile}" target="_blank" class="virusimages-upload-btn" style="width:20px;height:20px;line-height:20px;font-size:14px;">&#128065;</a>` : ''}
                        </div>
                    </div>
                    <div class="source_row">
                        <span class="source_label">Presentation Video:</span>
                        <span class="source_value">${v.presentationVideoLink || 'None'}</span>
                        <span class="source_size"></span>
                        <span class="source_date"></span>
                        <div class="source_icons">
                            ${v.presentationVideoLink ? `<a href="${v.presentationVideoLink}" target="_blank" class="virusimages-upload-btn" style="width:20px;height:20px;line-height:20px;font-size:14px;">&#128065;</a>` : ''}
                        </div>
                    </div>
                    <div class="source_row">
                        <span class="source_label">Security Handling Video:</span>
                        <span class="source_value">${v.securityVideoLink || 'None'}</span>
                        <span class="source_size"></span>
                        <span class="source_date"></span>
                        <div class="source_icons">
                            ${v.securityVideoLink ? `<a href="${v.securityVideoLink}" target="_blank" class="virusimages-upload-btn" style="width:20px;height:20px;line-height:20px;font-size:14px;">&#128065;</a>` : ''}
                        </div>
                    </div>
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

        if(virusNumericId) {
            res.write(getAttachmentsHTML(virusNumericId));
            res.write(getVirusImagesHTML(virusNumericId));
        }

        if(req.session.loggedin){
            res.write(pug_loggedinmenu_aside({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes, securityAccessLevel: req.session.securityAccessLevel}));
        } else {
            res.write(htmlinfostop);
        }
        res.write(htmlbottom);
        res.end();
    }

    sqlQuery();
});


module.exports = router;
