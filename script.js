// Copyright Aaron Wright 7/25/2017 http://westhollow.io


// This script is used to gather specific information from
// the qpp.cms.gov website.

var testJSON;
var errorCount = 0;
// Define our functions
var createNPIArray = function(){
    var npiText = document.getElementById('npi-list').value;
    npiText = npiText.replace(/[\n\r]/g, ',');
	npiText = npiText.replace(/\s+/g, '');
    var npiArray = npiText.split(',');
    console.log(npiArray);
    return npiArray;
}

var getNPIData = function(arrayOfNPINumbers){
  errorCount = 0;

  totalCountRecords = arrayOfNPINumbers.length;
  loadedRecords = 0;
  document.getElementById("total-count").textContent=totalCountRecords;
  document.getElementById('loading-spinner').style.visibility = "visible";
  document.getElementById('loading-count').style.visibility = "visible";
  for (i = 0; i < arrayOfNPINumbers.length; i++){
    (function(i){
      if (arrayOfNPINumbers[i].length == 10) {
        var requestUrl = 'https://qpp.cms.gov/api/eligibility/npi/' + arrayOfNPINumbers[i];
        var request = new XMLHttpRequest();
        request.open('GET', requestUrl);
        request.responseType = 'json';
        request.send();
        //request.onerror(console.log("** An error occurred during the transaction"));
        request.onload = function()
          {
          if (request.status == 400){
            addErrorRow(arrayOfNPINumbers[i], "BAD REQUEST");
            errorCount = errorCount + 1;
            showErrorCount(errorCount);
          } else if (request.status == 404){
            addErrorRow(arrayOfNPINumbers[i], "NO DATA");
            errorCount = errorCount + 1;
            showErrorCount(errorCount);
          } else {
            // IF NO ERROR MESSAGE, IS GOOD
            createTableRows(request.response);
          }
          loadedRecords += 1;
          document.getElementById("loaded-count").textContent=loadedRecords;
          if (totalCountRecords == loadedRecords) {
            document.getElementById('loading-spinner').style.visibility = "hidden";
            document.getElementById("loading-count").textContent="Loaded " + loadedRecords + " records.";
          }
        }

      } else {
            addErrorRow(arrayOfNPINumbers[i], "INVALID NPI");
            loadedRecords += 1;
            document.getElementById("loaded-count").textContent=loadedRecords;
            if (totalCountRecords == loadedRecords) {
              document.getElementById('loading-spinner').style.visibility = "hidden";
              document.getElementById("loading-count").textContent="Loaded " + loadedRecords + " records.";
            }
      }
    })(i);
  }
}

var createTableRows = function(jsonObject){
  var jsonData = jsonObject;

  // TODO: Add function to clear table.

  if (jsonData == null || jsonData.hasOwnProperty('error')){
    console.log('ERROR');
    errorCount = errorCount + 1;
  }else{
    addRow(jsonData);
    console.log(jsonData);
  }
}

var showErrorCount = function(errorCount){
  var errorSpan = document.getElementById('error-count');
  if (errorCount > 0){
    errorSpan.innerText = '[ ' + errorCount + ' Error(s) ]';
    errorSpan.hidden = false;
  }else{
    errorSpan.hidden = true;
  }
}

var addRow = function(jsonObject){

  // ADD Loop function to deal with multiple organizations.
  var organizationsCount = Object.keys(jsonObject.data.organizations).length;

  if (organizationsCount > 0) {
    for (var i = 0; i < organizationsCount; i++){
      // Link to the table on our page by ref
      var tableRef = document.getElementById('results-table');

      // create a new row
      var newRow = tableRef.insertRow();

      // create each cell in order and set the text

      var npiCell = newRow.insertCell(0);
      var npiText = document.createTextNode(jsonObject.data.npi);
      npiCell.appendChild(npiText);

      var providerNameCell = newRow.insertCell(1);
      var providerNameText = document.createTextNode(jsonObject.data.lastName + ", " + jsonObject.data.firstName + " " + jsonObject.data.middleName);
      providerNameCell.appendChild(providerNameText);

      var providerTypeCell = newRow.insertCell(2);
      var providerTypeText = document.createTextNode(jsonObject.data.specialty.typeDescription);
      providerTypeCell.appendChild(providerTypeText);

      var providerTINsCell = newRow.insertCell(3);
      var providerTINsText = document.createTextNode(organizationsCount);
      providerTINsCell.appendChild(providerTINsText);

      var providerEnrolledCell = newRow.insertCell(4);
	  var pecosEnrolledDate = jsonObject.data.pecosEnrollmentDate;
	  if (pecosEnrolledDate < 2017){
		  pecosEnrolledDateValue = 'true';
	  } else {
		  pecosEnrolledDateValue = 'false';
	  }
      var providerEnrolledText = document.createTextNode(pecosEnrolledDateValue);
      providerEnrolledCell.appendChild(providerEnrolledText);

      var providerPracticeDetailsCell = newRow.insertCell(5);
      var providerPracticeDetailsText = document.createTextNode(jsonObject.data.organizations[i].prvdrOrgName + ", " + jsonObject.data.organizations[i].addressLineOne + ", " +
        jsonObject.data.organizations[i].addressLineTwo + ", " +jsonObject.data.organizations[i].city + ", " +
        jsonObject.data.organizations[i].state + " " + jsonObject.data.organizations[i].zip);
      providerPracticeDetailsCell.appendChild(providerPracticeDetailsText);

      var providerMipsEligIndividualCell = newRow.insertCell(6);
      var providerMipsEligIndividualText = document.createTextNode(jsonObject.data.organizations[i].individualScenario.mipsEligibleSwitch);
      // Do a check for the individual level, if the lowVolumeSwitch is true, override mipsEligibleSwitch and set to False
      if (jsonObject.data.organizations[i].individualScenario.lowVolumeSwitch == true){
        providerMipsEligIndividualText = document.createTextNode(false);
      }
      providerMipsEligIndividualCell.appendChild(providerMipsEligIndividualText);

      var providerMipsEligGroupCell = newRow.insertCell(7);
      var providerMipsEligGroupText = document.createTextNode(!jsonObject.data.organizations[i].groupScenario.lowVolumeSwitch);
      providerMipsEligGroupCell.appendChild(providerMipsEligGroupText);

      var providerIndNonPatientCell = newRow.insertCell(8);
      var providerIndNonPatientText = document.createTextNode(jsonObject.data.organizations[i].individualScenario.nonPatientFacing);
      providerIndNonPatientCell.appendChild(providerIndNonPatientText);

      var providerIndHospitalBasedCell = newRow.insertCell(9);
      var providerIndHospitalBasedText = document.createTextNode(jsonObject.data.organizations[i].individualScenario.hospitalBasedClinician);
      providerIndHospitalBasedCell.appendChild(providerIndHospitalBasedText);

      var providerIndSmallPracticeCell = newRow.insertCell(10);
      var providerIndSmallPracticeText = document.createTextNode(jsonObject.data.organizations[i].individualScenario.smallGroupPractitioner);
      providerIndSmallPracticeCell.appendChild(providerIndSmallPracticeText);

      var providerIndRuralCell = newRow.insertCell(11);
      var providerIndRuralText = document.createTextNode(jsonObject.data.organizations[i].individualScenario.ruralClinician);
      providerIndRuralCell.appendChild(providerIndRuralText);

      var providerIndHPSACell = newRow.insertCell(12);
      var providerIndHPSAText = document.createTextNode(jsonObject.data.organizations[i].individualScenario.hpsaClinician);
      providerIndHPSACell.appendChild(providerIndHPSAText);

      var providerGrpNonPatientCell = newRow.insertCell(13);
      var providerGrpNonPatientText = document.createTextNode(jsonObject.data.organizations[i].groupScenario.nonPatientFacing);
      providerGrpNonPatientCell.appendChild(providerGrpNonPatientText);

      var providerGrpHospitalBasedCell = newRow.insertCell(14);
      var providerGrpHospitalBasedText = document.createTextNode(jsonObject.data.organizations[i].groupScenario.hospitalBasedClinician);
      providerGrpHospitalBasedCell.appendChild(providerGrpHospitalBasedText);

      var providerGrpSmallPracticeCell = newRow.insertCell(15);
      var providerGrpSmallPracticeText = document.createTextNode(jsonObject.data.organizations[i].groupScenario.smallGroupPractitioner);
      providerGrpSmallPracticeCell.appendChild(providerGrpSmallPracticeText);

      var providerGrpRuralCell = newRow.insertCell(16);
      var providerGrpRuralText = document.createTextNode(jsonObject.data.organizations[i].groupScenario.ruralClinician);
      providerGrpRuralCell.appendChild(providerGrpRuralText);

      var providerGrpHPSACell = newRow.insertCell(17);
      var providerGrpHPSAText = document.createTextNode(jsonObject.data.organizations[i].groupScenario.hpsaClinician);
      providerGrpHPSACell.appendChild(providerGrpHPSAText);

      }
    } else {

      // In the case they do not have a TINS, we need to display their NPI and a note
        // Link to the table on our page by ref
        var tableRef = document.getElementById('results-table');

        // create a new row
        var newRow = tableRef.insertRow();

        // create each cell in order and set the text

        var npiCell = newRow.insertCell(0);
        var npiText = document.createTextNode(jsonObject.data.npi);
        npiCell.appendChild(npiText);

        var providerNameCell = newRow.insertCell(1);
        var providerNameText = document.createTextNode(jsonObject.data.lastName + ", " + jsonObject.data.firstName + " " + jsonObject.data.middleName);
        providerNameCell.appendChild(providerNameText);

        var providerTypeCell = newRow.insertCell(2);
        var providerTypeText = document.createTextNode(jsonObject.data.specialty.typeDescription);
        providerTypeCell.appendChild(providerTypeText);

        var providerTINsCell = newRow.insertCell(3);
        var providerTINsText = document.createTextNode(organizationsCount);
        providerTINsCell.appendChild(providerTINsText);

        var providerEnrolledCell = newRow.insertCell(4);
        var providerEnrolledText = document.createTextNode('???');
        providerEnrolledCell.appendChild(providerEnrolledText);

        var providerPracticeDetailsCell = newRow.insertCell(5);
        var providerPracticeDetailsText = document.createTextNode("NO TINS");
        providerPracticeDetailsCell.appendChild(providerPracticeDetailsText);

        var providerMipsEligIndividualCell = newRow.insertCell(6);
        var providerMipsEligIndividualText = document.createTextNode("NO TINS");
        providerMipsEligIndividualCell.appendChild(providerMipsEligIndividualText);

        var providerMipsEligGroupCell = newRow.insertCell(7);
        var providerMipsEligGroupText = document.createTextNode("NO TINS"); // WE NEED OPOSITE OF BOOLEAN.
        providerMipsEligGroupCell.appendChild(providerMipsEligGroupText);

        var providerIndNonPatientCell = newRow.insertCell(8);
        var providerIndNonPatientText = document.createTextNode("NO TINS");
        providerIndNonPatientCell.appendChild(providerIndNonPatientText);

        var providerIndHospitalBasedCell = newRow.insertCell(9);
        var providerIndHospitalBasedText = document.createTextNode("NO TINS");
        providerIndHospitalBasedCell.appendChild(providerIndHospitalBasedText);

        var providerIndSmallPracticeCell = newRow.insertCell(10);
        var providerIndSmallPracticeText = document.createTextNode("NO TINS");
        providerIndSmallPracticeCell.appendChild(providerIndSmallPracticeText);

        var providerIndRuralCell = newRow.insertCell(11);
        var providerIndRuralText = document.createTextNode("NO TINS");
        providerIndRuralCell.appendChild(providerIndRuralText);

        var providerIndHPSACell = newRow.insertCell(12);
        var providerIndHPSAText = document.createTextNode("NO TINS");
        providerIndHPSACell.appendChild(providerIndHPSAText);

        var providerGrpNonPatientCell = newRow.insertCell(13);
        var providerGrpNonPatientText = document.createTextNode("NO TINS");
        providerGrpNonPatientCell.appendChild(providerGrpNonPatientText);

        var providerGrpHospitalBasedCell = newRow.insertCell(14);
        var providerGrpHospitalBasedText = document.createTextNode("NO TINS");
        providerGrpHospitalBasedCell.appendChild(providerGrpHospitalBasedText);

        var providerGrpSmallPracticeCell = newRow.insertCell(15);
        var providerGrpSmallPracticeText = document.createTextNode("NO TINS");
        providerGrpSmallPracticeCell.appendChild(providerGrpSmallPracticeText);

        var providerGrpRuralCell = newRow.insertCell(16);
        var providerGrpRuralText = document.createTextNode("NO TINS");
        providerGrpRuralCell.appendChild(providerGrpRuralText);

        var providerGrpHPSACell = newRow.insertCell(17);
        var providerGrpHPSAText = document.createTextNode("NO TINS");
        providerGrpHPSACell.appendChild(providerGrpHPSAText);
      }

  }

// If we get bad or no data, add an error row to the table.
var addErrorRow = function(npiNum, errMsg) {
  var tableRef = document.getElementById('results-table');

  // create a new row
  var newRow = tableRef.insertRow();

  // create each cell in order and set the text

  var npiCell = newRow.insertCell(0);
  var npiText = document.createTextNode(npiNum);
  npiCell.appendChild(npiText);

  var providerNameCell = newRow.insertCell(1);
  var providerNameText = document.createTextNode(errMsg);
  providerNameCell.appendChild(providerNameText);

  var providerTypeCell = newRow.insertCell(2);
  var providerTypeText = document.createTextNode(errMsg);
  providerTypeCell.appendChild(providerTypeText);

  var providerTINsCell = newRow.insertCell(3);
  var providerTINsText = document.createTextNode(errMsg);
  providerTINsCell.appendChild(providerTINsText);

  var providerEnrolledCell = newRow.insertCell(4);
  var providerEnrolledText = document.createTextNode(errMsg);
  providerEnrolledCell.appendChild(providerEnrolledText);

  var providerPracticeDetailsCell = newRow.insertCell(5);
  var providerPracticeDetailsText = document.createTextNode(errMsg);
  providerPracticeDetailsCell.appendChild(providerPracticeDetailsText);

  var providerMipsEligIndividualCell = newRow.insertCell(6);
  var providerMipsEligIndividualText = document.createTextNode(errMsg);
  providerMipsEligIndividualCell.appendChild(providerMipsEligIndividualText);

  var providerMipsEligGroupCell = newRow.insertCell(7);
  var providerMipsEligGroupText = document.createTextNode(errMsg); // WE NEED OPOSITE OF BOOLEAN.
  providerMipsEligGroupCell.appendChild(providerMipsEligGroupText);

  var providerIndNonPatientCell = newRow.insertCell(8);
  var providerIndNonPatientText = document.createTextNode(errMsg);
  providerIndNonPatientCell.appendChild(providerIndNonPatientText);

  var providerIndHospitalBasedCell = newRow.insertCell(9);
  var providerIndHospitalBasedText = document.createTextNode(errMsg);
  providerIndHospitalBasedCell.appendChild(providerIndHospitalBasedText);

  var providerIndSmallPracticeCell = newRow.insertCell(10);
  var providerIndSmallPracticeText = document.createTextNode(errMsg);
  providerIndSmallPracticeCell.appendChild(providerIndSmallPracticeText);

  var providerIndRuralCell = newRow.insertCell(11);
  var providerIndRuralText = document.createTextNode(errMsg);
  providerIndRuralCell.appendChild(providerIndRuralText);

  var providerIndHPSACell = newRow.insertCell(12);
  var providerIndHPSAText = document.createTextNode(errMsg);
  providerIndHPSACell.appendChild(providerIndHPSAText);

  var providerGrpNonPatientCell = newRow.insertCell(13);
  var providerGrpNonPatientText = document.createTextNode(errMsg);
  providerGrpNonPatientCell.appendChild(providerGrpNonPatientText);

  var providerGrpHospitalBasedCell = newRow.insertCell(14);
  var providerGrpHospitalBasedText = document.createTextNode(errMsg);
  providerGrpHospitalBasedCell.appendChild(providerGrpHospitalBasedText);

  var providerGrpSmallPracticeCell = newRow.insertCell(15);
  var providerGrpSmallPracticeText = document.createTextNode(errMsg);
  providerGrpSmallPracticeCell.appendChild(providerGrpSmallPracticeText);

  var providerGrpRuralCell = newRow.insertCell(16);
  var providerGrpRuralText = document.createTextNode(errMsg);
  providerGrpRuralCell.appendChild(providerGrpRuralText);

  var providerGrpHPSACell = newRow.insertCell(17);
  var providerGrpHPSAText = document.createTextNode(errMsg);
  providerGrpHPSACell.appendChild(providerGrpHPSAText);
}


// This will be the kick off function.
var queryQPP = function() {
  var npiNumbersArray = createNPIArray();
  getNPIData(npiNumbersArray);
};

// Attach click listener to button
if( document.body.attachEvent)
    document.getElementById('btn-load').attachEvent("onclick", queryQPP);
else
    document.getElementById('btn-load').addEventListener("click",queryQPP);
