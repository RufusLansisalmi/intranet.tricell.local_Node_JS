window.onload = function () {
    loadResearchObjectForEdit();
};

// --- HÄMTA DATAN ---
function loadResearchObjectForEdit() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "xml/researchdatabase.xml", true);
    xhr.send();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var params = new URLSearchParams(window.location.search);
            var objectNumber = params.get("nr"); 
            populateEditForm(xhr, objectNumber);
        }
    };
}

function populateEditForm(xml, objectNumber) {
    var xmlDoc = xml.responseXML;
    var objects = xmlDoc.getElementsByTagName("researchObject");

    for (var i = 0; i < objects.length; i++) {
        var number = objects[i].getElementsByTagName("objectNumber")[0].textContent;

        if (number === objectNumber) {
            // Hämta värden
            var name = objects[i].getElementsByTagName("objectName")[0].textContent;
            var date = objects[i].getElementsByTagName("objectCreateDate")[0].textContent;
            var time = objects[i].getElementsByTagName("objectCreateTime")[0].textContent;
            var creator = objects[i].getElementsByTagName("objectCreator")[0].textContent;
            var text = objects[i].getElementsByTagName("objectText")[0].textContent;

            // Fyll i INPUT-fälten med .value
            document.getElementById("objNumber").value = number;
            document.getElementById("objName").value = name;
            document.getElementById("objDate").value = date;
            document.getElementById("objTime").value = time;
            document.getElementById("objCreator").value = creator;
            document.getElementById("objText").value = text;
            
            break; 
        }
    }
}

// --- VALIDERING (KRAV FRÅN UPPGIFTEN) ---
function validateForm() {
    // 1. Hämta alla värden
    var number = document.getElementById("objNumber").value;
    var name = document.getElementById("objName").value;
    var date = document.getElementById("objDate").value;
    var time = document.getElementById("objTime").value;
    var creator = document.getElementById("objCreator").value;
    var text = document.getElementById("objText").value;

    // 2. Kolla att inget fält är tomt
    if (number === "" || name === "" || date === "" || time === "" || creator === "" || text === "") {
        alert("Alla fält måste fyllas i!");
        return false;
    }

    // 3. Kolla att numret innehåller '#'
    if (number.indexOf("#") === -1) {
        alert("Numret måste innehålla tecknet '#'");
        return false;
    }

    // 4. Kolla att numret är max 7 tecken
    if (number.length > 7) {
        alert("Numret får vara max 7 tecken långt!");
        return false;
    }

    // Om allt är OK:
    alert("Informationen är validerad och sparad! (Simulerat)");
    // Här kan du skicka användaren tillbaka om du vill:
    // history.back();
}