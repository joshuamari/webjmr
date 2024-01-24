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
var locations = [];
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
            locations = locs;
            createTable1(locations);
            fillLocations(locations);
            getReportData()
              .then((repd) => {
                createTable(repd, locations);
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
      createTable(repd, locations);
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
$(document).on("change", "#selLoc", function () {
  var loc = parseInt($("#selLoc :selected").attr("loc-id"));
  console.log(loc);
  if (loc === 0) {
    $("table").removeClass("d-none");
  }
  if (loc === 1) {
    $("table").addClass("d-none");
    $(".mainTable table[table-id='1']").removeClass("d-none");
  }
  if (loc === 2) {
    $("table").addClass("d-none");
    $(".mainTable table[table-id='2']").removeClass("d-none");
  }
  if (loc === 3) {
    $("table").addClass("d-none");
    $(".mainTable table[table-id='3']").removeClass("d-none");
  }
  if (loc === 4) {
    $("table").addClass("d-none");
    $(".mainTable table[table-id='4']").removeClass("d-none");
  }
  if (loc === 5) {
    $("table").addClass("d-none");
    $(".mainTable table[table-id='5']").removeClass("d-none");
  }
  getReportData()
    .then((repd) => {
      console.log(repd);
      createTable(repd, locations);
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
$(document).on("change", "#co", function () {
  getReportData()
    .then((repd) => {
      console.log(repd);
      createTable(repd, locations);
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
$(document).on("click", "#btnExport", function(){
  tableToExcel();
})
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
function createTable1(location) {
  $(".mainTable").empty();
  var str = "";
  $.each(location, function (index, loc) {
    if (index === 0) {
      str += `
    <table table-id="${loc.id}" id="${loc.id}" class="table table-hover w-100">
    <thead class="sticky-top shadow-sm">
    <tr>
      <th colspan="17" class="locName" style="background-color: #eee !important;"
      data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="eeeeee">${loc.locName}</th>
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
    `;
    } else {
      str += `
    <table table-id="${loc.id}" class="table table-hover w-100 ">
    <thead class="sticky-top">
    <tr>
      <th colspan="7" class="locName" style="background-color: #eee !important;"
        data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000"
        data-fill-color="eeeeee">${loc.locName}</th>
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
        Total Overtime (1.3)
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
      
      
    </tr>
    
  </thead>
  <tbody></tbody>
    </table>
    `;
    }
  });
  $(".mainTable").append(str);
}
function createTable(data, locs) {
  $(".mainTable table tbody").empty();
  locs.forEach((element) => {
    const locid = element.id;
    var table = $(`.mainTable table[table-id='${locid}'] tbody`);
    if (data.hasOwnProperty(locid)) {
      var locData = data[locid];
      Object.keys(locData).forEach((employeeKey) => {
        const mhObject = locData[employeeKey]["mh"];
        const employeeName = locData[employeeKey]["name"];
        var str = "";
        var totreg = 0,
          totot = 0,
          totl = 0,
          totmh = 0,
          totreot = 0,
          rdot = 0,
          rdot_beyond = 0,
          lot = 0,
          lot_beyond = 0,
          spc = 0,
          spc_beyond = 0,
          rdl = 0,
          rdl_beyond = 0,
          rdspc = 0,
          rdspc_beyond = 0;
        if (mhObject.totalReg !== undefined) {
          totreg = mhObject.totalReg;
        }
        if (mhObject.totalOT !== undefined) {
          totot = mhObject.totalOT;
        }
        if (mhObject.totalLeave !== undefined) {
          totl = mhObject.totalLeave;
        }
        if (mhObject.totalMH !== undefined) {
          totmh = mhObject.totalMH;
        }
        if (mhObject.regularOT !== undefined) {
          totreot = mhObject.regularOT;
        }
        if (mhObject.rdOT !== undefined) {
          rdot = mhObject.rdOT;
        }
        if (mhObject.rdOTBeyond !== undefined) {
          rdot_beyond = mhObject.rdOTBeyond;
        }
        if (mhObject.legalOT !== undefined) {
          lot = mhObject.legalOT;
        }
        if (mhObject.legalOTBeyond !== undefined) {
          lot_beyond = mhObject.legalOTBeyond;
        }
        if (mhObject.rdLegal !== undefined) {
          rdl = mhObject.rdLegal;
        }
        if (mhObject.rdLegalBeyond !== undefined) {
          //
          rdl_beyond = mhObject.rdLegalBeyond;
        }
        if (mhObject.spcOT !== undefined) {
          spc = mhObject.spcOT;
        }
        if (mhObject.spcOTBeyond !== undefined) {
          spc_beyond = mhObject.spcOTBeyond;
        }
        if (mhObject.rdSpc !== undefined) {
          rdspc = mhObject.rdSpc;
        }
        if (mhObject.rdSpcBeyond !== undefined) {
          rdspc_beyond = mhObject.rdSpcBeyond;
        }
        str += `<tr>
    <td 
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${employeeKey}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="left"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${employeeName}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${totreg}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${totot}</td>
    <td 
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${totl}</td>

    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${totmh}</td>
    `;
        if (locid == 1) {
          str += `
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${totreot}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${rdot}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${rdot_beyond}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${lot}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${lot_beyond}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${rdl}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${rdl_beyond}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${spc}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${spc_beyond}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${rdspc}</td>
    <td
    data-f-name="Arial"
    data-f-sz="9"
    data-f-bold="true"
    data-a-h="center"
    data-a-v="middle"
    data-b-a-s="thin"
    data-b-a-c="000000">
    ${rdspc_beyond}</td>
    
    </tr>
    `;
        }

        str += `</tr>`;
        table.append(str);
      });
    } else {
      if(locid == 1){
        table.append(`<tr><td colspan='17' data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000">No data found.</td></tr>`);
      }
      else{
        table.append(`<tr><td colspan='7'data-f-name="Arial"
        data-f-sz="9"
        data-f-bold="true"
        data-a-h="center"
        data-a-v="middle"
        data-b-a-s="thin"
        data-b-a-c="000000">No data found.</td></tr>`);
      }
      
    }
  });
  
}
function addTotal(){
  var tblid = $(".mainTable ")
  $('.maintTable table').each(function (index){
    if()
  })
}
function tableToExcel(){
  var month = $("#monthSel").val();
  var co = $("#co option:selected").text();
  TableToExcel.convert(document.getElementById("1"), {
    name: `Accounting Report_${month}_${co}.xlsx`,
    sheet: {
      name: `${month}`
    },
  });
}

// function tableToExcel() {
//   const wb = XLSX.utils.book_new();

//   $('table').each(function (index) {
//     const ws_data = [];
//     $(this).find('tr').each(function () {
//       const row_data = [];
//       $(this).find('th, td').each(function () {
//         const cellValue = $(this).text();
//         const cell = { v: cellValue };

//         // Mapping some styles
//         const cellStyle = {};

//         if ($(this).is('th')) {
//           // Header styles
//           cellStyle.font = { bold: true, color: { rgb: '000000' } };
//           cellStyle.fill = { fgColor: { rgb: 'EEEEEE' } };
//           cellStyle.alignment = { horizontal: 'center', vertical: 'middle' };
//           cellStyle.border = { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } } };
//         } else {
//           // Data cell styles
//           cellStyle.alignment = { horizontal: 'center', vertical: 'middle' };
//           cellStyle.border = { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } } };

//           // Extracting background color
//           const bgColor = $(this).css('background-color');
//           if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
//             cellStyle.fill = { fgColor: { rgb: rgbToHex(bgColor) } };
//           }
//         }

//         if (Object.keys(cellStyle).length > 0) {
//           cell.s = cellStyle;
//         }

//         row_data.push(cell);
//       });
//       ws_data.push(row_data);
//     });

//     const ws = XLSX.utils.aoa_to_sheet(ws_data);
//     XLSX.utils.book_append_sheet(wb, ws, `Sheet${index + 1}`);
//   });

//   XLSX.writeFile(wb, 'exported_tables.xlsx');
// }

// function rgbToHex(rgb) {
//   const hex = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
//   return hex ? '#' +
//     ('0' + parseInt(hex[1], 10).toString(16)).slice(-2) +
//     ('0' + parseInt(hex[2], 10).toString(16)).slice(-2) +
//     ('0' + parseInt(hex[3], 10).toString(16)).slice(-2) : '';
// }


// #endregion
