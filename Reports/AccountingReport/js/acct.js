//#region GLOBALS
switch (document.location.hostname) {
  case "kdt-ph":
    rootFolder = "//kdt-ph/";
    break;
  case "localhost":
    rootFolder = "//localhost/";
    break;
  default:
    rootFolder = "//kdt-ph/";
    break;
}

const today = new Date();
//#endregion
checkAccess()
  .then((acc) => {
    if (acc) {
      $(document).ready(function () {
        $("#monthSel").val(
          `${today.getFullYear()}-${(today.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`
        );
        getLocations()
          .then((locs) => {
            console.log(locs);
            getReportData()
              .then((repd) => {
                console.log(repd);
                createTable(repd)
              })
              .catch((error) => {
                alert(`${error}`);
              });
          })
          .catch((error) => {
            alert(`${error}`);
          });
      });
    } else {
      alert("Access denied");
      window.location.href = "../";
    }
  })
  .catch((error) => {
    alert(`${error}`);
  });

//#region BINDS

//#endregion

//#region FUNCTION
function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_permission.php",
      dataType: "json",
      success: function (data) {
        const acc = data;
        resolve(acc);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred1.");
        }
      },
    });
  });
}
function getLocations() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_locations.php",
      dataType: "json",
      success: function (response) {
        const locs = response;
        var str = "";
        
        $.each(locs, function(index, loc) {
          str += `<option value="${loc.id}">${loc.locName}</option>`;
         
        });
        resolve(locs); 
        
        $("#selLoc").append(str);
         
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (chr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occured2.");
        }
      },
    });
  });
}
function getReportData() {
  const locSel = $("#selLoc").find("option:selected").attr("loc-id");
  const yrMonth = $("#monthSel").val();
  const cutOff = $("#co").val();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_entries.php",
      data: {
        yearMonth: yrMonth,
        loc: locSel,
        cutOff: cutOff,
      },
      dataType: "json",
      success: function (response) {
        const repdata = response;
        resolve(repdata);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          rejected("Internal Server Error: There was a server error");
        } else {
          reject("An unspecified error occured3.");
        }
      },
    });
  });
}
function createTable(data){
  var str = '';
  
  $.each(data, function(index, type) {
      lot = type.legalOT;
      var totreg = totot = totl = totmh = totreot = rdot = spc = rdl = rdspc = 0;
   
    if(type.totalReg !== undefined){
       totreg = type.totalReg;
       
    }
    if(type.totalOT !== undefined){
      totot = type.totalOT;
    }
    if(type.totalLeave !== undefined){
      totl = type.totalLeave;
    }
    if(type.totalMH !== undefined){
      totmh = type.totalMH;
    }
    if(type.regularOT !== undefined){
      totreot = type.regularOT;
    }
    if(type.rdOT !== undefined){
      rdot = beyondHours(type.rdOT);
    }else{
      rdot = `<td>0</td><td>0</td>`;
    }
    if(type.legalOT !== undefined){
      lot = beyondHours(type.legalOT);
    }else{
      lot = `<td>0</td><td>0</td>`;
    }
    if(type.rdLegal !== undefined){
      rdl = beyondHours(type.rdLegal);
    }else{
      rdl = `<td>0</td><td>0</td>`;
    }
    if(type.spcOT !== undefined){
      spc = beyondHours(type.spcOT);
    }else{
      spc = `<td>0</td><td>0</td>`;
    }
    if(type.rdSpc !== undefined){
      rdspc = beyondHours(type.rdSpc);
    }else{
      rdspc = `<td>0</td><td>0</td>`;
    }
    str += 
    `<tr>
    <td>${index}</td>
    <td>${type.name}</td>
    <td>${totreg}</td>
    <td>${totot}</td>
    <td>${totl}</td>
    <td>unpaid katangahan</td>
    
    <td>${totmh}</td>
    <td>${totreot}</td>
    ${rdot}
    ${lot}
    ${rdl}
    ${spc}
    ${rdspc}
    </tr>
    `;
    
  });$("#acctBody").append(str)
}
function beyondHours(data){
  var out = "";
  if (data > 8){
    var sobra = '';
    sobra = data - 8;
    out = `<td>8</td><td>${sobra}</td>`;
  }
  else{
    out = `<td>${data}</td><td>0</td>`
  }
  return out;
}
//#endregion
