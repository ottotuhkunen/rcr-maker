var rcr;
var rwycc = [];
var header;

document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('video');
    if (videoElement) {
      // Get the duration of the video's transition (in milliseconds)
      const transitionDuration = 500; // 0.5 seconds in milliseconds
  
      // Add an event listener for the 'mouseover' event
      videoElement.addEventListener('mouseover', () => {
        // Increase the size of the 'video' element here
  
        // After the same duration as the transition, scroll to the bottom
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }, transitionDuration);
      });
    }
});
  

function generateRCR() {
    var snowtamInput = document.getElementById("snowtam");
    var snowtam = snowtamInput.value;
    // Normalize whitespace
    snowtam = snowtam.replace(/\s+/g, ' ').trim();
    snowtamInput.value = snowtam;

    console.log(snowtam);

    if (!snowtam.trim()) {
        const aerodromeElement = document.getElementById("aerodrome");
        aerodromeElement.textContent = "input is empty";
    
        setTimeout(function() {
            aerodromeElement.textContent = "";
        }, 2000);
    
        return;
    }

    makeHeader(snowtam);
    makeRWYCC(snowtam);
    makeContaminants(snowtam);
    makeReducedWidth(snowtam);
    makeOtherInformation(snowtam);
    makeTwyAndApnConditions(snowtam);

    document.getElementById("rcrOutput").innerHTML = rcr;
    document.getElementById("copyButton").style.visibility = "visible";
    document.getElementById("warning").style.visibility = "visible";
    document.getElementById("video").style.visibility = "hidden";
}

function makeHeader(snowtam) {
    var match = snowtam.match(/(\d{4})(\d{4}) (\d{2})/);

    if (match) {
        // runway
        if (snowtam.includes(" 04L ")) rcr = "RUNWAY CONDITION REPORT AT ";
        else rcr = "RUNWAY " + match[3] + " CONDITION REPORT AT ";
        // time
        rcr += match[2] + " UTC.<br>";
    } else {
        console.log("No match found.");
    }

    // get airport ICAO code
    const regexAD = /EF[A-Z]{2}/;
    const matchAD = snowtam.match(regexAD);

    if (matchAD) {
        document.getElementById("aerodrome").textContent = matchAD[0] + " ATIS RCR";
        header = matchAD[0] + " ATIS RCR";
    } else {
        document.getElementById("aerodrome").textContent = "";
    }
}

function makeRWYCC(snowtam) {
    rcr += "RUNWAY CONDITION CODES ";
    var digit1;
    var digit2;
    var digit3;
    var regex = /\b([1-9]\d*)\/([1-9]\d*)\/([1-9]\d*)\b/g;
    var match;

    // RWYCC values
    while ((match = regex.exec(snowtam)) !== null) {
        digit1 = match[1];
        digit2 = match[2];
        digit3 = match[3];
    }

    // downgraded/upgraded values
    var firstPartRegex = /FIRST PART RWYCC (UPGRADED|DOWNGRADED)/;
    var secondPartRegex = /SECOND PART RWYCC (UPGRADED|DOWNGRADED)/;
    var thirdPartRegex = /THIRD PART RWYCC (UPGRADED|DOWNGRADED)/;

    var matchFirstPart = snowtam.match(firstPartRegex);
    var matchSecondPart = snowtam.match(secondPartRegex);
    var matchThirdPart = snowtam.match(thirdPartRegex);

    var firstGrade = matchFirstPart ? matchFirstPart[1] : '';
    var secondGrade = matchSecondPart ? matchSecondPart[1] : '';
    var thirdGrade = matchThirdPart ? matchThirdPart[1] : '';

    if (firstGrade) digit1 += ' ' + firstGrade + ', ';
    else digit1 += ', ';

    if (secondGrade) digit2 += ' ' + secondGrade + ', ';
    else digit2 += ', ';

    if (thirdGrade) digit3 += ' ' + thirdGrade + '.<br>';
    else digit3 += '.<br>';

    rcr += digit1 + digit2 + digit3;
}

function makeContaminants(snowtam) {
    var regex = /((?:DRY SNOW ON TOP OF ICE|WET SNOW ON TOP OF ICE|DRY SNOW ON TOP OF COMPACTED SNOW|WET SNOW ON TOP OF COMPACTED SNOW|WATER ON TOP OF COMPACTED SNOW|SLIPPERY WET|DRY SNOW|WET SNOW|COMPACTED SNOW|WET ICE|ICE|DRY|FROST|WET|SLUSH|STANDING WATER)(?:\/(?:DRY SNOW ON TOP OF ICE|WET SNOW ON TOP OF ICE|DRY SNOW ON TOP OF COMPACTED SNOW|WET SNOW ON TOP OF COMPACTED SNOW|WATER ON TOP OF COMPACTED SNOW|SLIPPERY WET|DRY SNOW|WET SNOW|COMPACTED SNOW|WET ICE|ICE|DRY|FROST|WET|SLUSH|STANDING WATER))*)/g;

    var match;
    var contaminants = [];

    while ((match = regex.exec(snowtam)) !== null) {
        var contaminantParts = match[0].trim().split('/'); // Split contaminants by '/'
        contaminants.push(...contaminantParts); // Add each part separately
    }

    console.log("Contaminant 1:", contaminants[0]);
    console.log("Contaminant 2:", contaminants[1]);
    console.log("Contaminant 3:", contaminants[2]);

    // depth
    var depthValues = extractDepth(snowtam);

    if (contaminants[0] === contaminants[1] && contaminants[1] === contaminants[2]) {
        if (contaminants[0] == "DRY") {
            rcr += "CONTAMINANTS ALL PARTS DRY.<br>";
        }
        else {
            if (depthValues[0] != "NR") {
                rcr += "CONTAMINANTS ALL PARTS " + depthValues[0] + " PERCENT ";
            } else {
                rcr += "CONTAMINANTS ALL PARTS 100 PERCENT ";
            }
            if (depthValues[1] != "NR") {
                rcr += depthValues[1] + " MILLIMETERS " + contaminants[0] + ".<br>";
            } else {
                rcr += contaminants[0] + ".<br>";
            }

            if (snowtam.includes("CHEMICALLY TREATED")) {
                rcr += "RUNWAY CHEMICALLY TREATED.<br>"
            }

            if (snowtam.includes("CONTAMINANT THIN DUE TO SMALL COVERAGE")) {
                rcr += "TAKEOFF SIGNIFICANT CONTAMINANT THIN DUE TO SMALL COVERAGE.<br>"
            }
            else if (snowtam.includes("CONTAMINANT THIN")) {
                rcr += "TAKEOFF SIGNIFICANT CONTAMINANT THIN.<br>"
            }
        }
        
    } else {
        if (depthValues[1] != "NR") {
            rcr += "CONTAMINANTS FIRST PART 100 PERCENT " + depthValues[1] + " MILLIMETERS " + contaminants[0] + ", SECOND PART 100 PERCENT " + depthValues[1] + " MILLIMETERS " + contaminants[1] + ", THIRD PART 100 PERCENT " + depthValues[1] + " MILLIMETERS " + contaminants[2] + ".<br>";
        } else {
            rcr += "CONTAMINANTS FIRST PART 100 PERCENT " + contaminants[0] + ", SECOND PART 100 PERCENT " + contaminants[1] + ", THIRD PART 100 PERCENT " + contaminants[2] + ".<br>";
        }
        
        if (snowtam.includes("CONTAMINANT THIN DUE TO SMALL COVERAGE")) {
            rcr += "TAKEOFF SIGNIFICANT CONTAMINANT THIN DUE TO SMALL COVERAGE.<br>"
        }
        else if (snowtam.includes("CONTAMINANT THIN")) {
            rcr += "TAKEOFF SIGNIFICANT CONTAMINANT THIN.<br>"
        }
    }
}

function makeReducedWidth(snowtam) {
    var regex = /\s([4-6][0-9])/;
    var match = snowtam.match(regex);

    if (match) {
        rcr += "REDUCED WIDTH " + match[1] + " METERS.<br>"
    }
}

function makeTwyAndApnConditions(snowtam) {
    var twysRegex = /ALL TWYS (GOOD TO MEDIUM|MEDIUM TO POOR|GOOD|MEDIUM|POOR)/;
    var apronsRegex = /ALL APRONS (GOOD TO MEDIUM|MEDIUM TO POOR|GOOD|MEDIUM|POOR)/;

    var twysMatch = snowtam.match(twysRegex);
    var apronsMatch = snowtam.match(apronsRegex);

    var twysCondition = twysMatch ? twysMatch[1] : '';
    var apronsCondition = apronsMatch ? apronsMatch[1] : '';

    if (twysMatch) {
        rcr += "TAXIWAY CONDITIONS " + twysCondition + ".<br>";
    }
    if (apronsMatch) {
        rcr += "APRON CONDITIONS " + apronsCondition + ".<br>";
    }

}

function makeOtherInformation(snowtam) {
    // drifting snow
    if (snowtam.includes("DRIFTING SNOW")) {
        rcr += "DRIFTING SNOW. "
    }

    // snowbanks
    var regex = /SNOW BANK LR(\d+)/;
    var match = snowtam.match(regex);

    if (match && match[1]) {
        var snowBankNumber = match[1];
        rcr += "SNOW BANKS LEFT " + snowBankNumber + " METERS RIGHT " + snowBankNumber + " METERS FROM CENTERLINE.<br>"
    }

    // different snowbanks
    var regexLeft = /SNOW BANK L(\d+)/;
    var regexRight = /SNOW BANK R(\d+)/;
    var matchLeft = snowtam.match(regexLeft);
    var matchRight = snowtam.match(regexRight);

    if (matchLeft && matchLeft[1]) {
        if (matchRight && matchRight[1]) {
            rcr += "SNOW BANKS LEFT " + matchLeft[1] + " METERS RIGHT " + matchRight[1] + " METERS FROM CENTERLINE.<br>"
        }
    }

    // ice accumulation
    if (snowtam.includes("ICE ACCUMULATION")) {
        rcr += "ICE ACCUMULATION ON EDGES OF CLEARED AREA.<br>"
    }
    if (snowtam.includes("ICE FORMATION OUTSIDE CLEARED AREA.")) {
        rcr += "ICE FORMATION OUTSIDE CLEARED AREA.<br>"
    }
    if (snowtam.includes("COMPACTED SN OUTSIDE CLEARED AREA.")) {
        rcr += "COMPACTED SNOW OUTSIDE CLEARED AREA.<br>"
    }
}

function extractDepth(snowtam) {
    const parts = snowtam.split('/');
    function getFirstWord(str) {
        return str.split(/\s+/)[0];
    }
    if (parts.length > 5) {
        return [
            getFirstWord(parts[4]), 
            getFirstWord(parts[5]), 
        ];
    } else {
        return [];
    }
}

function copyTextToClipboard() {
    var textToCopy = rcr.replace(/<br\s*\/?>/gi, ' ');
    var textarea = document.createElement("textarea");
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    const aerodromeElement = document.getElementById("aerodrome");
    aerodromeElement.textContent = "copied ";

    setTimeout(function() {
        aerodromeElement.textContent = header;
    }, 2000);
}
