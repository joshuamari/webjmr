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

const Leaves = ["25", "26", "27", "28", "29", "30", "31"];
const oLeaves = { 27: "EL", 28: "ML", 29: "PL", 30: "TbL", 31: "LL" };
const today = new Date();
$("#monthSel").val(
  `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}`
);

//pang distinct. di ko alam kung may function ba na distinct hehe
const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

// const members = [
//   { empNum: "464", empName: "Coquia, Joshua Mari" },
//   { empNum: "465", empName: "Petate, Felix Edwin" },
//   { empNum: "487", empName: "Medrano, Collene Keith" }
// ];

var _selectedMembers = [];

var _unifiedQ = [];
var _grpProj = [];
var _grpOT = [];
var _maxDays = 0;
var _emplist = [];
var _empDetails = [];
//#endregion
checkLogin();
//#region BINDS
$(document).ready(function () {
  $.ajaxSetup({ async: false });
  getGroupList();
  getEmployeeList();

  $.ajaxSetup({ async: true });

  createTables($("#monthSel").val());
});

$(document).on("change", "#monthSel", function () {
  // $($('#members-label').nextAll()).remove()
  $.ajaxSetup({ async: false });
  getEmployeeList();
  $.ajaxSetup({ async: true });
  createTables($(this).val());
});
$(document).on("change", "#buSel", function () {
  $.ajaxSetup({ async: false });
  getEmployeeList();
  $.ajaxSetup({ async: true });
  createTables($("#monthSel").val());
});

$(document).on("click", "#selAll", function () {
  $(this).toggleClass("btn-primary btn-secondary");
  if ($(this).attr("class").includes("btn-primary")) {
    $(this).text("Select All");
    $(".memBtn").attr("class", "w-100 btn btn-secondary memBtn");
  } else {
    $(this).text("Deselect All");
    $(".memBtn").attr("class", "w-100 btn btn-primary memBtn");
  }
  _selectedMembers.length = 0;
  $(".memBtn.btn-primary").each(function () {
    _selectedMembers.push($(this).attr("emp-num"));
  });
  createTables($("#monthSel").val());
});

$(document).on("click", ".memBtn", function () {
  $(this).toggleClass("btn-primary btn-secondary");
  _selectedMembers.length = 0;
  $(".memBtn.btn-primary").each(function () {
    _selectedMembers.push($(this).attr("emp-num"));
  });
  createTables($("#monthSel").val());
});
//#endregion

//#region FUNCTIONS
function checkLogin() {
  $.ajaxSetup({ async: false });
  $.ajax({
    url: "Includes/check_login.php",
    success: function (data) {
      //ajax to check if user is logged in
      _empDetails = $.parseJSON(data);

      if (Object.keys(_empDetails).length < 1) {
        window.location.href = rootFolder + "/KDTPortalLogin"; //if result is 0, redirect to log in page
      }
    },
  });
  $.ajaxSetup({ async: true });
}
function getGroupList() {
  $("#buSel").empty();
  $.ajax({
    url: "ajax/get_group_list.php",
    success: function (response) {
      var grpList = $.parseJSON(response);
      grpList.forEach((grp) => {
        $("#buSel").append(`<option>${grp}</option>`);
        $("#buSel").val(_empDetails["empGroup"]);
      });
    },
  });
}
function getEmployeeList() {
  var selDate = $("#monthSel").val();
  var grpSel = $("#buSel").val();
  // $($("#members-label").nextAll()).remove();
  $("#members-list").empty();
  $.post(
    "ajax/get_emplist.php",
    {
      monthSel: selDate,
      groupSel: grpSel,
    },
    function (data) {
      _emplist = $.parseJSON(data);
      console.log(_emplist);
      // members = emplist;
      _emplist.map(fillMembers);
      _selectedMembers = _selectedMembers.filter((item) =>
        _emplist.some((myItem) => myItem.empNum === item)
      );
    }
  );
}
//#region table creation
function createTables(ymVal) {
  $("#mainThead,#mainTbody,#subThead,#subTbody").empty();
  $.post(
    "ajax/get_entries.php",
    {
      monthSel: ymVal,
      empArray: _selectedMembers,
    },
    function (data) {
      var empEntries = $.parseJSON(data);
      _maxDays = new Date(
        ymVal.split("-")[0],
        ymVal.split("-")[1],
        0
      ).getDate();
      createHeader();
      _unifiedQ = empEntries;
      _unifiedQ.map(extractData);
      _selectedMembers.map(getEmpProjects);
      addGrpData(_grpProj, _grpOT);
      addCells();
      adjustWidth();
      _unifiedQ.map(fillTable);
      getTotals();
    }
  );
  console.log(_selectedMembers);
}

function createHeader() {
  var addDates = "";
  for (let x = 1; x <= _maxDays; x++) {
    addDates += `<th>${x.toString().padStart(2, "0")}</th>`;
  }
  addDates += "<th>TOTAL</th>";
  $("#mainThead").html(`
    <th width="15%">Employee Name</th>
    <th width="15%">Project</th>
    ${addDates}
    `);
  $("#subThead").html(`
    <th></th>
    <th>Project</th>
    ${addDates}
    `);
}

function adjustWidth() {
  $($("#subThead").children()[0]).attr(
    "width",
    $($("#mainThead").children()[0]).outerWidth()
  );
  $($("#subThead").children()[1]).attr(
    "width",
    $($("#mainThead").children()[1]).outerWidth()
  );
  $("#lowerT").css("width", $("#upperT").outerWidth());
}

function extractData(entry) {
  if (!Leaves.includes(entry["pIndex"])) {
    if (entry["OT"]) {
      _grpOT.push({
        pIndex: entry["pIndex"],
        pName: entry["pName"],
      });
      _grpOT = [...new Map(_grpOT.map((x) => [x["pIndex"], x])).values()];
    } else {
      _grpProj.push({
        pIndex: entry["pIndex"],
        pName: entry["pName"],
      });
      _grpProj = [...new Map(_grpProj.map((x) => [x["pIndex"], x])).values()];
    }
  }
}

function getEmpProjects(empDetails) {
  var uniqueProjects = pGet(empDetails, false);
  var uniqueOT = pGet(empDetails, true);
  var addHtml = "";

  //Regular Projects
  uniqueProjects.forEach((element) => {
    addHtml += `<tr class="pRow" employee-number="${empDetails}" p-index="${element["pIndex"]}">
      <td></td>
      <td>${element["pName"]}</td>
      </tr>`;
  });

  //Total Hours
  addHtml += `<tr class="tTot"employee-number="${empDetails}" >
    <td></td>
    <td>Total Hours</td>
    </tr>
    <tr class="oTot"employee-number="${empDetails}" >
    <td></td>
    <td>Overtime</td>
    </tr>`;

  //OT Projects
  uniqueOT.forEach((element) => {
    addHtml += `<tr class="oRow" employee-number="${empDetails}" p-index="${element["pIndex"]}">
      <td></td>
      <td>OT - ${element["pName"]}</td>
      </tr>`;
  });

  //Leaves
  addHtml += `
    <tr class="lRow" p-index="25" employee-number="${empDetails}"><td></td><td>VL</td></tr>
    <tr class="lRow" p-index="26" employee-number="${empDetails}"><td></td><td>SL</td></tr>
    <tr class="lRow" p-index="others" employee-number="${empDetails}"><td></td><td>EL,PL,ML,Others</td></tr>
    <tr class="lTot" employee-number="${empDetails}"><td></td><td>Leave</td></tr>
    `;

  var empName = _emplist.find((employee) => employee.empNum == empDetails)[
    "empName"
  ];
  // console.log(empDetails)
  $("#mainTbody").append(`<tr class="emprow" employee-number="${empDetails}">
    <td>${empName}</td>
    <td>Project and Job Name</td>
    <td colspan="${_maxDays + 1}"></td>
    </tr>
    ${addHtml}`);
}

function pGet(empNum, ifOT) {
  var returnObject = [];
  if (ifOT) {
    //is OT
    _unifiedQ.forEach((element) => {
      if (element["empNum"] == empNum && !Leaves.includes(element["pIndex"])) {
        if (element["OT"]) {
          returnObject.push(element);
        }
      }
    });
  } else {
    //regular hours
    _unifiedQ.forEach((element) => {
      if (element["empNum"] == empNum && !Leaves.includes(element["pIndex"])) {
        if (!element["OT"]) {
          returnObject.push(element);
        }
      }
    });
  }
  returnObject = [
    ...new Map(returnObject.map((x) => [x["pIndex"], x])).values(),
  ];
  return returnObject;
}

function addGrpData(regular, ot) {
  var addHtml = "";
  regular.forEach((element) => {
    addHtml += `<tr class="gpRow" p-index="${element["pIndex"]}">
      <td></td>
      <td>${element["pName"]}</td>
      </tr>`;
  });

  addHtml += `<tr class="gtTot">
    <td></td>
    <td>Total Hours</td>
    </tr>
    <tr class="goTot">
    <td></td>
    <td>Overtime</td>
    </tr>`;

  ot.forEach((element) => {
    addHtml += `<tr class="goRow" p-index="${element["pIndex"]}">
      <td></td>
      <td>OT - ${element["pName"]}</td>
      </tr>`;
  });

  addHtml += `
    <tr class="glRow" p-index="25"><td></td><td>VL</td></tr>
    <tr class="glRow" p-index="26"><td></td><td>SL</td></tr>
    <tr class="glRow" p-index="others"><td></td><td>EL,PL,ML,Others</td></tr>
    <tr class="glTot" ><td></td><td>Leave</td></tr>
    `;

  $("#subTbody").append(addHtml);
}

function addCells() {
  var addHtml = "";
  for (let x = 1; x <= _maxDays; x++) {
    addHtml += `<td dayVal="${x}"></td>`;
  }
  addHtml += `<td class="tCell"></td>`;
  $(
    ".pRow,.oRow,.tRow,.lRow,.lTot,.tTot,.lTot,.oTot,.gpRow,.goRow,.goTot,.gtTot,.glRow,.glTot"
  ).append(addHtml);
}
//#endregion

//#region latag

function fillTable(entry) {
  if (!Leaves.includes(entry["pIndex"])) {
    $(
      $(
        `.${ifOT(entry["OT"])}Row[p-index="${
          entry["pIndex"]
        }"][employee-number="${entry["empNum"]}"]`
      ).children()[parseInt(entry["entryDate"]) + 1]
    ).text(entry["hours"]);
  } else {
    if (oLeaves.hasOwnProperty(entry["pIndex"])) {
      $(
        $(
          `.lRow[p-index="others"][employee-number="${entry["empNum"]}"]`
        ).children()[parseInt(entry["entryDate"]) + 1]
      ).text(entry["hours"]);
    }
    $(
      $(
        `.lRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`
      ).children()[parseInt(entry["entryDate"]) + 1]
    ).text(entry["hours"]);
  }
}

function ifOT(otStatus) {
  if (otStatus) {
    return "o";
  }
  return "p";
}

//totals
function getTotals() {
  //  OT > Reg + OT > Leave

  // OT
  $(".oTot").each(function () {
    var getEmpOts = $(
      `.oRow[employee-number="${$(this).attr("employee-number")}"]`
    );
    for (let x = 2; x < $(this).children().length - 1; x++) {
      var totalOT = 0;
      $(getEmpOts).each(function () {
        totalOT += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      $($(this).children()[x]).text(totalOT == 0 ? "" : totalOT);
    }
  });

  // Reg + OT
  $(".tTot").each(function () {
    var getEmpTots = $(
      `.pRow[employee-number="${$(this).attr("employee-number")}"]`
    );
    for (let x = 2; x < $(this).children().length - 1; x++) {
      var totaltime = 0;
      $(getEmpTots).each(function () {
        totaltime += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      totaltime += parseFloat(
        $(
          $(
            `.oTot[employee-number="${$(this).attr("employee-number")}"]`
          ).children()[x]
        ).text() == ""
          ? 0
          : $(
              $(
                `.oTot[employee-number="${$(this).attr("employee-number")}"]`
              ).children()[x]
            ).text()
      );
      $($(this).children()[x]).text(totaltime == 0 ? "" : totaltime);
    }
  });

  // Leaves
  $(".lTot").each(function () {
    var getEmpLeaves = $(
      `.lRow[employee-number="${$(this).attr("employee-number")}"]`
    );
    for (let x = 2; x < $(this).children().length - 1; x++) {
      var totalLeaves = 0;
      $(getEmpLeaves).each(function () {
        totalLeaves += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      $($(this).children()[x]).text(totalLeaves == 0 ? "" : totalLeaves);
    }
  });

  //fill sub table
  $(".gpRow").each(function () {
    var getpRows = $(`.pRow[p-index="${$(this).attr("p-index")}"]`);

    for (let x = 2; x < $(this).children().length - 1; x++) {
      var gpTotal = 0;
      $(getpRows).each(function () {
        gpTotal += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      $($(this).children()[x]).text(gpTotal == 0 ? "" : gpTotal);
    }
  });

  $(".goRow").each(function () {
    var getoRows = $(`.oRow[p-index="${$(this).attr("p-index")}"]`);

    for (let x = 2; x < $(this).children().length - 1; x++) {
      var goTotal = 0;
      $(getoRows).each(function () {
        goTotal += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      $($(this).children()[x]).text(goTotal == 0 ? "" : goTotal);
    }
  });

  $(".glRow").each(function () {
    var getlRows = $(`.lRow[p-index="${$(this).attr("p-index")}"]`);

    for (let x = 2; x < $(this).children().length - 1; x++) {
      var glTotal = 0;
      $(getlRows).each(function () {
        glTotal += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      $($(this).children()[x]).text(glTotal == 0 ? "" : glTotal);
    }
  });

  // gOT
  $(".goTot").each(function () {
    var getGrpOts = $(`.goRow`);
    for (let x = 2; x < $(this).children().length - 1; x++) {
      var totalOT = 0;
      $(getGrpOts).each(function () {
        totalOT += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      $($(this).children()[x]).text(totalOT == 0 ? "" : totalOT);
    }
  });

  // gReg + OT
  $(".gtTot").each(function () {
    var getGrpTots = $(`.gpRow`);
    for (let x = 2; x < $(this).children().length - 1; x++) {
      var totaltime = 0;
      $(getGrpTots).each(function () {
        totaltime += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      totaltime += parseFloat(
        $($(`.goTot`).children()[x]).text() == ""
          ? 0
          : $($(`.goTot`).children()[x]).text()
      );
      $($(this).children()[x]).text(totaltime == 0 ? "" : totaltime);
    }
  });

  // gLeaves
  $(".glTot").each(function () {
    var getGrpLeaves = $(`.glRow`);
    for (let x = 2; x < $(this).children().length - 1; x++) {
      var totalLeaves = 0;
      $(getGrpLeaves).each(function () {
        totalLeaves += parseFloat(
          $($(this).children()[x]).text() == ""
            ? 0
            : $($(this).children()[x]).text()
        );
      });
      $($(this).children()[x]).text(totalLeaves == 0 ? "" : totalLeaves);
    }
  });

  // right Totals
  $(".tCell").each(function () {
    var getLeft = $(this).prevAll();
    var rightTot = 0;
    for (let x = 0; x < _maxDays; x++) {
      rightTot += parseFloat(
        $(getLeft[x]).text() == "" ? 0 : $(getLeft[x]).text()
      );
    }
    $(this).text(rightTot);
  });
}

//#endregion

//#region basa ng members

function fillMembers(memDetails) {
  var selectType = `secondary`;
  if (_selectedMembers.includes(memDetails.empNum)) {
    selectType = `primary`;
  }
  $("#members-list").append(`
  <div class=" mt-3">
      <button emp-num="${memDetails.empNum}" class="btn btn-${selectType} w-100 memBtn">${memDetails.empName}</button>
  </div>`);
}

//#endregion

//#endregion
