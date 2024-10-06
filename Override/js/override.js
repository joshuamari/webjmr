//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
let empDetails = [];
// var editID = "";
const defaults = getDefaults();
var regCount = 0;
var otCount = 0;
var lvCount = 0;
let leaveID = 0;
let otherID = 0;
let mngID = 0;
let kiaID = 0;
let noMoreInputItems = [];
let oneBUTrainerID = "";
let entryArr = [];
let editTRID = [];
let delTRID = [];
const mhtypes = [
  { id: 0, type: "Regular" },
  { id: 1, type: "Overtime" },
];
let editGrpID = 0;

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
checkAccess()
  .then((emp) => {
    if (emp.isSuccess) {
      empDetails = emp.result;
      $(".hello-user").text(empDetails["empFName"]);
      var thisEmpID = $($("#idEmployee").find("option:selected")).attr(
        "emp-id"
      );
      ifSmallScreen();
      initializeDate();
      sequenceValidation(0);
      var myEmpNum = empDetails["empID"];
      $(document).ready(function () {
        getMyGroups(myEmpNum)
          .then((grps) => {
            fillMyGroups(grps);
            Promise.all([
              getDispatchLoc(),
              getEntries(thisEmpID),
              getVariables(),
            ])
              .then(([locs, entryList, otherVar]) => {
                fillDispatchLoc(locs, 0);
                fillEntries(entryList);
                getMHCount(thisEmpID);
                fillMHType(0);
                kiaID += parseInt(otherVar.kia_id);
                leaveID += parseInt(otherVar.leaveID);
                mngID += parseInt(otherVar.mngID);
                otherID += parseInt(otherVar.otherProjID);
                oneBUTrainerID += parseInt(otherVar.oneBUTrainerID);
                noMoreInputItems = otherVar.noMoreIOW;
                $(".cs-loader").fadeOut(1000);
              })
              .catch((error) => {
                alert(`check Access => ${error}`);
              });
          })
          .catch((error) => {
            alert(`check Access => ${error}`);
          });
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
// FORM MODAL
$(document).on("click", "#back2Project", function () {
  $("#drInstruction").modal("hide");
  $("#idItem").val(0).change();
  // $("#labell").remove();
});
$(document).on("click", "#drInstruction .btn-close", function () {
  $("#back2Project").click();
});

//ENTRY MODAL
$(document).on("click", ".btn-close", function () {
  resetEntry();
  removeOutlines();
  $(this).closest(".modal").find("input").attr("disabled", true);
  $(".editInputError").removeClass("block");
  $(".editInputError").addClass("hidden");
});
$(document).on("click", ".btn-Ecancel", function () {
  // removeOutlines();
  $(this).closest(".modal").find(".btn-close").click();
});
$(document).on("click", ".btn-Eupdate", function () {
  let date = $("#idDRDate").val();
  let emp = $("#idEmployee").val();
  saveEdit()
    .then((status) => {
      if (status) {
        getEntries(emp)
          .then((entryList) => {
            fillEntries(entryList);
          })
          .catch((error) => {
            alert(`Add Entries (Save Edit): ${error}`);
          });
        resetEntry();
        $(this).closest(".modal").find(".btn-close").click();
        removeOutlines();
      } else {
        alert(`Unsucessful Save of Edit`);
      }
    })
    .catch((error) => {
      alert(`Save Edit Error: ${error}`);
    });
});

$(document).on("click", ".btn-Edelete", function () {
  deleteEntry(delTRID);
  $(this).closest(".modal").find(".btn-close").click();
});
//Remove Red Borders Errors
$(document).on(
  "click",
  "#idGroup, #idDRDate, #idLocation, #idEmployee, #idProject, #idItem, #idJRD, #idTOW, #idChecking, #idMH, #idRemarks, #trGroup, #getHour, #getMin",
  function () {
    $(this).removeClass("bg-err");
    $(this).removeClass("border border-danger");
    $(".missingInputs").addClass("hidden");
  }
);
$(document).on(
  "click",
  "#edit-selLoc, #edit-selProj, #edit-selIOW, #edit-selJRD, #edit-2d3d, #edit-rev, #edit-selTOW, #edit-selCheck, #edit-selMHType, #edit-newRemarks, #edit-trGroup, #edit-newHour, #edit-newMin",
  function () {
    $(".editInputError").removeClass("block").addClass("hidden");
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

//DATE
$(document).on("change", "#idDRDate", function () {
  //select Date Event
  var thisEmpID = $($("#idEmployee").find("option:selected")).attr("emp-id"); //get ID of selected Employee
  var selDate = $(this).val();
  Promise.all([getEntries(thisEmpID)])
    .then(([entryList]) => {
      fillEntries(entryList);
      MHValidation();
      getMHCount();
      sequenceValidation(0);
    })
    .catch((error) => {
      alert(`${error}`);
    });
});

// FOR GROUP LIST
$(document).on("change", "#idGroup", function () {
  //select Group Event
  resetEntry();
  sequenceValidation(0);
  getEmployees()
    .then((emps) => {
      fillEmployees(emps);
      let thisEmpID = $("#idEmployee").val();
      getEntries(thisEmpID)
        .then((entryList) => {
          console.log("fill entries next...");
          fillEntries(entryList);
          getMHCount();
        })
        .catch((error) => {
          alert(`${error}`);
        });
    })
    .catch((error) => {
      alert(`${error}`);
    });

  $(this).removeClass("border-danger");
  // $(".iow").removeClass("active");
});

// FOR LOCATION LIST
$(document).on("change", "#idLocation", function () {
  //select Location Event
  MHValidation();
  $(this).removeClass("border-danger");
});

// FOR EMPLOYEE LIST
$(document).on("change", "#idEmployee", function () {
  //select Employee Event
  var thisEmpID = $($(this).find("option:selected")).attr("emp-id"); //get ID of selected Employee
  var selDate = $("#idDRDate").val();
  var groupID = $("#idGroup").val();
  sequenceValidation(0);
  if (thisEmpID != 0 || thisEmpID != undefined) {
    Promise.all([
      getProjects(thisEmpID, groupID),
      getEntries(thisEmpID), //get text entries
    ])
      .then(([projs, entryList]) => {
        resetSelection(1, 0);
        fillProjects(projs, 0);
        fillEntries(entryList); //fill table entries
        getMHCount(thisEmpID);
      })
      .catch((error) => {
        alert(`${error}`);
      });
  }

  $(this).removeClass("border-danger");
});

// FOR PROJECTS LIST
$(document).on("change", "#idProject", function () {
  //select Project Event Type=[0]
  var thisEmpID = $("#idEmployee").val(); //get ID of selected Employee
  var projID = $($(this).find("option:selected")).attr("proj-id"); //get ID of selected Project
  var groupID = $("#idGroup").val();
  console.log("projID", projID);
  sequenceValidation(0);
  Promise.all([
    getItems(thisEmpID, projID, groupID),
    getTOW(projID),
    getCheckers(projID, groupID),
  ])
    .then(([items, tows, checks]) => {
      resetSelection(2, 0);
      fillItems(items, 0);
      fillTOW(tows, 0);
      disableTimeInput(projID, 0);
      MHValidation(0);
      fillCheckers(checks, 0);
      if (projID != null || projID != undefined) {
        isDrawing(0);
      }
    })
    .catch((error) => {
      alert(`${error}`);
    });
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
$(document).on("change", "#edit-selProj", function () {
  //select Project Event Type=[1]
  var thisEmpID = $("#idEmployee").val(); //get ID of selected Employee
  var projID = $($(this).find("option:selected")).attr("proj-id"); //get ID of selected Project
  // sequenceValidation(1);
  Promise.all([
    getItems(thisEmpID, projID, editGrpID),
    getTOW(projID),
    getCheckers(projID, editGrpID),
  ])
    .then(([items, tows, checks]) => {
      resetSelection(2, 1);
      console.log("fill items on change of project");
      fillItems(items, 1);
      fillTOW(tows, 1);
      disableTimeInput(projID, 1);
      MHValidation(1);
      fillCheckers(checks, 1);
      if (projID != null || projID != undefined) {
        isDrawing(1);
      }
    })
    .catch((error) => {
      alert(`${error}`);
    });
  $(this).removeClass("border-danger");

  if (projID == leaveID) {
    $("#edit-itemlbl").html("Leave Type");
    $("#edit-lbltow").html("Day Type");
  } else {
    $("#edit-itemlbl").html("Item of Works");
    $("#edit-lbltow").html("Type of Work");
  }
  $(".trgrp").remove();
});

// FOR ITEM OF WORKS LIST
$(document).on("change", "#idItem", function () {
  //select Item Event
  var thisEmpID = $("#idEmployee").val(); //get ID of selected Employee
  var projID = $("#idProject").val(); //get ID of selected Project
  var itemID = $($(this).find("option:selected")).attr("item-id"); //get ID of selected IoW
  var groupID = $("#idGroup").val();
  var checkItemID = noMoreInputItems.includes(itemID);
  sequenceValidation(0);
  if (itemID != 0) {
    Promise.all([getJobs(thisEmpID, projID, itemID, groupID), getTRGroups()])
      .then(([jobs, allgrps]) => {
        resetSelection(3, 0);
        fillJobs(jobs, 0);
        getLabel(itemID, 0);
        createTRGroupDiv(itemID, allgrps, 0);
      })
      .catch((error) => {
        alert(`${error}`);
      });
  }

  if (checkItemID) {
    $("#drInstruction").modal("show");
  }
  $(this).removeClass("border-danger");
});
$(document).on("change", "#edit-selIOW", function () {
  //select Item Event
  var thisEmpID = $("#idEmployee").val(); //get ID of selected Employee
  var projID = $("#edit-selProj").val(); //get ID of selected Project
  var itemID = $($(this).find("option:selected")).attr("item-id"); //get ID of selected IoW
  var checkItemID = noMoreInputItems.includes(itemID);
  // sequenceValidation(1);
  if (itemID != 0) {
    Promise.all([getJobs(thisEmpID, projID, itemID, editGrpID), getTRGroups()])
      .then(([jobs, allgrps]) => {
        resetSelection(3, 1);
        fillJobs(jobs, 1);
        getLabel(itemID, 1);
        createTRGroupDiv(itemID, allgrps, 1);
      })
      .catch((error) => {
        alert(`${error}`);
      });
  }

  if (checkItemID) {
    $("#drInstruction").modal("show");
  }
  $(this).removeClass("border-danger");
});

// FOR JOB REQ DESC LIST
$(document).on("change", "#idJRD", function () {
  var jrdID = $($(this).find("option:selected")).attr("job-id");
  $(this).removeClass("border-danger");
});
$(document).on("change", "#edit-selJRD", function () {
  var editselJRD = $($(this).find("option:selected")).attr("job-id");
  $(this).removeClass("border-danger");
});
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
  getTOWDesc(towVal, 0);

  $(this).removeClass("border-danger");
});
$(document).on("change", "#edit-selTOW", function () {
  //select TOW Event
  var towID = $($(this).find("option:selected")).attr("tow-id");
  if (this.value == 3) {
    $(".edit-check").removeClass("d-none");
  } else {
    $(".edit-check").addClass("d-none");
  }
  if (this.value == 0) {
    $(".edit-check").addClass("d-none");
  }
  $("#edit-selCheck").prop("selectedIndex", 0);
  var towVal = $($(this).find("option:selected")).attr("tow-id");
  if (towVal == 0) {
    $("#edit-newHour").val("").change();
  }
  if (towVal == 10 || towVal == 11) {
    $("#edit-newHour").val("4");
  }
  if (towVal == 12) {
    $("#edit-newHour").val("8");
  }
  getTOWDesc(towVal, 1);

  $(this).removeClass("border-danger");
});
//Checker
$(document).on("change", "#idChecking", function () {
  $(this).removeClass("border-danger");
});

//Hours Minutes
$(document).on("click", "#getHour, #getMin", function () {
  $(this).removeClass("border-danger");
});

//ManHour Type
$(document).on("change", "#idMH", function () {
  $(this).removeClass("border-danger");
});

// Add / Clear
$(document).on("click", "#idReset", function () {
  //click Reset Event
  resetEntry();
});
$(document).on("click", "#idAdd", function () {
  //click Add Event
  addEntries();
});

//Entry Table Buttons
$(document).on("click", "#dupeBut", function () {
  var entryID = $(this).closest("tr").attr("entry-id");
  const entryRow = entryArr.filter((entry) => entry.id === entryID);
  editGrpID = entryRow[0].groupID;
  dupeEntry(entryRow);
});

$(document).on("click", "#editBut", function () {
  var empText = $("#idEmployee option:selected").text();

  var entryID = $(this).closest("tr").attr("entry-id");
  const entryRow = entryArr.filter((entry) => entry.id === entryID);
  editTRID = entryID;
  console.log("entryID", entryID, "entryArr", entryArr);
  console.log("entryRow (onclick Edit)", entryRow);

  fillEditFields(entryRow);
  $("#emp-edit").html(empText);
  $("#editEntry").modal("show");
});
$(document).on("click", "#delBut", function () {
  delTRID = $(this).closest("tr").attr("entry-id");
  $("#deleteEntry").modal("show");
});

//copy button
$(document).on("click", "#idCopy", function () {
  var copyfrom = $("#idCopyDate").val();
  var empName = $($("#idEmployee").find("option:selected")).attr("emp-id");

  if (!copyfrom || !empName) {
    alert("Please Select an Employee & a Date to Copy From");
  }
  copyEntries();
});

//disabling inputs as per sequence
$(document).on("change", "#idEmployee", function () {
  $("#idProject").prop("disabled", true);
  $("#idItem").prop("disabled", true);
  $("#idJRD").prop("disabled", true);
  sequenceValidation(0);
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

// COMPILED VARIABLES
function getVariables() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/global_variables.php",
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.");
        }
      },
    });
    // resolve(response);
  });
}

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
  grpSelect.html(
    `<option selected hidden value=0 grp-id=0>Select Group</option>`
  );
  if (grps.length > 1) {
    grps = grps.sort(function (a, b) {
      var first = a.abbreviation.toUpperCase();
      var second = b.abbreviation.toUpperCase();
      return first < second ? -1 : first > second ? 1 : 0;
    });
  }

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
function fillDispatchLoc(locs, type) {
  var locSelect = $("#idLocation");
  var editLocSel = $("#edit-selLoc");
  if (type == 0) {
    locSelect.html(
      `<option selected hidden value=0 loc-id=0>Select Location</option>`
    );
    $.each(locs, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.location)
        .attr("loc-id", item.id);
      locSelect.append(option);
    });
  } else {
    editLocSel.html(
      `<option selected hidden value=0 loc-id=0>Select Location</option>`
    );
    $.each(locs, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.location)
        .attr("loc-id", item.id);
      editLocSel.append(option);
    });
  }
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
      success: function (response) {
        const emps = response["result"];
        resolve(emps);
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
  empSelect.html(
    `<option selected hidden value=0 emp-id=0>Select Employee</option>`
  );
  // let formattedName = formatName(emps);
  $.each(emps, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(formatName(item.fullName))
      .attr("emp-id", item.id);
    empSelect.append(option);
  });
}

function formatName(emp) {
  let names = [];
  const splitName = emp.split(", ");
  const splitFName = splitName[1].split(" ");
  $.each(splitName, function (index, name) {
    let lower = name.toLowerCase();
    let capital = lower.charAt(0).toUpperCase() + lower.slice(1);
    names.push(capital);
  });
  names[1] = splitFName.join(" ");
  const newname = names.join(", ");
  return newname;
}

//PROJECT FUNCTIONS
function getProjects(thisEmpID, grpID) {
  //get PROJECT Selection
  // var groupID = $("#idGroup").val();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_projects.php",
      data: {
        grpNum: grpID,
        empNum: thisEmpID,
      },
      dataType: "json",
      success: function (response) {
        const projs = response["result"];
        resolve(projs);
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
function fillProjects(projs, type) {
  // console.log("all projs", projs);
  var projSelect = $("#idProject");
  var editProjSel = $("#edit-selProj");
  if (type == 0) {
    projSelect.html(
      `<option selected hidden value=0 proj-id=0>Select Project</option>`
    );
    $.each(projs, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.projName)
        .attr("proj-id", item.id);
      projSelect.append(option);
    });
  } else {
    editProjSel.html(
      `<option selected hidden value=0 proj-id=0>Select Project</option>`
    );
    $.each(projs, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.projName)
        .attr("proj-id", item.id);
      editProjSel.append(option);
    });
  }
}

// Check if ProjID is for LEAVE
function disableTimeInput(projID, type) {
  //disable Time Input
  if (type == 0) {
    $("#getHour").prop("disabled", false);
    $("#getMin").prop("disabled", false);
    if (projID == leaveID) {
      $("#getHour").prop("disabled", true);
      $("#getMin").prop("disabled", true);
    }
  } else {
    $("#edit-newHour").prop("disabled", false);
    $("#edit-newMin").prop("disabled", false);
    if (projID == leaveID) {
      $("#edit-newHour").prop("disabled", true);
      $("#edit-newMin").prop("disabled", true);
    }
  }
}
function MHValidation(type) {
  //enable/disable manhour type selection
  if (type == 0) {
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
      $("#idMH").val(0);
      if (!isWorkDay(selLoc)) {
        alert("Leave disabled on holidays/weekends");
        $("#idProject").val(0).change();
      }
    }
  } else {
    var projID = $($("#edit-selProj").find("option:selected")).attr("proj-id");
    var selLoc = "KDT";

    if ($("#edit-selLoc").val()) {
      selLoc = $("#edit-selLoc").val();
    }
    if (projID != leaveID) {
      //if Project selected is not LEAVE
      $("#edit-selMHType").prop("disabled", false);
      if (!isWorkDay(selLoc)) {
        $("#edit-selMHType").val("Overtime");
        $("#edit-selMHType").prop("disabled", true);
      }
      if (selLoc == "WFH") {
        $("#edit-selMHType").val("Regular");
        $("#edit-selMHType").prop("disabled", true);
      }
    } else {
      $("#edit-selMHType").prop("disabled", true);
      $("#edit-selMHType").val(0);
      if (!isWorkDay(selLoc)) {
        alert("Leave disabled on holidays/weekends");
        $("#edit-selProj").val(0).change();
      }
    }
  }
}

//ITEM of WORKS FUNCTIONS
function getItems(thisEmpID, projID, grpID) {
  //get Item Selection
  var itms = [];
  console.log("parameters: ", thisEmpID, projID, grpID);
  $("#labell").remove();
  $("#edit-labell").remove();
  // var groupID = $("#idGroup").val();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_items.php",
      data: {
        empNum: thisEmpID,
        projID: projID,
        grpNum: grpID,
      },
      dataType: "json",
      success: function (response) {
        const items = response["result"];
        resolve(items);
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
function fillItems(items, type) {
  var itemSelect = $("#idItem");
  var editIOWSel = $("#edit-selIOW");
  if (type == 0) {
    itemSelect.html(
      `<option selected hidden value=0 item-id=0>Select Item of Works</option>`
    );
    $.each(items, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.itemName)
        .attr("item-id", item.id);
      itemSelect.append(option);
    });
  } else {
    editIOWSel.html(
      `<option selected hidden value=0 item-id=0>Select Item of Works</option>`
    );
    $.each(items, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.itemName)
        .attr("item-id", item.id);
      editIOWSel.append(option);
    });
  }
}
function getLabel(itemID, type) {
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
    success: function (response) {
      if (response.isSuccess) {
        const lbl = response["result"]["fldLabel"];
        if (type == 0) {
          $("#labell").remove();
          $("#iowLbl").after(`
          <span class="col-12 alert-primary text-primary" id="labell" role="alert">${lbl}</span>
          `);
        } else {
          console.log("lbl", lbl);
          console.log("paste IOW label");
          $("#edit-labell").remove();
          $(".editIoWLbl").removeClass("hidden").addClass("block");
          $(".editIoWLbl").after(`
          <span class="col-12 alert-primary text-primary" id="edit-labell" role="alert">${lbl}</span>
          `);
        }
      }
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
function getJobs(thisEmpID, projID, itemID, grpID) {
  //get JRD Selection
  var jobs = [];
  // var groupID = $("#idGroup").val();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_jobs.php",
      data: {
        empNum: thisEmpID,
        projID: projID,
        grpNum: grpID,
        itemID: itemID,
      },
      dataType: "json",
      success: function (response) {
        const jobs = response["result"];
        resolve(jobs);
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
function fillJobs(jobs, type) {
  var jobSelect = $("#idJRD");
  var editJobSel = $("#edit-selJRD");
  if (type == 0) {
    jobSelect.html(
      `<option selected hidden value=0 job-id=0>Select Job Request Description</option>`
    );
    $.each(jobs, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.jobName)
        .attr("job-id", item.id);
      jobSelect.append(option);
    });
  } else {
    editJobSel.html(
      `<option selected hidden value=0 job-id=0>Select Job Request Description</option>`
    );
    $.each(jobs, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.jobName)
        .attr("job-id", item.id);
      editJobSel.append(option);
    });
  }
}

//items that triggers JMR Modal Instruction
function getNoMoreInputItems() {
  //get ids of no more input
  var nmiIDs = [];
  // $.ajax({
  //   url: "php/get_nomoreinput_items.php",
  //   success: function (data) {
  //     nmiIDs = $.parseJSON(data);
  //   },
  //   async: false,
  // });
  // return nmiIDs;
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_nomoreinput_items.php",
      dataType: "json",
      success: function (data) {
        nmIDs = data["result"];
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
      success: function (response) {
        const tow = response["result"];
        resolve(tow);
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
function fillTOW(tows, type) {
  var towSelect = $("#idTOW");
  var editTOWSel = $("#edit-selTOW");
  if (type == 0) {
    towSelect.html(
      `<option selected hidden value=0 tow-id=0>Select...</option>`
    );
    $.each(tows, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.itemName)
        .attr("tow-id", item.id);
      towSelect.append(option);
    });
  } else {
    editTOWSel.html(
      `<option selected hidden value=0 tow-id=0>Select...</option>`
    );
    $.each(tows, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.itemName)
        .attr("tow-id", item.id);
      editTOWSel.append(option);
    });
  }
}
function getTOWDesc(typesOfWorkID, type) {
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
    success: function (response) {
      const towDesc = response["result"];
      if (type == 0) {
        var towDescSelect = $("#towDesc");
        towDescSelect.html(towDesc);
      } else {
        var towDescSelect = $("#edit-towDesc");
        towDescSelect.html(towDesc);
      }
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
function getCheckers(projID, grpID) {
  //get Checkers Selection
  // var empGrp = $("#idGroup").val();
  if (projID == 0 || projID == undefined) {
    $(".checker").addClass("d-none");
    return;
  }

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_checkers.php",
      data: {
        grpNum: grpID,
        empNum: empDetails["empID"],
        projID: projID,
      },
      dataType: "json",
      success: function (response) {
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
function fillCheckers(checks, type) {
  var checkSelect = $("#idChecking");
  var editCheckSel = $("#edit-selCheck");
  if (type == 0) {
    checkSelect.html(
      `<option selected hidden value=0 chk-id=0>Select Employee</option>`
    );
    $.each(checks, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.name)
        .attr("chk-id", item.id);
      checkSelect.append(option);
    });
  } else {
    editCheckSel.html(
      `<option selected hidden value=0 chk-id=0>Select Employee</option>`
    );
    $.each(checks, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.name)
        .attr("chk-id", item.id);
      editCheckSel.append(option);
    });
  }
}

//if Engineering Section
function isDrawing(type) {
  //enable/disable engineering selections
  if (type == 0) {
    isEngineering(0);
    hasJRD(0);
    hasTOW(0);
  } else {
    isEngineering(1);
    hasJRD(1);
    hasTOW(1);
  }
}
function isEngineering(type) {
  var isDrawing = true;
  var projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id")
  );
  var editprojID = parseInt(
    $($("#edit-selProj").find("option:selected")).attr("proj-id")
  );
  var selGroup = $("#idGroup").val();
  if (type == 0) {
    isDrawing =
      !defaults.includes(projID) &&
      selGroup != 16 && //System Group
      selGroup != 10 && //IT Group
      projID != 0 &&
      projID != null &&
      projID != undefined;
    // return isDrawing;
    if (isDrawing) {
      $("#id2DDiv").removeClass("d-none");
      $("#idRevDiv").removeClass("d-none");
    } else {
      $("#id2DDiv").addClass("d-none");
      $("#idRevDiv").addClass("d-none");
    }
  } else {
    isDrawing =
      !defaults.includes(editprojID) &&
      editGrpID != 16 && //System Group
      editGrpID != 10 && //IT Group
      editprojID != 0 &&
      editprojID != null &&
      editprojID != undefined;
    // return isDrawing;
    if (isDrawing) {
      $("input[name=edt-radio]").prop("disabled", false);
      $("#edit-rev").prop("disabled", false);

      $("#edit-2D3DDiv").removeClass("d-none");
      $("#edit-RevDiv").removeClass("d-none");
    } else {
      $("#edit-2D3DDiv").addClass("d-none");
      $("#edit-RevDiv").addClass("d-none");
    }
  }
}
function hasJRD(type) {
  var isDrawing = true;
  var projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id")
  );
  var editprojID = parseInt(
    $($("#edit-selProj").find("option:selected")).attr("proj-id")
  );
  var selGroup = $("#idGroup").val();

  if (type == 0) {
    isDrawing = projID != leaveID && projID != otherID;
    if (isDrawing) {
      $("#idJRDDiv").removeClass("d-none");
    } else {
      $("#idJRDDiv").addClass("d-none");
    }
  } else {
    isDrawing = editprojID != leaveID && editprojID != otherID;
    if (isDrawing) {
      $("#edit-JRDDiv").removeClass("d-none");
    } else {
      $("#edit-JRDDiv").addClass("d-none");
    }
  }
}
function hasTOW(type) {
  var isDrawing = true;
  var projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id")
  );
  var editprojID = parseInt(
    $($("#edit-selProj").find("option:selected")).attr("proj-id")
  );
  var selGroup = $("#idGroup").val();
  if (type == 0) {
    isDrawing =
      !defaults.includes(projID) &&
      projID != 0 &&
      projID != null &&
      projID != undefined;
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
  } else {
    isDrawing =
      !defaults.includes(editprojID) &&
      editprojID != 0 &&
      editprojID != null &&
      editprojID != undefined;
    if (isDrawing) {
      $("#edit-TOWDiv").removeClass("d-none");
      $("#edit-TOWDescDiv").removeClass("d-none");
    } else {
      $("#edit-TOWDiv").addClass("d-none");
      $("#edit-TOWDescDiv").addClass("d-none");
    }
    if (editprojID == leaveID) {
      $("#edit-TOWDiv").removeClass("d-none");
      $("#edit-TOWDescDiv").removeClass("d-none");
    }
  }
}

//for Training Selection
function createTRGroupDiv(itemID, allgrps, type) {
  //check if item of work is for training for one bu
  if (itemID == 14) {
    if (type == 0) {
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
      fillTRGroups(allgrps, 0);
    } else {
      $(".edit-iow").after(`
      <div class="row mb-2 trgrp">
        <label for="edit-trGroup" class="col-form-label col-form-label-sm">Group of Trainees</label>
        <div class="input-group">
          <select class="form-select" id="edit-trGroup" required>
          <option value="" selected hidden>Select Group to Train</option>
          </select>
        </div>
        <small class="editTRGrpError hidden">Please Complete the Field</small>
      </div>
      `);
      fillTRGroups(allgrps, 1);
    }
  } else {
    $(".trgrp").remove();
  }
}

function fillTRGroups(allgrps, type) {
  var trgrpSelect = $("#trGroup");
  var editTRGrpSel = $("#edit-trGroup");
  if (type == 0) {
    trgrpSelect.html(
      `<option selected hidden value=0 trgrp-id=0>Select Training Group</option>`
    );
    $.each(allgrps, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.abbreviation)
        .attr("chk-id", item.id);
      trgrpSelect.append(option);
    });
  } else {
    editTRGrpSel.html(
      `<option selected hidden value=0 trgrp-id=0>Select Training Group</option>`
    );
    $.each(allgrps, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.abbreviation)
        .attr("chk-id", item.id);
      editTRGrpSel.append(option);
    });
  }
}

function getTRGroups() {
  //get groups for training group selection
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_groups.php",
      dataType: "json",
      success: function (data) {
        var allGroups = data["result"];
        resolve(allGroups);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject(
            "An unspecified error occurred while fetching Training Groups."
          );
        }
      },
    });
  });
}

//Time
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

  $("#regCount").text(parseFloat(regCount).toFixed(2));
  $("#otCount").text(parseFloat(otCount).toFixed(2));
  $("#lvCount").text(parseFloat(lvCount).toFixed(2));
  reg = parseFloat(regCount);
  ot = parseFloat(otCount);
  lv = parseFloat(lvCount);

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
function fillMHType(type) {
  var mhTypeSelect = $("#idMH");
  var editMHTypeSel = $("#edit-selMHType");

  // return;
  if (type == 0) {
    mhTypeSelect.html(
      `<option selected hidden value=null mhid=null>Select Manhour Type</option>`
    );
    $.each(mhtypes, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.type)
        .attr("mhid", item.id);
      mhTypeSelect.append(option);
    });
  } else {
    editMHTypeSel.html(
      `<option selected hidden value=null edtmhid=null>Select Manhour Type</option>`
    );
    $.each(mhtypes, function (index, item) {
      var option = $("<option>")
        .attr("value", item.id)
        .text(item.type)
        .attr("edtmhid", item.id);
      editMHTypeSel.append(option);
    });
  }
}

// Button Functions
function resetEntry() {
  //reset Inputs
  $("#getHour,#getMin,#idRemarks").val("").change();
  $("#idMH").val("null").change();
  // $("#towDesc").val("");
  // $("#idGroup,#idEmployee").val(0).change();
  $("#idLocation,#idProject,#idItem,#idJRD,#idTOW,#trGroup").val(0).change();
  // $("#one").click();
  $("#idRev").prop("checked", false);
  $("#edit-rev").prop("checked", false);
  $(
    "#idGroup,#idEmployee,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate,#trGroup"
  )
    .removeClass("border border-danger")
    .removeClass("bg-err");

  $(".checker").addClass("d-none");
  $("#id2DDiv").addClass("d-none");
  $("#idRevDiv").addClass("d-none");
  sequenceValidation(0);
  // resetSelection(1);
}
function cancelEditFunction() {
  //cancel editables
  $("#idAdd").text("Add");
  $("#idReset").text("Clear");
  resetEntry();
}
function saveEdit() {
  //update database entry
  const grp = editGrpID;
  const date = $("#idDRDate").val();
  const emp = $($("#idEmployee").find("option:selected")).attr("emp-id");
  const entryID = editTRID;

  const loc = $($("#edit-selLoc").find("option:selected")).attr("loc-id");
  const proj = $($("#edit-selProj").find("option:selected")).attr("proj-id");
  const item = $($("#edit-selIOW").find("option:selected")).attr("item-id");
  const trgrp = $($("#edit-trGroup").find("option:selected")).val() || "";
  const jobreq =
    $($("#edit-selJRD").find("option:selected")).attr("job-id") || "";
  let tutri = $('input[name="edt-radio"]:checked').val();
  let revision = $("#edit-rev").is(":checked");
  const tow = $($("#edit-selTOW").find("option:selected")).attr("tow-id");
  const checker =
    $($("#edit-selCheck").find("option:selected")).attr("chk-id") || "";
  const hour = $("#edit-newHour").val() * 60 || "0";
  const mins = $("#edit-newMin").val() || "0";
  const getDuration = `${parseFloat(hour) + parseFloat(mins)}`;
  let mhtype = $($("#edit-selMHType").find("option:selected")).attr("edtmhid");
  const remarks = $("#edit-newRemarks").val();

  let isSuccessful = false;
  let mgaKulang = [];

  if ($("#edit-2D3DDiv").hasClass("d-none")) {
    tutri = "";
  }
  if (!grp || grp == 0) {
    $("#idGroup").addClass("border border-danger ").addClass("bg-err");
    mgaKulang.push("GROUP");
  }
  if (!date) {
    $("#idDRDate").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("DATE");
  }
  if (!emp || emp == 0) {
    $("#idEmployee").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("EMPLOYEE");
  }
  if (!loc || loc == 0) {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-selLoc").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("LOCATION");
  }
  if (!proj || proj == 0) {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-selProj").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("PROJECT");
  }
  if (!item || item == 0) {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-selIOW").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("ITEM");
  }
  if (
    (!$("#edit-selJRD").hasClass("d-none") && jobreq == 0) ||
    (!$("#edit-selJRD").hasClass("d-none") && jobreq == null)
  ) {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-selJRD").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("JRD");
  }
  if (!jobreq && proj != leaveID && proj != otherID) {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-selJRD").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("JRD");
  }
  if (revision) {
    revision = 1;
  } else {
    revision = 0;
  }
  if (
    (!$("#edit-TOWDiv").hasClass("d-none") && tow == 0) ||
    (!$("#edit-TOWDiv").hasClass("d-none") && tow == null)
  ) {
    console.log("tow on display");
    $("#edit-selTOW").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idTOW");
    mgaKulang.push("TOW");
  } else {
    console.log("tow hidden");
  }
  if (!tow || tow == 0) {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-selTOW").addClass("border border-danger").addClass("bg-err");
  }
  if (!tow && (!defaults.includes(proj) || proj == leaveID)) {
    if (proj == leaveID) {
      $(".editInputError").removeClass("hidden").addClass("block");
    } else {
      $(".editInputError").removeClass("hidden").addClass("block");
    }
    $("#edit-selTOW").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("TOW");
  }
  if (tow == 3) {
    //If checker
    if (!checker || checker == 0) {
      $(".editInputError").removeClass("hidden").addClass("block");
      $("#edit-selCheck").addClass("border border-danger").addClass("bg-err");
      mgaKulang.push("CHECKER");
    }
  }
  if (hour > 1200 || hour < 0 || hour == 0) {
    //hour*60
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-newHour").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("ORAS");
  }
  if (mins > 59 || mins < 0) {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-newMin").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("ORAS");
  }
  if ((hour == "" && mins == "") || (hour == 0 && mins == 0)) {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-newHour").addClass("border border-danger").addClass("bg-err");
    $("#edit-newMin").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("ORAS");
  }
  if ((!mhtype && proj != leaveID) || mhtype == "null") {
    $(".editInputError").removeClass("hidden").addClass("block");
    $("#edit-selMHType").addClass("border border-danger").addClass("bg-err");
    mgaKulang.push("MHTYPE");
  }
  if (proj == leaveID) {
    //IF LEAVE
    mhtype = 2;
  }
  if (item == 14) {
    if (!trgrp || trgrp == 0) {
      $(".editInputError").removeClass("hidden").addClass("block");
      $("#edit-trGroup").addClass("border border-danger").addClass("bg-err");
      mgaKulang.push("TRGROUP");
    }
  }

  return new Promise((resolve, reject) => {
    if (mgaKulang.length > 0) {
      console.log(mgaKulang);
      reject("Missing Input Fields");
    } else {
      $.ajax({
        type: "POST",
        url: "php/update_entries.php",
        data: {
          drID: entryID,
          twoDthreeD: tutri,
          grpNum: grp,
          selDate: date,
          locID: loc,
          empNum: emp,
          projID: proj,
          itemID: item,
          jobReqDesc: jobreq,
          trGrp: trgrp,
          TOWID: tow,
          revision: revision,
          duration: getDuration,
          manhour: mhtype,
          remarks: remarks,
          checker: checker,
          overrideEmpNum: empDetails["empID"],
        },
        dataType: "json",
        success: function (response) {
          isSuccessful = true;
          resolve(isSuccessful);
        },
        error: function (xhr, status, error) {
          if (xhr.status === 404) {
            reject("Not Found Error: The requested resources are not found.");
          } else if (xhr.status === 500) {
            reject("Internal Server Error: There was a server error.");
          } else {
            reject(error);
          }
        },
      });
    }
  });
}

//Add Entry
function addEntries() {
  //add Entries to Database
  let tutri = $('input[name="radio"]:checked').val();
  const grp = $("#idGroup").val();
  const date = $("#idDRDate").val();
  const loc = $($("#idLocation").find("option:selected")).attr("loc-id");
  const emp = $($("#idEmployee").find("option:selected")).attr("emp-id");
  const proj = $($("#idProject").find("option:selected")).attr("proj-id");
  const item = $($("#idItem").find("option:selected")).attr("item-id");
  const trgrp = $($("#trGroup").find("option:selected")).val() || "";
  const jobreq = $($("#idJRD").find("option:selected")).attr("job-id") || "";
  const tow = $($("#idTOW").find("option:selected")).attr("tow-id");
  const hour = $("#getHour").val() * 60 || "0";
  const mins = $("#getMin").val() || "0";
  const getDuration = `${parseFloat(hour) + parseFloat(mins)}`;
  let revision = $("#idRev").is(":checked");
  let mhtype = $($("#idMH").find("option:selected")).attr("mhid");
  const remarks = $("#idRemarks").val();
  const checker =
    $($("#idChecking").find("option:selected")).attr("chk-id") || "";
  let mgaKulang = [];
  let noInput = null;

  console.log("rev state", revision);
  if ($("#id2DDiv").hasClass("d-none")) {
    tutri = "";
  }
  if (!grp || grp == 0) {
    $("#idGroup").addClass("border border-danger ").addClass("bg-err");
    if (!noInput) noInput = $("#idGroup");
    mgaKulang.push("GROUP");
  }
  if (!date) {
    $("#idDRDate").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idDRDate");
    mgaKulang.push("DATE");
  }
  if (!loc || loc == 0) {
    $("#idLocation").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idLocation");
    mgaKulang.push("LOCATION");
  }
  if (!emp || emp == 0) {
    $("#idEmployee").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idEmployee");
    mgaKulang.push("EMPLOYEE");
  }
  if (!proj || proj == 0) {
    $("#idProject").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idProject");
    mgaKulang.push("PROJECT");
  }
  if (!item || item == 0) {
    $("#idItem").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idItem");
    mgaKulang.push("ITEM");
  }
  if (
    (!$("#idJRDDiv").hasClass("d-none") && jobreq == 0) ||
    (!$("#idJRDDiv").hasClass("d-none") && jobreq == null)
  ) {
    console.log("jrd on display");
    $("#idJRD").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idJRD");
    mgaKulang.push("JRD");
  } else {
    console.log("jrd hidden");
  }
  if (!jobreq && proj != leaveID && proj != otherID) {
    $("#idJRD").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idJRD");
    mgaKulang.push("JRD");
  }
  if (revision) {
    revision = 1;
  } else {
    revision = 0;
  }
  if (
    (!$("#idTowDiv").hasClass("d-none") && tow == 0) ||
    (!$("#idTowDiv").hasClass("d-none") && tow == null)
  ) {
    console.log("tow on display");
    $("#idTOW").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idTOW");
    mgaKulang.push("TOW");
  } else {
    console.log("tow hidden");
  }
  if (!tow && (!defaults.includes(proj) || proj == leaveID)) {
    if (proj == leaveID) {
      if (!noInput) noInput = $("#idTOW");
    } else {
      if (!noInput) noInput = $("#idTOW");
    }
    $("#idTOW").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idTOW");
    mgaKulang.push("TOW");
  }
  if (tow == 3) {
    //If checker
    if (!checker) {
      $("#idChecking").addClass("border border-danger").addClass("bg-err");
      if (!noInput) noInput = $("#idChecking");
      mgaKulang.push("CHECKER");
    }
  }
  if (hour > 1200 || hour < 0 || hour == 0) {
    //hour*60
    $("#getHour").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#getHour");
    mgaKulang.push("ORAS");
  }
  if (mins > 59 || mins < 0) {
    $("#getMin").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#getMin");
    mgaKulang.push("ORAS");
  }
  if ((hour == "" && mins == "") || (hour == 0 && mins == 0)) {
    $("#getHour").addClass("border border-danger").addClass("bg-err");
    $("#getMin").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#getHour");
    mgaKulang.push("ORAS");
  }
  if (!mhtype && proj != leaveID) {
    $("#idMH").addClass("border border-danger").addClass("bg-err");
    if (!noInput) noInput = $("#idMH");
    mgaKulang.push("MHTYPE");
  }
  if (proj == leaveID) {
    //IF LEAVE
    mhtype = 2;
  }
  if (item == 14) {
    if (!trgrp || trgrp == 0) {
      $("#trGroup").addClass("border border-danger").addClass("bg-err");
      if (!noInput) noInput = $("#trGroup");
      mgaKulang.push("TRGROUP");
    }
  }

  return new Promise((resolve, reject) => {
    if (mgaKulang.length > 0) {
      $(".missingInputs").removeClass("hidden");
      console.log(mgaKulang);
      reject("Missing Input Fields");
    } else {
      $.ajax({
        type: "POST",
        url: "php/add_entries.php",
        data: {
          twoDthreeD: tutri,
          grpNum: grp,
          selDate: date,
          locID: loc,
          empNum: emp,
          projID: proj,
          itemID: item,
          jobReqDesc: jobreq,
          trGrp: trgrp,
          TOWID: tow,
          revision: revision,
          duration: getDuration,
          manhour: mhtype,
          remarks: remarks,
          checker: checker,
          overrideEmpNum: empDetails["empID"],
        },
        dataType: "json",
        success: function (response) {
          getEntries(emp)
            .then((entryList) => {
              fillEntries(entryList);
            })
            .catch((error) => {
              alert(`add entries: ${error}`);
            });
          resetEntry();
          resolve(response);
        },
        error: function (xhr, status, error) {
          if (xhr.status === 404) {
            reject("Not Found Error: The requested resources are not found.");
          } else if (xhr.status === 500) {
            reject("Internal Server Error: There was a server error.");
          } else {
            reject(error);
          }
        },
      });
    }
  });
}
//Edit Entry
function fillEditFields(editData) {
  console.log("entry Data (fill EditFields): ", editData);

  var thisEmpID = $("#idEmployee").val(); //get ID of selected Employee

  var entry = editData[0];
  console.log("entry", entry);

  editGrpID = entry["groupID"];
  const mhtype = entry["MHType"];
  const tow = entry["TOW"];
  const checker = entry["checkerID"];
  const timeFormat = entry["duration"];
  const duration = timeFormat * 60;
  const newhrs = Math.floor(duration / 60);
  const newmins = duration % 60;
  const id = entry["id"];
  const iow = entry["itemID"];
  const jrd = entry["jobReqDesc"];
  const location = entry["locID"];
  const proj = entry["projID"];
  const remarks = entry["remarks"];
  const revision = entry["revision"];
  const trgrp = entry["trGrp"];
  const tutridi = entry["twoDthreeD"];

  let checkItemID = noMoreInputItems.includes(iow); //for instruction modal

  Promise.all([getDispatchLoc(), getProjects(thisEmpID, editGrpID)])
    .then(([locs, projs]) => {
      fillDispatchLoc(locs, 1);
      fillProjects(projs, 1);
      fillMHType(1);

      $("#edit-selLoc").val(location);
      $("#edit-selProj").val(proj);
      $("#edit-newRemarks").val(remarks);

      //Promise after changing Project Selection Value
      Promise.all([
        getItems(thisEmpID, proj, editGrpID),
        getTOW(proj),
        getCheckers(proj, editGrpID),
      ])
        .then(([items, tows, checks]) => {
          resetSelection(2, 1);
          fillItems(items, 1);
          $("#edit-selIOW").val(iow);

          //Promise after changing IOW Selection Value
          Promise.all([getJobs(thisEmpID, proj, iow, editGrpID), getTRGroups()])
            .then(([jobs, allgrps]) => {
              resetSelection(3, 1);
              fillJobs(jobs, 1);

              $("#edit-selJRD").val(jrd);

              getLabel(iow, 1);
              createTRGroupDiv(iow, allgrps, 1);
              if (trgrp) {
                //for training group
                $("#edit-trGroup").val(trgrp);
              }
            })
            .catch((error) => {
              alert(`Get Edit JRD / TRGroups : ${error}`);
            });

          if (checkItemID) {
            $("#drInstruction").modal("show");
          }

          fillTOW(tows, 1);
          disableTimeInput(proj, 1);
          MHValidation(1);
          fillCheckers(checks, 1);
          if (proj != null || proj != undefined) {
            isDrawing(1);
          }

          if (proj == leaveID) {
            $("#edit-itemlbl").html("Leave Type");
            $("#edit-lbltow").html("Day Type");
          } else {
            $("#edit-itemlbl").html("Item of Works");
            $("#edit-lbltow").html("Type of Work");
          }
          $(".trgrp").remove();

          if (tow) {
            $("#edit-selTOW").val(tow);
            //After changing ToW Selection Value
            if (tow == 3) {
              //for checker
              $(".edit-check").removeClass("d-none");
              $("#edit-selCheck").val(checker);
            } else {
              $(".edit-check").addClass("d-none");
            }
            if (tow == 0) {
              $(".edit-check").addClass("d-none");
              $("#edit-newHour").val("");
            }
            if (tow == 10 || tow == 11) {
              $("#edit-newHour").val("4");
            }
            if (tow == 12) {
              $("#edit-newHour").val("8");
            }
            getTOWDesc(tow, 1);
            // $("#edit-towDesc").val();
            $("#edit-newHour").val(newhrs);
            $("#edit-newMin").val(newmins);
            $("#edit-selMHType").val(mhtype).change();
          }

          if (tutridi) {
            $(`#${tutridi}`).prop("checked", true);
          }
          if (revision != 0) {
            $("#edit-rev").prop("checked", true);
          }
        })
        .catch((error) => {
          alert(`Get Edit Items / ToW / Checker : ${error}`);
        });
    })
    .catch((error) => {
      alert(`Get Edit Location / Project : ${error}`);
    });

  return;
}
//Duplicate Entry
function dupeEntry(entryData) {
  const dupeData = entryData[0];
  console.log("dupeData", dupeData);

  const emp = $($("#idEmployee").find("option:selected")).attr("emp-id");
  const grp = editGrpID;
  const date = $("#idDRDate").val();
  const tutri = dupeData["twoDthreeD"];
  const loc = dupeData["locID"];
  const proj = dupeData["projID"];
  const item = dupeData["itemID"];
  const jobreq = dupeData["jobReqDesc"];
  const trgrp = dupeData["trGrp"];
  const tow = dupeData["TOW"];
  const revision = dupeData["revision"];
  const timeFormat = dupeData["duration"];
  const duration = timeFormat * 60;
  const mhtype = dupeData["MHType"];
  const remarks = dupeData["remarks"];
  const checker = dupeData["checkerID"];

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/add_entries.php",
      data: {
        twoDthreeD: tutri,
        grpNum: grp,
        selDate: date,
        locID: loc,
        empNum: emp,
        projID: proj,
        itemID: item,
        jobReqDesc: jobreq,
        trGrp: trgrp,
        TOWID: tow,
        revision: revision,
        duration: duration,
        manhour: mhtype,
        remarks: remarks,
        checker: checker,
        overrideEmpNum: empDetails["empID"],
      },
      dataType: "json",
      success: function (response) {
        getEntries(emp)
          .then((entryList) => {
            fillEntries(entryList);
          })
          .catch((error) => {
            alert(`dupe entries: ${error}`);
          });
        resetEntry();
        resolve(response);
      },
      error: function (xhr, status, error) {
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
//Delete Entry
function deleteEntry(trID) {
  //delete Entries from Database
  const emp = $($("#idEmployee").find("option:selected")).attr("emp-id");

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/delete_entry.php",
      data: {
        drID: trID,
      },
      dataType: "json",
      success: function (response) {
        getEntries(emp)
          .then((entryList) => {
            fillEntries(entryList);
          })
          .catch((error) => {
            alert(`new entries: ${error}`);
          });
        resolve(response);
      },
      error: function (xhr, status, error) {
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
//Entries
function getEntries(thisEmpID) {
  //get Daily Report Entries
  var date = $("#idDRDate").val();
  return new Promise((resolve, reject) => {
    if (thisEmpID == undefined || thisEmpID == 0) {
      var res = 0;
      resolve(res);
    } else {
      $.ajax({
        type: "POST",
        url: "php/get_entries.php",
        data: {
          selDate: date,
          empNum: thisEmpID,
        },
        dataType: "json",
        success: function (response) {
          console.log("getEntries: ", response);
          const allEntries = response;
          entryArr = response["result"];
          resolve(allEntries);
        },
        error: function (xhr, status, error) {
          if (xhr.status === 404) {
            reject("Not Found Error: The requested resources are not found.");
          } else if (xhr.status === 500) {
            reject("Internal Server Error: There was a server error.");
          } else {
            reject(error);
          }
        },
      });
    }
  });

  // $("#drEntries").empty();
  // $.post(
  //   "php/get_entries.php",
  //   {
  //     curDay: $("#idDRDate").val(),
  //     empNum: empDetails["empNum"],
  //   },
  //   function (data) {
  //     var entries = $.parseJSON(data);
  //     if (entries.length > 0) {
  //       entries.map(addRow);
  //     } else {
  //       var addString = `<tr><td colspan='9'class="text-center py-5 "><h3>No Entries Found</h3></td></tr>`;
  //       $("#drEntries").append(addString);
  //     }
  //     getMHCount();
  //   }
  // );
  // return new Promise((resolve, reject) => {

  // });
}
function fillEntries(entryList) {
  regCount = 0;
  otCount = 0;
  lvCount = 0;
  var entryTable = $("#drEntries");
  entryTable.empty();
  if (entryList == 0) {
    entryTable.empty();
    var addString = `<tr><td colspan='9'class="text-center py-5 entry-none"><h2>No Entries Found</h2></td></tr>`;
    entryTable.append(addString);
    getMHCount();
    return;
  }
  if (entryList.isSuccess) {
    var currDayEntries = entryList["result"];
    if (currDayEntries.length > 0) {
      $.each(currDayEntries, function (index, item) {
        item.duration = (item.duration / 60).toFixed(2);
        const mhtyp = ["Regular", "OT", "Leave"];
        switch (item.MHType) {
          case "0":
            regCount += parseFloat(item.duration);
            break;
          case "1":
            otCount += parseFloat(item.duration);
            break;
          case "2":
            lvCount += parseFloat(item.duration);
            break;
          default:
            alert("alert get entries");
            break;
        }
        var row = $(`<tr entry-id=${item.id}>`);
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.location}</td>`
        );
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.group}</td>`
        );
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.projName}</td>`
        );
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${
            item.itemName ? item.itemName : "-"
          }</td>`
        );
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${
            item.jobName ? item.jobName : "-"
          }</td>`
        );
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${
            item.towName ? item.towName : "-"
          }</td>`
        );
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.duration}</td>`
        );
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${
            mhtyp[item.MHType]
          }</td>`
        );

        row.append(`<td>
        <button class="btn action dupeBut" id="dupeBut" title="Duplicate"><i class="bx bx-duplicate"></i></button><button class="btn action editBut" id="editBut" title="Edit"><i class="fa fa-pencil"></i></button><button class="btn action delBut" id="delBut" title="Delete"><i class="fa fa-trash"></i></button>
        </td>`);

        entryTable.append(row);
      });
    } else {
      var addString = `<tr><td colspan='9'class="text-center py-5 "><h3>No Entries Found</h3></td></tr>`;
      entryTable.append(addString);
    }
    getMHCount();
  } else {
    var addString = `<tr><td colspan='9'class="text-center py-5 entry-none"><h2>No Entries Found</h2></td></tr>`;
    entryTable.append(addString);
    getMHCount();
  }
}

function copyEntries() {
  //copy entries from selected date
  var getDate = $("#idDRDate").val();
  var copyDate = $("#idCopyDate").val();
  var getEmp = $($("#idEmployee").find("option:selected")).attr("emp-id");

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/copy_entries.php",
      data: {
        empID: getEmp,
        overrideEmpID: empDetails["empID"],
        selDate: getDate,
        copyDate: copyDate,
      },
      success: function (response) {
        getEntries(getEmp)
          .then((entryList) => {
            fillEntries(entryList);
          })
          .catch((error) => {
            alert(`add entries: ${error}`);
          });
        resolve(response);
      },
      error: function (xhr, status, error) {
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
  var getDate = new Date();
  var offsetDate = getDate.getTimezoneOffset() * 60 * 1000;
  var localTime = getDate - offsetDate;
  var localTime = new Date(localTime);
  var iso = localTime.toISOString();
  var ISOFormatDate = iso.split("T")[0];
  $("#idDRDate").val(ISOFormatDate);
}

function sequenceValidation(type) {
  //sequence checking Project->Item->Job
  // $("#id2DDiv").addClass("d-none");
  // $("#idRevDiv").addClass("d-none");
  if (type == 0) {
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
  } else {
    $("#edit-selIOW").prop("disabled", true);
    $("#edit-selJRD").prop("disabled", true);

    // Enabling Selection
    if ($("#edit-selIOW").val() > 0) {
      $("#edit-selJRD").prop("disabled", false);
    }
    if ($("#edit-selProj").val() > 0) {
      $("#edit-selIOW").prop("disabled", false);
    }
  }
}

function resetSelection(num, type) {
  if (type == 0) {
    var proj = $("#idProject"); //get Project selection
    var iow = $("#idItem"); // get IoW selection
    var jrd = $("#idJRD"); // get JRD selection
    var tow = $("#idTOW"); //get TOW selection

    if (num == 1) {
      proj.val(0).change();
      iow.val(0).change();
      jrd.val(0).change();
    } else if (num == 2) {
      jrd.val(0).change();
      iow.val(0).change();
      tow.val(0).change();
    } else if (num == 3) {
      jrd.val(0).change();
    }
  } else {
    var proj = $("#edit-selProj"); //get Project selection
    var iow = $("#edit-selIOW"); // get IoW selection
    var jrd = $("#edit-selJRD"); // get JRD selection
    var tow = $("#edit-selTOW"); //get TOW selection

    if (num == 1) {
      proj.val(0).change();
      iow.val(0).change();
      jrd.val(0).change();
    } else if (num == 2) {
      jrd.val(0).change();
      iow.val(0).change();
      tow.val(0).change();
    } else if (num == 3) {
      jrd.val(0).change();
    }
  }
}

function removeOutlines() {
  $(
    "#edit-selLoc, #edit-selProj, #edit-selIOW, #edit-selJRD, #edit-2d3d, #edit-rev, #edit-selTOW, #edit-selCheck, #edit-selMHType, #edit-newRemarks, #edit-trGroup, #edit-newHour, #edit-newMin"
  )
    .removeClass("border border-danger")
    .removeClass("bg-err");
  $(".editInputError").removeClass("block").addClass("hidden");
  $(".editIoWLbl").removeClass("block").addClass("hidden");
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
      success: function (data) {
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

//in Globals
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
      success: function (data) {
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
      success: function (data) {
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
      success: function (data) {
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
      success: function (data) {
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

// function getOneBUTrainerID() {
//   //get databse id of one bu train itemofworks
//   var obutrainID = ``;
//   $.ajax({
//     url: "php/get_onebutrainer_id.php",
//     success: function (data) {
//       obutrainID = data.trim();
//     },
//     async: false,
//   });
//   return obutrainID;
// }

// Adding JMR

//#endregion
