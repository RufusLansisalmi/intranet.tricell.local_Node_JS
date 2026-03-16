window.onload = function () {
    loadResearchObject();
};

function loadResearchObject() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "xml/researchdatabase.xml", true);
    xhr.send();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Hämta ID från URL och se till att det avkodas korrekt
            var params = new URLSearchParams(window.location.search);
            var objectNumber = params.get("nr"); 
            
            showResearchObject(xhr, objectNumber);
        }
    };
}

function showResearchObject(xml, objectNumber) {
    var xmlDoc = xml.responseXML;
    var objects = xmlDoc.getElementsByTagName("researchObject");

    for (var i = 0; i < objects.length; i++) {
        // Hämta numret från XML (använd textContent för säkerhets skull)
        var number = objects[i].getElementsByTagName("objectNumber")[0].textContent;

        if (number === objectNumber) {
            // Hämta all data
            var name = objects[i].getElementsByTagName("objectName")[0].textContent;
            var date = objects[i].getElementsByTagName("objectCreateDate")[0].textContent;
            var time = objects[i].getElementsByTagName("objectCreateTime")[0].textContent;
            var creator = objects[i].getElementsByTagName("objectCreator")[0].textContent;
            
            // Hämta beskrivningen (textContent fixar radbrytningsproblemet)
            var text = objects[i].getElementsByTagName("objectText")[0].textContent;

            // Skriv ut på sidan
            document.getElementById("objNumber").innerHTML = number;
            document.getElementById("objName").innerHTML = name;
            document.getElementById("objDate").innerHTML = date;
            document.getElementById("objTime").innerHTML = time;
            document.getElementById("objCreator").innerHTML = creator;
            document.getElementById("objText").innerHTML = text; // Nu borde texten synas!

            // Uppdatera Edit-länken (glöm inte encodeURIComponent här också för nästa steg)
            document.getElementById("editLink").href = 
                "researchdatabase_object_edit.html?nr=" + encodeURIComponent(number);
                
            break; // Vi är klara
        }
    }
}