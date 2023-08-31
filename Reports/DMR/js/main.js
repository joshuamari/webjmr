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
Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear(),
    mm.toString().padStart(2, "0"),
    dd.toString().padStart(2, "0"),
  ].join("-");
};
var _selectedMembers = [];
var _empDetails = [];
var _dateScope = [];
//#endregion
checkLogin();

//#region BINDS
$(document).ready(function () {
  const getToday = new Date();
  $("#monthSel").val(
    `${getToday.getFullYear()}-${(parseInt(getToday.getMonth()) + 1)
      .toString()
      .padStart(2, "0")}`
  );
  getScope();
  $.ajaxSetup({ async: false });
  getGroupList();
  getEmployeeList();
  getProjects();
  $.ajaxSetup({ async: true });
  queryfunctions();
});
$(document).on("click", "#clearWeek", function () {
  clearWeek();
  $("[date-val]").removeClass("bg-warning");
  $("#weekly-report").hide();
});

$(document).on("change", "#monthSel", function () {
  getEmployeeList();
  getScope();
  queryfunctions();
});

$(document).on("change", "#weekSel", function () {
  $("#weekly-report").show();
  validateWeekRange($("#monthSel").val());
});
$(document).on("change", "#buSel", function () {
  getEmployeeList();
  getProjects();
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
      jmcAccess();
    },
  });
  $.ajaxSetup({ async: true });
}
function jmcAccess() {
  //check if user has access to jmc
  $.post(
    "ajax/jmc_access.php",
    {
      empNum: _empDetails["empNum"],
    },
    function (data) {
      if (data.trim() == 0) {
        alert("Access denied");
        window.location.href = "../";
      }
    }
  );
}
function makeArrayUnique(arr, key) {
  const uniqueValues = new Set();
  return arr.filter((item) => {
    if (!uniqueValues.has(item[key])) {
      uniqueValues.add(item[key]);
      return true;
    }
    return false;
  });
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
        if (grp == _empDetails["empGroup"]) {
          $("#buSel").val(_empDetails["empGroup"]);
        }
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
function getProjects() {
  $("#projSel").empty();
  var buSel = $("#buSel").val();
  $.post(
    "ajax/get_projects.php",
    {
      groupSel: buSel,
    },
    function (data) {
      console.log(data);
      var projList = $.parseJSON(data);
      if (projList.length > 1) {
        $("#projSel").html(`<option value=''>All</option>`);
      }
      projList.forEach((proj) => {
        $("#projSel").append(
          `<option proj-id="${proj["projID"]}">${proj["projName"]}</option>`
        );
      });
    }
  );
}
function getEntries() {
  var groupSel = $("#buSel").val();
  var projSel = $("#projSel").val();
  return;
  $.post(
    "ajax/get_entries.php",
    {
      groupSel: groupSel,
      projSel: projSel,
      firstDay: _dateScope["firstDay"],
      lastDay: _dateScope["lastDay"],
      empSel: _selectedMembers,
    },
    function (data) {}
  );
}
function getScope() {
  var monthSel = $("#monthSel").val();
  $.post(
    "ajax/get_scope.php",
    {
      monthSel: monthSel,
    },
    function (data) {
      _dateScope = $.parseJSON(data);
    }
  );
}
//#region mga query
function queryfunctions() {
  $("#main-tbody").empty();

  //projects
  $.getJSON("js/projects.json", function (data) {
    latagProjects(data);
    data.map(latagPDetails);
    createTable();
  });

  //planning
  $.getJSON("js/planning.json", function (data) {
    data.map(latagPlanning);
  });

  //DR
  $.getJSON("js/queries.json", function (data) {
    data.map(latagActual);
  });
}
//#endregion
//#region table sa taas
function createTable() {
  latagDays();
  weekendcolor();
}

function latagDays() {
  $($("#status").nextAll()).remove();
  var addHeader = "";
  var addCells = "";
  var startString = _dateScope["firstDay"];
  var endString = _dateScope["lastDay"];
  var startDate = new Date(startString);
  var endDate = new Date(endString);
  while (startDate <= endDate) {
    addHeader += `<th date-val="${startDate.yyyymmdd()}">${startDate.yyyymmdd()}</th>`;
    addCells += `<td date-val="${startDate.yyyymmdd()}"></td>`;
    startDate.setDate(startDate.getDate() + 1);
  }
  // //day1 not monday
  // if (fd.getDay() > 1) {
  //   for (let x = fd.getDay() - 2; x >= 0; x--) {
  //     var newDate = new Date(fd.getFullYear(), fd.getMonth(), -Math.abs(x));
  //     console.log(fd.getMonth());
  //     addHeader += `<th date-val="${newDate.yyyymmdd()}">${newDate.yyyymmdd()}</th>`;
  //     addCells += `<td date-val="${newDate.yyyymmdd()}"></td>`;
  //   }
  // }
  // if (fd.getDay() == 0) {
  //   for (let x = 6; x >= 1; x--) {
  //     var newDate = new Date(fd.getFullYear(), fd.getMonth(), -Math.abs(x));
  //     addHeader += `<th date-val="${newDate.yyyymmdd()}">${newDate.yyyymmdd()}</th>`;
  //     addCells += `<td date-val="${newDate.yyyymmdd()}"></td>`;
  //   }
  // }
  // //latag whole month
  // for (let x = 1; x <= ld.getDate(); x++) {
  //   var newDate = new Date(fd.getFullYear(), fd.getMonth(), x);
  //   addHeader += `<th date-val="${newDate.yyyymmdd()}">${newDate.yyyymmdd()}</th>`;
  //   addCells += `<td date-val="${newDate.yyyymmdd()}"></td>`;
  // }
  // //lastday not sunday
  // if (ld.getDay() != 0) {
  //   var diff = 6 - ld.getDay();
  //   for (let x = 1; x <= diff + 1; x++) {
  //     var newDate = new Date(ld.getFullYear(), ld.getMonth(), ld.getDate() + x);
  //     addHeader += `<th date-val="${newDate.yyyymmdd()}">${newDate.yyyymmdd()}</th>`;
  //     addCells += `<td date-val="${newDate.yyyymmdd()}"></td>`;
  //   }
  // }
  $("#status").after(addHeader);
  $(".plan-row, .actual-row").append(addCells);
}

function latagProjects(data) {
  const filteredData = makeArrayUnique(data, "pNum");

  filteredData.forEach((element) => {
    $("#main-tbody").append(`
    <tr class="project-row bg-warning" proj-num="${element.pNum}">
    <td colspan="100">${element.pName}</td>
    </tr>
    `);
  });
}

function latagPDetails(data) {
  $(`.project-row[proj-num="${data.pNum}"]`).after(`
<tr class="plan-row" job-num="${data.jobNum}" emp-num="${data.empNum}">
<td rowspan="2">${data.jobName}</td>
<td rowspan="2">${data.itemName}</td>
<td rowspan="2">${data.dName}</td>
<td rowspan="2">${data.kic}</td>
<td rowspan="2">${data.empName}</td>
<td rowspan="2">${data.khiRequest}</td>
<td rowspan="2">${data.kdtDeadline}</td>
<td rowspan="2">${data.startDate}</td>
<td rowspan="2">${data.mUsed}</td>
<td rowspan="2" class="status">${data.pStatus}</td>
</tr>
<tr class="actual-row" job-num="${data.jobNum}" emp-num="${data.empNum}"></tr>
`);
}

function latagPlanning(data) {
  $(
    $(`.plan-row[job-num="${data.jobNum}"][emp-num="${data.empNum}"]`).children(
      `[date-val="${data.entryDate}"]`
    )
  ).text(data.hours);
}

function latagActual(data) {
  $(
    $(
      `.actual-row[job-num="${data.jobNum}"][emp-num="${data.empNum}"]`
    ).children(`[date-val="${data.entryDate}"]`)
  ).text(data.hours);
}

function weekendcolor() {
  $.each($("#status").nextAll(), function (indexInArray, valueOfElement) {
    var newDate = new Date($(valueOfElement).text());
    if (newDate.getDay() == 0 || newDate.getDay() == 6) {
      $(`[date-val="${newDate.yyyymmdd()}"]`).addClass("bg-secondary");
    }
  });
}

//#endregion
//#region pang weekly report
function validateWeekRange(mVal) {
  var firstDay = new Date(`${mVal}-01`);
  var lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0);

  const selectedValue = $("#weekSel").val();

  const selectedWeek = parseInt(selectedValue.slice(6));

  // Define your allowed range
  const allowedWeekRange = [getWeekNo(firstDay), getWeekNo(lastDay)]; // Adjust as needed

  if (
    selectedWeek >= allowedWeekRange[0] &&
    selectedWeek <= allowedWeekRange[1]
  ) {
    highlightweek(selectedValue);
  } else {
    clearWeek();
    alert("Selected week is outside this month's range.");
  }
}

function getWeekNo(currentDate) {
  var startDate = new Date(currentDate.getFullYear(), 0, 1);
  var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
  var weekNumber = Math.ceil(days / 7);
  return weekNumber;
}

function clearWeek() {
  $("#weekSel").val(0);
}

function highlightweek(wVal) {
  $($("#w-total").nextAll()).remove();
  $("#weekly-body").empty();
  //add Emps
  var empArr = [];
  $.each($(".plan-row"), function (indexInArray, valueOfElement) {
    empArr.push({
      empNum: $(valueOfElement).attr("emp-num"),
      empName: $($(valueOfElement).children()[4]).text(),
    });
  });
  empArr = makeArrayUnique(empArr, "empNum");

  empArr.forEach((element) => {
    $("#weekly-body").append(`
    <tr class="wp-row" get-from="plan-row" emp-num="${element.empNum}">
    <td rowspan="2">${element.empName}</td>
    <td>Plan</td>
    <td rowspan="2" class="pa-percent"></td>
    <td class="w-tot"></td>
    </tr>
    <tr class="wa-row" get-from="actual-row" emp-num="${element.empNum}">
    <td>Actual</td>
    <td class="w-tot"></td></tr>
    `);
  });

  const [inputYear, inputWeek] = wVal.split("-W");
  $("[date-val]").removeClass("bg-warning");
  const startDate = new Date(inputYear, 0, 1 + inputWeek * 7);
  while (startDate.getDay() !== 1) {
    startDate.setDate(startDate.getDate() - 1);
  }
  const daysInWeek = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    $(`[date-val="${currentDate.yyyymmdd()}"]`).addClass("bg-warning");
    daysInWeek.push(currentDate);
    $("#weekly-headrow").append(
      `<th w-date-val="${currentDate.yyyymmdd()}">${currentDate.yyyymmdd()}</th>`
    );
    $(".wp-row").append(
      `<td class="pa-details" w-date-val="${currentDate.yyyymmdd()}"></td>`
    );
    $(".wa-row").append(
      `<td class="pa-details" w-date-val="${currentDate.yyyymmdd()}"></td>`
    );
  }

  $.each($(".pa-details"), function (index, val) {
    $(val).text(
      totalpa(
        $($(val).parent()).attr("emp-num"),
        $(val).attr("w-date-val"),
        $($(val).parent()).attr("get-from")
      )
    );
  });

  totalLeft();
}

function totalpa(empNum, date, pa) {
  console.log(empNum, date, pa);
  var arr = $(`.${pa}[emp-num="${empNum}"]`).children(`[date-val="${date}"]`);
  var totalArr = [];

  $.each(arr, function (index, val) {
    totalArr.push($(val).text() == "" ? 0 : $(val).text());
  });
  return eval(totalArr.join("+")) == 0 ? "" : eval(totalArr.join("+"));
}

function totalLeft() {
  $.each($(".w-tot"), function (index, val) {
    var x = $(val).nextAll();
    var arr = [];
    $.each(x, function (indexInArray, valueOfElement) {
      arr.push($(valueOfElement).text() == "" ? 0 : $(valueOfElement).text());
    });
    $(val).text(eval(arr.join("+")));
  });

  $.each($(".pa-percent"), function (index, val) {
    $(val).text(
      Number(
        eval(
          `${$($(val).next()).text()}/${$(
            $($($(val).parent()).next()).children(".w-tot")
          ).text()}*100`
        )
      ).toFixed(2) + "%"
    );
  });
}

//#endregion

//#endregion
