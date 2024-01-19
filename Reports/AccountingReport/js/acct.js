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
            console.log(locs)
            createTable1(locs);
            fillLocations(locs);
            getReportData()
              .then((repd) => {
                console.log(repd);
                createTable(repd);
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
$(document).on("change", "#monthSel", function () {
  getReportData()
    .then((repd) => {
      console.log(repd);
      createTable(repd);
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
$(document).on("change", "#selLoc", function () {
  
  getReportData()
    .then((repd) => {
      console.log(repd);
      createTable(repd);
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
$(document).on("change", "#co", function () {
  getReportData()
    .then((repd) => {
      console.log(repd);
      createTable(repd);
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
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
        resolve(locs);
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
function fillLocations(loc) {
  $("#selLoc").empty();
  var str = "";
  str = `<option loc-id="0">All</option>`;
  $.each(loc, function (index, loc) {
    str += `<option loc-id="${loc.id}">${loc.locName}</option>`;
  });

  $("#selLoc").append(str);
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
function createTable1(location){
  $(".mainTable").empty();
  var str = "";
  $.each(location, function (index, loc){
    if (index === 0 ){
      str += `
    <table table-id="${loc.id}" class="table table-hover w-100">
    <thead class="sticky-top shadow-sm">
    <tr>
      <th colspan="17" class="locName" style="background-color: #eee !important;">${loc.locName}</th>
    </tr>
    <tr data-fill-color="b6f9a1" class="heady">
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Employee No.
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Employee Name
      </th>
      <th id="loc-head"
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
        style="display:none"
      >
        Location
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Regular Hours
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Total Overtime
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Total Leave
      </th>
      <!-- <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Unpaid Leave
      </th> -->
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Total Hours
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Regular Overtime (1.3)
      </th>
      <th
        colspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Rest-day OT
      </th>
      <th
        colspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Legal Holiday
      </th>
      <th
        colspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        RDOT & Legal Holiday
      </th>
      <th
        colspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Special Holiday
      </th>
      <th
        colspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        RDOT & Special Holiday
      </th>
    </tr>
    <tr class="heady">
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        First 8 Hours (1.3)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Beyond 8 Hours (1.7)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        First 8 Hours (2.0)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Beyond 8 Hours (2.6)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        First 8 Hours (2.6)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Beyond 8 Hours (3.3)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        First 8 Hours (1.4)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Beyond 8 Hours (1.7)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        First 8 Hours (1.5)
      </th>
      <th
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Beyond 8 Hours (1.8)
      </th>
    </tr>
  </thead>
  <tbody></tbody>
    </table>
    `}
    else{
      str += `
    <table table-id="${loc.id}" class="table table-hover w-100 ">
    <thead class="sticky-top">
    <tr>
      <th colspan="7" class="locName" style="background-color: #eee !important;">${loc.locName}</th>
    </tr>
    <tr data-fill-color="b6f9a1" class="heady">
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Employee No.
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Employee Name
      </th>
      <th id="loc-head"
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
        style="display:none"
      >
        Location
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Regular Hours
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Total Overtime
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Total Leave
      </th>
      <!-- <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Unpaid Leave
      </th> -->
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Total Hours
      </th>
      <th
        rowspan="2"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="bbffbc"
      >
        Regular Overtime (1.3)
      </th>
      
    </tr>
    
  </thead>
  <tbody></tbody>
    </table>
    `
    }
  })
  $(".mainTable").append(str)

}
function createTable(data) {
  var table = $(".mainTable table[table-id='1'] tbody");
  table.empty();
  // $("#acctBody").empty();
  var str = "";

  $.each(data, function (index, type) {
    lot = type.legalOT;
    var totreg =
      (totot =
      totl =
      totmh =
      totreot =
      rdot =
      spc =
      rdl =
      rdspc =
        0);

    if (type.totalReg !== undefined) {
      totreg = type.totalReg;
    }
    if (type.totalOT !== undefined) {
      totot = type.totalOT;
    }
    if (type.totalLeave !== undefined) {
      totl = type.totalLeave;
    }
    if (type.totalMH !== undefined) {
      totmh = type.totalMH;
    }
    if (type.regularOT !== undefined) {
      totreot = type.regularOT;
    }
    if (type.rdOT !== undefined) {
      rdot = beyondHours(type.rdOT);
    } else {
      rdot = `<td>0</td><td>0</td>`;
    }
    if (type.legalOT !== undefined) {
      lot = beyondHours(type.legalOT);
    } else {
      lot = `<td>0</td><td>0</td>`;
    }
    if (type.rdLegal !== undefined) {
      rdl = beyondHours(type.rdLegal);
    } else {
      rdl = `<td>0</td><td>0</td>`;
    }
    if (type.spcOT !== undefined) {
      spc = beyondHours(type.spcOT);
    } else {
      spc = `<td>0</td><td>0</td>`;
    }
    if (type.rdSpc !== undefined) {
      rdspc = beyondHours(type.rdSpc);
    } else {
      rdspc = `<td>0</td><td>0</td>`;
    }
    str += `<tr>
    <td>${index}</td>
    <td>${type.name}</td>
    <td>${totreg}</td>
    <td>${totot}</td>
    <td>${totl}</td>
 
    
    <td>${totmh}</td>
    <td>${totreot}</td>
    ${rdot}
    ${lot}
    ${rdl}
    ${spc}
    ${rdspc}
    </tr>
    `;
  });
  // $("#acctBody").append(str);
  table.append(str);
}
function beyondHours(data) {
  var out = "";
  if (data > 8) {
    var sobra = "";
    sobra = data - 8;
    out = `<td>8</td><td>${sobra}</td>`;
  } else {
    out = `<td>${data}</td><td>0</td>`;
  }
  return out;
}
//#endregion
