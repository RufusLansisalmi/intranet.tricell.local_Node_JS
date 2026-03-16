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





 // skriv ut sidans innehåll
    const fsx = require('fs');
    let xmltext = fsx.readFileSync('./data/xml/personnelregistry.xml');
    xmltext = xmltext.toString();
    xmltext = xmltext.replace(/[\n\t\r]/g,"");

    let xmlArray = xmltext.split('<employee>');
    xmlArray.shift(); // ta bort första elementet som inte innehåller data

    //let str_employeeCode, str_name, str_signatureDate, str_rank, str_securityLevel;
    xmlArray.forEach(printEmployee);
    function printEmployee(employee)
	{

       let str_employeeCode = employee.substring(employee.indexOf('<employeecode>')+14, employee.lastIndexOf('</employeecode>'));
       let str_name = employee.substring(employee.indexOf('<name>')+6, employee.lastIndexOf('</name>'));
       let str_signatureDate = employee.substring(employee.indexOf('<signaturedate>')+15, employee.lastIndexOf('</signaturedate>'));
       let str_rank = employee.substring(employee.indexOf('<rank>')+6, employee.lastIndexOf('</rank>'));
       let str_securityLevel = employee.substring(employee.indexOf('<securityaccesslevel>')+21, employee.lastIndexOf('</securityaccesslevel>'));

         htmloutput += 
         "<tr>"+
            "<td class=\"infolight\" width=\"130\">"+str_employeeCode+"</td>"+
            
            "<td class=\"infodark\" width=\"210\"> &nbsp;<a href=\"http://localhost:3000/api/personnelregistry/"+str_employeeCode+"\">"+str_name+"</a></td>"+
            
            "<td class=\"infolight\" width=\"130\">"+str_signatureDate+" </td>"+
            "<td class=\"infolight\" width=\"130\">"+str_rank+"</td>"+

            "<td class=\"infolight\" width=\"112\">"+str_securityLevel+"</td>"+
        "</tr>";



      
    }
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
    const fsx = require('fs');
    let xml_string = fsx.readFileSync('./data/xml/personnelregistry.xml',"utf8" );
    let count = (xml_string.match(/<employee>/g)).length;  

   
     
    let str_employeeCode, str_name, str_signatureDate, str_dateOfBirth, str_sex, str_bloodtype, str_weight,str_rank, str_height, str_department, str_securityLevel;
    
    //res.write(""+ count);

    xml2js.parseString(xml_string, function(err, result) {
     
        let i;
        for(i=0; i<count; i++)
        {
            if(result['personnelregistry']['employee'][i]['employeecode'][0] == employeeid)
                {
                str_employeeCode = result['personnelregistry']['employee'][i]['employeecode'] ? result['personnelregistry']['employee'][i]['employeecode'][0] : '';
                str_name = result['personnelregistry']['employee'][i]['name'] ? result['personnelregistry']['employee'][i]['name'][0] : '';
                str_signatureDate = result['personnelregistry']['employee'][i]['signaturedate'] ? result['personnelregistry']['employee'][i]['signaturedate'][0] : '';
                str_dateOfBirth = result['personnelregistry']['employee'][i]['dateofbirth'] ? result['personnelregistry']['employee'][i]['dateofbirth'][0] : '';
                str_sex = result['personnelregistry']['employee'][i]['sex'] ? result['personnelregistry']['employee'][i]['sex'][0] : '';
                str_bloodtype = result['personnelregistry']['employee'][i]['bloodtype'] ? result['personnelregistry']['employee'][i]['bloodtype'][0] : '';
                str_height = result['personnelregistry']['employee'][i]['height'] ? result['personnelregistry']['employee'][i]['height'][0] : '';
                str_weight = result['personnelregistry']['employee'][i]['weight'] ? result['personnelregistry']['employee'][i]['weight'][0] : '';
                str_rank = result['personnelregistry']['employee'][i]['rank'] ? result['personnelregistry']['employee'][i]['rank'][0] : '';
                str_department = result['personnelregistry']['employee'][i]['department'] ? result['personnelregistry']['employee'][i]['department'][0] : '';
                str_securityLevel = result['personnelregistry']['employee'][i]['securitylevel'] ? result['personnelregistry']['employee'][i]['securitylevel'][0] : '';
                
                
                }


        } ;
    });

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
 xml_string = fsx.readFileSync("./data/xml/"+str_employeeCode+".xml", "utf8");
	xml_string = xml_string.replace(/[\n\t\r]/g,"");      // Radera bort koder för mellanslag och radbyten 
	var str_background, str_strengths, str_weaknesses;
	
	// Konverterar XML-texten till en JSON-array
	xml2js.parseString(xml_string, function (err, result) 
	{
		str_background = result['fields']['Background'];
		str_strengths = result['fields']['Strengths'];
		str_weaknesses = result['fields']['Weaknesses'];
	});
	
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