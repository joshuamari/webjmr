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

// const Leaves = ["25", "26", "27", "28", "29", "30", "31"];
var allEmployees = {};
const sampleData = [
  {
    firstName: "Timothy",
    lastName: "Pogi",
    empId: 511,
    RegularHourEntries: [
      {
        pName: "kdtCablewayBranchSplit",
        dateEntries: [
          { hours: 8, entryDate: "12" },
          { hours: 8, entryDate: "1" },
          { hours: 8, entryDate: "30" },
        ],
        iIndex: "2242",
        pIndex: "90",
      },
      {
        pIndex: "322",
        pName: "kdtKeisoSupport",
        dateEntries: [
          { hours: 8, entryDate: "12" },
          { hours: 8, entryDate: "1" },
          { hours: 8, entryDate: "30" },
        ],
        iIndex: "8018",
      },
    ],
    OTEntries: [
      {
        pName: "kdtCablewayBranchSplit",
        dateEntries: [
          { hours: 1, entryDate: "12" },
          { hours: 2, entryDate: "1" },
          { hours: 2, entryDate: "30" },
        ],
        iIndex: "2242",
        pIndex: "90",
      },
      {
        pIndex: "322",
        pName: "kdtKeisoSupport",
        dateEntries: [
          { hours: 1, entryDate: "12" },
          { hours: 1, entryDate: "1" },
          { hours: 1, entryDate: "30" },
        ],
        iIndex: "8018",
      },
    ],
  },
  {
    firstName: "Edmon",
    lastName: "Pogi",
    empId: 1,
    RegularHourEntries: [
      {
        pName: "kdtCablewayBranchSplit",
        dateEntries: [
          { hours: 8, entryDate: "12" },
          { hours: 8, entryDate: "1" },
          { hours: 8, entryDate: "30" },
          { hours: 8, entryDate: "5" },
          { hours: 8, entryDate: "6" },
          { hours: 8, entryDate: "7" },
        ],
        iIndex: "2242",
        pIndex: "90",
      },
      {
        pIndex: "322",
        pName: "kdtKeisoSupport",
        dateEntries: [
          { hours: 8, entryDate: "12" },
          { hours: 8, entryDate: "1" },
          { hours: 8, entryDate: "30" },
          { hours: 8, entryDate: "8" },
          { hours: 8, entryDate: "9" },
          { hours: 8, entryDate: "10" },
        ],
        iIndex: "8018",
      },
    ],
    OTEntries: [
      {
        pName: "kdtCablewayBranchSplit",
        dateEntries: [
          { hours: 1, entryDate: "12" },
          { hours: 2, entryDate: "8" },
          { hours: 2, entryDate: "27" },
        ],
        iIndex: "2242",
        pIndex: "90",
      },
      {
        pIndex: "322",
        pName: "kdtKeisoSupport",
        dateEntries: [
          { hours: 1, entryDate: "4" },
          { hours: 1, entryDate: "3" },
          { hours: 1, entryDate: "2" },
        ],
        iIndex: "8018",
      },
    ],
  },
];

const Leaves = ["6"];
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
var empArray = [];
var _unifiedQ = [];
var _grpProj = [];
var _grpOT = [];
var _maxDays = 0;
var _emplist = [];
var _empDetails = [];
var _sundays = [];
var _saturdays = [];
//#endregion
checkLogin();
//#region BINDS
$(document).ready(function () {
  $.ajaxSetup({ async: false });
  getGroupList();
  getEmployeeList();
  getLocations();
  $.ajaxSetup({ async: true });

  // createTables($("#monthSel").val());
});

$(document).on("change", "#monthSel", function () {
  // $($('#members-label').nextAll()).remove()
  _selectedMembers = [];
  $.ajaxSetup({ async: false });
  getEmployeeList();
  $.ajaxSetup({ async: true });
  createTables($(this).val());

  $("#selAll").attr("class", "btn btn-primary w-100 mt-4 ");
  $("#selAll").text("Select All");
  $(".memBtn").attr("class", "w-100 btn btn-secondary memBtn");
});
$(document).on("change", "#buSel", function () {
  $.ajaxSetup({ async: false });
  getEmployeeList();
  $.ajaxSetup({ async: true });
  createTables($("#monthSel").val());

  _selectedMembers = [];

  $("#selAll").attr("class", "btn btn-primary w-100 mt-4 ");
  $("#selAll").text("Select All");
  $(".memBtn").attr("class", "w-100 btn btn-secondary memBtn");
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
  _selectedMembers = [];
  $(".memBtn.btn-primary").each(function () {
    _selectedMembers.push($(this).attr("emp-num"));
  });
  createTables($("#monthSel").val());
});

$(document).on("click", ".memBtn", function () {
  $(this).toggleClass("btn-primary btn-secondary");
  _selectedMembers = [];
  $(".memBtn.btn-primary").each(function () {
    _selectedMembers.push($(this).attr("emp-num"));
  });
  var allButtonsSelected =
    $(".memBtn").length === $(".memBtn.btn-primary").length;
  var selAllButton = $("#selAll");
  if (allButtonsSelected) {
    selAllButton.text("Deselect All");
    selAllButton.removeClass("btn-primary");
    selAllButton.addClass("btn-secondary");
  } else {
    selAllButton.text("Select All");
    selAllButton.removeClass("btn-secondary");
    selAllButton.addClass("btn-primary");
  }
  createTables($("#monthSel").val());
});
$(document).on("click", "#btnExport", function () {
  exportTable();
});
$(document).on("click", "#btnPrint", function () {
  printTable();
});
$(document).on("change", "#CO", function () {
  createTables($("#monthSel").val());
});
$(document).on("change", ".checkbox", function () {
  //eto uuncomment tas papalitan id pag may checkbox na
  createTables($("#monthSel").val());
});
$(document).on("click", ".tog", function () {
  $(".left").toggleClass("hide");
});
$(document).on("change", "#locSel", function () {
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
      msAccess();
    },
  });
  $.ajaxSetup({ async: true });
}
function fillEmployeeData(empEntries) {
  _selectedMembers.forEach((memberId) => {
    const employee = _emplist.find((emp) => emp["empNum"] === memberId);
    const empName = employee["empName"].split(", ");

    //Creating new Employee
    if (allEmployees[memberId] === undefined) {
      allEmployees[memberId] = {
        firstName: empName[1],
        lastName: empName[0],
        empId: memberId,
        RegularHourEntries: [],
        OTEntries: [],
        Leaves: [],
      };
    }
  });

  empEntries.forEach((entry) => {
    //Leaves
    console.log(entry);

    if (allEmployees[entry["empNum"]]["Leaves"] === undefined) {
      allEmployees[entry["empNum"]]["Leaves"] = [];
    }

    if (entry["pName"] === "Leave") {
      allEmployees[entry["empNum"]]["Leaves"].push({ ...entry });
    }

    const newEntry = {
      entryDate: parseInt(entry["entryDate"]),
      hours: entry["hours"],
    };
    if (entry["OT"] === true) {
      let isProjectAdded = false;
      allEmployees[entry["empNum"]]["OTEntries"] = allEmployees[
        entry["empNum"]
      ]["OTEntries"].map((otEntry) => {
        if (entry["pName"] === otEntry["pName"]) {
          otEntry = {
            ...otEntry,
            dateEntries: [...otEntry["dateEntries"], newEntry],
          };
          isProjectAdded = true;
        }
        return otEntry;
      });
      if (!isProjectAdded) {
        const newProjectEntry = {
          pName: entry["pName"],
          dateEntries: [newEntry],
          iIndex: entry["iIndex"],
          pIndex: ["pIndex"],
        };
        allEmployees[entry["empNum"]]["OTEntries"].push(newProjectEntry);
      }
    } else if (entry["OT"] === false) {
      let isProjectAdded = false;
      allEmployees[entry["empNum"]]["RegularHourEntries"] = allEmployees[
        entry["empNum"]
      ]["RegularHourEntries"].map((regularEntry) => {
        if (entry["pName"] === regularEntry["pName"]) {
          const newRegEntry = {
            ...regularEntry,
            dateEntries: [...regularEntry["dateEntries"], newEntry],
          };
          isProjectAdded = true;
          return newRegEntry;
        }
        return regularEntry;
      });
      if (!isProjectAdded && entry["pName"] !== "Leave") {
        const newProjectEntry = {
          pName: entry["pName"],
          dateEntries: [newEntry],
          iIndex: entry["iIndex"],
          pIndex: ["pIndex"],
        };
        allEmployees[entry["empNum"]]["RegularHourEntries"].push(
          newProjectEntry
        );
      }
    }
  });
}
function msAccess() {
  $.post(
    "ajax/ms_access.php",
    {
      empNum: _empDetails["empNum"],
    },
    function (data) {
      var access = $.parseJSON(data);
      if (!access) {
        alert("Access denied");
        window.location.href = "../";
      }
    }
  );
}
function getGroupList() {
  $("#buSel").empty();
  $.post(
    "ajax/get_group_list.php",
    {
      empNum: _empDetails["empNum"],
    },
    function (data) {
      var grpList = $.parseJSON(data);
      grpList.forEach((grp) => {
        $("#buSel").append(`<option>${grp}</option>`);
        $("#buSel").val(_empDetails["empGroup"]);
      });
    }
  );
}
function getEmployeeList() {
  var selDate = $("#monthSel").val();
  var grpSel = $("#buSel").val();
  var cutOff = $(`#CO`).val();
  $("#members-list").empty();
  $.post(
    "ajax/get_emplist.php",
    {
      monthSel: selDate,
      groupSel: grpSel,
      getHalfSel: cutOff,
    },
    function (data) {
      _emplist = $.parseJSON(data);
      _emplist.map(fillMembers);
      _selectedMembers = _selectedMembers.filter((item) =>
        _emplist.some((myItem) => myItem.empNum === item)
      );
    }
  );
}
function getLocations() {
  $("#locSel").html(`<option loc-id=0>KDT/WFH</option>`);
  var addString = ``;
  $.ajax({
    url: "ajax/get_locations.php",
    success: function (data) {
      var locs = $.parseJSON(data);
      const locIDs = Object.keys(locs);
      locIDs.forEach((locID) => {
        const locName = locs[locID];
        addString += `<option loc-id=${locID}>${locName}</option>`;
      });
    },
  });
  $("#locSel").append(addString);
}
//#region table creation
function createTables(ymVal) {
  _grpProj = [];
  _grpOT = [];
  allEmployees = {};
  var groupSel = $(`#buSel`).val();
  var halfSel = $(`#CO`).val();
  var getOGP = $(`.checkbox`).is(":checked"); //eto papalitan pag may checkbox na
  var location = $($(`#locSel`).find("option:selected")).attr("loc-id");
  if (_selectedMembers.length < 1) {
    $(".noShow").removeClass("d-none");
    $(".lower .right").addClass("d-none");
    return;
  }
  $(".noShow").addClass("d-none");
  $(".lower .right").removeClass("d-none");
  $("#mainThead,#mainTbody,#subThead,#subTbody").empty();
  $.post(
    "ajax/get_entries.php",
    {
      monthSel: ymVal,
      empArray: _selectedMembers,
      groupSel: groupSel,
      getHalfSel: halfSel,
      getOGP: getOGP,
      location: location,
    },
    function (data) {
      var empEntries = $.parseJSON(data);
      fillEmployeeData(empEntries);
      _maxDays = new Date(
        ymVal.split("-")[0],
        ymVal.split("-")[1],
        0
      ).getDate();

      createHeader();
      generateMainTable(allEmployees);
      generateSubTable(allEmployees);
      colorYellow();
      getTotals();
      // addCells();
      // _unifiedQ = empEntries;
      // _unifiedQ.map(extractData);
      // _selectedMembers.map(getEmpProjects);
      // addGrpData(_grpProj, _grpOT);
      // addCells();
      // //adjustWidth();
      // console.log("unified", _unifiedQ);
      // _unifiedQ.map(fillTable);
      // getTotals();
      // colorYellow();
      colorWeekends(ymVal.split("-")[0], ymVal.split("-")[1]);
    }
  );
  // console.log(_selectedMembers);
}
/**
 *
 * @param {
 * } user :{
 * firstName:string,
 * lastName:string,
 * OTEntries:{
 *
 * }
 * }
 */
function generateRegularHours(regularHours, employeeId = 0) {
  let htmlString = "";
  let totalHourCells = "";
  const totalHours = {};
  const monthTotalHours = {};
  regularHours.forEach((rhEntry) => {
    const dateEntries = rhEntry["dateEntries"].reduce((map, curr) => {
      map[curr["entryDate"]] = curr["hours"];
      if (totalHours[curr["entryDate"]] === undefined) {
        totalHours[curr["entryDate"]] = curr["hours"];
      } else {
        totalHours[curr["entryDate"]] += curr["hours"];
      }
      if (monthTotalHours[rhEntry["pName"]] === undefined) {
        monthTotalHours[rhEntry["pName"]] = curr["hours"];
      } else {
        monthTotalHours[rhEntry["pName"]] += curr["hours"];
      }

      if (monthTotalHours["totalHours"] === undefined) {
        monthTotalHours["totalHours"] = curr["hours"];
      } else {
        monthTotalHours["totalHours"] += curr["hours"];
      }

      return map;
    }, {});
    let regularHourCells = "";

    for (let x = 1; x <= _maxDays; x++) {
      regularHourCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
        dateEntries[x] ? dateEntries[x] : ""
      }</td>`;
    }
    htmlString += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="pRow" employee-number="${employeeId}" p-index="${
      rhEntry["pIndex"]
    }">
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
                    rhEntry["pName"]
                  }</td>
                  ${regularHourCells}
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
                    monthTotalHours[rhEntry["pName"]]
                  }</td>`;
  });

  for (let x = 1; x <= _maxDays; x++) {
    totalHourCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      totalHours[x] ? totalHours[x] : ""
    }</td>`;
  }
  htmlString += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="tTot"employee-number="${employeeId}" >
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Total Hours</td>
  ${totalHourCells}
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
    monthTotalHours["totalHours"] ? monthTotalHours["totalHours"] : "0"
  }</td>

  </tr>
  </tr>`;
  return htmlString;
}
function generateOtHours(OtHours, employeeId = 0) {
  const monthTotalHours = {};
  const totalOtHours = {};
  let totalOtCells = "";
  let addHtml = "";
  OtHours.forEach((otEntry) => {
    otEntry["dateEntries"].forEach((entry) => {
      if (totalOtHours[entry["entryDate"]] === undefined) {
        totalOtHours[entry["entryDate"]] = entry["hours"];
      } else {
        totalOtHours[entry["entryDate"]] += entry["hours"];
      }
      if (monthTotalHours["totalOtHours"] === undefined) {
        monthTotalHours["totalOtHours"] = entry["hours"];
      } else {
        monthTotalHours["totalOtHours"] += entry["hours"];
      }
    });
  });
  for (let x = 1; x <= _maxDays; x++) {
    totalOtCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      totalOtHours[x] ? totalOtHours[x] : ""
    }</td>`;
  }
  addHtml += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="oTot"employee-number="${employeeId}" >
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Overtime</td>
  ${totalOtCells}
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
    monthTotalHours["totalOtHours"] ? monthTotalHours["totalOtHours"] : "0"
  }</td>

  </tr>
  </tr>`;

  OtHours.forEach((otEntry) => {
    //Setup data
    const otDateEntries = otEntry["dateEntries"].reduce((map, curr) => {
      map[curr["entryDate"]] = curr["hours"];

      if (totalOtHours[curr["entryDate"]] === undefined) {
        totalOtHours[curr["entryDate"]] = curr["hours"];
      } else {
        totalOtHours[curr["entryDate"]] += curr["hours"];
      }
      if (monthTotalHours["ot-" + otEntry["pName"]] === undefined) {
        monthTotalHours["ot-" + otEntry["pName"]] = curr["hours"];
      } else {
        monthTotalHours["ot-" + otEntry["pName"]] += curr["hours"];
      }
      return map;
    }, {});

    //Render UI
    let otHoursCells = "";
    for (let x = 1; x <= _maxDays; x++) {
      otHoursCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
        otDateEntries[x] ? otDateEntries[x] : ""
      }</td>`;
    }

    addHtml += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="pRow" employee-number="${employeeId}" p-index="${
      otEntry["pIndex"]
    }">
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
                    "OT-" + otEntry["pName"]
                  }</td>
                  ${otHoursCells}
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
                    monthTotalHours["ot-" + otEntry["pName"]]
                      ? monthTotalHours["ot-" + otEntry["pName"]]
                      : "0"
                  }</td>
                  `;
  });
  return addHtml;
}
function generateLeaves(leaves, employeeId = 0) {
  let vlCells;
  let slCells;
  let otherLeaveCells;
  let totalLeaveCells;
  const leavesMap = {};
  monthTotalHours = {};
  let addHtml = "";
  //Setup data
  leaves.forEach((leaveEntry) => {
    if (leaveEntry["iIndex"] === "25") {
      leavesMap[`vl-${leaveEntry["entryDate"]}`] = leaveEntry["hours"];
      if (monthTotalHours["totalVl"] === undefined) {
        monthTotalHours["totalVl"] = leaveEntry["hours"];
      } else {
        monthTotalHours["totalVl"] += leaveEntry["hours"];
      }
    } else if (leaveEntry["iIndex"] === "26") {
      leavesMap[`sl-${leaveEntry["entryDate"]}`] = leaveEntry["hours"];
      if (monthTotalHours["totalSl"] === undefined) {
        monthTotalHours["totalSl"] = leaveEntry["hours"];
      } else {
        monthTotalHours["totalSl"] += leaveEntry["hours"];
      }
    } else {
      leavesMap[`other-${leaveEntry["entryDate"]}`] = leaveEntry["hours"];
      if (monthTotalHours["totalOtherLeave"] === undefined) {
        monthTotalHours["totalOtherLeave"] = leaveEntry["hours"];
      } else {
        monthTotalHours["totalOtherLeave"] += leaveEntry["hours"];
      }
    }
    if (leavesMap[`total-${leaveEntry["entryDate"]}`] === undefined) {
      leavesMap[`total-${leaveEntry["entryDate"]}`] = leaveEntry["hours"];
    } else {
      leavesMap[`total-${leaveEntry["entryDate"]}`] += leaveEntry["hours"];
    }
    if (monthTotalHours["totalLeave"] === undefined) {
      monthTotalHours["totalLeave"] = leaveEntry["hours"];
    } else {
      monthTotalHours["totalLeave"] += leaveEntry["hours"];
    }
  });

  //Render UI
  for (let x = 1; x <= _maxDays; x++) {
    vlCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      leavesMap[`vl-${x}`] ? leavesMap[`vl-${x}`] : ""
    }</td>`;
    otherLeaveCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      leavesMap[`sl-${x}`] ? leavesMap[`sl-${x}`] : ""
    }</td>`;
    slCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      leavesMap[`other-${x}`] ? leavesMap[`other-${x}`] : ""
    }</td>`;
    totalLeaveCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      leavesMap[`total-${x}`] ? leavesMap[`total-${x}`] : ""
    }</td>`;
  }
  addHtml += `
  <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="glRow" i-index="25">
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">VL</td>
    ${vlCells}
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"> ${
      monthTotalHours["totalVl"] ? monthTotalHours["totalVl"] : "0"
    }</td>
  </tr>
  <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="glRow" i-index="26">
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;
    </td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">SL</td>
    ${slCells}
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"> ${
      monthTotalHours["totalSl"] ? monthTotalHours["totalSl"] : "0"
    }</td>

  </tr>
  <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="glRow" p-index="others">
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">EL,PL,ML,Others</td>
    ${otherLeaveCells}
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"> ${
      monthTotalHours["totalOtherLeave"]
        ? monthTotalHours["totalOtherLeave"]
        : "0"
    }</td>

    </tr>

  <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="glTot" >
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Leave</td>
    ${totalLeaveCells}
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"> ${
      monthTotalHours["totalLeave"] ? monthTotalHours["totalLeave"] : "0"
    }</td>
  </tr>
  `;
  return addHtml;
}
function generateMainTable(allEmployees) {
  Object.values(allEmployees).forEach((user) => {
    createMemberHours(user);
  });
}
function generateSubTable(allUsers) {
  let addHtml = "";

  const data = Object.values(allUsers).reduce(
    (prev, curr) => {
      return {
        Leaves: [...prev["Leaves"], ...curr["Leaves"]],
        OTEntries: [...prev["OTEntries"], ...curr["OTEntries"]],
        RegularHourEntries: [
          ...prev["RegularHourEntries"],
          ...curr["RegularHourEntries"],
        ],
      };
    },
    {
      Leaves: [],
      OTEntries: [],
      RegularHourEntries: [],
    }
  );
  addHtml += generateRegularHours(data["RegularHourEntries"]);
  addHtml += generateOtHours(data["OTEntries"]);
  addHtml += generateLeaves(data["Leaves"]);

  $("#subTbody").append(addHtml);
}
function createMemberHours(user) {
  let addHtml = "";
  /**totalHours
   * {
   *  [date]:totalHoursForThatDate
   * }
   */

  addHtml += generateRegularHours(user["RegularHourEntries"], user["empId"]);
  //End Regular Hour Section
  //OT Section
  addHtml += generateOtHours(user["OTEntries"], user["empId"]);
  //End Ot Section
  addHtml += generateLeaves(user["Leaves"], user["empId"]);
  //Start Leave Section

  $("#mainTbody")
    .append(`<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="emprow" employee-number="${
    user["empId"]
  }">
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
    user["lastName"]
  }, ${user["firstName"]}</td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Project and Job Name</td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" colspan="${
    _maxDays + 1
  }"></td>
  </tr>
  ${addHtml}`);
}

function createHeader() {
  var addDates = "";
  for (let x = 1; x <= _maxDays; x++) {
    addDates += `<th data-fill-color="00ffff" data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${x
      .toString()
      .padStart(2, "0")}</th>`;
  }
  addDates += `<th data-fill-color="00ffff" data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">TOTAL</th>`;
  $("#mainThead").html(`
    <th data-fill-color="00ffff"  data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Members</th>
    <th data-fill-color="00ffff"  data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Project</th>
    ${addDates}
    `);
  $("#subThead").html(`
    <th data-f-bold="true" data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" id="grpTotTitle">&nbsp;</th>
    <th data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Project</th>
    ${addDates}
    `);
}

function adjustWidth() {
  var memh = $("#mainTable th:first-child").outerWidth();
  var projh = $("#mainTable th:nth-child(2)").outerWidth();
  $("#subTable th:first-child").css("min-width", memh);
  $("#subTable th:nth-child(2)").css("min-width", projh);
}

function extractData(entry) {
  if (!Leaves.includes(entry["pIndex"])) {
    if (entry["OT"]) {
      _grpOT.push({
        pIndex: entry["pIndex"],
        pName: entry["pName"],
      });
      _grpOT = [...new Map(_grpOT.map((x) => [x["pIndex"], x])).values()];
    }
    _grpProj.push({
      pIndex: entry["pIndex"],
      pName: entry["pName"],
    });
    _grpProj = [...new Map(_grpProj.map((x) => [x["pIndex"], x])).values()];
  }
}

function getEmpProjects(empDetails) {
  var uniqueProjects = pGet(empDetails, false);
  var uniqueOT = pGet(empDetails, true);
  var addHtml = "";

  //Regular Projects
  uniqueProjects.forEach((element) => {
    addHtml += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="pRow" employee-number="${empDetails}" p-index="${element["pIndex"]}">
      <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
      <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${element["pName"]}</td>
      </tr>`;
  });

  //Total Hours
  addHtml += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="tTot"employee-number="${empDetails}" >
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Total Hours</td>
    </tr>
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="oTot"employee-number="${empDetails}" >
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Overtime</td>
    </tr>`;

  //OT Projects
  uniqueOT.forEach((element) => {
    addHtml += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="oRow" employee-number="${empDetails}" p-index="${element["pIndex"]}">
      <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
      <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">OT - ${element["pName"]}</td>
      </tr>`;
  });

  //Leaves
  addHtml += `
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="lRow" i-index="25" employee-number="${empDetails}"><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">VL</td></tr>
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="lRow" i-index="26" employee-number="${empDetails}"><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">SL</td></tr>
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="lRow" p-index="others" employee-number="${empDetails}"><td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">EL,PL,ML,Others</td></tr>
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="lTot" employee-number="${empDetails}"><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Leave</td></tr>
    `;

  var empName = _emplist.find((employee) => employee.empNum == empDetails)[
    "empName"
  ];
  // console.log(empDetails)
  $("#mainTbody")
    .append(`<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="emprow" employee-number="${empDetails}">
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${empName}</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Project and Job Name</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" colspan="${
      _maxDays + 1
    }"></td>
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
        // if (!element["OT"]) {
        returnObject.push(element);
        // }
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
    addHtml += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="gpRow" p-index="${element["pIndex"]}">
      <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td>
      <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${element["pName"]}</td>
      </tr>`;
  });

  addHtml += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="gtTot">
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Total Hours</td>
    </tr>
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="goTot">
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Overtime</td>
    </tr>`;

  ot.forEach((element) => {
    addHtml += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="goRow" p-index="${element["pIndex"]}">
      <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td>
      <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">OT - ${element["pName"]}</td>
      </tr>`;
  });

  addHtml += `
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="glRow" i-index="25"><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">VL</td></tr>
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="glRow" i-index="26"><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">SL</td></tr>
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="glRow" p-index="others"><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">EL,PL,ML,Others</td></tr>
    <tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="glTot" ><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">&nbsp;</td><td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Leave</td></tr>
    `;

  $("#subTbody").append(addHtml);
}

function addCells() {
  var addHtml = "";
  for (let x = 1; x <= _maxDays; x++) {
    addHtml += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}"></td>`;
  }
  addHtml += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="tCell"></td>`;
  $(
    ".pRow,.oRow,.tRow,.lRow,.lTot,.tTot,.lTot,.oTot,.gpRow,.goRow,.goTot,.gtTot,.glRow,.glTot"
  ).append(addHtml);
}
//#endregion

//#region latag

function fillTable(entry) {
  //ETOBAGUHIN MO NEXT WEEK
  var currentHours = 0;
  if (!Leaves.includes(entry["pIndex"])) {
    currentHours =
      parseFloat(
        $(
          $(
            `.pRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`
          ).children()[parseInt(entry["entryDate"]) + 1]
        ).text()
      ) || 0;
    currentHours += parseFloat(entry["hours"]);
    $(
      $(
        `.pRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`
      ).children()[parseInt(entry["entryDate"]) + 1]
    ).text(`${currentHours}`);
    if (entry["OT"]) {
      $(
        $(
          `.oRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`
        ).children()[parseInt(entry["entryDate"]) + 1]
      ).text(entry["hours"]);
    }
  } else {
    if (oLeaves.hasOwnProperty(entry["iIndex"])) {
      //EL PL
      $(
        $(
          `.lRow[p-index="others"][employee-number="${entry["empNum"]}"]`
        ).children()[parseInt(entry["entryDate"]) + 1]
      ).text(1233);
    }
    // iIndex === 25 = VL
    // iIndex === 26 = SL
    $(
      $(
        `.lRow[i-index="${entry["iIndex"]}"][employee-number="${entry["empNum"]}"]`
      ).children()[parseInt(entry["entryDate"]) + 1]
    ).text(entry["hours"]);
  }
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
      // $($(this).children()[x]).attr('data-fill-color','FFFF00');
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
      // totaltime += parseFloat( //ETO BAGUHIN MO NEXT WEEK
      //   $(
      //     $(
      //       `.oTot[employee-number="${$(this).attr("employee-number")}"]`
      //     ).children()[x]
      //   ).text() == ""
      //     ? 0
      //     : $(
      //         $(
      //           `.oTot[employee-number="${$(this).attr("employee-number")}"]`
      //         ).children()[x]
      //       ).text()
      // );
      $($(this).children()[x]).text(totaltime == 0 ? "" : totaltime);
      // $($(this).children()[x]).attr('data-fill-color','FFFF00');
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
      // $($(this).children()[x]).attr('data-fill-color','FFFF00');
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
    var getlRows = ``;
    if ($(this).attr("i-index")) {
      getlRows = $(`.lRow[i-index="${$(this).attr("i-index")}"]`);
    } else {
      getlRows = $(`.lRow[p-index="${$(this).attr("p-index")}"]`);
    }
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
      // totaltime += parseFloat( //ETO BAGUHIN MO NEXT WEEK
      //   $($(`.goTot`).children()[x]).text() == ""
      //     ? 0
      //     : $($(`.goTot`).children()[x]).text()
      // );
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
function colorYellow() {
  var myClass = [
    `tTot`,
    `oTot`,
    `lRow`,
    `lTot`,
    `gtTot`,
    `goTot`,
    `glRow`,
    `glTot`,
  ];
  myClass.forEach((element) => {
    $(`.${element}`).each(function () {
      for (let x = 1; x < $(this).children().length; x++) {
        $($(this).children()[x])
          .attr("data-fill-color", "FFFF00")
          .css("background-color", "#FFFF00");
      }
    });
  });
}

function colorWeekends(year, month) {
  _sundays = getSundays(year, month);
  _saturdays = getSaturdays(year, month);
  for (let x = 2; x < $(`#mainThead`).children().length; x++) {
    if (_sundays.includes(x - 1)) {
      $($(`#mainThead`).children()[x]).attr("data-fill-color", "00ff00");
    }
    if (_saturdays.includes(x - 1)) {
      $($(`#mainThead`).children()[x]).attr("data-fill-color", "ccff99");
    }
  }
  var mySelectors = [
    `#mainThead`,
    `#subThead`,
    `.pRow`,
    `.gpRow`,
    `.oRow`,
    `.goRow`,
    `.tTot`,
    `.oTot`,
    `.lRow`,
    `.lTot`,
    `.gtTot`,
    `.goTot`,
    `.glRow`,
    `.glTot`,
  ];
  mySelectors.forEach((element) => {
    $(`${element}`).each(function () {
      for (let x = 2; x < $(this).children().length; x++) {
        if (_sundays.includes(x - 1)) {
          $($(this).children()[x])
            .attr("data-fill-color", "00ff00")
            .css("background-color", "#00ff00");
        }
        if (_saturdays.includes(x - 1)) {
          $($(this).children()[x])
            .attr("data-fill-color", "ccff99")
            .css("background-color", "#ccff99");
        }
      }
    });
  });
}
function getSundays(year, month) {
  var firstDayOfMonth = new Date(year, month - 1, 1);
  var lastDayOfMonth = new Date(year, month, 0);
  var sundays = [];

  for (
    let day = firstDayOfMonth.getDate();
    day <= lastDayOfMonth.getDate();
    day++
  ) {
    var currentDate = new Date(year, month - 1, day);
    var dayOfWeek = currentDate.getDay(); // Sunday (0) to Saturday (6)

    if (dayOfWeek === 0) {
      sundays.push(day);
    }
  }
  return sundays;
}
function getSaturdays(year, month) {
  var firstDayOfMonth = new Date(year, month - 1, 1);
  var lastDayOfMonth = new Date(year, month, 0);
  var saturdays = [];

  for (
    let day = firstDayOfMonth.getDate();
    day <= lastDayOfMonth.getDate();
    day++
  ) {
    var currentDate = new Date(year, month - 1, day);
    var dayOfWeek = currentDate.getDay(); // Sunday (0) to Saturday (6)

    if (dayOfWeek === 6) {
      saturdays.push(day);
    }
  }

  return saturdays;
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

//#region Export
function printTable() {
  $(".xPrint").toggle();
  $(".lower").toggleClass("lower lower_");
  print();
  $(".lower_").toggleClass("lower lower_");
  $(".xPrint").toggle();
}

function exportTable() {
  var locVal = $($(`#locSel`).find("option:selected")).text();
  var colsP = _maxDays + 3;
  $("#mainTable").append(
    `<tr id='fromHereAdd' class='w3-gray'><td colspan="${colsP}" data-fill-color="808080" data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td></tr>`,
    $("#subTable").html()
  );
  $(`#grpTotTitle`).text(`GROUP's TOTAL`);

  var cOff;
  // $("#mainTable").removeClass("ayos");
  switch ($("#CO").val()) {
    case "1":
      cOff = "First Half";
      break;
    case "3":
      cOff = "Monthly";
      break;
  }
  TableToExcel.convert(document.getElementById("mainTable"), {
    name: `MonthlyStandard_${$("#buSel").val()}_${$(
      "#monthSel"
    ).val()}_${locVal}.xlsx`,
    sheet: {
      name: `${$("#buSel").val()}_${$("#monthSel").val()}`,
    },
  });
  $($("#fromHereAdd").nextAll()).remove();
  $("#fromHereAdd").remove();
  $(`#grpTotTitle`).text(``);
  // $(".fx").remove();
  // $("#mainTable").addClass("ayos");
}
//#endregion
//#endregion
