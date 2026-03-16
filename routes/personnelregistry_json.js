const express = require('express');
const router = express.Router();

router.use(express.static('./public'));
const path = require('path');
const xml2js = require('xml2js');


const readHTML = require('../readHTML.js');
 const fs = require('fs');

//läs in Masterframe
var htmlhead = readHTML('html/head.html');
var htmlheader = readHTML('html/header.html');
var htmlmenu = readHTML('html/menu.html');
var htmlinfostart = readHTML('html/infostart.html');
var htmlinfostop = readHTML('html/infostop.html');
var htmlbottom = readHTML('html/bottom.html');

router.get('/', (req, res) =>
{
    // skriv ut masterframe övre delen
    res.write(htmlhead);
    res.write(htmlheader);
    res.write(htmlmenu);
    res.write(htmlinfostart);

	 let htmloutput = '' +
     "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>"+
    "<table id=\"personnel\">"+
        "<tr>"+
           "<td class=\"infoheadinglight\" width=\"130\"> EMPLOYEE CODE  </td>"+
            
           "<td class=\"infoheadingdark\" width=\"210\"> &nbsp; NAME </td>"+
            
           "<td class=\"infoheadinglight\" width=\"130\"> SIGNATURE DATE </td>"+
        
            "<td class=\"infoheadinglight\" width=\"130\"> RANK </td>"+
            
            "<td class=\"infoheadinglight\" width=\"112\"> ACCESS LEVEL</td>"+
        "</tr>"+
        "";


	

	const result = require('../data/json/personnelregistry.json');
	var count = result['personnelregistry']['employee'].length;
	let str_employeeCode, str_name, str_signatureDate, str_rank, str_securityLevel;

	for (i=0; i<count; i++)
	{
		str_employeeCode = result['personnelregistry']['employee'][i]['employeecode'];
		str_name = result['personnelregistry']['employee'][i]['name'];
		str_signatureDate = result['personnelregistry']['employee'][i]['signaturedate'];
		str_rank = result['personnelregistry']['employee'][i]['rank'];
		str_securityLevel = result['personnelregistry']['employee'][i]['securitylevel'];

		 htmloutput += 
         "<tr>"+
            "<td class=\"infolight\" width=\"130\">"+str_employeeCode+"</td>"+
            
            "<td class=\"infodark\" width=\"210\"> &nbsp;<a href=\"http://localhost:3000/api/personnelregistry/"+str_employeeCode+"\">"+str_name+"</a></td>"+
            
            "<td class=\"infolight\" width=\"130\">"+str_signatureDate+" </td>"+
            "<td class=\"infolight\" width=\"130\">"+str_rank+"</td>"+

            "<td class=\"infolight\" width=\"112\">"+str_securityLevel+"</td>"+
        "</tr>";
	}

   

   





 // skriv ut sidans innehåll
   

  

      
    
   
	htmloutput += "</table>";
    res.write(htmloutput);

    //  res.write(str_employeeCode);
    // skriv ut masterframe nedre delen
    res.write(htmlinfostop);
    res.write(htmlbottom);
    res.end();

});


//router för en individuell anställd
router.get('/:employeeid', (req, res) =>
{
    const employeeid = req.params.employeeid;

    // skriv ut masterframe övre delen
	res.writeHead(200, {'Content-Type': 'text/html'});

    res.write(htmlhead);
    res.write(htmlheader);
    res.write(htmlmenu);
    res.write(htmlinfostart);

    // skriv ut sidans innehåll
    
   
     
    let str_employeeCode, str_name, str_signatureDate, str_dateOfBirth, str_sex, str_bloodtype, str_weight,str_rank, str_height, str_department, str_securityLevel;
    const result = require('../data/json/personnelregistry.json');
	const count = result['personnelregistry']['employee'].length;
    //res.write(""+ count);

    
        let i;
        for(i=0; i<count; i++)
        {
            if(result['personnelregistry']['employee'][i]['employeecode'] == employeeid)
                {
                str_employeeCode = result['personnelregistry']['employee'][i]['employeecode'] ? result['personnelregistry']['employee'][i]['employeecode'] : '';
                str_name = result['personnelregistry']['employee'][i]['name'] ? result['personnelregistry']['employee'][i]['name'] : '';
                str_signatureDate = result['personnelregistry']['employee'][i]['signaturedate'] ? result['personnelregistry']['employee'][i]['signaturedate'] : '';
                str_dateOfBirth = result['personnelregistry']['employee'][i]['dateofbirth'] ? result['personnelregistry']['employee'][i]['dateofbirth'] : '';
                str_sex = result['personnelregistry']['employee'][i]['sex'] ? result['personnelregistry']['employee'][i]['sex'] : '';
                str_bloodtype = result['personnelregistry']['employee'][i]['bloodtype'] ? result['personnelregistry']['employee'][i]['bloodtype'] : '';
                str_height = result['personnelregistry']['employee'][i]['height'] ? result['personnelregistry']['employee'][i]['height'] : '';
                str_weight = result['personnelregistry']['employee'][i]['weight'] ? result['personnelregistry']['employee'][i]['weight'] : '';
                str_rank = result['personnelregistry']['employee'][i]['rank'] ? result['personnelregistry']['employee'][i]['rank'] : '';
                str_department = result['personnelregistry']['employee'][i]['department'] ? result['personnelregistry']['employee'][i]['department'] : '';
                str_securityLevel = result['personnelregistry']['employee'][i]['securitylevel'] ? result['personnelregistry']['employee'][i]['securitylevel'] : '';
                
                
                }


        } 
   

  let htmloutput = '' +
  "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>\n"+
  "<h1>Personnel File - " + employeeid + "</h1>"+
	
	"<table id=\"infomiddle\">\n"+
	
	 
	 
	 "<tr>"+
	  
	  "<td width=\"166\" valign=\"top\">\n"+

	
		"<table id=\"photocol\">\n"+
		 
		 "<tr>\n"+
		  
		  "<td id=\"photobox\"><img src=\"photos/"+str_employeeCode+".jpg\" alt=\""+str_employeeCode+"\" width=\"164\"></td>\n"+
         
         "</tr>\n"+
		 
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"tablespacer\"></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td id=\"employeecode\">EMPLOYEE CODE: </b><br><b style=\"color:black;\">"+str_employeeCode+"</b><br></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"tablespacer\"></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td id=\"securitylevel\">SECURITY CLEARANCE LEVEL: <br>"+str_securityLevel+"<br></td>\n"+
		 "</tr>\n"+
		
		"</table>\n"+
		

	  "</td>"+
	  "<td width=\"135\" valign=\"top\">\n"+


		
		 "<table>\n"+
		 "<tr>\n"+
		  "<td class=\"variablecol\">NAME:&nbsp;</td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"tablespacer\"></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"variablecol\">DATE OF BIRTH:&nbsp;</td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"tablespacer\"></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"variablecol\">SEX:&nbsp;</td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"tablespacer\"></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"variablecol\">BLOOD TYPE:&nbsp;</td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"tablespacer\"></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"variablecol\">HEIGHT:&nbsp;</td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"variablecol\">WEIGHT:&nbsp;</td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"tablespacer\"></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"variablecol\">DEPARTMENT:&nbsp;</td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"tablespacer\"></td>\n"+
		 "</tr>\n"+
		 "<tr>\n"+
		  "<td class=\"variablecol\">RANK:&nbsp;</td>\n"+
		 "</tr>\n"+
		 "</table>"+
		

	  "</td>\n"+
	  "<td width=\"245\" valign=\"top\">\n"+


	
		"<table>\n"+
		"<tr>\n"+
		 "<td class=\"valuecol\">"+str_name+"</td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"blackline\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"tablespacer\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"valuecol\">"+str_dateOfBirth+"</td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"blackline\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"tablespacer\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"valuecol\">"+str_sex+"</td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"blackline\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"tablespacer\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"valuecol\">"+str_bloodtype+"</td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"blackline\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"tablespacer\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"valuecol\">"+str_height+"</td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"blackline\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"tablespacer\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"valuecol\">"+str_weight+"</td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"blackline\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"tablespacer\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		"<td class=\"valuecol\"> "+str_department+"</td>\n"+
	   "</tr>\n"+
		"<tr>\n"+
		 "<td class=\"blackline\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		"<td class=\"tablespacer\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
	 	 "<td class=\"valuecol\">"+str_rank+"</td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		 "<td class=\"blackline\"></td>\n"+
		"</tr>\n"+
		"<tr>\n"+
		"<td class=\"tablespacer\"></td>\n"+
		"</tr>\n"+
	"</table>\n";
	
	 // Läs den personliga XML-filen
     // Radera bort koder för mellanslag och radbyten 
	 const result2 = require('../data/json/'+employeeid+'.json');
	var str_background, str_strengths, str_weaknesses;
	
	// Konverterar XML-texten till en JSON-array
	
	str_background = result2['fields']['Background'];
	str_strengths = result2['fields']['Strengths'];
	str_weaknesses = result2['fields']['Weaknesses'];
	
	
	htmloutput = htmloutput +
	"\n<h1>Background</h1>\n"+ str_background +
	"<p />"+
	"<h1>Strengths</h1>\n"+ str_strengths +
	"<p />"+
	"<h1>Weaknesses</h1>\n"+ str_weaknesses +
	"<p />\n";

       res.write(htmloutput);
 
    // skriv ut masterframe nedre delen
    res.write(htmlinfostop);
    res.write(htmlbottom);
    res.end();


});


module.exports = router;