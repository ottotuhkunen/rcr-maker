let summerRcr = "";
let icao = "";

async function loadLatestMETARs(icaoCode) {
  icao = icaoCode;
    try {
        const response = await fetch(`https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::avi::observations::latest::iwxxm&icaocode=${icaoCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            document.getElementById("copyButtonSummer").style.visibility = "hidden";
            document.getElementById("aerodromeSummer").textContent = "";
            document.getElementById("rcrOutputSummer").innerHTML = "";
            const responseText = await response.text();
            const parser = new DOMParser();
            const data = parser.parseFromString(responseText, "application/xml");
            setLatestMETARs(data);
        }
    } catch (error) {
        console.log('Fetch API error -', error);
    }
}

function setLatestMETARs(xmlDoc) { 
    document.getElementById("rcrOutputSummer").innerHTML = "";
    var xmlElements = xmlDoc.getElementsByTagName("avi:source");
    var latestMETARs = [];
  
    for (var i = xmlElements.length - 1; i >= 0; i--) {
      var metar = xmlElements[i].getElementsByTagName("avi:input")[0].textContent;
      var time = xmlElements[i].getElementsByTagName("avi:processingTime")[0].textContent;

      time = time.replace(/T/g, '&emsp;&emsp;');
      time = time.replace(/\.\d{3}Z/g, '');

      latestMETARs.push([metar, time]);
    }

    document.getElementById("metarsTable").style.display = "table";
  
    // Clear the existing rows
    const table = document.getElementById("metarsTable");
    
    while (table.rows.length > 0) {
      table.deleteRow(0);
    }
  
    // Add new rows
    for (var i = 0; i < Math.min(latestMETARs.length, 8); i++) {
      const row = table.insertRow(-1);
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
  
      const report = latestMETARs[i][0].replace(/SHRA/g, '<strong><span style="color:#e65a5a;">SHRA</span></strong>').replace(/FZRA/g, '<strong><span style="color:#e65a5a;">FZRA</span></strong>').replace(/RA/g, '<strong><span style="color:#e65a5a;">RA</span></strong>');

      cell1.innerHTML = report;
      cell2.innerHTML = latestMETARs[i][1];

      document.getElementById("afterIcaoSelected").style.visibility = "visible";
    }
}

function conditionSelected(contaminantType) {
  document.getElementById("metarsTable").style.display = "none";
  document.getElementById("rcrOutputSummer").innerHTML = "";
  summerRcr = "";
  if (icao == "EFHK") summerRcr = "RUNWAY CONDITION REPORT AT ";
  else {
    const runway = runwayInfo[icao];
    summerRcr = `RUNWAY ${runway} CONDITION REPORT AT `;
  }

  const currentTime = new Date();

  // Extract hours and minutes
  const hours = ("0" + currentTime.getUTCHours()).slice(-2);
  const minutes = ("0" + currentTime.getUTCMinutes()).slice(-2);
  
  const currentTimeUTC = hours + minutes + " UTC";
  const rwycc = contaminantInfo[contaminantType];
  
  summerRcr += currentTimeUTC + `.<br>RUNWAY CONDITION CODES ${rwycc}, ${rwycc}, ${rwycc}.<br>`;
  summerRcr += `CONTAMINANTS ALL PARTS 100 PERCENT ${contaminantType}.<br>`
  if (rwycc < 6 && rwycc > 2) {
    summerRcr += "TAKEOFF SIGNIFICANT CONTAMINANT THIN.<br>"
  }
  document.getElementById("rcrOutputSummer").innerHTML = summerRcr;

  if (icao) {
    document.getElementById("aerodromeSummer").textContent = icao + " ATIS RCR";
    document.getElementById("copyButtonSummer").style.visibility = "visible";
  } else {
      document.getElementById("aerodromeSummer").textContent = "";
  }
}

function copyTextToClipboardSummer() {
  var textToCopy = summerRcr.replace(/<br\s*\/?>/gi, ' ');
  var textarea = document.createElement("textarea");
  textarea.value = textToCopy;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);

  document.getElementById("aerodromeSummer").textContent = "copied ";

}


const runwayInfo = {
  "EFET": "03",
  "EFHA": "08",
  "EFHK": "04L",
  "EFIV": "04",
  "EFJO": "10",
  "EFJY": "12",
  "EFKE": "18",
  "EFKI": "07",
  "EFKK": "01",
  "EFKS": "12",
  "EFKT": "16",
  "EFKU": "15",
  "EFLP": "06",
  "EFMA": "03",
  "EFMI": "11",
  "EFOU": "12",
  "EFPO": "12",
  "EFRO": "03",
  "EFSA": "12",
  "EFSI": "14",
  "EFTP": "06",
  "EFTU": "08",
  "EFUT": "07",
  "EFVA": "16"
};

const contaminantInfo = {
  "DRY": 6,
  "WET": 5,
  "SLIPPERY WET": 3,
  "STANDING WATER": 2
};