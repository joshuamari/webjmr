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

const today = new Date();
//#endregion
checkLogin();
$("#monthSel").val(
  `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}`
);
//#region BINDS
$(document).ready(function () {
  $.ajaxSetup({ async: false });
  getGroupList();

  $.ajaxSetup({ async: true });

  //start
  queries();
});

$(document).on("click", "#btnExport", function () {
  exportTable();
});

//#endregion

//#region FUNCTIONS
function exportTable() {
  TableToExcel.convert(document.getElementById("cmrTable"), {
    name: `Careless Mistakes Report_${$("#buSel").val()}_${$(
      "#monthSel"
    ).val()}.xlsx`,
    sheet: {
      name: `${$("#buSel").val()}_${$("#monthSel").val()}`,
    },
  });
}
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
    },
  });
  $.ajaxSetup({ async: true });
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
      if (grpList.length > 1) {
        $("#buSel").html(`<option value=''>All</option>`);
      } else {
        $("#totalRow").addClass("d-none");
      }
      grpList.forEach((grp) => {
        $("#buSel").append(`<option>${grp}</option>`);
        if (grp == _empDetails["empGroup"]) {
          $("#buSel").val(_empDetails["empGroup"]);
        }
      });
    }
  );
}

//#endregion

//#region for queries

function queries() {
  $.getJSON("js/testdata-KDT.json",
    function (data) {
      $.each(data, function (empNum, empDets) {

        const totalOT =
          empDets.hours.regular_OT +
          empDets.hours.rdOT +
          empDets.hours.rdOT_excess +
          empDets.hours.legal +
          empDets.hours.legal_excess +
          empDets.hours.legal +
          empDets.hours.rdOT_legal_excess +
          empDets.hours.special +
          empDets.hours.special_excess +
          empDets.hours.rdOT_special +
          empDets.hours.rdOT_special_excess;

        const totalHours = totalOT +
          empDets.hours.regular_hours +
          empDets.hours.paid_leave +
          empDets.hours.unpaid_leave;

        $('#acctBody').append(`
        <tr class="emp_row" emp_num="${empNum}">
        <td>${empNum}</td>
        <td>${empDets.empName}</td>
        <td>${empDets.hours.regular_hours}</td>
        <td class="ot_total">${totalOT}</td>
        <td>${empDets.hours.paid_leave}</td>
        <td>${empDets.hours.unpaid_leave}</td>
        <td>${totalHours}</td>
        <td>${empDets.hours.regular_OT}</td>
        <td>${empDets.hours.rdOT}</td>
        <td>${empDets.hours.rdOT_excess}</td>
        <td>${empDets.hours.legal}</td>
        <td>${empDets.hours.legal_excess}</td>
        <td>${empDets.hours.legal}</td>
        <td>${empDets.hours.rdOT_legal_excess}</td>
        <td>${empDets.hours.special}</td>
        <td>${empDets.hours.special_excess}</td>
        <td>${empDets.hours.rdOT_special}</td>
        <td>${empDets.hours.rdOT_special_excess}</td>
        </tr>`);
      });
    }
  );
}

//#endregion

$(document).on('change','#selLoc',function(){
  console.log($(this).val())
  if($(this).val() == "Overseas"){
    $('#loc-head').show();
  }else{
    $('#loc-head').hide();
  }
});
