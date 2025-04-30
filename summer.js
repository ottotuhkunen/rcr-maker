let summerRcr = "";
let icao = "";

async function loadLatestMETARs(icaoCode) {
  icao = icaoCode;
  try {
    const response = await fetch(`https://api.met.no/weatherapi/tafmetar/1.0/metar.txt?icao=${icaoCode}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      document.getElementById("copyButtonSummer").style.visibility = "hidden";
      document.getElementById("aerodromeSummer").textContent = "";
      document.getElementById("rcrOutputSummer").innerHTML = "";
      const responseText = await response.text();
      setLatestMETARs(responseText);
    }
  } catch (error) {
    console.log('Fetch API error -', error);
  }
}

function setLatestMETARs(metarText) { 
  document.getElementById("rcrOutputSummer").innerHTML = "";
  const metarLines = metarText.split('\n').filter(line => line.trim() !== '');
  const latestMETARs = [];
  
  // Get the last 10 METARs (or fewer if there aren't that many)
  const recentMetars = metarLines.slice(-10).reverse();
  
  for (const metar of recentMetars) {
    // Extract time from METAR (e.g., "291520Z" from "ENGM 291520Z 23008KT...")
    const timeMatch = metar.match(/\d{6}Z/);
    if (timeMatch) {
      const timeCode = timeMatch[0];
      const day = timeCode.substring(0, 2);
      const hour = timeCode.substring(2, 4);
      const minute = timeCode.substring(4, 6);
      
      const formattedTime = `${day} ${hour}:${minute} UTC`;
      
      latestMETARs.push([metar, formattedTime]);
    } else {
      // If time can't be parsed, just show the METAR with empty time
      latestMETARs.push([metar, '']);
    }
  }

  document.getElementById("metarsTable").style.display = "table";
  
  // Clear the existing rows
  const table = document.getElementById("metarsTable");
  
  while (table.rows.length > 0) {
    table.deleteRow(0);
  }
  
  // Add new rows
  for (var i = 0; i < latestMETARs.length; i++) {
    const row = table.insertRow(-1);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
  
    // highlight Rain/Drizzle/Showers
    const report = latestMETARs[i][0]
      .replace(/SHRA/g, '<strong><span style="color:#e65a5a;">SHRA</span></strong>')
      .replace(/FZRA/g, '<strong><span style="color:#e65a5a;">FZRA</span></strong>')
      .replace(/RA/g, '<strong><span style="color:#e65a5a;">RA</span></strong>')
      .replace(/SH/g, '<strong><span style="color:#e65a5a;">SH</span></strong>')
      .replace(/DZ/g, '<strong><span style="color:#e65a5a;">DZ</span></strong>');

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
  
  summerRcr += currentTimeUTC + `.<br>RUNWAY CONDITION CODES ${rwycc}, ${rwycc}, ${rwycc}, <br>`;

  if (rwycc == 6) summerRcr += `CONTAMINANTS ALL PARTS DRY`;
  else summerRcr += `CONTAMINANTS ALL PARTS 100 PERCENT ${contaminantType}`

  if (rwycc < 6 && rwycc > 2) summerRcr += ".<br>TAKEOFF SIGNIFICANT CONTAMINANT THIN";

  summerRcr += '.';

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