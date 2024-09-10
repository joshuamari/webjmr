//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
let empDetails = [];
// var myEmpNum = "";
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
// checkLogin();
// const myEmpNum = empDetails["empNum"];
checkAccess()
  .then((emp) => {
    if (emp.isSuccess) {
      empDetails = emp.result[0];
      console.log(empDetails);
      $(".hello-user").text(empDetails["empFName"]);
      ifSmallScreen();
      initializeDate();
      sequenceValidation();
      var myEmpNum = empDetails["empID"];
      $(document).ready(function () {
        getMyGroups(myEmpNum)
          .then((grps) => {
            fillMyGroups(grps);
            Promise.all([getDispatchLoc()])
              .then(([locs]) => {
                fillDispatchLoc(locs);
                getEntries();
                $(".cs-loader").fadeOut(1000);
              })
              .catch((error) => {
                alert(`${error}`);
              });
          })
          .catch(() => {});
      });
    } else {
      alert(emp.message);
      window.location.href = `${rootFolder}/webJMR/`;
    }
  })
  .catch((error) => {
    alert(`${error}`);
  });

//#region BINDS
// $(document).ready(function () {
//   //page Initialize Event
//   $(".hello-user").text(empDetails["empFName"]);
//   ifSmallScreen();
//   initializeDate();
//   getMyGroups();
//   // getEmployees();
//   getDispatchLoc();
//   // getTOW();
//   getEntries();
//   sequenceValidation();
//   // initCalendar();
//   // getPlans();
//   // planAccess();
//   //#region sidebarshits
//   let arrow = document.querySelectorAll(".arrow");

//   for (var i = 0; i < arrow.length; i++) {
//     arrow[i].addEventListener("click", (e) => {
//       let arrowParent = e.target.parentElement.parentElement; //selecting main parent of arrow
//       arrowParent.classList.toggle("showMenu");
//     });
//   }
//   let ey = document.querySelectorAll(".ey");

//   for (var i = 0; i < ey.length; i++) {
//     ey[i].addEventListener("click", (e) => {
//       let aey = e.target.parentElement.parentElement.parentElement; //selecting main parent of arrow
//       aey.classList.toggle("showMenu");
//     });
//   }

//   let sidebar = document.querySelector(".sidebar");
//   let sidebarBtn = document.querySelector(".menu-one");
//   let sidebarBtn2 = document.querySelector(".menu-two");
//   sidebarBtn.addEventListener("click", () => {
//     $(".sidebar").toggleClass("close");
//   });
//   sidebarBtn2.addEventListener("click", () => {
//     $(".sidebar").addClass("close");
//   });
//   //#endregion
//   //#region input time validation
//   var inputHour = document.getElementById("getHour");

//   var invalidChars = ["-", "+", "e", "."];

//   inputHour.addEventListener("input", function () {
//     this.value = this.value.replace(/[e\+\-\.]/gi, "");
//   });

//   inputHour.addEventListener("keydown", function (e) {
//     if (invalidChars.includes(e.key)) {
//       e.preventDefault();
//     }
//   });
//   var inputMin = document.getElementById("getMin");

//   var invalidChars = ["-", "+", "e", "."];

//   inputMin.addEventListener("input", function () {
//     this.value = this.value.replace(/[e\+\-\.]/gi, "");
//   });

//   inputMin.addEventListener("keydown", function (e) {
//     if (invalidChars.includes(e.key)) {
//       e.preventDefault();
//     }
//   });
//   //#endregion
//   $(".cs-loader").fadeOut(1000);
// });

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
// MODAL
$(document).on("click", "#back2Project", function () {
  $("#drInstruction").modal("hide");
  $("#idItem").val(0).change();
  // $("#labell").remove();
});
$(document).on("click", "#drInstruction .btn-close", function () {
  $("#back2Project").click();
});

//Remove Red Borders Errors
$(document).on(
  "click",
  "#idGroup, #idDRDate, #idLocation, #idEmployee, #idProject, #idItem, #idJRD, #idTOW, #idChecking, #idMH, #idRemarks, #trGroup, #getHour, #getMin",
  function () {
    $(this).removeClass("bg-err");
    $(this).removeClass("border border-danger");
  }
);

//sidebar
$(document).on("click", ".menu-one", function () {
  $(".sidebar").toggleClass("close");
});
$(document).on("click", ".menu-two", function () {
  $(".sidebar").addClass("close");
});

// FOR GROUP LIST
$(document).on("change", "#idGroup", function () {
  //select Group Event
  sequenceValidation();
  getEmployees()
    .then((emps) => {
      fillEmployees(emps);
    })
    .catch((error) => {
      alert(`${error}`);
    });

  // $("#idJRD, #idItem, #idProject, #idEmployee").val("");
  $("#p1").text("");
  $(this).removeClass("border-danger");
  // $(".iow").removeClass("active");
});

// FOR LOCATION LIST
$(document).on("change", "#idLocation", function () {
  //select Location Event
  MHValidation();
  $("#p3").text("");
  $(this).removeClass("border-danger");
});

// FOR EMPLOYEE LIST
$(document).on("change", "#idEmployee", function () {
  //select Employee Event
  var thisEmpID = $($(this).find("option:selected")).attr("emp-id"); //get ID of selected Employee
  sequenceValidation();
  getProjects(thisEmpID)
    .then((projs) => {
      resetSelection(1);
      fillProjects(projs);
    })
    .catch((error) => {
      alert(`${error}`);
    });

  $("#p4").text("");
  $(this).removeClass("border-danger");
  // getProjects(thisEmpID);
});

// FOR PROJECTS LIST
$(document).on("change", "#idProject", function () {
  //select Project Event
  var thisEmpID = $("#idEmployee").val(); //get ID of selected Employee
  var projID = $($(this).find("option:selected")).attr("proj-id"); //get ID of selected Project
  sequenceValidation();
  Promise.all([
    getItems(thisEmpID, projID),
    getTOW(projID),
    getCheckers(projID),
    isDrawing(),
  ])
    .then(([items, tows, checks]) => {
      resetSelection(2);
      fillItems(items);
      fillTOW(tows);
      disableTimeInput(projID);
      MHValidation();
      fillCheckers(checks);
    })
    .catch((error) => {
      alert(`${error}`);
    });

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
  // $(".iow").removeClass("active");
  $("#p5").text("");
  $(this).removeClass("border-danger");

  if (projID == leaveID) {
    $("#itemlbl").html("Leave Type");
    $("#lbltow").html("Day Type");
  } else {
    $("#itemlbl").html("Item of Works");
    $("#lbltow").html("Type of Work");
  }

  $(".trgrp").remove();
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
  var checkItemID = noMoreInputItems.includes(itemID);
  sequenceValidation();
  if (itemID != 0) {
    getJobs(thisEmpID, projID, itemID)
      .then((jobs) => {
        resetSelection(3);
        fillJobs(jobs);
        getLabel(itemID);
      })
      .catch((error) => {
        alert(`${error}`);
      });
    // getJobs(thisEmpID, projID, itemID);
    // getLabel(itemID);
  }

  // $(".trgrp").remove();
  // disableInputs(projID, itemID);
  if (checkItemID) {
    $("#drInstruction").modal("show");
  }
  // trainingGroup(itemID);
  // getJobs(projID, itemID);
  $("#p6").text("");
  $(this).removeClass("border-danger");
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
  if (this.value == 3) {
    $(".checker").removeClass("d-none");
  } else {
    $(".checker").addClass("d-none");
  }
  if (this.value == 0) {
    $(".checker").addClass("d-none");
  }
  $("#idChecking").prop("selectedIndex", 0);
  var towVal = $($(this).find("option:selected")).attr("tow-id");
  if (towVal == 0) {
    $("#getHour").val("").change();
  }
  if (towVal == 10 || towVal == 11) {
    $("#getHour").val("4");
  }
  if (towVal == 12) {
    $("#getHour").val("8");
  }
  getTOWDesc(towVal);

  $("#p12").text("");
  $(this).removeClass("border-danger");
});
//Checker
$(document).on("change", "#idChecking", function () {
  $("#p9").text("");
  $(this).removeClass("border-danger");
});
//Hours Minutes
$(document).on("click", "#getHour, #getMin", function () {
  $("#p10").text("");
  $(this).removeClass("border-danger");
});
//ManHour Type
$(document).on("change", "#idMH", function () {
  $("#p11").text("");
  $(this).removeClass("border-danger");
});
// Add / Clear / Save Changes / Cancel Buttons
$(document).on("click", "#idReset", function () {
  //click Reset Event
  if ($(this).text().trim() == "Clear") {
    resetEntry();
  } else {
    cancelEditFunction();
  }
});
$(document).on("click", "#idAdd", function () {
  //click Add Event
  switch ($(this).text().trim()) {
    case "Add":
      addEntries(0);
      break;
    case "Save Changes":
      saveFunction();
      break;
  }
});

//disabling inputs as per sequence
$(document).on("change", "#idEmployee", function () {
  $("#idProject").prop("disabled", true);
  $("#idItem").prop("disabled", true);
  $("#idJRD").prop("disabled", true);
  sequenceValidation();
});

//#endregion
//#region FUNCTIONS

function checkAccess() {
  //authentication + authorization
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/check_login.php",
      dataType: "json",
      success: function (data) {
        console.log("checkAccess data: ", data);
        const empDetails = data;
        resolve(empDetails);
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
    // resolve(response);
  });
}
// function checkLogin() {
//   //check if user is logged in
//   $.ajax({
//     url: "Includes/check_login.php",
//     success: function (data) {
//       //ajax to check 9 is logged in
//       empDetails = $.parseJSON(data);
//       if (Object.keys(empDetails).length < 1) {
//         //if result is 0, redirect to log in page
//         window.location.href = rootFolder + "/KDTPortalLogin";
//       }
//     },
//     async: false,
//   });
// }

//GROUP FUNCTIONS
function getMyGroups(myEmpNum) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_my_groups.php",
      data: {
        empNum: myEmpNum,
      },
      dataType: "json",
      success: function (response) {
        const grps = response["result"];
        resolve(grps);
        // const groupIDS = grps.map((obj) => obj.abbreviation);
        // var grpSelect = $("#idGroup");
        // grpSelect.html(`<option value=0 grp-id=0>Select Group</option>`);
        // // grpSelect.html(`<option value='0' hidden>Select Group</option>`);
        // $.each(grps, function (index, item) {
        //   var option = $("<option>")
        //     .attr("value", item.id)
        //     .text(item.abbreviation)
        //     .attr("grp-id", item.id);
        //   grpSelect.append(option);
        // });
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
  });
}
function fillMyGroups(grps) {
  var grpSelect = $("#idGroup");
  grpSelect.html(`<option value=0 grp-id=0>Select Group</option>`);
  // grpSelect.html(`<option value='0' hidden>Select Group</option>`);
  $.each(grps, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.abbreviation)
      .attr("grp-id", item.id);
    grpSelect.append(option);
  });
}

//LOCATION FUNCTIONS
function getDispatchLoc() {
  //get Dispatch Location Selection
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_dispatch_loc.php",
      dataType: "json",
      success: function (response) {
        const locs = response["result"];
        resolve(locs);
        // const locsIDs = locs.map((obj) => obj.location);
        // var locSelect = $("#idLocation");
        // locSelect.html(`<option value=0 loc-id=0>Select Location</option>`);
        // // locSelect.html(`<option value='0' hidden>Select Location</option>`);
        // $.each(locs, function (index, item) {
        //   var option = $("<option>")
        //     .attr("value", item.id)
        //     .text(item.location)
        //     .attr("loc-id", item.id);
        //   locSelect.append(option);
        // });
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
function fillDispatchLoc(locs) {
  var locSelect = $("#idLocation");
  locSelect.html(`<option value=0 loc-id=0>Select Location</option>`);
  // locSelect.html(`<option value='0' hidden>Select Location</option>`);
  $.each(locs, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.location)
      .attr("loc-id", item.id);
    locSelect.append(option);
  });
}

//EMPLOYEE FUNCTIONS
function getEmployees() {
  //get EMPLOYEE Selection
  var groupID = $("#idGroup").val();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_member_list.php",
      data: {
        grpNum: groupID,
      },
      dataType: "json",
      success(response) {
        const emps = response["result"];
        resolve(emps);
        // const empsList = emps.map((obj) => obj.fullName);
        // var empSelect = $("#idEmployee");
        // empSelect.html(`<option value=0 emp-id=0>Select Employee</option>`);
        // // empSelect.html(`<option value='0' hidden>Select Employee</option>`);
        // $.each(emps, function (index, item) {
        //   var option = $("<option>")
        //     .attr("value", item.id)
        //     .text(item.fullName)
        //     .attr("emp-id", item.id);
        //   empSelect.append(option);
        // });
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching employees.");
        }
      },
    });
  });
}
function fillEmployees(emps) {
  var empSelect = $("#idEmployee");
  empSelect.html(`<option value=0 emp-id=0>Select Employee</option>`);
  // empSelect.html(`<option value='0' hidden>Select Employee</option>`);
  $.each(emps, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.fullName)
      .attr("emp-id", item.id);
    empSelect.append(option);
  });
}

//PROJECT FUNCTIONS
function getProjects(thisEmpID) {
  //get PROJECT Selection
  var proj = [];
  var groupID = $("#idGroup").val();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_projects.php",
      data: {
        grpNum: groupID,
        empNum: thisEmpID,
      },
      dataType: "json",
      success(response) {
        const projs = response["result"];
        resolve(projs);
        // const projList = projs.map((obj) => obj.projName);
        // var projSelect = $("#idProject");
        // projSelect.html(`<option value=0 proj-id=0>Select Project</option>`);
        // // empSelect.html(`<option value='0' hidden>Select Project</option>`);
        // $.each(projs, function (index, item) {
        //   var option = $("<option>")
        //     .attr("value", item.id)
        //     .text(item.projName)
        //     .attr("proj-id", item.id);
        //   projSelect.append(option);
        // });
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching projects.");
        }
      },
    });
  });
}
function fillProjects(projs) {
  var projSelect = $("#idProject");
  projSelect.html(`<option value=0 proj-id=0>Select Project</option>`);
  // empSelect.html(`<option value='0' hidden>Select Project</option>`);
  $.each(projs, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.projName)
      .attr("proj-id", item.id);
    projSelect.append(option);
  });
}

// Check if ProjID is for LEAVE
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

//ITEM of WORKS FUNCTIONS
function getItems(thisEmpID, projID) {
  //get Item Selection
  var itms = [];
  $("#labell").remove();
  var groupID = $("#idGroup").val();

  return new Promise((resolve, reject) => {
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
        const items = response["result"];
        resolve(items);
        // const itemList = items.map((obj) => obj.itemName);
        // var itemSelect = $("#idItem");
        // itemSelect.html(
        //   `<option value=0 item-id=0>Select Item of Works</option>`
        // );
        // // empSelect.html(`<option value='0' hidden>Select Item of Works</option>`);
        // $.each(items, function (index, item) {
        //   var option = $("<option>")
        //     .attr("value", item.id)
        //     .text(item.itemName)
        //     .attr("item-id", item.id);
        //   itemSelect.append(option);
        // });
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching items.");
        }
      },
    });
  });
}
function fillItems(items) {
  var itemSelect = $("#idItem");
  itemSelect.html(`<option value=0 item-id=0>Select Item of Works</option>`);
  // empSelect.html(`<option value='0' hidden>Select Item of Works</option>`);
  $.each(items, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.itemName)
      .attr("item-id", item.id);
    itemSelect.append(option);
  });
}
function getLabel(itemID) {
  //display label of selected item of work
  if (itemID == undefined) {
    return; //if there's no IoW selected
  }
  $.ajax({
    type: "POST",
    url: "php/get_label.php",
    data: {
      itemID: itemID,
    },
    dataType: "json",
    success(response) {
      const msg = response["result"];
      $("#labell").remove();
      $("#p6").after(`
        <span class="col-12 alert-primary text-primary" id="labell" role="alert">${msg}</span>
        `);
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching labels.");
      }
    },
  });
}

//JRD FUNCTIONS
function getJobs(thisEmpID, projID, itemID) {
  //get JRD Selection
  var jobs = [];
  var groupID = $("#idGroup").val();

  return new Promise((resolve, reject) => {
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
        const jobs = response["result"];
        resolve(jobs);
        // const jobList = jobs.map((obj) => obj.jobName);
        // var jobSelect = $("#idJRD");
        // jobSelect.html(
        //   `<option value=0 job-id=0>Select Job Request Description</option>`
        // );
        // // empSelect.html(`<option value='0' hidden>Select Job Request Description</option>`);
        // $.each(jobs, function (index, item) {
        //   var option = $("<option>")
        //     .attr("value", item.id)
        //     .text(item.jobName)
        //     .attr("job-id", item.id);
        //   jobSelect.append(option);
        // });
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching jobs.");
        }
      },
    });
  });
}
function fillJobs(jobs) {
  var jobSelect = $("#idJRD");
  jobSelect.html(
    `<option value=0 job-id=0>Select Job Request Description</option>`
  );
  // empSelect.html(`<option value='0' hidden>Select Job Request Description</option>`);
  $.each(jobs, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.jobName)
      .attr("job-id", item.id);
    jobSelect.append(option);
  });
}

//Types of Work FUNCTIONS
function getTOW(projID) {
  //get Types of Work Selection
  $("#idChecking").prop("selectedIndex", 0);
  $("#forChecking").hide();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_tow.php",
      data: {
        projID: projID,
      },
      dataType: "json",
      success(response) {
        const tow = response["result"];
        resolve(tow);
        // const towList = tow.map((obj) => obj.itemName);
        // var towSelect = $("#idTOW");
        // towSelect.html(`<option value=0 tow-id=0>Select Type of Work</option>`);
        // // empSelect.html(`<option value='0' hidden>Select ToW</option>`);
        // $.each(tow, function (index, item) {
        //   var option = $("<option>")
        //     .attr("value", item.id)
        //     .text(item.itemName)
        //     .attr("tow-id", item.id);
        //   towSelect.append(option);
        // });
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching ToW.");
        }
      },
    });
  });
}
function fillTOW(tows) {
  var towSelect = $("#idTOW");
  towSelect.html(`<option value=0 tow-id=0>Select Type of Work</option>`);
  // empSelect.html(`<option value='0' hidden>Select ToW</option>`);
  $.each(tows, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.itemName)
      .attr("tow-id", item.id);
    towSelect.append(option);
  });
}
function getTOWDesc(typesOfWorkID) {
  //get TOW Description Selection
  if (typesOfWorkID == 0) {
    $("#towDesc").html("-");
  }
  $.ajax({
    type: "POST",
    url: "php/get_tow_desc.php",
    data: {
      towID: typesOfWorkID,
    },
    dataType: "json",
    success(response) {
      const towDesc = response["result"];
      // const towDescList = towDesc.map((obj) => obj.itemName);
      var towDescSelect = $("#towDesc");
      towDescSelect.html(towDesc);
      // $("#towDesc").html(data.trim());
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        reject("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        reject("Internal Server Error: There was a server error.");
      } else {
        reject("An unspecified error occurred while fetching ToW Descs.");
      }
    },
  });
}

//for checking ToW
function getCheckers(projID) {
  //get Checkers Selection
  var empGrp = $("#idGroup").val();
  console.log("projID: ", projID);
  if (projID == 0) {
    $(".checker").addClass("d-none");
    return;
  }

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_checkers.php",
      data: {
        grpNum: empGrp,
        empNum: empDetails["empID"],
        projID: projID,
      },
      dataType: "json",
      success(response) {
        const checklist = response["result"];
        resolve(checklist);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching checkers.");
        }
      },
    });
  });
}

function fillCheckers(checks) {
  var checkSelect = $("#idChecking");
  checkSelect.html(`<option value=0 chk-id=0>Select Employee</option>`);
  // checkSelect.html(`<option value='0' hidden>Select Employee</option>`);
  $.each(checks, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.name)
      .attr("chk-id", item.id);
    checkSelect.append(option);
  });
}

//if Engineering Section
function isDrawing() {
  //enable/disable engineering selections
  isEngineering();
  hasJRD();
  hasTOW();
}
function isEngineering() {
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
  var isDrawing = true;
  var projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id")
  );
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

// Button Functions
function resetEntry() {
  //reset Inputs
  $("#getHour,#getMin,#idRemarks").val("").change();
  $("#idMH").val("").change();
  $(
    "#idGroup,#idEmployee,#idLocation,#idProject,#idItem,#idJRD,#idTOW,#towDesc,#trGroup"
  )
    .val(0)
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
  $("#id2DDiv").addClass("d-none");
  $("#idRevDiv").addClass("d-none");
  sequenceValidation();
}
function cancelEditFunction() {
  //cancel editables
  $("#idAdd").text("Add");
  $("#idReset").text("Clear");
  resetEntry();
}
function saveFunction() {
  //update database entry
  addEntries(editID);
}
//need fix tow, revision, check, mhtype, emp
function addEntries(addMode) {
  //add Entries to Database
  var tutri = $('input[name="radio"]:checked').val();
  var grp = $("#idGroup").val();
  var date = $("#idDRDate").val();
  var loc = $($("#idLocation").find("option:selected")).attr("loc-id");
  var emp = $($("#idEmployee").find("option:selected")).attr("emp-id");
  // var proj = parseInt(
  //   $($("#idProject").find("option:selected")).attr("proj-id")
  // );
  var proj = $($("#idProject").find("option:selected")).attr("proj-id");
  var item = $($("#idItem").find("option:selected")).attr("item-id");
  var trgrp = $($("#trGroup").find("option:selected")).val() || "";
  var jobreq = $($("#idJRD").find("option:selected")).attr("job-id") || "";
  var tow = $($("#idTOW").find("option:selected")).attr("tow-id");
  var hour = $("#getHour").val() * 60 || "0";
  var mins = $("#getMin").val() || "0";
  var getDuration = `${parseFloat(hour) + parseFloat(mins)}`;
  var revision = "";
  var mhtype = $($("#idMH").find("option:selected")).attr("mhid");
  var remarks = $("#idRemarks").val();
  var checker =
    $($("#idChecking").find("option:selected")).attr("chk-id") || "";
  var mgaKulang = [];

  if ($("#id2DDiv").hasClass("d-none")) {
    tutri = "";
  }
  if (!grp || grp == 0) {
    $("#p1").text("Please Select Group");
    $("#idGroup").addClass("border border-danger ").addClass("bg-err");
    mgaKulang.push("GROUP");
  }
  if (!date) {
    $("#p2").text("Please Select Date");
    $("#idDRDate").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("DATE");
  }
  if (!loc || loc == 0) {
    $("#p3").text("Please Select Location");
    $("#idLocation").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("LOCATION");
  }
  if (!emp || emp == 0) {
    $("#p4").text("Please Select Employee");
    $("#idEmployee").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("EMPLOYEE");
  }
  if (!proj || proj == 0) {
    $("#p5").text("Please Select Project");
    $("#idProject").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("PROJECT");
  }
  if (!item || item == 0) {
    $("#p6").text("Please Select Item of Works");
    $("#idItem").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("ITEM");
  }
  if ((!jobreq && proj != leaveID && proj != otherID) || jobreq == 0) {
    $("#p7").text("Please Select Job Request Description");
    $("#idJRD").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("JRD");
  }
  if ($("#idRev").is(":checked") && !$("#idRevDiv").hasClass("d-none")) {
    revision = 1;
  } else {
    revision = 0;
  }
  if (!tow && (!defaults.includes(proj) || proj == leaveID)) {
    if (proj == leaveID) {
      $("#p12").text("Please Select Day Type");
    } else {
      $("#p12").text("Please Select Type of Work");
    }
    $("#idTOW").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("TOW");
  }
  if (tow == 3) {
    //If checker
    if (!checker) {
      $("#p9").text("Please Select Member");
      $("#idChecking").addClass("border border-danger").addClass("bg-err");
      mgaKulang.push("CHECKER");
    }
  }
  if (hour > 1200 || hour < 0 || hour == 0) {
    //hour*60
    $("#p10").text("Please Input Valid Time");
    $("#getHour").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("ORAS");
  }
  if (mins > 59 || mins < 0) {
    $("#p10").text("Please Input Valid Time");
    $("#getMin").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("ORAS");
  }
  if ((hour == "" && mins == "") || (hour == 0 && mins == 0)) {
    $("#p10").text("Please Input Valid Time");
    $("#getHour").addClass("border border-danger").addClass("bg-err");
    $("#getMin").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("ORAS");
  }
  if (!mhtype && proj != leaveID) {
    $("#p11").text("Please Select Manhour Type");
    $("#idMH").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("MHTYPE");
  }
  if (proj == leaveID) {
    //IF LEAVE
    mhtype = 2;
  }
  if (item == oneBUTrainerID) {
    if (!trgrp) {
      $("#p13").text("Please Select Group To Train");
      $("#trGroup").addClass("border border-danger").addClass("bg-err");
      mgaKulang.push("TRGROUP");
    }
  }

  if (mgaKulang.length > 0) {
    console.log(mgaKulang);
    return;
  } else {
    //for (var pair of fd.entries()) {
    //   console.log(pair[0]+ ', ' + pair[1]);
    //}
    // return;
    // $.ajax({
    //   type: "POST",
    //   url: "ajax/add_entries.php",
    //   data: fd,
    //   contentType: false,
    //   cache: false,
    //   processData: false,
    //   success: function (data) {
    //     getEntries();
    //     resetEntry();
    //     if ($("#idAdd").text() != "Add") {
    //       $("#idAdd").text("Add");
    //       $("#idReset").text("Reset");
    //     }
    //     isDrawing();
    //     initCalendar();
    //     getPlans();
    //   },
    // });
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url: "php/add_entries.php",
        data: {
          tutri: tutri,
          grpNum: grp,
          selDate: date,
          locID: loc,
          empID: emp,
          projID: proj,
          itemID: item,
          trGrp: trgrp,
          towID: tow,
          revision: revision,
          duration: getDuration,
          mhType: mhtype,
          remarks: remarks,
          checking: checker,
          addType: addMode, // might remove
          empNum: empDetails["empID"],
        },
        dataType: "json",
        success(response) {
          console.log("add entry success response: ", response);
          getEntries();
          resetEntry();
          console.log("okay");
          resolve(response);
        },
        error: function (xhr, status, error) {
          console.log("error");
          if (xhr.status === 404) {
            reject("Not Found Error: The requested resources are not found.");
          } else if (xhr.status === 500) {
            reject("Internal Server Error: There was a server error.");
          } else {
            reject(error);
          }
        },
      });
    });
  }
}

//for sidebar
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
  // $.ajax({
  //   url: "php/get_date.php",
  //   success: function (response) {
  //     $("#idDRDate").val(response);
  //     console.log("date response: ", response);
  //   },
  //   async: false,
  // });

  // var datedate = new Date().toDateString();
  // console.log("toDate: ", datedate);
  // var currentDate = new Date().toISOString();
  // console.log("current ISO Date is: ", currentDate);
  // var currDate = currentDate.split("T")[0];
  // console.log("split date is: ", currDate);

  //test date
  var getDate = new Date();
  var offsetDate = getDate.getTimezoneOffset() * 60 * 1000;
  var localTime = getDate - offsetDate;
  var localTime = new Date(localTime);
  var iso = localTime.toISOString();
  var ISOFormatDate = iso.split("T")[0];
  console.log("test Date: ", ISOFormatDate);
  $("#idDRDate").val(ISOFormatDate);
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
        var addString = `<tr><td colspan='9'class="text-center py-5 "><h3>No Entries Found</h3></td></tr>`;
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
  console.log("reg: ", $("#regCount").val());
  console.log("ot: ", $("#otCount").val());
  console.log("leave: ", $("#lvCount").val());
}

function sequenceValidation() {
  //sequence checking Project->Item->Job
  $("#idEmployee").prop("disabled", true);
  $("#idProject").prop("disabled", true);
  $("#idItem").prop("disabled", true);
  $("#idJRD").prop("disabled", true);

  // Enabling Selection
  if ($("#idItem").val() > 0) {
    $("#idJRD").prop("disabled", false);
  }
  if ($("#idProject").val() > 0) {
    $("#idItem").prop("disabled", false);
  }
  if ($("#idEmployee").val() > 0) {
    $("#idProject").prop("disabled", false);
  }
  if ($("#idGroup").val() > 0) {
    $("#idEmployee").prop("disabled", false);
  }
}

function resetSelection(num) {
  var proj = $("#idProject"); //get Project selection
  var iow = $("#idItem"); // get IoW selection
  var jrd = $("#idJRD"); // get JRD selection
  var tow = $("#idTOW"); //get TOW selection

  if (num == 1) {
    proj.val(0).change();
    iow.val(0).change();
    jrd.val(0).change();
    console.log("reset 1");
  } else if (num == 2) {
    jrd.val(0).change();
    iow.val(0).change();
    tow.val(0).change();
    console.log("reset 2");
  } else if (num == 3) {
    jrd.val(0).change();
    console.log("reset 3");
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
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/check_workday.php",
      dataType: "json",
      success(data) {
        isWorkDay = data["result"];
        resolve(isWorkDay);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching Work Days.");
        }
      },
    });
  });
}

//calendar functions

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

// function addColors(currentMonth) {
//   var greenDates = [];
//   var redDates = [];
//   var holidates = [];
//   var allDates = [];
//   $.ajaxSetup({ async: false });
//   $.post(
//     "php/get_date_colors.php",
//     {
//       curMonth: currentMonth,
//       empNum: empDetails["empNum"],
//     },
//     function (data) {
//       allDates = $.parseJSON(data);
//       greenDates = allDates[0];
//       redDates = allDates[1];
//       holidates = allDates[2];
//     }
//   );
//   $.ajaxSetup({ async: true });
//   greenDates.forEach((element) => {
//     var spl = element.split("-");

//     var m = spl[1];
//     var da = spl[2];
//     var d = new Date(currentMonth);
//     var nowm = d.getMonth() + 1;
//     if (m > nowm) {
//       $(`.day.next-date:contains(${parseInt(da)})`)
//         .addClass("green")
//         .removeClass("red");
//     } else if (m < nowm) {
//       $(`.day.prev-date:contains(${parseInt(da)})`)
//         .addClass("green")
//         .removeClass("red");
//     } else {
//       $(".day")
//         .not(".next-date")
//         .not(".prev-date")
//         .filter(function () {
//           return $(this).text() === `${parseInt(da)}`;
//         })
//         .addClass("green")
//         .removeClass("red");
//     }
//   });
//   redDates.forEach((element) => {
//     var spl = element.split("-");

//     var mm = spl[1];
//     var daa = spl[2];
//     var d = new Date(currentMonth);
//     var nowmm = d.getMonth() + 1;

//     if (mm > nowmm) {
//       $(`.day.next-date:contains(${parseInt(daa)})`)
//         .addClass("red")
//         .removeClass("green");
//     } else if (mm < nowmm) {
//       $(`.day.prev-date:contains(${parseInt(daa)})`)
//         .addClass("red")
//         .removeClass("green");
//     } else {
//       $(".day")
//         .not(".next-date")
//         .not(".prev-date")
//         .filter(function () {
//           return $(this).text() === `${parseInt(daa)}`;
//         })
//         .addClass("red")
//         .removeClass("green");
//     }
//   });
//   holidates.forEach((element) => {
//     var rawHoliday = element.split("||");
//     var spl = rawHoliday[0].split("-");

//     var mm = spl[1];
//     var daa = spl[2];
//     var d = new Date(currentMonth);
//     var nowmm = d.getMonth() + 1;

//     if (mm > nowmm) {
//       $(`.day.next-date:contains(${parseInt(daa)})`).addClass("holiday");
//       $(`.day.next-date:contains(${parseInt(daa)})`).prop(
//         "title",
//         `${rawHoliday[1]}`
//       );
//     } else if (mm < nowmm) {
//       $(`.day.prev-date:contains(${parseInt(daa)})`).addClass("holiday");
//       $(`.day.prev-date:contains(${parseInt(daa)})`).prop(
//         "title",
//         `${rawHoliday[1]}`
//       );
//     } else {
//       $(".day")
//         .not(".next-date")
//         .not(".prev-date")
//         .filter(function () {
//           return $(this).text() === `${parseInt(daa)}`;
//         })
//         .addClass("holiday");
//       $(".day")
//         .not(".next-date")
//         .not(".prev-date")
//         .filter(function () {
//           return $(this).text() === `${parseInt(daa)}`;
//         })
//         .prop("title", `${rawHoliday[1]}`);
//     }
//   });
// }

//plan functions
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
    dataType: "json",
    success: function (data) {
      defaultsArray = data.result;
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
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_leave_id.php",
      dataType: "json",
      success(data) {
        lvID = data["result"];
        resolve(lvID);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching Leave ID.");
        }
      },
    });
  });
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
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_other_id.php",
      dataType: "json",
      success(data) {
        oID = data["result"];
        resolve(oID);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching Other ID.");
        }
      },
    });
  });
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
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_mng_id.php",
      dataType: "json",
      success(data) {
        mngID = data["result"];
        resolve(mngID);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching Mng ID.");
        }
      },
    });
  });
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
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_kia_id.php",
      dataType: "json",
      success(data) {
        kiaID = data["result"];
        resolve(kiaID);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching Kia ID.");
        }
      },
    });
  });
}

//items that triggers JMR Modal
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
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_nomoreinput_items.php",
      dataType: "json",
      success(data) {
        var nmIDs = data["result"];
        resolve(nmIDs);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject(
            "An unspecified error occurred while fetching NoMoreInputItems."
          );
        }
      },
    });
  });
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

// Adding JMR

//#endregion
