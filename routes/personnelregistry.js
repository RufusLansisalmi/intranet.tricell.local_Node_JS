const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(express.static('./public'));
const path = require('path');
const xml2js = require('xml2js');


const readHTML = require('../readHTML.js');
 const fs = require('fs');

 const pug = require('pug');
 const {response} = require('express');
 const pug_loggedinmenu = pug.compileFile('./html/loggedinmenu.html');
 

//läs in Masterframe
var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');

router.get('/', (req, res) =>
{
   




	

	let str_employeecode, str_name, str_signatureDate, str_rank, str_securitylevel;
	const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');
	async function sqlQuery() {



		 // skriv ut masterframe övre delen
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

		 let htmloutput = '' +
     "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>";
     if(req.session.loggedin){

htmloutput +="<table border=\"0\">";

htmloutput +="<tr><td width=\"350\" align=\"left\">";

htmloutput +="<h2>Personnel Registry:</h2>\n";

htmloutput +="</td><td width=\"350\" align=\"right\">";

htmloutput +="<a href=\"http://localhost:3000/api/newemployee\" style=\"color:#336699;text-decoration:none;\">Add new employee</a>";

htmloutput +="</td></tr></table>";

}
else

{

htmloutput +="<h2>Personnel Registry:</h2>\n";

}
htmloutput += '' +
    "<table id=\"personnel\">"+
        "<tr>"+
           "<td class=\"infoheadinglight\" width=\"130\"> EMPLOYEE CODE  </td>"+
            
           "<td class=\"infoheadingdark\" width=\"210\"> &nbsp; NAME </td>"+
            
           "<td class=\"infoheadinglight\" width=\"130\"> SIGNATURE DATE </td>"+
        
            "<td class=\"infoheadinglight\" width=\"130\"> RANK </td>"+
            
            "<td class=\"infoheadinglight\" width=\"112\"> ACCESS LEVEL</td>";
       
        if(req.session.loggedin)

{

htmloutput +="<td class=\"table-header-cell-light\">Edit</td>\n"+

"<td class=\"table-header-cell-light\">Delete</td>\n";

}
 "</tr>";
htmloutput += '' +
        "";

		try {
			const result = await connection.query('SELECT id, employeeCode AS employeecode, name, signatureDate AS signaturedate, rank, securitylevel AS securitylevel FROM employee');
			var count = result.length;
			let i;
			for (i = 0; i < count; i++) {
                id = result [i]['id'];
				str_employeecode = result[i]['employeeCode'] || result[i]['employeecode'] || result[i]['employeecode'];
				str_name = result[i]['name'];
				str_signatureDate = result[i]['signatureDate'] || result[i]['signaturedate'];
				str_rank = result[i]['rank'];
				str_securitylevel = result[i]['securitylevel'] || result[i]['securitylevel'];

				 htmloutput += 
         "<tr>"+
            "<td class=\"infolight\" width=\"130\">"+str_employeecode+"</td>"+
            
            "<td class=\"infodark\" width=\"210\"> &nbsp;<a href=\"http://localhost:3000/api/personnelregistry/"+str_employeecode+"\">"+str_name+"</a></td>"+
            
            "<td class=\"infolight\" width=\"130\">"+str_signatureDate+" </td>"+
            "<td class=\"infolight\" width=\"130\">"+str_rank+"</td>"+

            "<td class=\"infolight\" width=\"112\">"+str_securitylevel+"</td>";

              if(req.session.loggedin)

                {
            htmloutput += "<td><a href=\"http://localhost:3000/api/editemployee/"+id+"\" style=\"color:#336699;\">E</a></td>\n"+
            "<td><a href=\"http://localhost:3000/api/deleteemployee/"+id+"\" style=\"color:#336699;\">D</a></td></td>";
}
  htmloutput += "</tr>";
			}
		} catch (err) {
			console.error('ADODB query failed:', err && err.process && err.process.message ? err.process.message : err);
			// Fallback to local JSON
			try {
				const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/json/personnelregistry.json'), 'utf8'));
				const employees = jsonData && jsonData.personnelregistry && jsonData.personnelregistry.employee ? jsonData.personnelregistry.employee : [];
				for (let i = 0; i < employees.length; i++) {
					str_employeecode = employees[i]['employeecode'] || employees[i]['employeecode'];
					str_name = employees[i]['name'];
					str_signatureDate = employees[i]['signaturedate'] || employees[i]['signatureDate'];
					str_rank = employees[i]['rank'];
					str_securitylevel = employees[i]['securitylevel'] || employees[i]['securitylevel'];

					 htmloutput += 
         "<tr>"+
            "<td class=\"infolight\" width=\"130\">"+str_employeecode+"</td>"+
            
            "<td class=\"infodark\" width=\"210\"> &nbsp;<a href=\"http://localhost:3000/api/personnelregistry/"+str_employeecode+"\">"+str_name+"</a></td>"+
            
            "<td class=\"infolight\" width=\"130\">"+str_signatureDate+" </td>"+
            "<td class=\"infolight\" width=\"130\">"+str_rank+"</td>"+

            "<td class=\"infolight\" width=\"112\">"+str_securitylevel+"</td>";

             if(req.session.loggedin)

                {
            htmloutput += "<td class=\"infolight\" width=\"112\">E</td>\n"+
            "<td class=\"infolight\" width=\"112\">D</td>\n";
}

   htmloutput += "</tr>";
				}
			} catch (e) {
				console.error('Fallback JSON read failed:', e);
				htmloutput += "<tr><td colspan=\"5\" class=\"infolight\">Data unavailable</td></tr>";
			}
		}

	 
	htmloutput += "</table>";
    res.write(htmloutput);
	  // skriv ut masterframe nedre delen
    res.write(htmlinfostop);
    res.write(htmlbottom);
    res.end();


}
	sqlQuery();
    //  res.write(str_employeecode);
  
});


//router för en individuell anställd
router.get('/:employeeid', (req, res) =>
{
    const employeeid = req.params.employeeid;

	 // Öppna databasen
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb;');

 async function sqlQuery()
    {
    // skriv ut masterframe övre delen
	res.writeHead(200, {'Content-Type': 'text/html'});

    res.write(htmlhead);
    if(req.session.loggedin){var htmlLoggedinMenuCSS = readHTML('./html/loggedinmenu_css.html'); res.write(htmlLoggedinMenuCSS); }
    if(req.session.loggedin){var htmlLoggedinMenuJS = readHTML('./html/loggedinmenu_js.html'); res.write(htmlLoggedinMenuJS); }
    //if(req.session.loggedin){var htmlLoggedinMenu = readHTML('./html/loggedinmenu.html'); res.write(htmlLoggedinMenu); }
      if(req.session.loggedin){
        res.write(pug_loggedinmenu({employeecode: req.cookies.employeecode, name: req.cookies.name, lastlogin: req.cookies.lastlogin, logintimes: req.cookies.logintimes}));
    }
    res.write(htmlheader);
    res.write(htmlmenu);
    res.write(htmlinfostart);

    // skriv ut sidans innehåll
	 // Skicka SQL-query till databasen och läs in variabler
     let result;
     try {
      result = await connection.query(`
SELECT 
  employeecode,
  [name],
  signaturedate,
  [rank],
  securitylevel,
  dateofbirth,
  sex,
  bloodtype,
  height,
  weight,
  department,
  background,
  strengths,
  weaknesses
FROM employee
WHERE employeecode='${employeeid}'
`);
     } catch (queryErr) {
         console.error('ADODB query failed for individual employee:', queryErr && queryErr.process && queryErr.process.message ? queryErr.process.message : queryErr);
         result = [];
     }

   // declare FIRST
let str_employeecode,
    str_name,
    str_signatureDate,
    str_dateofbirth,
    str_sex,
    str_bloodtype,
    str_weight,
    str_rank,
    str_height,
    str_department,
    str_securitylevel,
    str_background,
    str_strengths,
    str_weaknesses;

// THEN assign
if (result && result.length > 0) {
    str_employeecode = result[0]['employeecode'];
    str_name = result[0]['name'];
    str_rank = result[0]['rank'];
    str_securitylevel = result[0]['securitylevel'];
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
} else {
    // fallback to JSON file
    try {
        const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/json/personnelregistry.json'), 'utf8'));
        const employees = jsonData && jsonData.personnelregistry && jsonData.personnelregistry.employee ? jsonData.personnelregistry.employee : [];
        const emp = employees.find(e => e.employeecode === employeeid);
        if (emp) {
            str_employeecode = emp['employeecode'];
            str_name = emp['name'];
            str_signatureDate = emp['signaturedate'] || emp['signatureDate'];
            str_rank = emp['rank'];
            str_securitylevel = emp['securitylevel'] || emp['securitylevel'];
            str_dateofbirth = emp['dateofbirth'];
            str_sex = emp['sex'];
            str_bloodtype = emp['bloodtype'];
            str_height = emp['height'];
            str_weight = emp['weight'];
            str_department = emp['department'];
            str_background = emp['background'];
            str_strengths = emp['strengths'];
            str_weaknesses = emp['weaknesses'];
        } else {
            res.status(404).send('<h1>Employee not found</h1>');
            return;
        }
    } catch (e) {
        console.error('Fallback JSON read failed:', e);
        res.status(500).send('<h1>Error retrieving employee data</h1>');
        return;
    }
}

    

     // Skapa HTML-textsträng för tabellen för utskrift av XML-data
        let htmlOutput =""+
        "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>\n"+ 
        "<h1>Personnel Registry - " + employeeid + "</h1>\n"+
        "<table id=\"infomiddle\">\n"+
        "<tr><td width=\"166\" valign=\"top\">\n"+
             "<table id=\"photocol\"><tr><td id=\"photobox\"><img src=\"photos/" + str_employeecode + ".jpg\" alt=\"" + str_employeecode + "\" width=\"164\" /></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td id=\"employeecode\">EMPLOYEE CODE: </b><br /><b>" + str_employeecode + "</b></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr> <td id=\"securitylevel\">SECURITY CLEARANCE LEVEL: </b><br /><big><big><big>" +str_securitylevel+ "</big></big></big></td></tr></table>\n"+
        "</td><td width=\"135\" valign=\"top\">\n"+
             "<table><tr><td class=\"variablecol\">NAME: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"variablecol\">DATE OF BIRTH: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"variablecol\">SEX: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"variablecol\">BLOOD TYPE: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"variablecol\">HEIGHT: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"variablecol\">WEIGHT: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"variablecol\">DEPARTMENT: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"variablecol\">RANK: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr></table>\n"+
        "</td><td width=\"245\" valign=\"top\">\n"+
             "<table><tr><td class=\"valuecol\">" +str_name+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"valuecol\">" +str_dateofbirth+ "</div></td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"valuecol\">" +str_sex+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"valuecol\">" +str_bloodtype+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"valuecol\">" +str_height+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"valuecol\">" +str_weight+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"valuecol\">" +str_department+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
            "<tr><td class=\"valuecol\">" +str_rank+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr></table>\n"+
            "<td width=\"182\" valign=\"top\">\n"+
            "</td>\n"+
        "</td></tr></table>\n";  

   
     
   
   
     htmlOutput =htmlOutput +
        "<h1>Background</h1>\n"+ str_background +
        "<p />"+
        "<h1>Strengths</h1>\n"+ str_strengths +
        "<p />"+
        "<h1>Weaknesses</h1>\n"+ str_weaknesses +
        "<p />";

        res.write(htmlOutput);
    // skriv ut masterframe nedre delen
    res.write(htmlinfostop);
    res.write(htmlbottom);
    res.end();
	}
	sqlQuery();

});


module.exports = router;