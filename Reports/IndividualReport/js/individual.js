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
const monthNames = [
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

            $("#idEmp option[emp-id='" + empDetails["empNum"] + "']").prop(
              "selected",
              true
            );
            createCheckers(chkrs);
            createTable();
            setViewer();
          })
          .catch((error) => {
            alert(error);
          });
      });
    });
  })
  .catch((error) => {
    alert(error);
    // window.location.href = `${rootFolder}/KDTPortalLogin`;
  });

const { jsPDF } = globalThis.jspdf;
//#region BINDS
$(document).on("click", "#save", function () {
  saveToPDF();
});
$(document).on("click", "#btnPrint", function () {
  // html2canvas($("#toPrint")[0], { scale: 1.2 }).then((canvas) => {
  //   var printWindow = window.open("", "", "width=900, height=800");
  //   printWindow.document.open();
  //   printWindow.document.write(
  //     "<html><head><title>Monthly Individual Report</title></head><body>"
  //   );
  //   printWindow.document.write(
  //     "<img src='" + canvas.toDataURL("image/png") + "' />"
  //   );
  //   printWindow.document.write("</body></html>");
  //   printWindow.document.close();
  //   // Wait for the image to load before calling print()
  //   var image = printWindow.document.querySelector("img");
  //   image.onload = function () {
  //     printWindow.print();
  //     printWindow.close();
  //   };
  // });
});
$(document).on("click", "#descriptionList", function () {
  $(this).toggleClass("open");
});
$(document).on("click", ".list-items .item", function () {
  $(this).toggleClass("checked");
  countCheck();
});
$(document).on("change", "#idGroup", function () {
  setViewerGroup();
  clearViewer();
  createTable();
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
  var group = $(this).val();
  if (group == "MPM") {
    $(".token").removeClass("d-none");
    $(".tokenTable").removeClass("d-none");
    $(".signature").css("margin-top", "18px");
    $("td,th, table tbody tr, table thead tr").css("height", "17px ");
    $(".table-cont").css("height", "581px ");
  } else {
    $(".token").addClass("d-none");
    $(".tokenTable").addClass("d-none");
    $(".signature").css("margin-top", "35px");
    $("td,th, table tbody tr, table thead tr").css("height", "18px ");
    $(".table-cont").css("height", "615px ");
  }
});
$(document).on("change", "#idMonth", function () {
  setViewerDate();
  createTable();
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
$(document).on("change", "#idLoc", function () {
  checkLoc();
  setViewerLoc();
});
$(document).on("change", "#idEmp", function () {
  setViewerName();
  setPreparedBy();
});
$(document).on("change", "#idChecker", function () {
  setCheckedBy();
});
$(document).on("change", "#idApprover", function () {
  setApprovedBy();
});
$(document).on("input", "#khiName , #khiPos", function () {
  setKhiRep();
});
$(document).on("input", "#tokenRate", function () {
  var token = $(this).val();
  $("#invToken").text(token);
  totalCost();
});
$(document).on("input", "#unitRate", function () {
  var unit = $(this).val();
  $("#invUnit").text(unit);
  totalCost();
});
$(document).on("click", ".toke", function () {
  var count = $(".toke.checked").length;
  $("#invDays").text(count);
  console.log(count);
  totalCost();
});
//#endregion

//#region FUNCTIONS
function createTable() {
  var mo = $("#idMonth").val();
  var yr = parseInt(mo.split("-")[0]);
  var moIndex = parseInt(mo.split("-")[1]) - 1;
  var str = "";
  var grp = $("#idGroup").val();
  console.log(grp);
  var daysInMonth = new Date(yr, moIndex + 1, 0).getDate();
  var specialHeader = `<th class="sm" rowspan="2">DATE</th>
  <th colspan="2">TIME</th>
  <th class="sm break" rowspan="2">MAN HOUR</th>
  <th class="sm break" rowspan="2">OVER TIME</th>
  <th rowspan="2" style="width:150px !important">JOB NUMBER</th>
  <th rowspan="2" style="width:calc(100% - 540px) !important">DESCRIPTION</th>
  <th class="sm break" rowspan="2"style="width:40px !important">INV. OP.</th>
  <th rowspan="2" class="last" style="width:150px !important">PERSON IN-CHARGE</th>`;
  var commonHeader = `<th class="sm" rowspan="2">DATE</th>
  <th colspan="2">TIME</th>
  <th class="sm break" rowspan="2">MAN HOUR</th>
  <th class="sm break" rowspan="2">OVER TIME</th>
  <th rowspan="2">DESCRIPTION</th>
  <th rowspan="2" class="last">PERSON IN-CHARGE</th>`;

  var groupHeaders = grp === "MPM" ? specialHeader : commonHeader;
  $(".table-cont table thead tr:first-of-type").empty();
  $(".table-cont table thead tr:first-of-type").html(groupHeaders);

  for (var x = 1; x <= 31; x++) {
    var date = new Date(yr, moIndex, x);
    var specialTr = `<tr${
      date.getDay() === 0 || date.getDay() === 6 ? ' class="weekend"' : ""
    }>
        <td>${(x < 10 ? "0" : "") + x}</td>
        <td>7:00</td>
        <td>16:00</td>
        <td>8</td>
        <td></td>
      <td></td>
        <td>kdtKeisoSupport</td>
        <td><svg class="custom-checkbox toke" viewBox="0 0 24 24" onclick="toggleCheckbox(this)"><circle class="circle" cx="12" cy="12" r="11" stroke="#333" fill="none"/></svg></td>

        <td>SHIRAkAWA Kenji</td>
      </tr>`;
    var commonTr = `<tr${
      date.getDay() === 0 || date.getDay() === 6 ? ' class="weekend"' : ""
    }>
          <td>${(x < 10 ? "0" : "") + x}</td>
          <td>7:00</td>
          <td>16:00</td>
          <td>8</td>
          
        <td></td>
          <td>kdtKeisoSupport</td>
          
          <td>SHIRAkAWA Kenji</td>
        </tr>`;
    var emptySpecialTr = `<tr${
      date.getDay() === 0 || date.getDay() === 6 ? ' class="weekend"' : ""
    }>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td ></td>
            <td ></td>
          </tr>`;
    var emptyTr = `<tr${
      date.getDay() === 0 || date.getDay() === 6 ? ' class="weekend"' : ""
    }>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              
              <td></td>
            <td></td>
              <td></td>
            </tr>`;

    if (x <= daysInMonth) {
      grp === "MPM" ? (str += specialTr) : (str += commonTr);
    } else {
      grp === "MPM" ? (str += emptySpecialTr) : (str += emptyTr);
      // For days beyond the month's last day, add a row with an empty day
    }
  }
  $(".table-cont table tbody tr:not(#appendBefore)").remove();
  $("#appendBefore").before(str);
  calculateTotalHours();
}
function toggleCheckbox(checkbox) {
  checkbox.classList.toggle("checked");
}

function calculateTotalHours() {
  var totalManHour = 0;
  var totalOverTime = 0;

  $("#appendHere tr:not(#appendBefore)").each(function () {
    var manHour = parseInt($(this).find("td:nth-child(4)").text());
    var overTime = parseInt($(this).find("td:nth-child(5)").text());

    if (!isNaN(manHour)) {
      totalManHour += manHour;
    }
    if (!isNaN(overTime)) {
      totalOverTime += overTime;
    }
  });

  $("#totalMH").text(totalManHour);
  $("#totalOT").text(totalOverTime);
}
function setCurrentMonth() {
  var currentDate = new Date();
  var year = currentDate.getFullYear();
  var month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  $("#idMonth").val(`${year}-${month}`);
}

function setViewer() {
  setViewerDate();
  setViewerLoc();
  setViewerName();
  setViewerGroup();
  setPreparedBy();
  setCheckedBy();
  setApprovedBy();
  setKhiRep();
}
function setViewerDate() {
  var mo = $("#idMonth").val();
  var yr = parseInt(mo.split("-")[0]);
  var moIndex = parseInt(mo.split("-")[1]) - 1;

  var monthName = monthNames[moIndex];

  $("#viewDate").text(`${monthName}, ${yr}`);
}
function setViewerLoc() {
  var loc = $("#idLoc").val();

  $("#viewLoc").text(loc);
}
function setViewerName() {
  var emp = $("#idEmp").val();
  $("#viewName").text(emp);
}
function setViewerGroup() {
  var grp = $("#idGroup").val();
  $("#viewGroup").text(grp);
}
function setPreparedBy() {
  var iba = parseInt($("#idEmp option:selected").attr("emp-id"));
  var emp = $("#idEmp").val();

  var firstName = findFirstNameById(iba, mmbrs);
  var lastName = findLastNameById(iba, mmbrs);
  $("#preparedBy").text(`${firstName} ${lastName}`);
  $("#viewPrepPos").text(getDesig(iba, mmbrs));
}
function setCheckedBy() {
  var iba = parseInt($("#idChecker option:selected").attr("emp-id"));
  var check = $("#idChecker").val();
  if (check == "Select Member . . .") {
    $("#checkedBy").text("");
    $("#viewCheckPos").text("");
  } else {
    var firstName = findFirstNameById(iba, chkrs);
    var lastName = findLastNameById(iba, chkrs);
    $("#checkedBy").text(`${firstName} ${lastName}`);
    $("#viewCheckPos").text(getDesig(iba, chkrs));
  }
}
function setKhiRep() {
  var name = $("#khiName").val();
  var desig = $("#khiPos").val();

  $("#khiBy").text(name);
  $("#viewKhiPos").text(desig);
}
function setApprovedBy() {
  var iba = parseInt($("#idApprover option:selected").attr("emp-id"));
  var check = $("#idApprover").val();
  if (check == "Select Member . . .") {
    $("#approvedBy").text("");
    $("#viewAppPos").text("");
  } else {
    var firstName = findFirstNameById(iba, chkrs);
    var lastName = findLastNameById(iba, chkrs);
    $("#approvedBy").text(`${firstName} ${lastName}`);
    $("#viewAppPos").text(getDesig(iba, chkrs));
  }
}

function clearViewer() {
  $(
    "#viewName, #preparedBy, #viewPrepPos, #checkedBy, #viewCheckPos, #approvedBy, #viewAppPos, #viewKhiPos, #khiBy"
  ).text("");
}

function totalCost() {
  var indays = $("#invDays").text() ? parseInt($("#invDays").text()) : 0;
  var tok = $("#invToken").text() ? parseInt($("#invToken").text()) : 0;
  var unit = $("#invUnit").text() ? parseInt($("#invUnit").text()) : 0;
  var total;

  total = tok * unit * indays;

  $("#invTotal").text(parseInt(total));
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
  html2canvas($("#toPrint")[0], { scale: 2 }).then((canvas) => {
    var imgData = canvas.toDataURL("image/jpeg", 1.25);
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
  console.log(ymSel);
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
  // var user = empDetails["empNum"];
  // var sel = $("#idEmp option[emp-id='" + user + "']");
  // sel.attr("selected", true);
  const selectedMember = parseInt(memSel.find(":selected").attr("emp-id"));
  memSel.html(`<option val="" hidden>Select Member . . .</option>`);

  members.forEach((member) => {
    const option = $("<option>")
      .attr("emp-id", member.id)
      .text(`${member.fname} ${member.sname}`);
    memSel.append(option);
  });
  if (selectedMember) {
    var selectedOption = memSel.find(`option[emp-id=${selectedMember}]`);
    selectedOption.prop("selected", true);
  }
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
  const selectedChecker = parseInt(chkSel.find(":selected").attr("emp-id"));
  const selectedApprover = parseInt(appSel.find(":selected").attr("emp-id"));
  chkSel.html("<option hidden >Select Member . . .</option>");
  appSel.html("<option hidden >Select Member . . .</option>");
  checkers.forEach((checker) => {
    const option = $("<option>")
      .attr("emp-id", checker.id)
      .text(`${checker.fname} ${checker.sname}`);
    chkSel.append(option);
    appSel.append(option.clone());
  });

  if (selectedChecker) {
    var chkOption = chkSel.find(`option[emp-id=${selectedChecker}]`);
    chkOption.prop("selected", true);
  }
  if (selectedApprover) {
    var appOption = appSel.find(`option[emp-id=${selectedApprover}]`);
    appOption.prop("selected", true);
  }
}
function getDesig(empid, memlist) {
  return memlist.find((item) => item.id == empid).desig;
}
function findFirstNameById(empid, memlist) {
  const result = memlist.find((item) => item.id === empid);
  console.log(result);
  return result ? abbreviateFirstName(result.fname) : null;
}
function findLastNameById(empid, memlist) {
  const result = memlist.find((item) => item.id === empid);
  return result ? result.sname : null;
}
function abbreviateFirstName(firstName) {
  const initials =
    firstName
      .split(" ")
      .map((part) => part.charAt(0))
      .join(".") + ".";
  return initials;
}
//#endregion
