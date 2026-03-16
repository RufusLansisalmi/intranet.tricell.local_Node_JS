window.onload = function ()
{
	loadResearchDatabase();
};

function loadResearchDatabase()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "xml/researchdatabase.xml", true);
	xhr.send();

	xhr.onreadystatechange = function ()
	{
		if (xhr.readyState === 4 && xhr.status === 200)
		{
			showResearchObjects(xhr);
		}
	};
}

function showResearchObjects(xml)
{
	var xmlDoc = xml.responseXML;
	var objects = xmlDoc.getElementsByTagName("researchObject");

	var tableBody = document.getElementById("virusTableBody");
	tableBody.innerHTML = "";

	for (var i = 0; i < objects.length; i++)
	{
		var number = objects[i].getElementsByTagName("objectNumber")[0].childNodes[0].nodeValue;
		var name = objects[i].getElementsByTagName("objectName")[0].childNodes[0].nodeValue;
		var date = objects[i].getElementsByTagName("objectCreateDate")[0].childNodes[0].nodeValue;
		var time = objects[i].getElementsByTagName("objectCreateTime")[0].childNodes[0].nodeValue;
		var creator = objects[i].getElementsByTagName("objectCreator")[0].childNodes[0].nodeValue;

		var row = document.createElement("tr");

		row.innerHTML =
			"<td class='infolight'>" + number + "</td>" +
			"<td class='infolight'><a href='researchdatabase_object.html?nr=" + encodeURIComponent(number) + "'>" + name + "</a></td>" +
			"<td class='infolight'>" + date + "</td>" +
			"<td class='infolight'>" + time + "</td>" +
			"<td class='infolight'>" + creator + "</td>";

		tableBody.appendChild(row);
	}
}
