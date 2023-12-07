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
var crtime = [];
var holidays = [];
var selClmns = [];
var tokens = [];
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

      Promise.all([
        getGroups(),
        getLocations(),
        getCoretime(),
        getHolidays(),
      ]).then(([grps, locs, cores, holidates]) => {
        holidays = holidates;
        crtime = cores;
        fillCoretime(crtime);
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
            setViewer();

            getReportData()
              .then((repdata) => {
                createTable(repdata);
              })
              .catch((error) => {
                alert(error);
              });
          })
          .catch((error) => {
            alert(`${error}`);
          });
      });
    });
  })
  .catch((error) => {
    alert(error);
    window.location.href = `${rootFolder}/KDTPortalLogin`;
  });

const { jsPDF } = globalThis.jspdf;
//#region BINDS
$(document).on("click", "#save", function () {
  if ($("#khiName").val().trim() === "") {
    $("#khiBy").text("");
  }
  if ($("#khiPos").val().trim() === "") {
    $("#viewKhiPos").text("");
  }

  $("#descriptionList").removeClass("open");
  saveToPDF();
  if ($("#doNotShowAgain").is(":checked")) {
    const oneDayInMillis = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const currentDate = new Date().getTime();
    const tomorrow = currentDate + oneDayInMillis;

    // Store the 'Do not show again' preference and the expiration time in localStorage
    localStorage.setItem("doNotShowAgain", "true");
    localStorage.setItem("doNotShowAgainExpiration", tomorrow);
  }

  // Close the modal after handling 'Do not show again' preference
  $("#reminderModal .close").click();
  if ($("#khiName").val().trim() === "") {
    $("#khiBy").text("(KHI Representative)");
    $("#viewKhiPos").text("(Designation)");
  }
  if ($("#khiPos").val().trim() === "") {
    $("#viewKhiPos").text("(Designation)");
  }
});
$(document).on("click", ".remind", function () {
  const storedValue = localStorage.getItem("doNotShowAgain");

  const expirationTime = localStorage.getItem("doNotShowAgainExpiration");
  const currentDate = new Date().getTime();
  // Check if 'Do not show again' preference is set and has not expired
  if (
    !(storedValue === "true" && expirationTime && currentDate < expirationTime)
  ) {
    $("#reminderModal").modal("show"); // Show the modal
  } else {
    // Continue with your process without showing the modal
    // Add your process logic here
    console.log("Modal is not shown for the remainder of the day");
    $("#save").click();
  }
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
$(document).on("click", "#descriptionList", function (event) {
  event.stopPropagation();
  $(this).toggleClass("open");
  $(this).blur();
});
$(document).on("click", "body", function (event) {
  if (
    !$("#selCol").is(event.target) &&
    $("#selCol").has(event.target).length === 0
  ) {
    $("#descriptionList").removeClass("open");
  }
});
$(document).on("click", ".list-items .item", function () {
  $(this).toggleClass("checked");

  countCheck();
  getReportData()
    .then((repdata) => {
      createTable(repdata);
      addToke();
    })
    .catch((error) => {
      alert(error);
    });
});
$(document).on("change", "#idGroup", function () {
  tokens = [];
  setViewerGroup();
  clearViewer();
  Promise.all([getMembers(), getCheckers()])
    .then(([members, checkers]) => {
      chkrs = checkers;
      mmbrs = members;
      createMembers(mmbrs);
      createCheckers(chkrs);
      getReportData()
        .then((repdata) => {
          createTable(repdata);
        })
        .catch((error) => {
          alert(error);
        });
    })
    .catch((error) => {
      alert(error);
    });
});
$(document).on("change", "#idMonth", function () {
  tokens = [];
  setViewerDate();
  Promise.all([getMembers(), getCheckers(), getCoretime(), getHolidays()])
    .then(([members, checkers, cores, holidates]) => {
      holidays = holidates;
      crtime = cores;
      chkrs = checkers;
      mmbrs = members;
      createMembers(mmbrs);
      createCheckers(chkrs);
      fillCoretime(crtime);
      getReportData()
        .then((repdata) => {
          createTable(repdata);
        })
        .catch((error) => {
          alert(error);
        });
    })
    .catch((error) => {
      alert(error);
    });
});
$(document).on("change", "#idLoc", function () {
  tokens = [];
  checkLoc();
  setViewerLoc();
  Promise.all([getCoretime(), getHolidays()])
    .then(([cores, holidates]) => {
      holidays = holidates;
      crtime = cores;
      fillCoretime(crtime);
      getReportData()
        .then((repdata) => {
          createTable(repdata);
        })
        .catch((error) => {
          alert(error);
        });
    })
    .catch((error) => {
      alert(error);
    });
});
$(document).on("change", "#idEmp", function () {
  setViewerName();

  setPreparedBy();
  getReportData()
    .then((repdata) => {
      createTable(repdata);
    })
    .catch((error) => {
      alert(error);
    });
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
  countToken();
});
$(document).on("click", "#totOnly", function () {
  changeCoretime();
  getReportData()
    .then((repdata) => {
      createTable(repdata);
    })
    .catch((error) => {
      alert(error);
    });
  $(".btn-close").click();
});
$(document).on("change", "#excludeKDT", function () {
  getReportData()
    .then((repdata) => {
      createTable(repdata);
      // countToken();
      // $("#checkAllTokens").prop("checked", false);
    })
    .catch((error) => {
      alert(error);
    });
});
$(document).on("change", "#withTokens", function () {
  tokens = [];
  getReportData()
    .then((repdata) => {
      createTable(repdata);
      // countToken();
    })
    .catch((error) => {
      alert(error);
    });
  if (!$(this).prop("checked")) {
    $("#checkAllTokens").prop("checked", false);
  }
});
$(document).on("change", "#checkAllTokens", function () {
  $(".custom-checkbox").removeClass("checked");
  if ($(this).prop("checked")) {
    $(".custom-checkbox").addClass("checked");
  }
  countToken();
});
$(document).on("click", "#howttoToken", function () {
  $("#tokenInstruction").removeClass("visually-hidden");
});
$(document).on("click", "#bgInstruction", function () {
  console.log("boom");
  $("#tokenInstruction").addClass("visually-hidden");
});
$(document).on("input", ".cts", function () {
  var startValue = $(this).val();
  var endValue = $(this).closest(".row").find(".cte").val();
  if (!valiDate(startValue, endValue)) {
    $(this).val($(this).data("prevValue"));
  } else {
    $(this).data("prevValue", startValue);
  }
});
$(document).on("input", ".cte", function () {
  var endValue = $(this).val();
  var startValue = $(this).closest(".row").find(".cts").val();
  if (!valiDate(startValue, endValue)) {
    $(this).val($(this).data("prevValue"));
  } else {
    $(this).data("prevValue", endValue);
  }
});
//#endregion

//#region FUNCTIONS
function countToken() {
  tokens = [];
  $(".toke.checked").each(function () {
    var dateT = $(this).closest("tr").find("td:first-child").text();
    tokens.push(dateT);
  });
  var count = $(".toke.checked").length;
  $("#invDays").text(count);
  isAllTokeChecked();
  totalCost();
}
function createTable(repdata) {
  var mo = $("#idMonth").val();
  var yr = parseInt(mo.split("-")[0]);
  var moIndex = parseInt(mo.split("-")[1]) - 1;
  var str = "";
  var grp = $("#idGroup").val();
  var daysInMonth = new Date(yr, moIndex + 1, 0).getDate();
  var tokenChecked = $("#withTokens").prop("checked");
  var specialHeader = `<th class="sm" rowspan="2">DATE</th>
  <th colspan="2">TIME</th>
  <th class="sm break" rowspan="2">MAN HOUR</th>
  <th class="sm break" rowspan="2">OVER TIME</th>
  <th rowspan="2" class="jn" style="width:146px" >JOB NUMBER</th>
  <th rowspan="2" class="des">DESCRIPTION</th>
  <th class="sm break invop" rowspan="2"style="width:40px ">INV. OP.</th>
  <th rowspan="2" class="last pic" style="width:146px ">PERSON IN-CHARGE</th>`;
  var commonHeader = `<th class="sm" rowspan="2">DATE</th>
  <th colspan="2">TIME</th>
  <th class="sm break" rowspan="2">MAN HOUR</th>
  <th class="sm break" rowspan="2">OVER TIME</th>
  <th class="des" rowspan="2">DESCRIPTION</th>
  <th rowspan="2" class="pic" class="last">PERSON IN-CHARGE</th>`;

  var groupHeaders = tokenChecked === true ? specialHeader : commonHeader;
  $(".table-cont table thead tr:first-of-type").empty();
  $(".table-cont table thead tr:first-of-type").html(groupHeaders);
  //#region LUMA
  // for (var x = 1; x <= 31; x++) {
  //   var date = new Date(yr, moIndex, x);
  //   var specialTr = `<tr${
  //     date.getDay() === 0 || date.getDay() === 6 ? ' class="weekend"' : ""
  //   }>
  //       <td>${(x < 10 ? "0" : "") + x}</td>
  //       <td>7:00</td>
  //       <td>16:00</td>
  //       <td>8</td>
  //       <td></td>
  //     <td></td>
  //       <td>kdtKeisoSupport</td>
  //       <td><svg class="custom-checkbox toke" viewBox="0 0 24 24" onclick="toggleCheckbox(this)"><circle class="circle" cx="12" cy="12" r="11" stroke="#333" fill="none"/></svg></td>

  //       <td>SHIRAkAWA Kenji</td>
  //     </tr>`;
  //   var commonTr = `<tr${
  //     date.getDay() === 0 || date.getDay() === 6 ? ' class="weekend"' : ""
  //   }>
  //         <td>${(x < 10 ? "0" : "") + x}</td>
  //         <td>7:00</td>
  //         <td>16:00</td>
  //         <td>8</td>

  //       <td></td>
  //         <td>kdtKeisoSupport</td>

  //         <td>SHIRAkAWA Kenji</td>
  //       </tr>`;
  //   var emptySpecialTr = `<tr${
  //     date.getDay() === 0 || date.getDay() === 6 ? ' class="weekend"' : ""
  //   }>
  //           <td></td>
  //           <td></td>
  //           <td></td>
  //           <td></td>
  //           <td></td>
  //           <td></td>
  //           <td></td>
  //           <td ></td>
  //           <td ></td>
  //         </tr>`;
  //   var emptyTr = `<tr${
  //     date.getDay() === 0 || date.getDay() === 6 ? ' class="weekend"' : ""
  //   }>
  //             <td></td>
  //             <td></td>
  //             <td></td>
  //             <td></td>

  //             <td></td>
  //           <td></td>
  //             <td></td>
  //           </tr>`;

  //   if (x <= daysInMonth) {
  //     grp === "MPM" ? (str += specialTr) : (str += commonTr);
  //   } else {
  //     grp === "MPM" ? (str += emptySpecialTr) : (str += emptyTr);
  //     // For days beyond the month's last day, add a row with an empty day
  //   }
  // }
  // $(".table-cont table tbody tr:not(#appendBefore)").remove();
  // $("#appendBefore").before(str);
  // calculateTotalHours();
  //#endregion
  //#region BAGO

  var dayTr = ``;
  for (var x = 1; x <= 31; x++) {
    const key = x.toString().padStart(2, "0");
    const isHoliday = holidays.includes(x) ? "weekend" : "";
    var timeIn = "";
    var timeOut = "";
    var manHour = "";
    var overtime = "";
    var description = "";
    var pic = "";
    var jobNum = "";
    const invop = `<svg class="custom-checkbox toke" viewBox="0 0 24 24" onclick="toggleCheckbox(this)"><circle class="circle" cx="12" cy="12" r="11" stroke="#333" fill="none"/></svg>`;
    var jobMPM = "";
    var invopMPM = "";
    if (repdata) {
      if (repdata.hasOwnProperty(key)) {
        timeIn = repdata[key].start !== undefined ? repdata[key].start : "";
        timeOut = repdata[key].end !== undefined ? repdata[key].end : "";
        description = repdata[key].desc !== undefined ? repdata[key].desc : "";
        overtime = repdata[key].ot !== undefined ? repdata[key].ot : "";
        manHour = repdata[key].hours !== undefined ? repdata[key].hours : "";
        pic = repdata[key].khic !== undefined ? repdata[key].khic : "";
        jobNum = repdata[key].order !== undefined ? repdata[key].order : "";
        jobMPM = tokenChecked === true ? `<td class="jn">${jobNum}</td>` : "";
      }
      var jobMPM = tokenChecked === true ? `<td class="jn">${jobNum}</td>` : "";
      var invopMPM =
        tokenChecked === true
          ? `<td class="invop">${manHour ? invop : ""}</td>`
          : "";
    }

    dayTr += `<tr class='${isHoliday}'>
    <td>${(x < 10 ? "0" : "") + (x <= daysInMonth ? x : "")}</td>
    <td>${timeIn}</td>
    <td>${timeOut}</td>
    <td>${manHour}</td>
    <td>${overtime}</td>
    ${jobMPM}
    <td class="des">${description}</td>
    ${invopMPM}
    <td class="pic">${pic}</td>
    </tr>`;

    $(".table-cont table tbody tr:not(#appendBefore)").remove();
    $("#appendBefore").before(dayTr);

    calculateTotalHours();
    countToken();
    if (tokenChecked === true) {
      $(".token").removeClass("d-none");
      $(".tokenTable").removeClass("d-none");
      $(".signature").css("margin-top", "18px");
      $("td,th, table tbody tr, table thead tr").css("height", "17px ");
      $(".table-cont").css("height", "581px ");
      $("th.des, td.des").css({
        width: "147px",
        "max-width": "147px",
        overflow: "hidden",
      });
      $("th.jn, td.jn").css({
        width: "146px",
        "max-width": "146px",
        overflow: "hidden",
      });
      $("th.pic, td.pic").css({
        width: "146px",
        "max-width": "146px",
        overflow: "hidden",
      });
    } else {
      $(".token").addClass("d-none");
      $(".tokenTable").addClass("d-none");
      $(".signature").css("margin-top", "35px");
      $("td,th, table tbody tr, table thead tr").css("height", "18px ");
      $(".table-cont").css("height", "615px ");
      $("th.des, td.des").css("width", "330px");
      $("th.pic, td.pic").css({
        width: "135px",
        "max-width": "135px",
        overflow: "hidden",
      });
    }
  }
  //#endregion
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
  var iba = parseInt($("#idEmp option:selected").attr("emp-id"));
  if (iba) {
    var emp = $("#idEmp").val();

    $("#viewName").text(emp);
  }
}
function setViewerGroup() {
  var grp = $("#idGroup").val();
  $("#viewGroup").text(grp);
}
function setPreparedBy() {
  var iba = parseInt($("#idEmp option:selected").attr("emp-id"));
  if (iba) {
    var firstName = findFirstNameById(iba, mmbrs);
    var lastName = findLastNameById(iba, mmbrs);
    $("#preparedBy").text(`${firstName} ${lastName}`);
    $("#viewPrepPos").text(getDesig(iba, mmbrs));
  }
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
  var name = $("#khiName").val() ? $("#khiName").val() : "(KHI Representative)";
  var desig = $("#khiPos").val() ? $("#khiPos").val() : "(Designation)";

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
    "#viewName, #preparedBy, #viewPrepPos, #checkedBy, #viewCheckPos, #approvedBy, #viewAppPos, #invDays"
  ).text("");
}

function totalCost() {
  var indays = $("#invDays").text() ? parseInt($("#invDays").text()) : 0;
  var tok = $("#invToken").text() ? parseInt($("#invToken").text()) : 0;
  var unit = $("#invUnit").text() ? parseInt($("#invUnit").text()) : 0;
  var total;

  total = tok * unit * indays;

  $("#invTotal").text(parseInt(total).toLocaleString());
}

function countCheck() {
  var checked = $("#selCol .checked");
  var btnText = $(".text-btn");

  if (checked && checked.length != 0) {
    btnText.text(`${checked.length} Selected`);
  } else {
    btnText.text("Select Description");
  }
}
function saveToPDF() {
  $(".custom-checkbox:not(.checked)").addClass("d-none");
  $("#toPrint").css("scale", "1");
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
  $("#toPrint").css("scale", "0.9");
  $(".custom-checkbox:not(.checked)").removeClass("d-none");
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
        empnum: empDetails["empNum"],
      },
      dataType: "json",
      success: function (data) {
        const members = data;
        resolve(members);
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
    $("#idEmp").change();
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
        resolve(checkers);
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
  chkSel.html("<option>Select Member . . .</option>");
  appSel.html("<option>Select Member . . .</option>");
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
function getCoretime() {
  const ymSel = $("#idMonth").val();
  const selLoc = parseInt($("#idLoc").find(":selected").attr("loc-id"));
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_coretime.php",
      data: {
        selLoc: JSON.stringify(selLoc),
        ymSel: ymSel,
      },
      dataType: "json",
      success: function (data) {
        const coretime = data;
        if (Object.keys(coretime).length < 1) {
          reject("No coretime found"); // Reject the promise
        } else {
          resolve(coretime); // Resolve the promise with empDetails
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
function fillCoretime(cores) {
  const timeMappings = {
    Time: ["#sTime", "#eTime"],
    Lunch: ["#sLunch", "#eLunch"],
    Dinner: ["#sDinner", "#eDinner"],
  };
  Object.keys(timeMappings).forEach((event) => {
    const [startId, endId] = timeMappings[event];
    $(startId).val(cores[event]["start"]);
    $(endId).val(cores[event]["end"]);
  });

  $(".cts").each(function () {
    $(this).data("prevValue", $(this).val());
  });
}
function changeCoretime() {
  const sTime = $("#sTime").val();
  const eTime = $("#eTime").val();
  const sLunch = $("#sLunch").val();
  const eLunch = $("#eLunch").val();
  const sDinner = $("#sDinner").val();
  const eDinner = $("#eDinner").val();
  crtime = {
    Time: {
      start: sTime,
      end: eTime,
    },
    Lunch: {
      start: sLunch,
      end: eLunch,
    },
    Dinner: {
      start: sDinner,
      end: eDinner,
    },
  };
}
function getReportData() {
  const empSelect = parseInt($("#idEmp option:selected").attr("emp-id"));
  const groupSel = $("#idGroup").val();
  const selColumns = $("#selCol .checked")
    .filter((_, element) => element.id !== "hrschk")
    .map((_, element) => element.id)
    .get();
  const hrsChk = $("#hrschk").hasClass("checked");
  const ymSel = $("#idMonth").val();
  const exclude = $("#excludeKDT").is(":checked");
  const core = crtime;
  const locSelect = parseInt($("#idLoc").find(":selected").attr("loc-id"));
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_report_data.php",
      data: {
        empSelect: empSelect,
        groupSel: groupSel,
        ymSelect: ymSel,
        locSelect: locSelect,
        selColumns: JSON.stringify(selColumns),
        exclude: JSON.stringify(exclude),
        hrsChk: JSON.stringify(hrsChk),
        core: JSON.stringify(core),
      },
      dataType: "json",
      success: function (data) {
        const repdata = data;
        resolve(repdata);
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
function getHolidays() {
  const ymSel = $("#idMonth").val();
  const selLoc = parseInt($("#idLoc").find(":selected").attr("loc-id"));
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_holidays.php",
      data: {
        selLoc: JSON.stringify(selLoc),
        ymSel: ymSel,
      },
      dataType: "json",
      success: function (data) {
        const holidays = data;
        resolve(holidays);
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
function addToke() {
  $.each(tokens, function (indexInArray, valueOfElement) {
    var td = $("tr td:first-child:contains(" + valueOfElement + ")");
    td.closest("tr").find(".custom-checkbox").addClass("checked");
  });
}
function isAllTokeChecked() {
  var toks = $(".toke").length;
  var chekTok = $(".toke.checked").length;
  $("#checkAllTokens").prop("checked", false);
  if (toks && toks === chekTok) {
    $("#checkAllTokens").prop("checked", true);
  }
}
function valiDate(start, end) {
  return start <= end;
}

//#endregion
