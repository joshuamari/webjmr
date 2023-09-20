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
