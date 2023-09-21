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
  // getEntries();
});
$(document).on("click", "#clearWeek", function () {
  clearWeek();
});

$(document).on("change", "#monthSel", function () {
  $.ajaxSetup({ async: false });
  getEmployeeList();
  getScope();
  $.ajaxSetup({ async: true });
  getEntries();
});

$(document).on("change", "#weekSel", function () {
  $("#weekly-report").show();
  validateWeekRange($("#monthSel").val());
});
$(document).on("change", "#buSel", function () {
  getEmployeeList();
  getProjects();
  _selectedMembers.length = 0;

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
  _selectedMembers.length = 0;
  $(".memBtn.btn-primary").each(function () {
    _selectedMembers.push($(this).attr("emp-num"));
  });
  getEntries();
});
$(document).on("click", ".memBtn", function () {
  $(this).toggleClass("btn-primary btn-secondary");
  _selectedMembers.length = 0;
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
  getEntries();
});
$(document).on("change", "#projSel", function () {
  getEntries();
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
  var projSel = $($("#projSel").find("option:selected")).attr("proj-id");
  if (_selectedMembers.length < 1) {
    $(".noShow").removeClass("d-none");
    $("#mainContent").addClass("d-none");
    return;
  }
  $(".noShow").addClass("d-none");
  $("#mainContent").removeClass("d-none");
  $("#main-tbody").empty();
  $.post(
    "ajax/get_entries.php",
    {
      groupSel: groupSel,
      projSel: projSel,
      firstDay: _dateScope["firstDay"],
      lastDay: _dateScope["lastDay"],
      empSel: _selectedMembers,
    },
    function (data) {
      const query = $.parseJSON(data);
      latagProjects(query);
      updateTr();
      latagPlanning(query);
      gawaBaba();
    }
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
//#region table sa taas
function createTable() {
  latagDays();
  // weekendcolor();
}

function updateTr() {
  $('.pName').attr('colspan',$('#headrow').children().length);
  var pRow = $(".plan-row");
  $.each(pRow, function (i, v) {
    var aRow = $(v).next();
    $(v).attr("job-num", $($(v).children(".jname")).attr("job-num"));
    $(v).attr("emp-num", $($(v).children(".ename")).attr("e-id"));
    $(aRow).attr("job-num", $($(v).children(".jname")).attr("job-num"));
    $(aRow).attr("emp-num", $($(v).children(".ename")).attr("e-id"));
  });
}

function latagDays() {
  $($("#poa").nextAll()).remove();
  var addHeader = "";
  var addCells = "";
  var startString = _dateScope["firstDay"];
  var endString = _dateScope["lastDay"];
  var startDate = new Date(startString);
  var endDate = new Date(endString);
  while (startDate <= endDate) {
    addHeader += `<th data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" data-f-bold="true" date-val="${startDate.yyyymmdd()}" ${weekendcolor(startDate.yyyymmdd())} ${ifMonday(startDate.yyyymmdd())}>${startDate.yyyymmdd()}</th>`;
    addCells += `<td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" date-val="${startDate.yyyymmdd()}" ${weekendcolor(startDate.yyyymmdd())} ></td>`;
    startDate.setDate(startDate.getDate() + 1);
  }
  $("#poa").after(addHeader);
  $(".plan-row, .actual-row").append(addCells);
}

function ifMonday(date) {
  const newDate = new Date(date);
  if (newDate.getDay() == 1) {
    return "isMonday";
  }
}

function latagProjects(data) {
  $.each(data, function (pName, det) {
    $("#main-tbody").append(`
    <tr data-height="20" class="project-row bg-warning" proj-num="${det.pNum}">
    <th data-f-name="ＭＳ Ｐゴシック" data-fill-color="ffff99" data-b-a-s="thin" data-b-t-s="double" data-f-bold="true" class="pName" colspan="">${pName}</th>
    </tr>
    `);
    $.each(det.Items, function (itemName, iDet) {
      latagPDetails(iDet, itemName).forEach((element) => {
        $("#main-tbody").append(`<tr data-height="20" class="plan-row" job-num emp-num ${det.Direct ? "direct" : "indirect"}>
        ${element}
        </tr>
        <tr data-height="20" class="actual-row" job-num emp-num ${det.Direct ? "direct" : "indirect"}><td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" style="background-color: #ffccff" data-fill-color="ffccff">Actual</td>
        </tr>`);
      });
    });
  });
  createTable();
}

function latagPDetails(data, itemName) {
  const newArr = [];
  $.each(data, function (jobName, jDet) {
    $.each(jDet.Members, function (empID, eDet) {
      newArr.push(`<td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2" class="jname" job-num="${jDet.jobNum}">${jobName}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2">${itemName}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2">${jDet.dName}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2">${jDet.kic}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2" class="ename" e-id="${empID}" style="background-color: #ffccff;" data-fill-color="ffccff">${eDet.name}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2">${jDet.khiRequest}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2">${jDet.kdtDeadline}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2">${jDet.startDate}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2">${eDet.mUsed}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" rowspan="2" class="status">${eDet.pStatus}</td>
    <td data-f-name="ＭＳ Ｐゴシック" data-b-a-s="thin" style="background-color: #ccff99" data-fill-color="ccff99">Planned</td>`);
    });
  });
  return newArr;
}

function latagPlanning(data) {
  $.each(data, function (pName, pDets) {
    $.each(pDets.Items, function (iName, iDets) {
      $.each(iDets, function (jName, jDets) {
        $.each(jDets.Members, function (empId, eDets) {
          $.each(eDets.Dates, function (date, hours) {
            $(
              $(
                `.plan-row[job-num="${jDets.jobNum}"][emp-num="${empId}"]`
              ).children(`[date-val="${date}"]`)
            ).text(hours.Planned).css('background-color','#ccff99').attr('data-fill-color','ccff99');
            $(
              $(
                `.actual-row[job-num="${jDets.jobNum}"][emp-num="${empId}"]`
              ).children(`[date-val="${date}"]`)
            ).text(hours.Actual).css('background-color','#ffccff').attr('data-fill-color','ffccff');
          });
        });
      });
    });
  });
}

function weekendcolor(date) {
  var newDate = new Date(date);
  if (newDate.getDay() == 0 || newDate.getDay() == 6) {
    return ` class="bg-secondary" data-fill-color="d9d9d9"`;
  }
  return "";
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
  $("[date-val]").removeClass("bg-warning");
  $("#weekly-report").hide();
  $("#weekly-group-summary").hide();
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
    <tr data-height="20" class="wp-row" get-from="plan-row" emp-num="${element.empNum}">
    <td data-f-name="ＭＳ Ｐゴシック" rowspan="2">${element.empName}</td>
    <td data-f-name="ＭＳ Ｐゴシック">Plan</td>
    <td data-f-name="ＭＳ Ｐゴシック" rowspan="2" class="pa-percent"></td>
    <td data-f-name="ＭＳ Ｐゴシック" class="w-tot"></td>
    </tr>
    <tr data-height="20" class="wa-row" get-from="actual-row" emp-num="${element.empNum}">
    <td data-f-name="ＭＳ Ｐゴシック">Actual</td>
    <td data-f-name="ＭＳ Ｐゴシック" class="w-tot"></td></tr>
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
      `<th data-f-name="ＭＳ Ｐゴシック" w-date-val="${currentDate.yyyymmdd()}">${currentDate.yyyymmdd()}</th>`
    );
    $(".wp-row").append(
      `<td data-f-name="ＭＳ Ｐゴシック" class="pa-details" w-date-val="${currentDate.yyyymmdd()}"></td>`
    );
    $(".wa-row").append(
      `<td data-f-name="ＭＳ Ｐゴシック" class="pa-details" w-date-val="${currentDate.yyyymmdd()}"></td>`
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
  var arr = $(`.${pa}[emp-num="${empNum}"][direct]`).children(`[date-val="${date}"]`);
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
    var tVal = 
    Number(
      eval(
        `${$($(val).next()).text()}/${$(
          $($($(val).parent()).next()).children(".w-tot")
        ).text()}*100`
      )
    ).toFixed(2);

    $(val).text(tVal + "%");
    if($(val).text() == "NaN%"){
      $(val).text("0.00%")
    }
  });
}

//#endregion

//#endregion


//#region  new update

//option sa baba

$(document).on('click', '.repSel', function () {
  switch ($(this).attr('id')) {
    case "GroupRep":
      $('#wb-div, #weekly-report').hide();
      $('#weekly-group-summary').show();
      break;
    case "MemberRep":
      $('#wb-div').show();
      $('#weekly-group-summary').hide();
      if ($('#weekSel').val() != "") {
        $('#weekly-report').show();
      }
      break;
  }
})


//pang gawa ng baba

function gawaBaba() {
  $('#weekly-group-summary').show();
  $($('.c1-label').nextAll()).remove()
  $('#tr-group-2').empty();
  $.each($('[isMonday]'), function (indexInArray, valueOfElement) {
    $('#tr-group-1').append(`
      <th data-f-name="ＭＳ Ｐゴシック" colspan="3" class="week-start">${$(valueOfElement).text()}</th>
      `);
    $('#tr-group-2').append(`
      <th data-f-name="ＭＳ Ｐゴシック">JMR</th>
      <th data-f-name="ＭＳ Ｐゴシック">入力工数(A) グループ</th>
      <th data-f-name="ＭＳ Ｐゴシック">実績工数(B) A/B(%)</th>
      `);
    $('#data-plan, #data-actual').append(`
      <td data-f-name="ＭＳ Ｐゴシック" week-index="${indexInArray}" col-ref="a"></td>
      <td data-f-name="ＭＳ Ｐゴシック" week-index="${indexInArray}" col-ref="b"></td>
      <td data-f-name="ＭＳ Ｐゴシック" week-index="${indexInArray}" col-ref="c"></td>
      `);
  });

  //total inputs
  $.each($('.week-start'), function (weekIndex, monday) {
    var planVal = 0;
    var actualVal = 0;
    var indirectVal = 0;
    for (let x = 0; x <= 6; x++) {
      const newDate = new Date($(monday).text());
      newDate.setDate(newDate.getDate() + x);
      $.each($('.plan-row[direct]').children(`[date-val="${newDate.yyyymmdd()}"]`), function (indexInArray, dayVal) {
        planVal += parseFloat($(dayVal).text() == "" ? 0 : $(dayVal).text())
      });
      $.each($('.actual-row[direct]').children(`[date-val="${newDate.yyyymmdd()}"]`), function (indexInArray, dayVal) {
        actualVal += parseFloat($(dayVal).text() == "" ? 0 : $(dayVal).text())
      });
      $.each($('[indirect]').children(`[date-val="${newDate.yyyymmdd()}"]`), function (indexInArray, dayVal) {
        indirectVal += parseFloat($(dayVal).text() == "" ? 0 : $(dayVal).text())
      });
    }
    var bVal = parseFloat(actualVal) + parseFloat(indirectVal);

    $($('#data-plan').children(`[week-index="${weekIndex}"][col-ref="a"]`)).text(planVal);
    $($('#data-plan').children(`[week-index="${weekIndex}"][col-ref="b"]`)).text(bVal);
    $($('#data-plan').children(`[week-index="${weekIndex}"][col-ref="c"]`)).text(
      Number(
        eval(
          `${planVal}/${bVal}*100`
        )
      ).toFixed(2) + "%"
    );

    $($('#data-actual').children(`[week-index="${weekIndex}"][col-ref="a"]`)).text(actualVal);
    $($('#data-actual').children(`[week-index="${weekIndex}"][col-ref="b"]`)).text(bVal);
    $($('#data-actual').children(`[week-index="${weekIndex}"][col-ref="c"]`)).text(
      Number(
        eval(
          `${actualVal}/${bVal}*100`
        )
      ).toFixed(2) + "%"
    );

  });

}

//export
$(document).on('click','#btnExport',function(){
  TableToExcel.convert(document.getElementById("main-table"), {
    name: `Drawing Monitoring Report - ${$('#buSel').val()}_${$('#monthSel').val()}.xlsx`,
    sheet: {
      name: $('#buSel').val()
    }
  });
});

//#endregion