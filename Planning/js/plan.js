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
var empDetails = [];
var editID = "";
var deleteID = "";
var TRow = "";
var _selectedEmployees = [];

//#endregion
checkLogin();
//#region BINDS
$(document).ready(function () {
  //page Initialize Event
  $(".hello-user").text(empDetails["empFName"]);
  ifSmallScreen();
  getMyGroups();
  sequenceValidation();
  sequenceEditValidation();
  dateValidation();
  getPlans();
  getFilters();

  //#region sidebarshits
  let arrow = document.querySelectorAll(".arrow");

  for (var i = 0; i < arrow.length; i++) {
    arrow[i].addEventListener("click", (e) => {
      let arrowParent = e.target.parentElement.parentElement; //selecting main parent of arrow
      arrowParent.classList.toggle("showMenu");
    });
  }
  let ey = document.querySelectorAll(".ey");

  for (var i = 0; i < ey.length; i++) {
    ey[i].addEventListener("click", (e) => {
      let aey = e.target.parentElement.parentElement.parentElement; //selecting main parent of arrow
      aey.classList.toggle("showMenu");
    });
  }

  let sidebar = document.querySelector(".sidebar");
  let sidebarBtn = document.querySelector(".menu-one");
  let sidebarBtn2 = document.querySelector(".menu-two");
  // console.log(sidebarBtn);
  sidebarBtn.addEventListener("click", () => {
    $(".sidebar").toggleClass("close");
    // console.log("pinindot")
  });
  sidebarBtn2.addEventListener("click", () => {
    $(".sidebar").addClass("close");
  });
  //#endregion
  $(".cs-loader").fadeOut(1000);
});

$(document).on("change", "#idGroup", function () {
  //select Group Event
  $("#idProject").val(null).change();
  getProjects();
  $("#p1").text("");
  $(this).removeClass("border-danger");
  $(".iow").removeClass("active");
});
$(document).on("change", "#idGroupEdit", function () {
  //select Group Event
  $("#idProjectEdit").val(null).change();
  getEditProjects();
  $("#e1").text("");
  $(this).removeClass("border-danger");
  $("#editPlanningEntry .iow").removeClass("active");
});

$(document).on("change", "#idProject", function () {
  //select Project Event
  removeSelected();
  var projID = $($(this).find("option:selected")).attr("proj-id"); //get ID of selected Project
  $("#idJRD").val(null).change(); //clear Job Request Description
  $("#idItem").val(null).change();
  if ($("#idItem").val() == null || $("#idItem").val() == "") {
    $("#idItem")
      .empty()
      .append(
        `<option selected hidden disabled value="">Select Item of Works</option>`
      );
  }
  getItems(projID);
  getEmployees();
  $(".iow").removeClass("active");
  $("#p2").text("");
  $(this).removeClass("border-danger");
});

$(document).on("change", "#idProjectEdit", function () {
  //select Project Event
  var projID = $($(this).find("option:selected")).attr("proj-id"); //get ID of selected Project
  $("#idJRDEdit").val(""); //clear Job Request Description
  $("#idItemEdit").val(null).change();
  if ($("#idItemEdit").val() == null || $("#idItem").val() == "") {
    $("#idItemEdit")
      .empty()
      .append(
        `<option selected hidden disabled value="">Select Item of Works</option>`
      );
  }
  getEditItems(projID);
  getEmployees();
  $("#editPlanningEntry .iow").removeClass("active");
  $("#e2").text("");
  $(this).removeClass("border-danger");
});

$(document).on("change", "#idItem", function () {
  //select Item Event
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  var itemID = $($(this).find("option:selected")).attr("item-id");

  getJobs(projID, itemID);
  // getJRDSearch(projID,itemID);
  $("#p3").text("");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#idItemEdit", function () {
  //select Item Event
  var projID = $($("#idProjectEdit").find("option:selected")).attr("proj-id");
  var itemID = $($(this).find("option:selected")).attr("item-id");

  getEditJobs(projID, itemID);
  // getJRDSearch(projID,itemID);
  $("#e3").text("");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#idJRD", function () {
  $("#p4").text("");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#idJRDEdit", function () {
  $("#e4").text("");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#idEmp option", function () {
  var selected = $("#idEmp").val();
  var selectedID = $(this).attr(`emp-id`);
  $("#p5").text("");
  $(this).removeClass("border-danger");
  $(".empviewer").append(`
    <span class='mx-1' emp-id = '${selectedID}' >
      ${selected}
      <i class="bx bx-x text-light removeEmp"></i>
    </span>`);
  //if nasa .empviewer na sya alisin na sa selection.
});
$(document).on("change", "#idEmpEdit", function () {
  $("#e5").text("");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#idStartDate", function () {
  //select Date Event
  $("#p6").text("");
  $(this).removeClass("border-danger");
  dateValidation();
});
$(document).on("click", ".removeEmp", function () {
  var removeID = $($(this).parent()).attr(`emp-id`);
  var index = _selectedEmployees.indexOf(removeID);
  if (index !== -1) {
    _selectedEmployees.splice(index, 1);
  }
  $($(this).parent()).remove();
  getEmployees();
});
$(document).on("change", "#idStartDateEdit", function () {
  //select Date Event
  $("#e6").text("");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#idEndDate", function () {
  //select Date Event
  $("#p7").text("");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#idEndDateEdit", function () {
  //select Date Event
  $("#e7").text("");
  $(this).removeClass("border-danger");
});

$(document).on("change", "#idMH", function () {
  $("#p8").text("");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#idMHEdit", function () {
  $("#e8").text("");
  $(this).removeClass("border-danger");
});

$(document).on("click", "#idAdd", function () {
  addEntries();
});
$(document).on("click", " #idEdit", function () {
  editEntries();
});

$(document).on("click", "#idProject", function (event) {
  event.stopPropagation();
  $(".proj").toggleClass("active");
  $(".jord").removeClass("active");
  $(".iow").removeClass("active");
  $(".empl").removeClass("active");
  $(this).blur();
});
$(document).on("click", "#idProjectEdit", function (event) {
  event.stopPropagation();
  $(".proj").toggleClass("active");
  $(".jord").removeClass("active");
  $(".iow").removeClass("active");
  $(this).blur();
});

$(document).on("click", "body", function (event) {
  if (
    !$(".proj .content").is(event.target) &&
    $(".proj .content").has(event.target).length === 0
  ) {
    $(".proj").removeClass("active");
  }

  if (
    !$(".iow .content").is(event.target) &&
    $(".iow .content").has(event.target).length === 0
  ) {
    $(".iow").removeClass("active");
  }

  if (
    !$(".jord .content").is(event.target) &&
    $(".jord .content").has(event.target).length === 0
  ) {
    $(".jord").removeClass("active");
  }
  if (
    !$(".empl .content").is(event.target) &&
    $(".empl .content").has(event.target).length === 0
  ) {
    $(".empl").removeClass("active");
  }
});

$(document).on("click", "#projOptions li", function () {
  $(".proj").removeClass("active");
  var projID = $(this).attr("proj-id");
  $($("#idProject").find(`option[proj-id=${projID}]`))
    .prop("selected", true)
    .change();
});
$(document).on("click", "#projOptionsEdit li", function () {
  $("#editPlanningEntry .proj").removeClass("active");
  var projID = $(this).attr("proj-id");
  $($("#idProjectEdit").find(`option[proj-id=${projID}]`))
    .prop("selected", true)
    .change();
});

$(document).on("keyup", "#searchproj", function () {
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  getProjSearch();
});
$(document).on("search", "#searchproj", function () {
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  getProjSearch();
});
$(document).on("keyup", "#searchprojEdit", function () {
  var projID = $($("#idProjectEdit").find("option:selected")).attr("proj-id");
  getEditProjSearch();
});
$(document).on("search", "#searchprojEdit", function () {
  var projID = $($("#idProjectEdit").find("option:selected")).attr("proj-id");
  getEditProjSearch();
});

$(document).on("click", "#idItem", function (event) {
  event.stopPropagation();
  $(".iow").toggleClass("active");
  $(".proj").removeClass("active");
  $(".jord").removeClass("active");
  $(".empl").removeClass("active");
  $(this).blur();
});
$(document).on("click", "#idItemEdit", function (event) {
  event.stopPropagation();
  $(".iow").toggleClass("active");
  $(".proj").removeClass("active");
  $(".jord").removeClass("active");
  $(this).blur();
});

$(document).on("click", "#itemOptions li", function () {
  $(".iow").removeClass("active");
  var itemID = $(this).attr("item-id");
  $($("#idItem").find(`option[item-id=${itemID}]`))
    .prop("selected", true)
    .change();
});
$(document).on("click", "#itemOptionsEdit li", function () {
  $("#editPlanningEntry .iow").removeClass("active");
  var itemID = $(this).attr("item-id");
  $($("#idItemEdit").find(`option[item-id=${itemID}]`))
    .prop("selected", true)
    .change();
});

$(document).on("keyup", "#searchitem", function () {
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  getItemSearch(projID);
});
$(document).on("search", "#searchitem", function () {
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  getItemSearch(projID);
});

$(document).on("keyup", "#searchitemEdit", function () {
  var projID = $($("#idProjectEdit").find("option:selected")).attr("proj-id");
  getEditItemSearch(projID);
});
$(document).on("search", "#searchitemEdit", function () {
  var projID = $($("#idProjectEdit").find("option:selected")).attr("proj-id");
  getEditItemSearch(projID);
});

$(document).on("click", "#idJRD", function (event) {
  event.stopPropagation();
  $(".jord").toggleClass("active");
  $(".iow").removeClass("active");
  $(".proj").removeClass("active");
  $(".empl").removeClass("active");
  $(this).blur();
});

$(document).on("click", "#idJRDEdit", function (event) {
  event.stopPropagation();
  $(".jord").toggleClass("active");
  $(".iow").removeClass("active");
  $(".proj").removeClass("active");
  $(this).blur();
});
$(document).on("click", "#jrdOptions li", function () {
  $(".jord").removeClass("active");
  var jrdID = $(this).attr("job-id");
  $($("#idJRD").find(`option[job-id=${jrdID}]`))
    .prop("selected", true)
    .change();
});
$(document).on("click", "#jrdOptionsEdit li", function () {
  $("#editPlanningEntry .jord").removeClass("active");
  var jrdID = $(this).attr("job-id");
  $($("#idJRDEdit").find(`option[job-id=${jrdID}]`))
    .prop("selected", true)
    .change();
});
$(document).on("keyup", "#searchjrd", function () {
  var itemID = $($("#idItem").find("option:selected")).attr("item-id");
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");

  getJRDSearch(projID, itemID);
});
$(document).on("keyup", "#searchjrdEdit", function () {
  var itemID = $($("#idItemEdit").find("option:selected")).attr("item-id");
  var projID = $($("#idProjectEdit").find("option:selected")).attr("proj-id");

  getEditJRDSearch(projID, itemID);
});
$(document).on("search", "#searchjrd", function () {
  var itemID = $($("#idItem").find("option:selected")).attr("item-id");
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");

  getJRDSearch(projID, itemID);
});
$(document).on("search", "#searchjrdEdit", function () {
  var itemID = $($("#idItemEdit").find("option:selected")).attr("item-id");
  var projID = $($("#idProjectEdit").find("option:selected")).attr("proj-id");

  getEditJRDSearch(projID, itemID);
});

$(document).on("click", "#idEmp", function (event) {
  event.stopPropagation();
  $(".empl").toggleClass("active");
  $(".jord").removeClass("active");
  $(".iow").removeClass("active");
  $(".proj").removeClass("active");
  $(this).blur();
});

$(document).on("click", "#empOptions li", function () {
  $(".empl").removeClass("active");
  var empid = $(this).attr("emp-id");
  $($("#idEmp").find(`option[emp-id=${empid}]`))
    .prop("selected", true)
    .change();
  _selectedEmployees.push(empid);
  $(`#searchemp`).val("").change();
  getEmployees();
});

$(document).on("search", "#searchemp", function () {
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");

  getEmpSearch();
});
$(document).on("keyup", "#searchemp", function () {
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");

  getEmpSearch();
});

$(document).on("click", ".badge", function () {
  var planID = $(this).closest("tr").attr("plan-id");
  var getTR = $(this).closest("tr");
  editID = planID;
  TRow = getTR;
  $("#editStatus").modal("show");
});
$(document).on("click", "#idEditStatus", function () {
  $("#editStatus").modal("hide");
  updateStatus();
});
$(document).on("click", ".editPlanningButton", function () {
  var planID = $(this).closest("tr").attr("plan-id");
  editID = planID;
  getEdeets(planID);
});
$(document).on("click", ".deletePlanningButton", function () {
  var planID = $(this).closest("tr").attr("plan-id");
  deleteID = planID;
});
$(document).on("click", "#confirmDeleteEntry", function () {
  deletePlannedEntry(deleteID);
});
$(document).on("click", ".cancel", function () {
  resetEntry();
});
$(document).on("click", ".cancel1", function () {
  resetEditEntry();
});
$(document).on("keyup", "#searchEmployee", function () {
  getPlans();
});
$(document).on("search", "#searchEmployee", function () {
  getPlans();
});
$(document).on("change", "#searchSDate", function () {
  getPlans();
});
$(document).on("change", "#filterStatus", function () {
  getPlans();
});
$(document).on("change", "#filterGroup", function () {
  getPlans();
});
$(document).on("change", "#filterProject", function () {
  getPlans();
});
$(document).on("change", "#filterItem", function () {
  getPlans();
});
$(document).on("change", "#filterJRD", function () {
  getPlans();
});
//#endregion

//#region FUNCTIONS
function checkLogin() {
  //check if user is logged in
  $.ajaxSetup({ async: false });
  $.ajax({
    url: "Includes/check_login.php",
    success: function (data) {
      //ajax to check if user is logged in
      empDetails = $.parseJSON(data);

      if (Object.keys(empDetails).length < 1) {
        window.location.href = rootFolder + "/KDTPortalLogin"; //if result is 0, redirect to log in page
      }
      planAccess();
    },
  });
  $.ajaxSetup({ async: true });
}
function planAccess() {
  $.post(
    "ajax/plan_access.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var access = $.parseJSON(data);
      if (!access) {
        alert("Access denied");
        window.location.href = "../DailyReport";
      }
    }
  );
}
function getMyGroups() {
  //get Group Selection
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_my_groups.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      $("#idGroup").html(data);
      $("#idGroupEdit").html(data);
    }
  );
  $.ajaxSetup({ async: true });
}
function getEmployees() {
  $(`#idEmp`).empty();
  $(`#idEmpEdit`).empty();
  $(`#empOptions`).empty();
  $(`#idEmp`).html(`<option hidden="">Select Employee</option>`);
  $(`#idEmpEdit`).html(`<option hidden="">Select Employee</option>`);
  var projID =
    $($("#idProject").find("option:selected")).attr("proj-id") ||
    $($("#idProjectEdit").find("option:selected")).attr("proj-id");
  var emps = [];

  var searchemp = $(`#searchemp`).val();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_employees.php",
    {
      projID: projID,
      searchemp: searchemp,
      selectedEmps: _selectedEmployees,
    },
    function (data) {
      emps = $.parseJSON(data);
      emps.map(fillEmployee);
    }
  );
  $.ajaxSetup({ async: true });
}
function fillEmployee(empDeets) {
  var empDts = empDeets.split("||");
  var addString = `<li emp-id='${empDts[0]}'>${empDts[1]}</li>`;
  var addStringMain = `<option hidden emp-id='${empDts[0]}'>${empDts[1]}</option>`;

  $(`#idEmp`).append(addStringMain);
  $(`#idEmpEdit`).append(addStringMain);
  $(`#empOptions`).append(addString);
}

function getEmpSearch() {
  //get Proj Selection
  $("#idEmp").empty();
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  var emps = [];
  var searchemp = $(`#searchemp`).val();
  $("#empOptions").empty();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_employees.php",
    {
      projID: projID,
      searchemp: searchemp,
      selectedEmps: _selectedEmployees,
    },
    function (data) {
      emps = $.parseJSON(data);
      emps.map(fillEmployee);
    }
  );
  $.ajaxSetup({ async: true });
}
function addRow(iVal) {
  //map Entries for display
  // ["primary_id||location||group||project||item||description||hour||mht"]
  var pId = iVal.split("||")[0];
  var loc = iVal.split("||")[1];
  var group = iVal.split("||")[2];
  var project = iVal.split("||")[3];
  var item = iVal.split("||")[4];
  var desc = iVal.split("||")[5];
  var hour = parseFloat(iVal.split("||")[6]);
  var mht = iVal.split("||")[7];
  var rmrks = iVal.split("||")[8];
  var del = ``;
  if (iVal.split("||")[9] == 1) {
    del = `<strong>(Deleted)</strong>`;
  }
  const mhtyp = ["Regular", "OT", "Leave"];
  switch (mht) {
    case "0":
      regCount += hour;
      break;
    case "1":
      otCount += hour;
      break;
    case "2":
      lvCount += hour;
      break;
    default:
      alert("WTF");
      break;
  }
  var addString = `
    <tr id="${mht}_${pId}" title="${rmrks}" >
    <td>${loc}</td>
    <td>${group}</td>
    <td>${del}${project}</td>
    <td>${item}</td>
    <td>${desc}</td>
    <td>${parseFloat(hour / 60).toFixed(2)}</td>
    <td>${mhtyp[mht]}</td>
    <td class="d-flex"><button class="btn btn-primary action selectBut" id="selectBut" title="Duplicate Items"><i class="text-light  bx bx-duplicate"></i></button><button class="btn btn-warning action edit" title="Edit" edit-entry><i class="fa fa-pencil"></i></button><button class="btn btn-danger action delBut" title="Delete"><i class="text-light fa fa-trash"></i></button>
    </td>
    </tr>
    `;
  $("#drEntries").append(addString);
}
function sequenceValidation() {
  //sequence Checking Project->Item->Job
  $("#idProject").prop("disabled", true);
  $("#idItem").prop("disabled", true);
  $("#idJRD").prop("disabled", true);
  $("#idEmp").prop("disabled", true);

  if ($("#idItem").prop("selectedIndex") > 0) {
    $("#idJRD").prop("disabled", false);
    $("#idEmp").prop("disabled", false);
  }
  if ($("#idProject").prop("selectedIndex") > 0) {
    $("#idItem").prop("disabled", false);
  }

  if ($("#idGroup").prop("selectedIndex") > 0) {
    $("#idProject").prop("disabled", false);
  }
}
function sequenceEditValidation() {
  //sequence Checking Project->Item->Job
  $("#idProjectEdit").prop("disabled", true);
  $("#idItemEdit").prop("disabled", true);
  $("#idJRDEdit").prop("disabled", true);
  $("#idEmpEdit").prop("disabled", true);
  if ($("#idItemEdit").prop("selectedIndex") > 0) {
    $("#idJRDEdit").prop("disabled", false);
  }
  if ($("#idProjectEdit").prop("selectedIndex") > 0) {
    $("#idItemEdit").prop("disabled", false);
    $("#idEmpEdit").prop("disabled", false);
  }
  if ($("#idGroupEdit").prop("selectedIndex") > 0) {
    $("#idProjectEdit").prop("disabled", false);
  }
}

function getProjects() {
  //get PROJECT Selection
  var proj = [];
  $("#projOptions").empty();
  $("#idProject").html(`<option value='' hidden>Select Project</option>`);

  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_projects.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroup").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
    },
    function (data) {
      proj = $.parseJSON(data);
      proj.map(fillProj);
      sequenceValidation();
    }
  );
  $.ajaxSetup({ async: true });
}

function getEditProjects() {
  //get edit PROJECT Selection
  var proj = [];
  $("#projOptionsEdit").empty();
  $("#idProjectEdit").html(`<option value='' hidden>Select Project</option>`);

  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_projects.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroupEdit").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
    },
    function (data) {
      proj = $.parseJSON(data);
      proj.map(fillEditProj);
      sequenceEditValidation();
    }
  );
  $.ajaxSetup({ async: true });
}

function fillProj(iVal) {
  var projDeets = iVal.split("||");
  var addString = `<li proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</li>`;
  var addStringMain = `<option hidden proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</option>`;
  $(`#projOptions`).append(addString);
  $(`#idProject`).append(addStringMain);
}

function fillEditProj(iVal) {
  var projDeets = iVal.split("||");
  var addString = `<li proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</li>`;
  var addStringMain = `<option hidden proj-id='${projDeets[0]}'>${projDeets[1]}${projDeets[2]}</option>`;
  $(`#projOptionsEdit`).append(addString);
  $(`#idProjectEdit`).append(addStringMain);
}

function getProjSearch() {
  //get Proj Selection
  var proj = [];
  var searchProj = $(`#searchproj`).val();
  $("#projOptions").empty();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_projects.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroup").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      searchProj: searchProj,
    },
    function (data) {
      proj = $.parseJSON(data);
      proj.map(fillProj);
    }
  );
  $.ajaxSetup({ async: true });
}

function getEditProjSearch() {
  //get Proj Selection
  var proj = [];
  var searchProj = $(`#searchprojEdit`).val();
  $("#projOptionsEdit").empty();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_projects.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroupEdit").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      searchProj: searchProj,
    },
    function (data) {
      proj = $.parseJSON(data);
      proj.map(fillEditProj);
    }
  );
  $.ajaxSetup({ async: true });
}

function getItems(iVal) {
  //get Item Selection
  var itms = [];
  $("#itemOptions").empty();
  $("#idItem").html(`<option value='' hidden>Select Item of Works</option>`);
  $("#labell").remove();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_items.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroup").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      projID: iVal,
    },
    function (data) {
      itms = $.parseJSON(data);
      itms.map(fillItem);
      sequenceValidation();
    }
  );
  $.ajaxSetup({ async: true });
}

function getEditItems(iVal) {
  //get Item Selection
  var itms = [];
  $("#itemOptionsEdit").empty();
  $("#idItemEdit").html(
    `<option value='' hidden>Select Item of Works</option>`
  );
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_items.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroupEdit").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      projID: iVal,
    },
    function (data) {
      itms = $.parseJSON(data);
      itms.map(fillEditItem);
      sequenceEditValidation();
    }
  );
  $.ajaxSetup({ async: true });
}

function fillItem(iVal) {
  var itemDeets = iVal.split("||");
  var addString = `<li item-id='${itemDeets[0]}'>${itemDeets[1]}</li>`;
  var addStringMain = `<option hidden item-id='${itemDeets[0]}'>${itemDeets[1]}</option>`;
  $(`#itemOptions`).append(addString);
  $(`#idItem`).append(addStringMain);
}

function fillEditItem(iVal) {
  var itemDeets = iVal.split("||");
  var addString = `<li item-id='${itemDeets[0]}'>${itemDeets[1]}</li>`;
  var addStringMain = `<option hidden item-id='${itemDeets[0]}'>${itemDeets[1]}</option>`;
  $(`#itemOptionsEdit`).append(addString);
  $(`#idItemEdit`).append(addStringMain);
}
function getItemSearch(iVal) {
  //get Item Selection
  var itms = [];
  var searchIOW = $(`#searchitem`).val();
  $("#itemOptions").empty();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_items.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroup").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      projID: iVal,
      searchIOW: searchIOW,
    },
    function (data) {
      itms = $.parseJSON(data);
      itms.map(fillItem);
    }
  );
  $.ajaxSetup({ async: true });
}
function getEditItemSearch(iVal) {
  //get Item Selection
  var itms = [];
  var searchIOW = $(`#searchitemEdit`).val();
  $("#itemOptionsEdit").empty();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_items.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroupEdit").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      projID: iVal,
      searchIOW: searchIOW,
    },
    function (data) {
      itms = $.parseJSON(data);
      itms.map(fillEditItem);
    }
  );
  $.ajaxSetup({ async: true });
}

function getJobs(iVal, xVal) {
  //get Item Selection
  var jobs = [];
  $("#jrdOptions").empty();
  $("#idJRD").html(
    `<option value='' hidden>Select Job Request Description</option>`
  );
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_jobs.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroup").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      projID: iVal,
      itemID: xVal,
    },
    function (data) {
      jobs = $.parseJSON(data);
      jobs.map(fillJobs);
      sequenceValidation();
    }
  );
  $.ajaxSetup({ async: true });
}
function getEditJobs(iVal, xVal) {
  //get Item Selection
  var jobs = [];
  $("#jrdOptionsEdit").empty();
  $("#idJRDEdit").html(
    `<option value='' hidden>Select Job Request Description</option>`
  );
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_jobs.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroupEdit").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      projID: iVal,
      itemID: xVal,
    },
    function (data) {
      jobs = $.parseJSON(data);
      jobs.map(fillEditJobs);
      sequenceEditValidation();
    }
  );
  $.ajaxSetup({ async: true });
}

function fillJobs(iVal) {
  var jrdDeets = iVal.split("||");
  var addString = `<li job-id='${jrdDeets[0]}'>${jrdDeets[1]}</li>`;
  var addStringMain = `<option hidden job-id='${jrdDeets[0]}'>${jrdDeets[1]}</option>`;
  $(`#jrdOptions`).append(addString);
  $(`#idJRD`).append(addStringMain);
}
function fillEditJobs(iVal) {
  var jrdDeets = iVal.split("||");
  var addString = `<li job-id='${jrdDeets[0]}'>${jrdDeets[1]}</li>`;
  var addStringMain = `<option hidden job-id='${jrdDeets[0]}'>${jrdDeets[1]}</option>`;
  $(`#jrdOptionsEdit`).append(addString);
  $(`#idJRDEdit`).append(addStringMain);
}
function getJRDSearch(iVal, xVal) {
  //get Item Selection
  var jrd = [];
  var searchjrd = $(`#searchjrd`).val();
  $("#jrdOptions").empty();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_jobs.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroup").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      projID: iVal,
      itemID: xVal,
      searchjrd: searchjrd,
    },
    function (data) {
      jrd = $.parseJSON(data);
      jrd.map(fillJobs);
    }
  );
  $.ajaxSetup({ async: true });
}
function getEditJRDSearch(iVal, xVal) {
  //get Item Selection
  var jrd = [];
  var searchjrd = $(`#searchjrdEdit`).val();
  $("#jrdOptionsEdit").empty();
  $.ajaxSetup({ async: false });
  $.post(
    "ajax/get_jobs.php",
    {
      // empGroup:empDetails['empGroup'],
      empGroup: $("#idGroupEdit").val(),
      empNum: empDetails["empNum"],
      empPos: empDetails["empPos"],
      projID: iVal,
      itemID: xVal,
      searchjrd: searchjrd,
    },
    function (data) {
      jrd = $.parseJSON(data);
      jrd.map(fillEditJobs);
    }
  );
  $.ajaxSetup({ async: true });
}

function isStartGreaterThanEnd(startDate, endDate) {
  var sdate = new Date(startDate);
  var edate = new Date(endDate);
  if (sdate <= edate) {
    return true;
  }
  return false;
}
function dateValidation() {
  $("#idEndDate").prop("disabled", true);
  var startDate = $("#idStartDate").val();
  var endDate = $("#idEndDate").val();
  if (!isStartGreaterThanEnd(startDate, endDate)) {
    $("#idEndDate").val(startDate);
  }
  if (startDate) {
    $("#idEndDate").attr("min", startDate);
    $("#idEndDate").prop("disabled", false);
  }
}

function addEntries() {
  //add Entries to Database
  var grp = $("#idGroup").val();
  var proj = $($("#idProject").find("option:selected")).attr("proj-id");
  var item = $($("#idItem").find("option:selected")).attr("item-id");
  var jobreq = $($("#idJRD").find("option:selected")).attr("job-id");
  // var emp = $($("#idEmp").find("option:selected")).attr("emp-id");
  var sdate = $("#idStartDate").val();
  var edate = $("#idEndDate").val();
  var mh = $("#idMH").val() * 60;
  var mgaKulang = [];

  if (!grp) {
    $("#p1").text("Please select group");
    $("#idGroup").addClass("border border-danger");
    mgaKulang.push("GROUP");
  }
  if (!proj) {
    $("#p2").text("Please select project");
    $("#idProject").addClass("border border-danger");
    mgaKulang.push("PROJECT");
  }
  if (!item) {
    $("#p3").text("Please select item of works");
    $("#idItem").addClass("border border-danger");
    mgaKulang.push("ITEM");
  }
  if (!jobreq) {
    $("#p4").text("Please select job request description");
    $("#idJRD").addClass("border border-danger");
    mgaKulang.push("JRD");
  }
  if (_selectedEmployees.length == 0) {
    $("#p5").text("Please select employee");
    $("#idEmp").addClass("border border-danger");
    mgaKulang.push("EMP");
  }
  if (!sdate) {
    $("#p6").text("Please input start date");
    $("#idStartDate").addClass("border border-danger");
    mgaKulang.push("SDATE");
  }
  if (!edate) {
    $("#p7").text("Please input deadline");
    $("#idEndDate").addClass("border border-danger");
    mgaKulang.push("EDATE");
  }
  if (!mh || mh == 0) {
    $("#p8").text("Please input man hour");
    $("#idMH").addClass("border border-danger");
    mgaKulang.push("MH");
  }

  var fd = new FormData();
  fd.append("getDescription", jobreq);
  fd.append("getEmp[]", _selectedEmployees);
  fd.append("getsDate", sdate);
  fd.append("geteDate", edate);
  fd.append("getMH", mh);
  fd.append("empNum", empDetails["empNum"]);
  if (mgaKulang.length > 0) {
    console.log(mgaKulang);
    return;
  } else {
    $.post(
      "ajax/add_planning_entries.php",
      {
        getDescription: jobreq,
        getEmp: _selectedEmployees,
        getsDate: sdate,
        geteDate: edate,
        getMH: mh,
        empNum: empDetails["empNum"],
      },
      function (data) {
        resetEntry();
        getPlans();
        $(".cancel").click();
      }
    );
  }
}

function editEntries() {
  //add Entries to Database
  var grp = $("#idGroupEdit").val();
  var proj = $($("#idProjectEdit").find("option:selected")).attr("proj-id");
  var item = $($("#idItemEdit").find("option:selected")).attr("item-id");
  var jobreq = $($("#idJRDEdit").find("option:selected")).attr("job-id");
  var emp = $($("#idEmpEdit").find("option:selected")).attr("emp-id");
  var sdate = $("#idStartDateEdit").val();
  var edate = $("#idEndDateEdit").val();
  var mh = $("#idMHEdit").val() * 60;
  var mgaKulang = [];

  if (!grp) {
    $("#e1").text("Please select group");
    $("#idGroupEdit").addClass("border border-danger");
    mgaKulang.push("GROUP");
  }
  if (!proj) {
    $("#e2").text("Please select project");
    $("#idProjectEdit").addClass("border border-danger");
    mgaKulang.push("PROJECT");
  }
  if (!item) {
    $("#e3").text("Please select item of works");
    $("#idItemEdit").addClass("border border-danger");
    mgaKulang.push("ITEM");
  }
  if (!jobreq) {
    $("#e4").text("Please select job request description");
    $("#idJRDEdit").addClass("border border-danger");
    mgaKulang.push("JRD");
  }
  if (!emp) {
    $("#e5").text("Please select employee");
    $("#idEmpEdit").addClass("border border-danger");
    mgaKulang.push("EMP");
  }
  if (!sdate) {
    $("#e6").text("Please input start date");
    $("#idStartDateEdit").addClass("border border-danger");
    mgaKulang.push("SDATE");
  }
  if (!edate) {
    $("#e7").text("Please input end date");
    $("#idEndDateEdit").addClass("border border-danger");
    mgaKulang.push("EDATE");
  }
  if (!mh) {
    $("#e8").text("Please input man hour");
    $("#idMHEdit").addClass("border border-danger");
    mgaKulang.push("MH");
  }

  var fd = new FormData();
  fd.append("getDescription", jobreq);
  fd.append("getEmp", emp);
  fd.append("getsDate", sdate);
  fd.append("geteDate", edate);
  fd.append("getMH", mh);
  fd.append("planID", editID);
  if (mgaKulang.length > 0) {
    console.log(mgaKulang);
    return;
  } else {
    $.ajax({
      type: "POST",
      url: "ajax/edit_planning_entries.php",
      data: fd,
      contentType: false,
      cache: false,
      processData: false,
      success: function (data) {
        resetEditEntry();
        getPlans();
        $(".cancel1").click();
      },
    });
  }
}
function deletePlannedEntry(planid) {
  $.post(
    "ajax/delete_planning.php",
    {
      planID: planid,
    },
    function (data) {
      $(".cancel3").click();
      getPlans();
    }
  );
}

function resetEntry() {
  //reset Inputs
  $("#idGroup,#idProject,#idItem,#idJRD,#idEmp,#idStartDate,#idEndDate,#idMH")
    .val("")
    .change();
  $("#p1,#p2,#p3,#p4,#p5,#p6,#p7,#p8").text("");
  $(
    "#idGroup,#idProject,#idItem,#idJRD,#idEmp,#idStartDate,#idEndDate,#idMH"
  ).removeClass("border border-danger");
  sequenceValidation();
}
function resetEditEntry() {
  //reset Inputs
  $(
    "#idGroupEdit,#idProjectEdit,#idItemEdit,#idJRDEdit,#idEmpEdit,#idStartDateEdit,#idEndDateEdit,#idMHEdit"
  )
    .val("")
    .change();
  $("#e1,#e2,#e3,#e4,#e5,#e6,#e7,#e8").text("");
  $(
    "#idGroupEdit,#idProjectEdit,#idItemEdit,#idJRDEdit,#idEmpEdit,#idStartDateEdit,#idEndDateEdit,#idMHEdit"
  ).removeClass("border border-danger");
  sequenceEditValidation();
}
function getPlans() {
  var plans = [];
  $(`#planningTable`).empty();
  var defaultBody = `<tr><td colspan="12" class="text-center">No Entries Found</td></tr>`;
  var searchEmployee = $("#searchEmployee").val();
  var searchSDate = $("#searchSDate").val();
  var filterGroup = $("#filterGroup").val();
  var filterProject = $("#filterProject").val();
  var filterItem = $("#filterItem").val();
  var filterJRD = $("#filterJRD").val();
  var filterStatus = $("#filterStatus").val();
  $.post(
    "ajax/get_plans.php",
    {
      getPlanner: empDetails["empNum"],
      searchEmployee: searchEmployee,
      searchSDate: searchSDate,
      filterGroup: filterGroup,
      filterProject: filterProject,
      filterItem: filterItem,
      filterJRD: filterJRD,
      filterStatus: filterStatus,
    },
    function (data) {
      plans = $.parseJSON(data);
      if (plans.length > 0) {
        plans.map(fillPlans);
      } else {
        $(`#planningTable`).html(defaultBody);
      }
    }
  );
}
function fillPlans(planString) {
  var projCount = $("#planningTable tr").length + 1;
  var planStringArray = planString;
  var planID = planStringArray["planID"];
  var projGroup = planStringArray["projGroup"];
  var projName = planStringArray["projName"];
  var projItem = planStringArray["projItem"];
  var projJob = planStringArray["projJob"];
  var projEmp = planStringArray["projEmpName"];
  var projStart = planStringArray["projStart"];
  var projEnd = planStringArray["projEnd"];
  var projMH = planStringArray["projMH"];
  var usedHours = planStringArray["usedHours"];
  var projStatus = planStringArray["projStatus"];
  var statusBadge = `<button class="badge text-bg-warning border-0  w-100">Ongoing</button>`;
  var buttons = `
    <button class="btn btn-primary edit editPlanningButton" title="edit" data-bs-toggle="modal" data-bs-target="#editPlanningEntry"><i class='bx bx-edit-alt w-100 text-white' ></i></button>
    <button class="btn btn-danger delBut deletePlanningButton" title="delete" data-bs-toggle="modal" data-bs-target="#deletePlanningEntry"><i class='bx bx-trash-alt w-100 text-white' ></i></button>
    `;
  if (projStatus) {
    statusBadge = `<button class="badge done bg-success border-0  w-100">Finished - ${projStatus}</button>`;
  }
  var addString = `<tr plan-id="${planID}">
    <th scope="row" class="text-center">${projCount}</th>
    <td class="text-center">${projGroup}</td>
    <td class="text-center">${projName}</td>
    <td class="text-center">${projItem}</td>
    <td class="text-center">${projJob}</td>
    <td class="text-center">${projEmp}</td>
    <td class="text-center">${projStart}</td>
    <td class="text-center">${projEnd}</td>
    <td class="text-center">${projMH}</td>
    <td class="text-center">${usedHours}</td>
    <td class="text-center">
      <div class="bdge ">
        ${statusBadge}
     </div>
    </td>
    <td class="text-center d-flex">${buttons}</td>
  </tr>`;
  $(`#planningTable`).append(addString);
}
function getEdeets(planID) {
  var eDeets = [];
  $.post(
    "ajax/get_edeets.php",
    {
      planID: planID,
    },
    function (data) {
      eDeets = $.parseJSON(data);
      eDeets.map(fillEditPlan);
    }
  );
}
function fillEditPlan(editDetails) {
  var eDeets = editDetails.split("||");
  var projGroup = eDeets[0];
  var projID = eDeets[1];
  var itemID = eDeets[2];
  var jobID = eDeets[3];
  var empID = eDeets[4];
  var projStart = eDeets[5];
  var projEnd = eDeets[6];
  var projMH = eDeets[7];
  $("#idGroupEdit").val(projGroup).change();
  $("#idGroupEdit").prop("disabled", true);
  $($("#idProjectEdit").find(`option[proj-id=${projID}]`))
    .prop("selected", true)
    .change();
  $($("#idItemEdit").find(`option[item-id=${itemID}]`))
    .prop("selected", true)
    .change();
  $("#idProjectEdit").prop("disabled", true);
  $("#idItemEdit").prop("disabled", true);
  $($("#idJRDEdit").find(`option[job-id=${jobID}]`))
    .prop("selected", true)
    .change();
  $("#idJRDEdit").prop("disabled", true);
  $($("#idEmpEdit").find(`option[emp-id=${empID}]`))
    .prop("selected", true)
    .change();
  $("#idEmpEdit").prop("disabled", true);
  $("#idStartDateEdit").val(projStart).change();
  $("#idEndDateEdit").val(projEnd).change();
  $("#idMHEdit").val(projMH).change();
}
function updateStatus() {
  $.post(
    "ajax/update_status.php",
    {
      planID: editID,
    },
    function (data) {
      getPlans();
    }
  );
}

function ifSmallScreen() {
  //responsive
  if ($(window).width() < 550) {
    if ($(".sidebar").hasClass(".close")) {
      $(".menu-two").addClass("d-none");
    } else {
      $(".menu-two").removeClass("d-none");
    }
  } else {
    $(".menu-two").addClass("d-none");
  }
}

function removeSelected() {
  $(`.empviewer`).empty();
  _selectedEmployees = [];
}
function getFilters() {
  getGroupFilter();
  getProjFilter();
  getItemFilter();
  getJRDFilter();
}
function getGroupFilter() {
  $("#filterGroup").html(`<option value selected>Group</option>`);
  var groups = [];
  $.post(
    "ajax/get_group_filter.php",
    {
      getPlanner: empDetails["empNum"],
    },
    function (data) {
      groups = $.parseJSON(data);
      groups.map(groupFillter);
    }
  );
}
function groupFillter(grp) {
  var groupSelection = `<option>${grp}</option>`;
  $("#filterGroup").append(groupSelection);
}
function getProjFilter() {
  $("#filterProject").html(`<option value selected>Project</option>`);
  var projs = [];
  $.post(
    "ajax/get_proj_filter.php",
    {
      getPlanner: empDetails["empNum"],
    },
    function (data) {
      projs = $.parseJSON(data);
      projs.map(projFillter);
    }
  );
}
function projFillter(proj) {
  var projSelection = `<option>${proj}</option>`;
  $("#filterProject").append(projSelection);
}
function getItemFilter() {
  $("#filterItem").html(`<option value selected>Item</option>`);
  var items = [];
  $.post(
    "ajax/get_item_filter.php",
    {
      getPlanner: empDetails["empNum"],
    },
    function (data) {
      items = $.parseJSON(data);
      items.map(itemFillter);
    }
  );
}
function itemFillter(item) {
  var itemSelection = `<option>${item}</option>`;
  $("#filterItem").append(itemSelection);
}
function getJRDFilter() {
  $("#filterJRD").html(`<option value selected>JRD</option>`);
  var jrds = [];
  $.post(
    "ajax/get_jrd_filter.php",
    {
      getPlanner: empDetails["empNum"],
    },
    function (data) {
      jrds = $.parseJSON(data);
      jrds.map(jrdFillter);
    }
  );
}
function jrdFillter(jrd) {
  var jrdSelection = `<option>${jrd}</option>`;
  $("#filterJRD").append(jrdSelection);
}
//#endregion
