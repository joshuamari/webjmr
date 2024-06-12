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
var amsData = {};
//#endregion
checkLogin()
  .then((emp) => {
    if (emp) {
      _empDetails = emp;
      msAccess();
      $(document).ready(function () {
        Promise.all([getGroupList(), getLocations()]).then(([grps, locs]) => {
          fillGroups(grps);
          getEmployeeList().then((emplist) => {
            if (emplist) {
              emplist.map(fillMembers);
            }
          });
          if (locs) {
            fillLocations(locs);
          }
        });
      });
    } else {
      window.location.href = rootFolder + "/KDTPortalLogin"; //if result is 0, redirect to log in page
    }
  })
  .catch((error) => {
    alert(`${error}`);
  });
//#region BINDS

$(document).on("change", "#monthSel", function () {
  // $($('#members-label').nextAll()).remove()
  _selectedMembers = [];
  hideTable();
  getEmployeeList().then((emps) => {
    if (emps) {
      emps.map(fillMembers);
    }
  });

  $("#selAll").attr("class", "btn btn-primary w-100 mt-4 ");
  $("#selAll").text("Select All");
  $(".memBtn").attr("class", "w-100 btn btn-secondary memBtn");
});
$(document).on("change", "#buSel", function () {
  // $.ajaxSetup({ async: false });
  // getEmployeeList();
  // $.ajaxSetup({ async: true });
  // createTables($("#monthSel").val());
  getEmployeeList().then((emps) => {
    if (emps) {
      emps.map(fillMembers);
    }
  });
  _selectedMembers = [];
  hideTable();
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
  createTables($("#monthSel").val(), true);
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
  // $.ajaxSetup({ async: false });
  // $.ajax({
  //   url: "Includes/check_login.php",
  //   success: function (data) {
  //     //ajax to check if user is logged in
  //     _empDetails = $.parseJSON(data);

  //     if (Object.keys(_empDetails).length < 1) {
  //       window.location.href = rootFolder + "/KDTPortalLogin"; //if result is 0, redirect to log in page
  //     }
  //     msAccess();
  //   },
  // });
  // $.ajaxSetup({ async: true });
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "Includes/check_login.php",
      dataType: "json",
      success: function (data) {
        const empdetails = data;
        resolve(empdetails);
        // //ajax to check if user is logged in
        // _empDetails = $.parseJSON(data);

        // if (Object.keys(_empDetails).length < 1) {
        //   window.location.href = rootFolder + "/KDTPortalLogin"; //if result is 0, redirect to log in page
        // }
        // msAccess();
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while checking login details.");
        }
      },
    });
  });
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
        RegularHourEntries: {},
        OTEntries: {},
        Leaves: [],
      };
    }
  });

  empEntries.forEach((entry) => {
    if (allEmployees[entry["empNum"]]["Leaves"] === undefined) {
      allEmployees[entry["empNum"]]["Leaves"] = [];
    }

    if (entry["pName"] === "Leave") {
      allEmployees[entry["empNum"]]["Leaves"].push({ ...entry });
    }

    const newEntry = {
      entryDate: entry["entryDate"],
      hours: entry["hours"],
    };
    if (entry["OT"] === true) {
      if (
        allEmployees[entry["empNum"]]["OTEntries"][entry["pIndex"]] ===
        undefined
      ) {
        //Create new project
        const newProjectEntry = {
          pName: entry["pName"],
          dateEntries: [],
          iIndex: entry["iIndex"],
          pIndex: entry["pIndex"],
        };
        allEmployees[entry["empNum"]]["OTEntries"][entry["pIndex"]] =
          newProjectEntry;
      }
      allEmployees[entry["empNum"]]["OTEntries"][entry["pIndex"]][
        "dateEntries"
      ].push(newEntry);
    } else if (entry["OT"] === false) {
      if (
        allEmployees[entry["empNum"]]["RegularHourEntries"][entry["pIndex"]] ===
        undefined
      ) {
        //Create new project
        const newProjectEntry = {
          pName: entry["pName"],
          dateEntries: [],
          iIndex: entry["iIndex"],
          pIndex: entry["pIndex"],
        };
        allEmployees[entry["empNum"]]["RegularHourEntries"][entry["pIndex"]] =
          newProjectEntry;
      }
      allEmployees[entry["empNum"]]["RegularHourEntries"][entry["pIndex"]][
        "dateEntries"
      ].push(newEntry);
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
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_group_list.php",
      data: {
        empNum: _empDetails["empNum"],
      },
      dataType: "json",
      success: function (response) {
        const grplist = response;
        resolve(grplist);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching group list.");
        }
      },
    });
  });
}
function fillGroups(grplist) {
  grplist.forEach((grp) => {
    $("#buSel").append(`<option>${grp}</option>`);
    $("#buSel").val(_empDetails["empGroup"]);
  });
}
function getEmployeeList() {
  const selDate = $("#monthSel").val();
  const grpSel = $("#buSel").val();
  const cutOff = $(`#CO`).val();
  $("#members-list").empty();
  // $.post(
  //   "ajax/get_emplist.php",
  //   {
  //     monthSel: selDate,
  //     groupSel: grpSel,
  //     getHalfSel: cutOff,
  //   },
  //   function (data) {
  //     _emplist = $.parseJSON(data);
  //     _emplist.map(fillMembers);
  //     _selectedMembers = _selectedMembers.filter((item) =>
  //       _emplist.some((myItem) => myItem.empNum === item)
  //     );
  //   }
  // );
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_emplist.php",
      data: {
        monthSel: selDate,
        groupSel: grpSel,
        getHalfSel: cutOff,
      },
      dataType: "json",
      success: function (response) {
        const emplist = response;
        resolve(emplist);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching employee list.");
        }
      },
    });
  });
}
function getLocations() {
  // $("#locSel").html(`<option loc-id=0>KDT/WFH</option>`);
  // var addString = ``;
  // $.ajax({
  //   url: "ajax/get_locations.php",
  //   success: function (data) {
  //     var locs = $.parseJSON(data);
  //     const locIDs = Object.keys(locs);
  //     locIDs.forEach((locID) => {
  //       const locName = locs[locID];
  //       addString += `<option loc-id=${locID}>${locName}</option>`;
  //     });
  //   },
  // });
  // $("#locSel").append(addString);
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_locations.php",
      dataType: "json",
      success: function (response) {
        const loc = response;
        resolve(loc);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching locations.");
        }
      },
    });
  });
}
function fillLocations(locs) {
  $("#locSel").html(`<option loc-id=0>KDT/WFH</option>`);
  var addString = ``;
  $.each(locs, function (key, value) {
    var option = $("<option>").attr("loc-id", key).text(value);
    $("select").append(option);
  });
  $("#locSel").append(addString);
}
//#region table creation
function createTables(ymVal, useAmsCache = false) {
  _grpProj = [];
  _grpOT = [];
  allEmployees = {};
  var groupSel = $(`#buSel`).val();
  var halfSel = $(`#CO`).val();
  var getOGP = $(`.checkbox`).is(":checked"); //eto papalitan pag may checkbox na
  var location = $($(`#locSel`).find("option:selected")).attr("loc-id");
  if (_selectedMembers.length < 1) {
    hideTable();
    return;
  }

  if (useAmsCache === false || Object.entries(amsData).length < 1) {
    $.ajaxSetup({ async: false });
    getAMS()
      .then((am) => {
        amsData = am;
      })
      .catch((error) => {
        alert(`${error}`);
      });
    $.ajaxSetup({ async: true });
  }

  $(".noShow").addClass("d-none");
  $(".lower .right").removeClass("d-none");
  $("#mainThead,#mainTbody,#subThead,#subTbody").empty();
  $.post(
    "ajax/get_entries.php",
    {
      monthSel: ymVal,
      empArray: JSON.stringify(_selectedMembers),
      groupSel: groupSel,
      getHalfSel: halfSel,
      getOGP: true,
      location: location,
    },
    function (data) {
      var empEntries = $.parseJSON(data);
      allEmployees = empEntries;
      _maxDays = new Date(
        ymVal.split("-")[0],
        ymVal.split("-")[1],
        0
      ).getDate();

      createHeader();
      generateMainTable(allEmployees, getOGP);
      generateSubTable(allEmployees);
      colorYellow();
      colorWeekends(ymVal.split("-")[0], ymVal.split("-")[1]);
    }
  );
  // console.log(_selectedMembers);
}
function hideTable() {
  $(".noShow").removeClass("d-none");
  $(".lower .right").addClass("d-none");
}
function getEntries() {}
function getAMS() {
  const monthSel = $("#monthSel").val();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_ams.php",
      data: {
        yearMonth: monthSel,
        empArray: JSON.stringify(_selectedMembers),
      },
      dataType: "json",
      success: function (response) {
        const ams = response;
        resolve(ams);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching ams data.");
        }
      },
    });
  });
}

function padZero(num) {
  return String(num).padStart(2, "0");
}

function getRegularHoursData(projects, otProjects, includeOgp = false) {
  const totalHours = {};

  const monthTotalHours = { totalHours: 0 };
  const projectEntries = projects
    .map((rhEntry) => {
      const isOGPProject =
        rhEntry["pName"].substr(rhEntry["pName"].length - 5) === "[ogp]";
      if (includeOgp === false && isOGPProject) {
        return;
      }
      const dateEntries = rhEntry["dateEntries"].reduce((map, curr) => {
        if (map[curr["entryDate"]]) {
          map[curr["entryDate"]] += curr["hours"];
        } else {
          map[curr["entryDate"]] = curr["hours"];
        }

        if (totalHours[curr["entryDate"]] === undefined) {
          const totalOtEntry = otProjects[curr["entryDate"]]
            ? otProjects[curr["entryDate"]]
            : 0;
          totalHours[curr["entryDate"]] = curr["hours"] + totalOtEntry;
        } else {
          totalHours[curr["entryDate"]] += curr["hours"];
        }
        if (monthTotalHours[rhEntry["pName"]] === undefined) {
          monthTotalHours[rhEntry["pName"]] = curr["hours"];
        } else {
          monthTotalHours[rhEntry["pName"]] += curr["hours"];
        }
        monthTotalHours["totalHours"] += curr["hours"];
        return map;
      }, {});
      return {
        ...rhEntry,
        dateEntries: dateEntries,
      };
    })
    .filter((x) => x !== undefined);

  return {
    monthTotalHours,
    totalHours,
    projectEntries,
  };
}
function getOTHoursData(OTprojects, includeOgp) {
  const totalHours = {};
  const monthTotalHours = { totalHours: 0 };

  const projectEntries = OTprojects.map((rhEntry) => {
    const isOGPProject =
      rhEntry["pName"].substr(rhEntry["pName"].length - 5) === "[ogp]";
    if (includeOgp === false && isOGPProject) {
      return;
    }
    const dateEntries = rhEntry["dateEntries"].reduce((map, curr) => {
      if (map[curr["entryDate"]]) {
        map[curr["entryDate"]] += curr["hours"];
      } else {
        map[curr["entryDate"]] = curr["hours"];
      }

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
      monthTotalHours["totalHours"] += curr["hours"];
      return map;
    }, {});
    return {
      ...rhEntry,
      dateEntries: dateEntries,
    };
  }).filter((x) => x !== undefined);
  return {
    otMonthTotalHours: monthTotalHours,
    otTotalHours: totalHours,
    otProjectEntries: projectEntries,
  };
}
function generateRegularHours(
  totalHours,
  monthTotalHours,
  projectEntries,
  employeeId = 0,
  shouldIncludeOgp = false,
  ams = {},
  includeColor = {
    totalHours: false,
  },
  totalOtHours
) {
  let htmlString = "";
  let totalHourCells = "";
  projectEntries.forEach((projectEntry) => {
    const dateEntries = projectEntry["dateEntries"];
    const isOGPProject =
      projectEntry["pName"].substr(projectEntry["pName"].length - 5) ===
      "[ogp]";
    if (isOGPProject && !shouldIncludeOgp) {
      return;
    }
    const projectName = isOGPProject
      ? projectEntry["pName"].slice(0, -5)
      : projectEntry["pName"];
    let regularHourCells = "";
    const employee = allEmployees[employeeId];
    for (let x = 1; x <= _maxDays; x++) {
      regularHourCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
        dateEntries[padZero(x)] ? dateEntries[padZero(x)] : ""
      }</td>`;
    }
    htmlString += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="pRow" employee-number="${employeeId}" p-index="${
      projectEntry["pIndex"]
    }">
                  <td data-a-v="middle" style="width:300px;" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${projectName}</td>
                  ${regularHourCells}
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
                    monthTotalHours[projectEntry["pName"]]
                  }</td>`;
  });
  for (let x = 1; x <= _maxDays; x++) {
    ams[padZero(x)];

    let cellColor = "rgb(255, 255, 0)";
    if (includeColor.totalHours && ams[padZero(x)]) {
      cellColor = getTotalHourColor(
        totalHours[padZero(x)],
        ams[padZero(x)]["hours"]
      );
    }
    totalHourCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" style="background-color: ${cellColor};" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      totalHours[padZero(x)] ? totalHours[padZero(x)] : ""
    }</td>`;
  }
  htmlString += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="tTot"employee-number="${employeeId}" >
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"</td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" style="background-color: rgb(255, 255, 0);">Total Hours</td>
  ${totalHourCells}
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
    monthTotalHours["totalHours"] ? monthTotalHours["totalHours"] : "0"
  }</td>

  </tr>
  </tr>`;
  return { regularHourCells: htmlString, totalHours };
}
function generateOtHours(
  OtHours,
  monthTotalHours,
  totalOtHours,
  employeeId = 0,
  shouldIncludeOgp
) {
  let overTimeTotal = "";
  let totalOtCells = "";
  let addHtml = "";

  for (let x = 1; x <= _maxDays; x++) {
    totalOtCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      totalOtHours[padZero(x)] ? totalOtHours[padZero(x)] : ""
    }</td>`;
  }
  overTimeTotal += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="oTot"employee-number="${employeeId}" >
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Overtime</td>
  ${totalOtCells}
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
    monthTotalHours["totalHours"] ? monthTotalHours["totalHours"] : "0"
  }</td>

  </tr>
  </tr>`;
  //Setup data for ot cells with projectname
  let projectOtCellsWithProjectName = "";

  OtHours.forEach((otEntry) => {
    //Setup data
    const otDateEntries = otEntry["dateEntries"];
    //Render UI
    const isOGPProject =
      otEntry["pName"].substr(otEntry["pName"].length - 5) === "[ogp]";
    if (isOGPProject && !shouldIncludeOgp) {
      return;
    }
    const projectName = isOGPProject
      ? otEntry["pName"].slice(0, -5)
      : otEntry["pName"];
    let otHoursCells = "";
    for (let x = 1; x <= _maxDays; x++) {
      otHoursCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
        otDateEntries[padZero(x)] ? otDateEntries[padZero(x)] : ""
      }</td>`;
    }
    projectOtCellsWithProjectName += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="pRow" employee-number="${employeeId}" p-index="${
      otEntry["pIndex"]
    }">
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td>
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
                    "OT-" + projectName
                  }</td>
                  ${otHoursCells}
                  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
                    monthTotalHours[otEntry["pName"]]
                      ? monthTotalHours[otEntry["pName"]]
                      : "0"
                  }</td>
                  `;
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
  return { projectOtCellsWithProjectName, overTimeTotal, totalOtHours };
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
    if (leaveEntry["iIndex"] === 25) {
      leaveEntry["dateEntries"].forEach((entry) => {
        if (leavesMap[`vl-${entry["entryDate"]}`] !== undefined) {
          leavesMap[`vl-${entry["entryDate"]}`] += entry["hours"];
        } else {
          leavesMap[`vl-${entry["entryDate"]}`] = entry["hours"];
        }
        if (monthTotalHours["totalVl"] === undefined) {
          monthTotalHours["totalVl"] = entry["hours"];
        } else {
          monthTotalHours["totalVl"] += entry["hours"];
        }
        if (leavesMap[`total-${entry["entryDate"]}`] === undefined) {
          leavesMap[`total-${entry["entryDate"]}`] = entry["hours"];
        } else {
          leavesMap[`total-${entry["entryDate"]}`] += entry["hours"];
        }
        if (monthTotalHours["totalLeave"] === undefined) {
          monthTotalHours["totalLeave"] = entry["hours"];
        } else {
          monthTotalHours["totalLeave"] += entry["hours"];
        }
      });
    } else if (leaveEntry["iIndex"] === 26) {
      leaveEntry["dateEntries"].forEach((entry) => {
        if (leavesMap[`sl-${entry["entryDate"]}`] !== undefined) {
          leavesMap[`sl-${entry["entryDate"]}`] += entry["hours"];
        } else {
          leavesMap[`sl-${entry["entryDate"]}`] = entry["hours"];
        }
        if (monthTotalHours["totalSl"] === undefined) {
          monthTotalHours["totalSl"] = entry["hours"];
        } else {
          monthTotalHours["totalSl"] += entry["hours"];
        }
        if (leavesMap[`total-${entry["entryDate"]}`] === undefined) {
          leavesMap[`total-${entry["entryDate"]}`] = entry["hours"];
        } else {
          leavesMap[`total-${entry["entryDate"]}`] += entry["hours"];
        }
        if (monthTotalHours["totalLeave"] === undefined) {
          monthTotalHours["totalLeave"] = entry["hours"];
        } else {
          monthTotalHours["totalLeave"] += entry["hours"];
        }
      });
    } else {
      leaveEntry["dateEntries"].forEach((entry) => {
        if (leavesMap[`other-${entry["entryDate"]}`] !== undefined) {
          leavesMap[`other-${entry["entryDate"]}`] += entry["hours"];
        } else {
          leavesMap[`other-${entry["entryDate"]}`] = entry["hours"];
        }
        if (monthTotalHours["totalOtherLeave"] === undefined) {
          monthTotalHours["totalOtherLeave"] = entry["hours"];
        } else {
          monthTotalHours["totalOtherLeave"] += entry["hours"];
        }

        if (leavesMap[`total-${entry["entryDate"]}`] === undefined) {
          leavesMap[`total-${entry["entryDate"]}`] = entry["hours"];
        } else {
          leavesMap[`total-${entry["entryDate"]}`] += entry["hours"];
        }
        if (monthTotalHours["totalLeave"] === undefined) {
          monthTotalHours["totalLeave"] = entry["hours"];
        } else {
          monthTotalHours["totalLeave"] += entry["hours"];
        }
      });
    }
    // if (leavesMap[`total-${leaveEntry["entryDate"]}`] === undefined) {
    //   leavesMap[`total-${leaveEntry["entryDate"]}`] = entry["hours"];
    // } else {
    //   leavesMap[`total-${leaveEntry["entryDate"]}`] += entry["hours"];
    // }
    // if (monthTotalHours["totalLeave"] === undefined) {
    //   monthTotalHours["totalLeave"] = entry["hours"];
    // } else {
    //   monthTotalHours["totalLeave"] += entry["hours"];
    // }
  });

  //Render UI
  for (let x = 1; x <= _maxDays; x++) {
    vlCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      leavesMap[`vl-${padZero(x)}`] ? leavesMap[`vl-${padZero(x)}`] : ""
    }</td>`;
    otherLeaveCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      leavesMap[`sl-${padZero(x)}`] ? leavesMap[`sl-${padZero(x)}`] : ""
    }</td>`;
    slCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      leavesMap[`other-${padZero(x)}`] ? leavesMap[`other-${padZero(x)}`] : ""
    }</td>`;
    totalLeaveCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      leavesMap[`total-${padZero(x)}`] ? leavesMap[`total-${padZero(x)}`] : ""
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
  return { leavesUI: addHtml, leavesData: leavesMap };
}
function generateAMS(
  amsLogs,
  employeeId = 0,
  regularHourEntries,
  leavesData,
  otEntries
) {
  let amsLogsSection = "";
  let amsLogsCells = "";
  let totalAmsMonth = 0;

  for (let x = 1; x <= _maxDays; x++) {
    let cellColor = "";
    if (amsLogs[padZero(x)] && amsLogs[padZero(x)]["hours"] !== undefined) {
      totalAmsMonth += amsLogs[padZero(x)]["hours"];
      cellColor = getAMSEntryColor(
        amsLogs[padZero(x)]["locationName"] === "WFH",
        amsLogs[padZero(x)]["hours"],
        leavesData[`total-${padZero(x)}`],
        regularHourEntries[padZero(x)]
      );
    } else {
      //No ams entry
      const location = $("#locSel").val();
      if (
        (location === "WFH" || location === "KDT/WFH" || location === "KDT") &&
        regularHourEntries[padZero(x)] !== undefined
      ) {
        //Not Dispatch
        if (regularHourEntries[padZero(x)] !== undefined) {
          cellColor = "#ff0000";
        }
      } else {
        if (regularHourEntries[padZero(x)] !== undefined) {
          cellColor = "#c5976a";
        }
      }
    }

    amsLogsCells += `<td data-a-v="middle" data-f-name="Arial" data-f-sz="9" style="background-color: ${cellColor};"  data-b-a-s="thin" data-a-h="center" dayVal="${x}">${
      amsLogs[padZero(x)] ? amsLogs[padZero(x)]["hours"] : ""
    }</td>`;
  }
  amsLogsSection += `<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="amsRow" employee-number="${employeeId}">
  <td></td>  
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" style="background-color: rgb(255,255,0);">AMS</td>
    ${amsLogsCells}
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${totalAmsMonth}</td></tr>`;
  return amsLogsSection;
}
function generateMainTable(allEmployees, includeOgp = false) {
  Object.values(allEmployees).forEach((user) => {
    createMemberHours(user);
  });
}
function generateSubTable(allUsers) {
  let addHtml = "";
  const includeOgp = $(`.checkbox`).is(":checked");

  let Leaves = [];
  const OTEntries = {};
  const RegularHourEntries = {};
  Object.values(allUsers).forEach((user) => {
    //Regular hour merge
    for (let key in user["RegularHourEntries"]) {
      if (RegularHourEntries[key] === undefined) {
        RegularHourEntries[key] = user["RegularHourEntries"][key];
      } else {
        RegularHourEntries[key]["dateEntries"] = [
          ...RegularHourEntries[key]["dateEntries"],
          ...user["RegularHourEntries"][key]["dateEntries"],
        ];
      }
    }

    //OT Hour Merge
    for (let key in user["OTEntries"]) {
      if (OTEntries[key] === undefined) {
        OTEntries[key] = user["OTEntries"][key];
      } else {
        OTEntries[key]["dateEntries"] = [
          ...OTEntries[key]["dateEntries"],
          ...user["OTEntries"][key]["dateEntries"],
        ];
      }
    }
    //Leaves
    Leaves.push(...Object.values(user["Leaves"]));
  });

  const { otMonthTotalHours, otProjectEntries, otTotalHours } = getOTHoursData(
    Object.values(OTEntries)
  );
  const { monthTotalHours, totalHours, projectEntries } = getRegularHoursData(
    Object.values(RegularHourEntries),
    otTotalHours,
    includeOgp
  );
  const { regularHourCells } = generateRegularHours(
    totalHours,
    monthTotalHours,
    projectEntries,
    0,
    includeOgp,
    otTotalHours
  );
  const { projectOtCellsWithProjectName, overTimeTotal, totalOtHours } =
    generateOtHours(
      otProjectEntries,
      otMonthTotalHours,
      otTotalHours,
      0,
      includeOgp
    );
  addHtml += regularHourCells;
  addHtml += overTimeTotal;
  addHtml += projectOtCellsWithProjectName;
  $("#subTbody").append(addHtml);
  return;
  addHtml += generateLeaves(Leaves);
}
function createMemberHours(user) {
  const includeOgp = $(`.checkbox`).is(":checked");
  let addHtml = "";
  /**totalHours
   * {
   *  [date]:totalHoursForThatDate
   * }
   */

  //Get Required Data

  const { otMonthTotalHours, otTotalHours, otProjectEntries } = getOTHoursData(
    Object.values(user["OTEntries"]),
    includeOgp
  );

  const { monthTotalHours, totalHours, projectEntries } = getRegularHoursData(
    Object.values(user["RegularHourEntries"]),
    otTotalHours,
    includeOgp
  );
  const { regularHourCells } = generateRegularHours(
    totalHours,
    monthTotalHours,
    projectEntries,
    user["empId"],
    includeOgp,
    amsData[user["empId"]],
    { totalHours: true },
    otTotalHours
  );

  //End Regular Hour Section
  //#region OT Section
  const { projectOtCellsWithProjectName, overTimeTotal, totalOtHours } =
    generateOtHours(
      otProjectEntries,
      otMonthTotalHours,
      otTotalHours,
      user["empId"],
      includeOgp
    );
  //#endregion Ot Section
  const { leavesData, leavesUI } = generateLeaves(
    Object.values(user["Leaves"]),
    user["empId"]
  );
  const amsLogs = generateAMS(
    amsData[user["empId"]] ? amsData[user["empId"]] : {},
    user["empId"],
    totalHours,
    leavesData
  );

  //Start Leave Section

  $("#mainTbody")
    .append(`<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="emprow" employee-number="${
    user["empId"]
  }">
  <td data-a-v="middle" style="width:300px;" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${
    user["firstName"]
  }, ${user["lastName"]}</td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Project and Job Name</td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" colspan="${
    _maxDays + 1
  }"></td>
  </tr>
  ${regularHourCells}
  ${overTimeTotal}
  ${amsLogs}
  ${projectOtCellsWithProjectName}
  ${leavesUI}
  `);
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
          ).children()[entry["entryDate"] + 1]
        ).text()
      ) || 0;
    currentHours += parseFloat(entry["hours"]);
    $(
      $(
        `.pRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`
      ).children()[entry["entryDate"] + 1]
    ).text(`${currentHours}`);
    if (entry["OT"]) {
      $(
        $(
          `.oRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`
        ).children()[entry["entryDate"] + 1]
      ).text(entry["hours"]);
    }
  } else {
    if (oLeaves.hasOwnProperty(entry["iIndex"])) {
      //EL PL
      $(
        $(
          `.lRow[p-index="others"][employee-number="${entry["empNum"]}"]`
        ).children()[entry["entryDate"] + 1]
      ).text(1233);
    }
    // iIndex === 25 = VL
    // iIndex === 26 = SL
    $(
      $(
        `.lRow[i-index="${entry["iIndex"]}"][employee-number="${entry["empNum"]}"]`
      ).children()[entry["entryDate"] + 1]
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

function getAMSEntryColor(isWfh, totalAmsHours, leaveHours, totalRegularHours) {
  if (totalAmsHours === undefined) {
    totalAmsHours = 0;
  }
  if (leaveHours === undefined) {
    leaveHours = 0;
  }
  if (totalRegularHours === undefined) {
    totalRegularHours = 0;
  }

  if (isWfh === true) {
    return "#ffc0cb";
  }
}

function getTotalHourColor(totalHour, amsHour, otHour) {
  if (totalHour > 8 && otHour !== undefined) {
    return "#ff0000";
  }
  if (totalHour !== amsHour) {
    if (totalHour > amsHour || !amsHour) {
      return "#ff0000";
    }
    if (totalHour < amsHour) {
      return "#00ffff";
    }
  }
  return "rgb(255, 255, 0)";
}
function colorYellow() {
  var myClass = [
    `oTot`,
    `lRow`,
    `lTot`,
    `gtTot`,
    `goTot`,
    `glRow`,
    `glTot`,
    "amsRowLabel",
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
    `.amsRow`,
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
