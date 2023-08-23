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

  $.ajaxSetup({ async: true });

  // createTables($("#monthSel").val());
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
  createTables($("#monthSel").val());
});

$(document).on("click", ".memBtn", function () {
  $(this).toggleClass("btn-primary btn-secondary");
  _selectedMembers.length = 0;
  $(".memBtn.btn-primary").each(function () {
    _selectedMembers.push($(this).attr("emp-num"));
  });
  var allButtonsSelected = $(".memBtn").length === $(".memBtn.btn-primary").length;
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
$(document).on('click', '#btnExport', function(){
  exportTable();
})
$(document).on("click", "#btnPrint", function () {
  $(".xPrint").toggle();
  $(".lower").toggleClass("lower lower_");
  print();
  $(".lower_").toggleClass("lower lower_");
  $(".xPrint").toggle();
});
$(document).on("change", "#CO", function () {
  createTables($("#monthSel").val());
})
// $(document).on("change", "#checkBoxEme", function () { //eto uuncomment tas papalitan id pag may checkbox na
//   createTables($("#monthSel").val());
// })
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
function getGroupList() {
  $("#buSel").empty();
  $.post("ajax/get_group_list.php",
  {
    empNum : _empDetails['empNum'],
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
//#region table creation
function createTables(ymVal) {
  _grpProj = [];
  _grpOT = [];
  var groupSel = $(`#buSel`).val();
  var halfSel = $(`#CO`).val();
  var getOGP = false; //eto papalitan pag may checkbox na
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
      getOGP: getOGP
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
      colorYellow();
      colorWeekends(ymVal.split("-")[0],ymVal.split("-")[1]);
    }
  );
  // console.log(_selectedMembers);
}

function createHeader() {
  var addDates = "";
  for (let x = 1; x <= _maxDays; x++) {
    addDates += `<th data-fill-color="00ffff" data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${x.toString().padStart(2, "0")}</th>`;
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
  var memh= $('#mainTable th:first-child').outerWidth()
  var projh= $('#mainTable th:nth-child(2)').outerWidth()
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
  $("#mainTbody").append(`<tr data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" class="emprow" employee-number="${empDetails}">
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${empName}</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">Project and Job Name</td>
    <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" colspan="${_maxDays + 1}"></td>
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

function fillTable(entry) {//ETOBAGUHIN MO NEXT WEEK
  var currentHours = 0;
  if (!Leaves.includes(entry["pIndex"])) {
    currentHours=parseFloat($($(`.pRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`).children()[parseInt(entry["entryDate"]) + 1]).text()) || 0;
    currentHours += parseFloat(entry["hours"]);
    $($(`.pRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`).children()[parseInt(entry["entryDate"]) + 1]).text(`${currentHours}`);
    if(entry["OT"]){
      $($(`.oRow[p-index="${entry["pIndex"]}"][employee-number="${entry["empNum"]}"]`).children()[parseInt(entry["entryDate"]) + 1]).text(entry["hours"]);
    }
  } else {
    if (oLeaves.hasOwnProperty(entry["iIndex"])) {
      $(
        $(
          `.lRow[p-index="others"][employee-number="${entry["empNum"]}"]`
        ).children()[parseInt(entry["entryDate"]) + 1]
      ).text(entry["hours"]);
    }
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
    if($(this).attr("i-index")){
      getlRows = $(`.lRow[i-index="${$(this).attr("i-index")}"]`);
    }
    else{
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
function colorYellow(){
  var myClass = [`tTot`,`oTot`,`lRow`,`lTot`,`gtTot`,`goTot`,`glRow`,`glTot`];
  myClass.forEach(element => {
    $(`.${element}`).each(function () {
      for (let x = 1; x < $(this).children().length; x++) {
        $($(this).children()[x]).attr('data-fill-color','FFFF00');
      }
    });
  });
}

function colorWeekends(year,month){
  _sundays = getSundays(year,month);
  _saturdays = getSaturdays(year,month);
  for (let x = 2; x < $(`#mainThead`).children().length; x++) {
    if(_sundays.includes(x-1)){
      $($(`#mainThead`).children()[x]).attr('data-fill-color','00ff00');
    }
    if(_saturdays.includes(x-1)){
      $($(`#mainThead`).children()[x]).attr('data-fill-color','ccff99');
    }
  }
  var mySelectors = [`#mainThead`,`#subThead`,`.pRow`,`.gpRow`,`.oRow`,`.goRow`,`.tTot`,`.oTot`,`.lRow`,`.lTot`,`.gtTot`,`.goTot`,`.glRow`,`.glTot`];
  mySelectors.forEach(element => {
    $(`${element}`).each(function () {
      for (let x = 2; x < $(this).children().length; x++) {
        if(_sundays.includes(x-1)){
          $($(this).children()[x]).attr('data-fill-color','00ff00');
        }
        if(_saturdays.includes(x-1)){
          $($(this).children()[x]).attr('data-fill-color','ccff99');
        }
      }
    });
  });
}
function getSundays(year,month){
  var firstDayOfMonth = new Date(year, month - 1, 1);
  var lastDayOfMonth = new Date(year, month, 0);
  var sundays = [];

  for (let day = firstDayOfMonth.getDate(); day <= lastDayOfMonth.getDate(); day++) {
    var currentDate = new Date(year, month - 1, day);
    var dayOfWeek = currentDate.getDay(); // Sunday (0) to Saturday (6)

    if (dayOfWeek === 0) {
      sundays.push(day);
    }
  }
  return sundays;
}
function getSaturdays(year,month){
  var firstDayOfMonth = new Date(year, month - 1, 1);
  var lastDayOfMonth = new Date(year, month, 0);
  var saturdays = [];

  for (let day = firstDayOfMonth.getDate(); day <= lastDayOfMonth.getDate(); day++) {
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
  var colsP = _maxDays+3;
  $('#mainTable').append(`<tr id='fromHereAdd' class='w3-gray'><td colspan="${colsP}" data-fill-color="808080" data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center"></td></tr>`,$('#subTable').html());
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
    name: `MonthlyStandard_${$("#buSel").val()}_${$("#monthSel").val()}.xlsx`,
    sheet: {
      name: `${$("#buSel").val()}_${$("#monthSel").val()}`,
    },
  });
  $($('#fromHereAdd').nextAll()).remove();
  $('#fromHereAdd').remove();
  $(`#grpTotTitle`).text(``);
  // $(".fx").remove();
  // $("#mainTable").addClass("ayos");
}
//#endregion
//#endregion
