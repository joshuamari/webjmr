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
var chkrs = [];
var mmbrs = [];
//#endregion
checkLogin()
  .then((emp_deets) => {
    empDetails = emp_deets;
    $(document).ready(function () {
      setCurrentMonth();
      Promise.all([getGroups(), getLocations()]).then(([grps, locs]) => {
        createGroupSelection(grps);
        createLocationSelection(locs);
        $("#idGroup").val(empDetails["empGroup"]);
        Promise.all([getMembers(), getCheckers()])
          .then(([members, checkers]) => {
            chkrs = checkers;
            mmbrs = members;
            createMembers(mmbrs);
            createCheckers(chkrs);
          })
          .catch((error) => {
            alert(error);
          });
      });
    });
  })
  .catch((error) => {
    window.location.href = `${rootFolder}/KDTPortalLogin`;
  });

const { jsPDF } = globalThis.jspdf;
//#region BINDS
$(document).on("click", "#save", function () {
  saveToPDF();
});
$(document).on("click", "#btnPrint", function () {
  html2canvas($("#toPrint")[0]).then((canvas) => {
    var printWindow = window.open("", "", "width=900, height=600");
    printWindow.document.open();
    printWindow.document.write(
      "<html><head><title>Monthly Individual Report</title></head><body>"
    );
    printWindow.document.write(
      "<img src='" + canvas.toDataURL("image/png") + "' />"
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    // Wait for the image to load before calling print()
    var image = printWindow.document.querySelector("img");
    image.onload = function () {
      printWindow.print();
      printWindow.close();
    };
  });
});
$(document).on("click", "#descriptionList", function () {
  $(this).toggleClass("open");
});
$(document).on("click", ".list-items .item", function () {
  $(this).toggleClass("checked");
  countCheck();
});
$(document).on("change", "#idGroup", function () {
  var group = $(this).val();
  if (group == "MPM") {
    $(".token").removeClass("d-none");
  } else {
    $(".token").addClass("d-none");
  }
});
$(document).on("change", "#idLoc", function () {
  checkLoc();
});

//#endregion

//#region FUNCTIONS
function setCurrentMonth() {
  var currentDate = new Date();
  var year = currentDate.getFullYear();
  var month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  $("#idMonth").val(`${year}-${month}`);
}
function countCheck() {
  var checked = $(".checked");
  var btnText = $(".text-btn");

  if (checked && checked.length != 0) {
    btnText.text(`${checked.length} Selected`);
  } else {
    btnText.text("Select Description");
  }
}
function saveToPDF() {
  html2canvas($("#toPrint")[0]).then((canvas) => {
    var imgData = canvas.toDataURL("image/jpeg", 1.0);
    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      displayMode: "fullwidth",
      userUnit: 1,
    });
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
    doc.save("Monthly_Individual_Report.pdf");
  });
}
function checkLogin() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "php/check_login.php",
      success: function (data) {
        const emp_deets = $.parseJSON(data);
        if (Object.keys(emp_deets).length < 1) {
          reject("Not logged in"); // Reject the promise
        } else {
          resolve(emp_deets); // Resolve the promise with empDetails
        }
      },
    });
  });
}
function checkLoc() {
  var local = [0, 1, 2];
  var loc = parseInt($("#idLoc").find(":selected").attr("loc-id"));
  if (local.includes(loc)) {
    $(".checker, .approver").removeClass("d-none");
    $(".signature")
      .addClass("justify-content-between")
      .removeClass("justify-content-around");
  } else {
    $(".checker, .approver").addClass("d-none");
    $(".signature")
      .removeClass("justify-content-between")
      .addClass("justify-content-around");
  }
}
function getGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_groups.php",
      data: {
        empnum: empDetails["empNum"],
      },
      dataType: "json",
      success: function (data) {
        const groups = data;
        if (Object.keys(groups).length < 1) {
          reject("No groups found"); // Reject the promise
        } else {
          resolve(groups); // Resolve the promise with empDetails
        }
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
  });
}
function createGroupSelection(groups) {
  const grpSel = $("#idGroup");
  grpSel.empty();
  groups.forEach((group) => {
    const option = $("<option>").attr("group-id", group.id).text(group.name);
    grpSel.append(option);
  });
}
function getMembers() {
  const groupSel = $("#idGroup").val();
  const ymSel = $("#idMonth").val();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_members.php",
      data: {
        empGroup: groupSel,
        ymSelect: ymSel,
      },
      dataType: "json",
      success: function (data) {
        const members = data;
        if (Object.keys(members).length < 1) {
          reject("No members found"); // Reject the promise
        } else {
          resolve(members); // Resolve the promise with empDetails
        }
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
  });
}
function createMembers(members) {
  const memSel = $("#idEmp");
  memSel.html("<option hidden>Select Member . . .</option>");
  members.forEach((member) => {
    const option = $("<option>").attr("emp-id", member.id).text(member.name);
    memSel.append(option);
  });
}
function getLocations() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_locations.php",
      dataType: "json",
      success: function (data) {
        const locations = data;
        if (Object.keys(locations).length < 1) {
          reject("No locations found"); // Reject the promise
        } else {
          resolve(locations); // Resolve the promise with empDetails
        }
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
  });
}
function createLocationSelection(locations) {
  const locSel = $("#idLoc");
  locSel.empty();
  locations.forEach((location) => {
    const option = $("<option>")
      .attr("loc-id", location.id)
      .text(location.name);
    locSel.append(option);
  });
}
function getCheckers() {
  const groupSel = $("#idGroup").val();
  const ymSel = $("#idMonth").val();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_checkers.php",
      data: {
        empGroup: groupSel,
        ymSelect: ymSel,
      },
      dataType: "json",
      success: function (data) {
        const checkers = data;
        if (Object.keys(checkers).length < 1) {
          reject("No checkers found"); // Reject the promise
        } else {
          resolve(checkers); // Resolve the promise with empDetails
        }
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
  });
}
function createCheckers(checkers) {
  const chkSel = $("#idChecker");
  const appSel = $("#idApprover");
  chkSel.html("<option hidden>Select Member . . .</option>");
  appSel.html("<option hidden>Select Member . . .</option>");
  checkers.forEach((checker) => {
    const option = $("<option>").attr("emp-id", checker.id).text(checker.name);
    chkSel.append(option);
    appSel.append(option.clone());
  });
}
function getDesig(empid, memlist) {
  return memlist.find((item) => item.id == empid).desig;
}
//#endregion
