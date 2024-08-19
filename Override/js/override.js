//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
let empDetails = [];

var editID = "";
const defaults = getDefaults();
var regCount = 0;
var otCount = 0;
var lvCount = 0;
const leaveID = getLeaveID();
const otherID = getOtherID();
const mngID = getMngID();
const kiaID = getKiaID();
const noMoreInputItems = getNoMoreInputItems();
const oneBUTrainerID = getOneBUTrainerID();

const calendar = document.querySelector(".calendar");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

//#endregion

checkLogin();
const myEmpNum = empDetails["empNum"];

//#region BINDS
//#region sidebarshits
$(document).ready(function () {
  //page Initialize Event
  $(".hello-user").text(empDetails["empFName"]);
  ifSmallScreen();
  initializeDate();
  getMyGroups();
  // getEmployees();
  getDispatchLoc();
  // getTOW();
  getEntries();
  sequenceValidation();
  // initCalendar();
  getPlans();
  planAccess();
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
  sidebarBtn.addEventListener("click", () => {
    $(".sidebar").toggleClass("close");
  });
  sidebarBtn2.addEventListener("click", () => {
    $(".sidebar").addClass("close");
  });
  //#endregion
  //#region input time validation
  var inputHour = document.getElementById("getHour");

  var invalidChars = ["-", "+", "e", "."];

  inputHour.addEventListener("input", function () {
    this.value = this.value.replace(/[e\+\-\.]/gi, "");
  });

  inputHour.addEventListener("keydown", function (e) {
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    }
  });
  var inputMin = document.getElementById("getMin");

  var invalidChars = ["-", "+", "e", "."];

  inputMin.addEventListener("input", function () {
    this.value = this.value.replace(/[e\+\-\.]/gi, "");
  });

  inputMin.addEventListener("keydown", function (e) {
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    }
  });
  //#endregion
  $(".cs-loader").fadeOut(1000);
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
});

// FOR GROUP LIST
$(document).on("change", "#idGroup", function () {
  //select Group Event
  console.log("group changed to: ", $("#idGroup").val());
  sequenceValidation();
  getEmployees();

  // $("#idJRD, #idItem, #idProject, #idEmployee").val("");
  $("#p1").text("");
  $(this).removeClass("border-danger");
  $(".iow").removeClass("active");
});
$(document).on(
  "click",
  "#idGroup,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate,#trGroup",
  function () {
    $(this).removeClass("bg-err");
  }
);

// FOR EMPLOYEE LIST
$(document).on("change", "#idEmployee", function () {
  //select Employee Event
  console.log("changed employee...");
  var thisEmpID = $($(this).find("option:selected")).attr("emp-id"); //get ID of selected Employee

  sequenceValidation();
  getProjects(thisEmpID);
});

// FOR PROJECTS LIST
$(document).on("change", "#idProject", function () {
  //select Project Event
  var thisEmpID = $("#idEmployee").val(); //get ID of selected Employee
  var projID = $($(this).find("option:selected")).attr("proj-id"); //get ID of selected Project
  console.log("changed project to: ", projID);
  sequenceValidation();
  getItems(thisEmpID, projID);
  isDrawing();
  getTOW(projID);
  // $("#idJRD").val(""); //clear Job Request Description
  // $("#idItem").val(null).change();
  // if ($("#idItem").val() == null || $("#idItem").val() == "") {
  //   $("#idItem")
  //     .empty()
  //     .append(
  //       `<option selected hidden disabled value="">Select Item of Works</option>`
  //     );
  // }
  // getItems(projID);
  // isDrawing();
  // getTOW(projID);
  // disableTimeInput(projID);
  // MHValidation();
  // $(".iow").removeClass("active");
  // $("#p5").text("");
  // $(this).removeClass("border-danger");

  // if (projID == leaveID) {
  //   $("#itemlbl").html("Leave Type");
  //   $("#lbltow").html("Day Type");
  // } else {
  //   $("#itemlbl").html("Item of Works");
  //   $("#lbltow").html("Type of Work");
  // }

  // getCheckers();
  // $(".trgrp").remove();
});
// $(document).on("click", "#idProject", function (event) {
//   event.stopPropagation();
//   $(".proj").toggleClass("active");
//   $(".jord").removeClass("active");
//   $(".iow").removeClass("active");
//   $(this).blur();
// });
// $(document).on("click", "#projOptions li", function () {
//   $(".proj").removeClass("active");
//   var projID = $(this).attr("proj-id");
//   $($("#idProject").find(`option[proj-id=${projID}]`))
//     .prop("selected", true)
//     .change();
// });
// $(document).on("keyup", "#searchproj", function () {
//   var projID = $($("#idProject").find("option:selected")).attr("proj-id");
//   getProjSearch();
// });
// $(document).on("search", "#searchproj", function () {
//   var projID = $($("#idProject").find("option:selected")).attr("proj-id");
//   getProjSearch();
// });

// FOR ITEM OF WORKS LIST
$(document).on("change", "#idItem", function () {
  //select Item Event
  var thisEmpID = $("#idEmployee").val(); //get ID of selected Employee

  var projID = $("#idProject").val(); //get ID of selected Project
  var itemID = $($(this).find("option:selected")).attr("item-id"); //get ID of selected IoW
  console.log("Item of Works changed to: ", itemID);
  sequenceValidation();
  getJobs(thisEmpID, projID, itemID);
  // $(".trgrp").remove();
  // getLabel(itemID);
  // disableInputs(projID, itemID);
  // if (noMoreInputItems.includes(itemID)) {
  //   $("#drInstruction").modal("show");
  // }
  // trainingGroup(itemID);
  // getJobs(projID, itemID);
  // $("#p6").text("");
  // $(this).removeClass("border-danger");
});
// $(document).on("click", "#back2Project", function () {
//   $("#drInstruction").modal("hide");
//   $("#idItem").val(null).change();
// });
// $(document).on("click", "#idItem", function (event) {
//   event.stopPropagation();
//   $(".iow").toggleClass("active");
//   $(".proj").removeClass("active");
//   $(".jord").removeClass("active");
//   $(this).blur();
// });
// $(document).on("click", "#itemOptions li", function () {
//   $(".iow").removeClass("active");
//   var itemID = $(this).attr("item-id");
//   $($("#idItem").find(`option[item-id=${itemID}]`))
//     .prop("selected", true)
//     .change();
// });
// $(document).on("keyup", "#searchjrd", function () {
//   var itemID = $($("#idItem").find("option:selected")).attr("item-id");
//   var projID = $($("#idProject").find("option:selected")).attr("proj-id");
//   getJRDSearch(projID, itemID);
// });
// $(document).on("search", "#searchjrd", function () {
//   var itemID = $($("#idItem").find("option:selected")).attr("item-id");
//   var projID = $($("#idProject").find("option:selected")).attr("proj-id");
//   getJRDSearch(projID, itemID);
// });

// FOR JOB REQ DESC LIST
$(document).on("change", "#idJRD", function () {
  var jrdID = $($(this).find("option:selected")).attr("job-id");
  console.log("Job Request Description changed to: ", jrdID);
  $("#p7").text("");
  $(this).removeClass("border-danger");
});
// $(document).on("click", "#idJRD", function (event) {
//   event.stopPropagation();
//   $(".jord").toggleClass("active");
//   $(".iow").removeClass("active");
//   $(".proj").removeClass("active");
//   $(this).blur();
// });
// $(document).on("click", "#jrdOptions li", function () {
//   $(".jord").removeClass("active");
//   var jrdID = $(this).attr("job-id");
//   $($("#idJRD").find(`option[job-id=${jrdID}]`))
//     .prop("selected", true)
//     .change();
// });
$(document).on("change", "#idTOW", function () {
  //select TOW Event
  var towID = $($(this).find("option:selected")).attr("tow-id");
  console.log("Type of Work changed to: ", towID);
  if (this.value == "Chk - Checker") {
    $(".checker").removeClass("d-none");
  } else {
    $(".checker").addClass("d-none");
  }
  $("#idChecking").prop("selectedIndex", 0);
  var towVal = $($(this).find("option:selected")).attr("tow-id");
  if (towVal == 10 || towVal == 11) {
    $("#getHour").val("4");
  }
  if (towVal == 12) {
    $("#getHour").val("8");
  }
  getTOWDesc(towVal);

  $("#p11").text("");
  $(this).removeClass("border-danger");
});
//#endregion

//#region FUNCTIONS
// not sure -> checklogin/access > then(issuccess/error) > doc.ready > make empDetails global / getEmployeeDetails > getgroups > fillgroups > Promise(getEmp,Loc,Proj,IoW,JRD) > fill each promise func > catch error
function checkAccess() {
  //authentication + authorization
  // return new Promise((resolve, reject) => {
  //   $.ajax({
  //     type: "GET",
  //     url: "Includes/check_login.php",
  //     dataType: "json",
  //     success: function (data) {
  //       // const acc = data;
  //       // resolve(acc);
  //       empDetails = data;
  //       resolve(empDetails);
  //     },
  //     error: function (xhr, status, error) {
  //       if (xhr.status === 404) {
  //         reject("Not Found Error: The requested resource was not found.");
  //       } else if (xhr.status === 500) {
  //         reject("Internal Server Error: There was a server error.");
  //       } else {
  //         reject("An unspecified error occurred while checking login details.");
  //       }
  //     },
  //   });
  //   // resolve(response);
  // });
}
function checkLogin() {
  //check if user is logged in
  $.ajax({
    url: "Includes/check_login.php",
    success: function (data) {
      //ajax to check 9 is logged in
      empDetails = $.parseJSON(data);
      if (Object.keys(empDetails).length < 1) {
        //if result is 0, redirect to log in page
        window.location.href = rootFolder + "/KDTPortalLogin";
      }
    },
    async: false,
  });
}

//GROUP FUNCTIONS
function getMyGroups() {
  $.ajax({
    type: "POST",
    url: "php/get_my_groups.php",
    data: {
      empNum: myEmpNum,
    },
    dataType: "json",
    success: function (response) {
      const grps = response["result"];
      const groupIDS = grps.map((obj) => obj.abbreviation);
      var grpSelect = $("#idGroup");
      grpSelect.html(`<option value=0>Select Group</option>`);
      // grpSelect.html(`<option value='0' hidden>Select Group</option>`);
      $.each(grps, function (index, item) {
        var option = $("<option>")
          .attr("value", item.id)
          .text(item.abbreviation)
          .attr("grp-id", item.id);
        grpSelect.append(option);
      });
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching groups.");
      }
    },
  });
}
function fillMyGroups() {}

//LOCATION FUNCTIONS
function getDispatchLoc() {
  //get Dispatch Location Selection
  $.ajax({
    type: "GET",
    url: "php/get_dispatch_loc.php",
    dataType: "json",
    success: function (data) {
      const locs = data["result"];
      const locsIDs = locs.map((obj) => obj.location);
      var locSelect = $("#idLocation");
      // $("#idLocation").html(locs.location);
      locSelect.html(`<option value=0>Select Location</option>`);
      // locSelect.html(`<option value='0' hidden>Select Location</option>`);
      $.each(locs, function (index, item) {
        var option = $("<option>")
          .attr("value", item.id)
          .text(item.location)
          .attr("loc-id", item.id);
        locSelect.append(option);
      });
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching groups.");
      }
    },
  });
}
function fillDispatchLoc() {}

//EMPLOYEE FUNCTIONS
function getEmployees() {
  //get EMPLOYEE Selection
  console.log("start get emp...");
  // console.log("groupID is: ", $("#idGroup").val());
  var groupID = $("#idGroup").val();

  $.ajax({
    type: "POST",
    url: "php/get_member_list.php",
    data: {
      grpNum: groupID,
    },
    dataType: "json",
    success(response) {
      console.log("getEmployees res: ", response);
      const emps = response["result"];
      const empsList = emps.map((obj) => obj.fullName);
      var empSelect = $("#idEmployee");
      empSelect.html(`<option value=0>Select Employee</option>`);
      // empSelect.html(`<option value='0' hidden>Select Employee</option>`);
      $.each(emps, function (index, item) {
        var option = $("<option>")
          .attr("value", item.id)
          .text(item.fullName)
          .attr("emp-id", item.id);
        empSelect.append(option);
      });
      console.log("finished getting employees");
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching groups.");
      }
    },
  });
}
function fillEmployees() {}

//PROJECT FUNCTIONS
function getProjects(thisEmpID) {
  //get PROJECT Selection
  var proj = [];
  console.log("start get projs...");
  // console.log("empSelect Value is: ", $("#idEmployee").val());
  var groupID = $("#idGroup").val();
  // console.log("project to get is from group #: ", groupID);
  // console.log("chosen employee's ID (thisEmpID) is: ", thisEmpID);

  $.ajax({
    type: "POST",
    url: "php/get_projects.php",
    data: {
      grpNum: groupID,
      empNum: thisEmpID,
    },
    dataType: "json",
    success(response) {
      console.log("projects: ", response);
      const projs = response["result"];
      const projList = projs.map((obj) => obj.projName);
      var projSelect = $("#idProject");
      projSelect.html(`<option value=0>Select Project</option>`);
      // empSelect.html(`<option value='0' hidden>Select Project</option>`);
      $.each(projs, function (index, item) {
        var option = $("<option>")
          .attr("value", item.id)
          .text(item.projName)
          .attr("proj-id", item.id);
        projSelect.append(option);
      });
      console.log("finished getting projects");
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching groups.");
      }
    },
  });
}
// function fillProj(projArrayElement) {
//   var projDeets = projArrayElement;
//   var addString = `<li proj-id='${projDeets["projID"]}'>${projDeets["projName"]}${projDeets["groupAppend"]}</li>`;
//   var addStringMain = `<option hidden proj-id='${projDeets["projID"]}'>${projDeets["projName"]}${projDeets["groupAppend"]}</option>`;
//   $(`#projOptions`).append(addString);
//   $(`#idProject`).append(addStringMain);
// }

// function getProjSearch() {
//   //get Item Selection
//   var proj = [];
//   var searchProj = $(`#searchproj`).val();
//   $("#projOptions").empty();
//   $.ajaxSetup({ async: false });
//   $.post(
//     "php/get_projects.php",
//     {
//       empGroup: $("#idGroup").val(),
//       empNum: empDetails["empNum"],
//       empPos: empDetails["empPos"],
//       searchProj: searchProj,
//     },
//     function (data) {
//       proj = $.parseJSON(data);
//       proj.map(fillProj);
//     }
//   );
//   $.ajaxSetup({ async: true });
// }
function fillProjects() {}

//ITEM of WORKS FUNCTIONS
function getItems(thisEmpID, projID) {
  //get Item Selection
  var itms = [];

  var groupID = $("#idGroup").val();
  console.log("start get Items...");
  // console.log("project to get is from group #: ", groupID);
  // console.log("project ID is: ", projID);
  $.ajax({
    type: "POST",
    url: "php/get_items.php",
    data: {
      empNum: thisEmpID,
      projID: projID,
      grpNum: groupID,
    },
    dataType: "json",
    success(response) {
      console.log("items: ", response);
      const items = response["result"];
      const itemList = items.map((obj) => obj.itemName);
      var itemSelect = $("#idItem");
      itemSelect.html(`<option value=0>Select Item of Works</option>`);
      // empSelect.html(`<option value='0' hidden>Select Item of Works</option>`);
      $.each(items, function (index, item) {
        var option = $("<option>")
          .attr("value", item.id)
          .text(item.itemName)
          .attr("item-id", item.id);
        itemSelect.append(option);
      });
      console.log("finished getting items");
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching groups.");
      }
    },
  });
}

// function fillItem(itemArrayElement) {
//   var itemDeets = itemArrayElement;
//   var addString = `<li item-id='${itemDeets["itemID"]}'>${itemDeets["itemName"]}</li>`;
//   var addStringMain = `<option hidden item-id='${itemDeets["itemID"]}'>${itemDeets["itemName"]}</option>`;
//   $(`#itemOptions`).append(addString);
//   $(`#idItem`).append(addStringMain);
// }
// function getItemSearch(projID) {
//   //get Item Selection
//   var itms = [];
//   var searchIOW = $(`#searchitem`).val();
//   $("#itemOptions").empty();
//   $.ajaxSetup({ async: false });
//   $.post(
//     "php/get_items.php",
//     {
//       empGroup: $("#idGroup").val(),
//       empNum: empDetails["empNum"],
//       empPos: empDetails["empPos"],
//       projID: projID,
//       searchIOW: searchIOW,
//     },
//     function (data) {
//       itms = $.parseJSON(data);
//       itms.map(fillItem);
//     }
//   );
//   $.ajaxSetup({ async: true });
// }
function fillItems() {}

//JRD FUNCTIONS
function getJobs(thisEmpID, projID, itemID) {
  //get JRD Selection
  var jobs = [];
  var groupID = $("#idGroup").val();
  console.log("start get Jobs...");
  // console.log("project to get is from group #: ", groupID);
  // console.log("project ID is: ", projID);
  // console.log("item is: ", itemID);
  $.ajax({
    type: "POST",
    url: "php/get_jobs.php",
    data: {
      empNum: thisEmpID,
      projID: projID,
      grpNum: groupID,
      itemID: itemID,
    },
    dataType: "json",
    success(response) {
      console.log("jrd: ", response);
      const jobs = response["result"];
      const jobList = jobs.map((obj) => obj.jobName);
      var jobSelect = $("#idJRD");
      jobSelect.html(`<option value=0>Select Job Request Description</option>`);
      // empSelect.html(`<option value='0' hidden>Select Job Request Description</option>`);
      $.each(jobs, function (index, item) {
        var option = $("<option>")
          .attr("value", item.id)
          .text(item.jobName)
          .attr("job-id", item.id);
        jobSelect.append(option);
      });
      console.log("finished getting jrd");
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching groups.");
      }
    },
  });
}
// function fillJobs(jobArrayElement) {
//   var jrdDeets = jobArrayElement;
//   var addString = `<li job-id='${jrdDeets["jobID"]}'>${jrdDeets["jobName"]}</li>`;
//   var addStringMain = `<option hidden job-id='${jrdDeets["jobID"]}'>${jrdDeets["jobName"]}</option>`;
//   $(`#jrdOptions`).append(addString);
//   $(`#idJRD`).append(addStringMain);
// }
// function getJRDSearch(projID, itemID) {
//   //get Item Selection
//   var jrd = [];
//   var searchjrd = $(`#searchjrd`).val();
//   $("#jrdOptions").empty();
//   $.ajaxSetup({ async: false });
//   $.post(
//     "php/get_jobs.php",
//     {
//       empGroup: $("#idGroup").val(),
//       empNum: empDetails["empNum"],
//       empPos: empDetails["empPos"],
//       projID: projID,
//       itemID: itemID,
//       searchjrd: searchjrd,
//     },
//     function (data) {
//       jrd = $.parseJSON(data);
//       jrd.map(fillJobs);
//     }
//   );
//   $.ajaxSetup({ async: true });
// }
function fillJobs() {}

//Types of Work FUNCTIONS
function getTOW(projID) {
  //get Types of Work Selection
  console.log("start get ToW...");
  $.ajax({
    type: "POST",
    url: "php/get_tow.php",
    data: {
      projID: projID,
    },
    dataType: "json",
    success(response) {
      console.log("ToW: ", response);
      const tow = response["result"];
      const towList = tow.map((obj) => obj.itemName);
      var towSelect = $("#idTOW");
      towSelect.html(`<option value=0>Select Type of Work</option>`);
      // empSelect.html(`<option value='0' hidden>Select ToW</option>`);
      $.each(tow, function (index, item) {
        var option = $("<option>")
          .attr("value", item.id)
          .text(item.itemName)
          .attr("tow-id", item.id);
        towSelect.append(option);
      });
      console.log("finished getting ToW");
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching groups.");
      }
    },
  });
}
function getTOWDesc(typesOfWorkID) {
  //get TOW Description Selection
  console.log("towDesc: ", typesOfWorkID);
  $.ajax({
    type: "POST",
    url: "php/get_tow_desc.php",
    data: {
      towID: typesOfWorkID,
    },
    dataType: "json",
    success(response) {
      console.log(response);
      const towDesc = response["result"];
      // const towDescList = towDesc.map((obj) => obj.itemName);
      var towDescSelect = $("#towDesc");
      towDescSelect.html(towDesc);
      // $("#towDesc").html(data.trim());
    },
  });
}
function isDrawing() {
  //enable/disable engineering selections
  console.log("isDrawing here");
  isEngineering();
  hasJRD();
  hasTOW();
}

function isEngineering() {
  console.log("isEngineering here");
  var isDrawing = true;
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  var selGroup = $("#idGroup").val();
  isDrawing =
    !defaults.includes(projID) &&
    selGroup != 16 && //System Group
    selGroup != 10 && //IT Group
    projID;
  // return isDrawing;
  if (isDrawing) {
    $("#id2DDiv").removeClass("d-none");
    $("#idRevDiv").removeClass("d-none");
  } else {
    $("#id2DDiv").addClass("d-none");
    $("#idRevDiv").addClass("d-none");
  }
}

function hasJRD() {
  console.log("hasJRD here");
  var isDrawing = true;
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  var selGroup = $("#idGroup").val();
  isDrawing = projID != leaveID && projID != otherID;
  if (isDrawing) {
    $("#idJRDDiv").removeClass("d-none");
  } else {
    $("#idJRDDiv").addClass("d-none");
  }
}

function hasTOW() {
  console.log("hasTOW here");
  var isDrawing = true;
  var projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id")
  );
  console.log("tow projID", projID);
  var selGroup = $("#idGroup").val();
  isDrawing = !defaults.includes(projID) && projID;
  if (isDrawing) {
    $("#idTowDiv").removeClass("d-none");
    $("#idTowDescDiv").removeClass("d-none");
  } else {
    $("#idTowDiv").addClass("d-none");
    $("#idTowDescDiv").addClass("d-none");
  }
  if (projID == leaveID) {
    $("#idTowDiv").removeClass("d-none");
    $("#idTowDescDiv").removeClass("d-none");
  }
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

function initializeDate() {
  //Initialize Selected Date
  $.ajax({
    url: "php/get_date.php",
    success: function (response) {
      $("#idDRDate").val(response);
    },
    async: false,
  });
}

function getEntries() {
  //get Daily Report Entries
  regCount = 0;
  otCount = 0;
  lvCount = 0;
  $("#drEntries").empty();
  $.post(
    "php/get_entries.php",
    {
      curDay: $("#idDRDate").val(),
      empNum: empDetails["empNum"],
    },
    function (data) {
      var entries = $.parseJSON(data);
      if (entries.length > 0) {
        entries.map(addRow);
      } else {
        var addString = `<tr ><td colspan='9'class="text-center py-5 "><h3>No Entries Found</h3></td></tr>`;
        $("#drEntries").append(addString);
      }
      getMHCount();
    }
  );
}

function getMHCount() {
  //get MH Counter Values
  var reg = 0;
  var ot = 0;
  var lv = 0;
  var loc = "KDT";
  var getTRs = Object.values($("#drEntries").children());
  getTRs.length -= 2;
  getTRs.forEach((element) => {
    loc = $($(element).children()[0]).text();
  });

  $("#regCount").text(parseFloat(regCount / 60).toFixed(2));
  $("#otCount").text(parseFloat(otCount / 60).toFixed(2));
  $("#lvCount").text(parseFloat(lvCount / 60).toFixed(2));
  reg = parseFloat(regCount / 60);
  ot = parseFloat(otCount / 60);
  lv = parseFloat(lvCount / 60);
  $("#cardReg").removeClass("new");
  $("#cardOt").removeClass("new");
  $("#cardLv").removeClass("new");
  if (loc == "WFH") {
    if (ot > 0) {
      $("#cardOt").addClass("new");
    }
    if (lv > 0) {
      $("#cardLv").addClass("new");
    }
  } else {
    if (isWorkDay(loc)) {
      if (ot > 0) {
        if (reg < 8 || lv > 0) {
          $("#cardOt").addClass("new");
        }
      }
      if (lv == 4 && reg < 4) {
        $("#cardLv").addClass("new");
      }
      if (reg > 8 || (reg > 0 && reg + lv < 8)) {
        $("#cardReg").addClass("new");
      }
    } else {
      if (reg > 0) {
        $("#cardReg").addClass("new");
      }
      if (lv > 0) {
        $("#cardLv").addClass("new");
      }
    }
  }
}

function sequenceValidation() {
  //sequence Checking Project->Item->Job
  $("#idEmployee").prop("disabled", true);
  $("#idProject").prop("disabled", true);
  $("#idItem").prop("disabled", true);
  $("#idJRD").prop("disabled", true);

  // Enabling Selection
  if ($("#idItem").prop("selectedIndex") > 0) {
    $("#idJRD").prop("disabled", false);
  }
  if ($("#idProject").prop("selectedIndex") > 0) {
    $("#idItem").prop("disabled", false);
  }
  if ($("#idEmployee").prop("selectedIndex") > 0) {
    $("#idProject").prop("disabled", false);
  }
  if ($("#idGroup").prop("selectedIndex") > 0) {
    $("#idEmployee").prop("disabled", false);
  }
}

function isWorkDay(location) {
  //check if work day
  var isWorkDay = false;
  var selDate = $("#idDRDate").val();
  var selLoc = location;
  if (selLoc == null) {
    selLoc = "KDT";
  }
  $.ajaxSetup({ async: false });
  $.post(
    "php/check_workday.php",
    {
      selDate: selDate,
      selLoc: selLoc,
    },
    function (data) {
      isWorkDay = $.parseJSON(data);
    }
  );
  $.ajaxSetup({ async: true });
  return isWorkDay;
}

function formatDate(rawDate) {
  var d = new Date(rawDate),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function addListener() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      activeDay = Number(e.target.innerHTML);
      //remove active
      days.forEach((day) => {
        day.classList.remove("active");
      });
      //if clicked prev-date or next-date switch to that month
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        //add active to clicked day afte month is change
        setTimeout(() => {
          //add active where no prev-date or next-date
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        //add active to clicked day afte month is changed
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
      }
    });
  });
}

// function initCalendar() {
//   const firstDay = new Date(year, month, 1);
//   const lastDay = new Date(year, month + 1, 0);
//   const prevLastDay = new Date(year, month, 0);
//   const prevDays = prevLastDay.getDate();
//   const lastDate = lastDay.getDate();
//   const day = firstDay.getDay();
//   const nextDays = 7 - lastDay.getDay() - 1;
//   var mhColor = ``;
//   //month upper center
//   $(".date").html(months[month] + " " + year);
//   //#region prev month days
//   let days = "";
//   for (let x = day; x > 0; x--) {
//     var newDate = new Date(year, month - 1, prevDays - x + 1);
//     if (newDate.getDay() == 0) {
//       days += `<div class="day prev-date weekend ${mhColor}">${
//         prevDays - x + 1
//       }</div>`;
//     } else {
//       days += `<div class="day prev-date ${mhColor}">${prevDays - x + 1}</div>`;
//     }
//   }
//   //#endregion
//   //#region current month days
//   for (let i = 1; i <= lastDate; i++) {
//     //if day is today add class today
//     if (
//       i == new Date().getDate() &&
//       year == new Date().getFullYear() &&
//       month == new Date().getMonth()
//     ) {
//       var newDate = new Date(year, month, i);
//       if (newDate.getDay() == 0) {
//         days += `<div class='day today active weekend ${mhColor}'>${i}</div>`;
//         activeDay = i;
//         getActiveDay(i);
//       } else {
//         days += `<div class='day today active ${mhColor}'>${i}</div>`;
//         activeDay = i;
//         getActiveDay(i);
//       }
//     } else {
//       var newDate = new Date(year, month, i);
//       if (newDate.getDay() == 0 || newDate.getDay() == 6) {
//         days += `<div class="day weekend ${mhColor}">${i}</div>`;
//       } else {
//         days += `<div class="day ${mhColor}">${i}</div>`;
//       }
//     }
//   }
//   //#endregion
//   //#region next month days
//   for (let j = 1; j <= nextDays; j++) {
//     var newDate = new Date(year, month + 1, j);
//     if (newDate.getDay() != 6) {
//       days += `<div class="day next-date  ${mhColor}">${j}</div>`;
//     } else {
//       days += `<div class="day next-date weekend ${mhColor}">${j}</div>`;
//     }
//   }
//   //#endregion
//   $(".days").html(days);
//   addListener();
//   addColors(formatDate(1 + " " + months[month] + " " + year));
// }
// //previous month
// function prevMonth() {
//   month--;
//   if (month < 0) {
//     month = 11;
//     year--;
//   }
//   initCalendar();
// }

// //next month
// function nextMonth() {
//   month++;
//   if (month > 11) {
//     month = 0;
//     year++;
//   }
//   initCalendar();
// }

// //go to entered date
// function gotoMonth() {
//   const dateArr = $("#gotomonth").val().split("-");
//   if (dateArr.length == 2) {
//     if (dateArr[1] > 0 && dateArr[1] < 13 && dateArr[0].length == 4) {
//       month = dateArr[1] - 1;
//       year = dateArr[0];
//       initCalendar();
//       return;
//     }
//   }
// }

// //go to today
// function gotoday() {
//   todayy = new Date();
//   month = todayy.getMonth();
//   year = todayy.getFullYear();
//   initCalendar();
// }

function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  $(".event-day").html(dayName);
  $(".event-date").html(date + " " + months[month] + " " + year);
  getDayta(formatDate(date + " " + months[month] + " " + year));
}

function getDayta(rawDate) {
  $("#pHoursTable").empty();
  var projHours = [];
  var mhArr = [0, 0, 0, 0];
  $.ajaxSetup({ async: false });
  $.post(
    "php/get_dayta.php",
    {
      getDate: rawDate,
      empNum: empDetails["empNum"],
    },
    function (data) {
      projHours = $.parseJSON(data);
      if (projHours.length > 0) {
        projHours.map(fillDayta);
      } else {
        $("#pHoursTable").html(
          "<tr><td colspan='2' class='text-center'>No entries found</td></tr>"
        );
      }
    }
  );
  $.ajaxSetup({ async: true });
  $.post(
    "php/get_mh_dayta.php",
    {
      getDate: rawDate,
      empNum: empDetails["empNum"],
    },
    function (data) {
      mhArr = $.parseJSON(data);
      $("#msvReg").html(mhArr[0].toFixed(2));
      $("#msvOt").html(mhArr[1].toFixed(2));
      $("#msvLv").html(mhArr[2].toFixed(2));
      $("#msvAms").html(mhArr[3].toFixed(2));
    }
  );
}

function addColors(currentMonth) {
  var greenDates = [];
  var redDates = [];
  var holidates = [];
  var allDates = [];
  $.ajaxSetup({ async: false });
  $.post(
    "php/get_date_colors.php",
    {
      curMonth: currentMonth,
      empNum: empDetails["empNum"],
    },
    function (data) {
      allDates = $.parseJSON(data);
      greenDates = allDates[0];
      redDates = allDates[1];
      holidates = allDates[2];
    }
  );
  $.ajaxSetup({ async: true });
  greenDates.forEach((element) => {
    var spl = element.split("-");

    var m = spl[1];
    var da = spl[2];
    var d = new Date(currentMonth);
    var nowm = d.getMonth() + 1;
    if (m > nowm) {
      $(`.day.next-date:contains(${parseInt(da)})`)
        .addClass("green")
        .removeClass("red");
    } else if (m < nowm) {
      $(`.day.prev-date:contains(${parseInt(da)})`)
        .addClass("green")
        .removeClass("red");
    } else {
      $(".day")
        .not(".next-date")
        .not(".prev-date")
        .filter(function () {
          return $(this).text() === `${parseInt(da)}`;
        })
        .addClass("green")
        .removeClass("red");
    }
  });
  redDates.forEach((element) => {
    var spl = element.split("-");

    var mm = spl[1];
    var daa = spl[2];
    var d = new Date(currentMonth);
    var nowmm = d.getMonth() + 1;

    if (mm > nowmm) {
      $(`.day.next-date:contains(${parseInt(daa)})`)
        .addClass("red")
        .removeClass("green");
    } else if (mm < nowmm) {
      $(`.day.prev-date:contains(${parseInt(daa)})`)
        .addClass("red")
        .removeClass("green");
    } else {
      $(".day")
        .not(".next-date")
        .not(".prev-date")
        .filter(function () {
          return $(this).text() === `${parseInt(daa)}`;
        })
        .addClass("red")
        .removeClass("green");
    }
  });
  holidates.forEach((element) => {
    var rawHoliday = element.split("||");
    var spl = rawHoliday[0].split("-");

    var mm = spl[1];
    var daa = spl[2];
    var d = new Date(currentMonth);
    var nowmm = d.getMonth() + 1;

    if (mm > nowmm) {
      $(`.day.next-date:contains(${parseInt(daa)})`).addClass("holiday");
      $(`.day.next-date:contains(${parseInt(daa)})`).prop(
        "title",
        `${rawHoliday[1]}`
      );
    } else if (mm < nowmm) {
      $(`.day.prev-date:contains(${parseInt(daa)})`).addClass("holiday");
      $(`.day.prev-date:contains(${parseInt(daa)})`).prop(
        "title",
        `${rawHoliday[1]}`
      );
    } else {
      $(".day")
        .not(".next-date")
        .not(".prev-date")
        .filter(function () {
          return $(this).text() === `${parseInt(daa)}`;
        })
        .addClass("holiday");
      $(".day")
        .not(".next-date")
        .not(".prev-date")
        .filter(function () {
          return $(this).text() === `${parseInt(daa)}`;
        })
        .prop("title", `${rawHoliday[1]}`);
    }
  });
}

function getPlans() {
  var plans = [];
  var selDate = $("#idDRDate").val();
  $(`#plannedItems`).empty();
  var defaultBody = `<tr><td colspan="6" class="text-center">No Entries Found</td></tr>`;
  $.post(
    "php/get_plans.php",
    {
      getEmployee: empDetails["empNum"],
      selDate: selDate,
    },
    function (data) {
      plans = $.parseJSON(data);
      if (plans.length > 0) {
        plans.map(fillPlans);
      } else {
        $(`#plannedItems`).html(defaultBody);
      }
    }
  );
}

function planAccess() {
  $.post(
    "php/plan_access.php",
    {
      empNum: empDetails["empNum"],
    },
    function (data) {
      var addString = "";
      var access = $.parseJSON(data);
      if (access) {
        addString += `<li>
        <div class="iocn-link">
          <a class="row-cols-12" href="../Planning/">
            <i class="bx bx-book-bookmark"></i>
            <span class="link_name col-9">Planning</span>
          </a>
        </div>
        <ul class="sub-menu">
          <li><a class="link_name" href="../Planning/">Planning</a></li>
        </ul>
      </li>`;
        // $("#navigationLinks").append(addString);
        $("#drLink").after(addString);
      }
    }
  );
}

function resetEntry() {
  //reset Inputs
  $(
    "#idGroup,#idEmployee,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#towDesc,#trGroup"
  )
    .val("")
    .change();
  $("#one").click();
  $("#idRev").prop("checked", false);
  $("#p1,#p2,#p3,#p4,#p5,#p6,#p7,#p8,#p9,#p10,#p11,#p12,#p13").text("");
  $(
    "#idGroup,#idEmployee,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate,#trGroup"
  )
    .removeClass("border border-danger")
    .removeClass("bg-err");
  $(".checker").addClass("d-none");
  sequenceValidation();
}

function getCheckers() {
  //get Checkers Selection
  $.ajaxSetup({ async: false });
  var empGrp = $("#idGroup").val();
  var projID = $($("#idProject").find("option:selected")).attr("proj-id") || "";
  $.post(
    "php/get_checkers.php",
    {
      empGrp: empGrp,
      empNum: empDetails["empNum"],
      projID: projID,
    },
    function (data) {
      $("#idChecking").html(data);
    }
  );
  $.ajaxSetup({ async: true });
}

function getLabel(itemOfWorkID) {
  //display label of selected item of work
  $.post(
    "php/get_label.php",
    {
      itemID: itemOfWorkID,
    },
    function (data) {
      if (data.trim()) {
        $("#labell").remove();
        $("#p6").after(`
                <span class="col-12 alert-primary text-primary" id="labell" role="alert">${data}</span>
                `);
      }
    }
  );
}

function disableInputs(projID, itemID) {
  //disable input for no more inputs
  $("#getHour").prop("disabled", true);
  $("#getMin").prop("disabled", true);
  $("#idMH").prop("disabled", true);
  $("#idRemarks").prop("disabled", true);
  $("#idAdd").prop("disabled", true);

  if (projID != leaveID) {
    if (!noMoreInputItems.includes(itemID)) {
      $("#idRemarks").prop("disabled", false);
      $("#idAdd").prop("disabled", false);
      $("#getHour").prop("disabled", false);
      $("#getMin").prop("disabled", false);
      $("#idMH").prop("disabled", false);
    }
  } else {
    $("#idRemarks").prop("disabled", false);
    $("#idAdd").prop("disabled", false);
  }
}

function getDefaults() {
  //get Default Projects(GOW,Kaizen,etc.)
  var defaultsArray = [];
  $.ajax({
    url: "php/get_defaults.php",
    success: function (data) {
      defaultsArray = $.parseJSON(data);
    },
    async: false,
  });
  return defaultsArray;
}

function getLeaveID() {
  //get database id of leave project
  var lvID = ``;
  $.ajax({
    url: "php/get_leave_id.php",
    success: function (data) {
      lvID = data.trim();
    },
    async: false,
  });
  return lvID;
}

function getOtherID() {
  //get database id of other project
  var oID = ``;
  $.ajax({
    url: "php/get_other_id.php",
    success: function (data) {
      oID = data.trim();
    },
    async: false,
  });
  return oID;
}

function getMngID() {
  //get database id of management project
  var mngID = ``;
  $.ajax({
    url: "php/get_mng_id.php",
    success: function (data) {
      mngID = data.trim();
    },
    async: false,
  });
  return mngID;
}

function getKiaID() {
  //get database id of kdt internal
  var kiaID = ``;
  $.ajax({
    url: "php/get_kia_id.php",
    success: function (data) {
      kiaID = data.trim();
    },
    async: false,
  });
  return kiaID;
}

function getNoMoreInputItems() {
  //get ids of no more input
  var nmiIDs = [];
  $.ajax({
    url: "php/get_nomoreinput_items.php",
    success: function (data) {
      nmiIDs = $.parseJSON(data);
    },
    async: false,
  });
  return nmiIDs;
}

function getOneBUTrainerID() {
  //get databse id of one bu train itemofworks
  var obutrainID = ``;
  $.ajax({
    url: "php/get_onebutrainer_id.php",
    success: function (data) {
      obutrainID = data.trim();
    },
    async: false,
  });
  return obutrainID;
}

function trainingGroup(itemID) {
  //check if item of work is for training for one bu
  if (itemID == oneBUTrainerID) {
    $(".iow").after(`
    <div class="col-12 my-2 trgrp">
                  <label for="trGroup" class="form-label">Group of Trainees</label>
                  <div class="input-group">
                    <select class="form-select" id="trGroup" required>
                      <option value="" selected hidden>Select Group to Train</option>
                    </select>
                  </div>
                  <span class="col-12 mt-1 alert-danger text-danger" id="p13" role="alert"></span>
                </div>
    `);
    getTRGroups();
  } else {
    $(".trgrp").remove();
  }
}

function getTRGroups() {
  //get groups for training group selection
  $.ajax({
    url: "php/get_groups.php",
    success: function (response) {
      $("#trGroup").html(response);
    },
    async: false,
  });
}

function disableTimeInput(projID) {
  //disable Time Input
  $("#getHour").prop("disabled", false);
  $("#getMin").prop("disabled", false);
  if (projID == leaveID) {
    $("#getHour").prop("disabled", true);
    $("#getMin").prop("disabled", true);
  }
}

function MHValidation() {
  //enable/disable manhour type selection
  var projID = $($("#idProject").find("option:selected")).attr("proj-id");
  var selLoc = "KDT";

  if ($("#idLocation").val()) {
    selLoc = $("#idLocation").val();
  }
  if (projID != leaveID) {
    //if Project selected is not LEAVE
    $("#idMH").prop("disabled", false);
    if (!isWorkDay(selLoc)) {
      $("#idMH").val("Overtime");
      $("#idMH").prop("disabled", true);
    }
    if (selLoc == "WFH") {
      $("#idMH").val("Regular");
      $("#idMH").prop("disabled", true);
    }
  } else {
    $("#idMH").prop("disabled", true);
    $("#idMH").val("");
    if (!isWorkDay(selLoc)) {
      alert("Leave disabled on holidays/weekends");
      $("#idProject").val("").change();
    }
  }
}

// Adding JMR

//#endregion
