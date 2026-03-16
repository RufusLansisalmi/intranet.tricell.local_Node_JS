const express = require('express');
const router = express.Router();

router.use(express.static('./public'));
const path = require('path');

// --------------------- Läs in Masterframen --------------------------------
const readHTML = require('../readHTML.js');
const fs = require('fs');
const { json } = require('express');

    var htmlHead = readHTML('./head.html');
    var htmlHeader = readHTML('./header.html');
    var htmlMenu = readHTML('./menu_back.html');    
    var htmlInfoStart = readHTML('./infoStart.html');
    var htmlInfoStop = readHTML('./infoStop.html');
    var htmlFooter = readHTML('./footer.html');
    var htmlBottom = readHTML('./bottom.html');

// ---------------------- Lista all personal, Metod 3: JSON-fil -------------------------------
router.get('/', (request, response) =>
{
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

   // Skapa HTML-textsträng för tabellen för utskrift av XML-data
   let htmlOutput =""+
   "<link rel=\"stylesheet\" href=\"css/personnel_registry.css\" \/>"+
   "<h2>Personnel Registry:</h2>\n"+
   "<div id=\"table-resp\">"+
   "<div id=\"table-header\">\n"+
   "<div class=\"table-header-cell-light\">Employee Code</div>\n"+
   "<div class=\"table-header-cell-dark\">Name</div>\n"+
   "<div class=\"table-header-cell-light\">Signature Date</div>\n"+
   "<div class=\"table-header-cell-light\">Rank</div>\n"+
   "<div class=\"table-header-cell-light\">Access Level</div>\n"+
   "</div>\n\n"+
   "<div id=\"table-body\">\n";
   "";

    // Läs in JSON-filen
    const result = require('../data/json/personnel_registry.json');    

    // Ta reda på antalet employees
    var count =  result['personnelRegistry']['employee'].length;

    // Loopa genom och skrv ut varje person
    let i;
    for(i=0; i<count; i++)
    {
        str_employeeCode = result['personnelRegistry']['employee'][i]['employeeCode'];
        str_name = result['personnelRegistry']['employee'][i]['name'];
        str_signatureDate = result['personnelRegistry']['employee'][i]['signatureDate'];
        str_rank = result['personnelRegistry']['employee'][i]['rank'];
        str_securityAccessLevel = result['personnelRegistry']['employee'][i]['securityAccessLevel'];

        // Lägg till respektive employee till utskrift-variabeln
        htmlOutput += "<div class=\"resp-table-row\">\n";
        htmlOutput += "<div class=\"table-body-cell\">" + str_employeeCode + "</div>\n";
        htmlOutput += "<div class=\"table-body-cell-bigger\"><a href=\"http://localhost:3000/api/personnelregistry/" + str_employeeCode + "\">" + str_name + "</a></div>\n";
        htmlOutput += "<div class=\"table-body-cell\"> " + str_signatureDate + "</div>\n";
        htmlOutput += "<div class=\"table-body-cell\"> " + str_rank + "</div>\n";
        htmlOutput += "<div class=\"table-body-cell\"> " + str_securityAccessLevel + "</div>\n";
        htmlOutput += "</div>\n";
    }      

    htmlOutput += "</div></div>\n\n";
    response.write(htmlOutput); // Skriv ut XML-datat

    response.write(htmlInfoStop);
    response.write(htmlFooter);
    response.write(htmlBottom);
    response.end();

});


// --------------------- Läs en specifik person, Metod 3: JSON-fil -----------------------------
router.get('/:employeeid', function(request, response)
{
    const employeeid = request.params.employeeid;
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    // Läs in gemensamma JSON-filen
    let result = require('../data/json/personnel_registry.json');    
    var count =  result['personnelRegistry']['employee'].length;
    var str_employeeCode, str_name, str_signatureDate, str_dateOfBirth, str_sex, str_bloodType, str_height, str_weight, str_rank, str_department, str_securityAccessLevel;
    
    // Loopa genom och hitta rätt person
    let i;
    for(i=0; i<count; i++)
    {
        if(result['personnelRegistry']['employee'][i]['employeeCode'] == employeeid)
        {
            str_employeeCode = result['personnelRegistry']['employee'][i]['employeeCode'];
            str_name = result['personnelRegistry']['employee'][i]['name'];
            str_dateOfBirth = result['personnelRegistry']['employee'][i]['dateOfBirth'];
            str_sex = result['personnelRegistry']['employee'][i]['sex'];
            str_bloodType = result['personnelRegistry']['employee'][i]['bloodType'];
            str_height = result['personnelRegistry']['employee'][i]['height'];
            str_weight = result['personnelRegistry']['employee'][i]['weight'];
            str_rank = result['personnelRegistry']['employee'][i]['rank'];
            str_department = result['personnelRegistry']['employee'][i]['department'];
            str_securityAccessLevel = result['personnelRegistry']['employee'][i]['securityAccessLevel'];
        }
    }        

   // Skapa HTML-textsträng för tabellen för utskrift av XML-data
   let htmlOutput =""+
   "<link rel=\"stylesheet\" href=\"css/personnel_registry_employee.css\" \/>\n"+ 
   "<h1>Personnel Registry - " + employeeid + "</h1>\n"+
   "<table id=\"infomiddle\">\n"+
   "<tr><td width=\"166\" valign=\"top\">\n"+
       "<table id=\"photocol\"><tr><td id=\"photobox\"><img src=\"photos/" + str_employeeCode + ".jpg\" alt=\"" + str_employeeCode + "\" width=\"164\" /></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
       "<tr><td id=\"employeecode\">EMPLOYEE CODE: </b><br /><b>" + str_employeeCode + "</b></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
       "<tr> <td id=\"securitylevel\">SECURITY CLEARANCE LEVEL: </b><br /><big><big><big>" +str_securityAccessLevel+ "</big></big></big></td></tr></table>\n"+
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
       "<tr><td class=\"valuecol\">" +str_dateOfBirth+ "</div></td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
       "<tr><td class=\"valuecol\">" +str_sex+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
       "<tr><td class=\"valuecol\">" +str_bloodType+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
       "<tr><td class=\"valuecol\">" +str_height+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
       "<tr><td class=\"valuecol\">" +str_weight+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
       "<tr><td class=\"valuecol\">" +str_department+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
       "<tr><td class=\"valuecol\">" +str_rank+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr></table>\n"+
       "<td width=\"182\" valign=\"top\">\n"+
       "</td>\n"+
   "</td></tr></table>\n";  

   // Läs in personliga JSON-filen
   let result2 = require("../data/json/"+employeeid+".json");    
   var str_background, str_strengths, str_weaknesses;
    str_background = result2['fields']['background'];
    str_strengths = result2['fields']['strengths'];
    str_weaknesses = result2['fields']['weaknesses'];
    
    htmlOutput =htmlOutput +
    "<h1>Background</h1>\n"+ str_background +
    "<p />"+
    "<h1>Strengths</h1>\n"+ str_strengths +
    "<p />"+
    "<h1>Weaknesses</h1>\n"+ str_weaknesses +
    "<p />";

    response.write(htmlOutput); // Skriv ut 

    response.write(htmlInfoStop);
    response.write(htmlFooter);
    response.write(htmlBottom);
    response.end();
});

module.exports = router;