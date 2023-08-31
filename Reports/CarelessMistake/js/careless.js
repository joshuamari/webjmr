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
var _empDetails = [];
var _entries = [];
var _tows = ["New", "Kmod", "Mkdt", "Mkhi", "Chk", "Cal", "Doc", "Other"];
var _exceptTow = ["ETCL", "MPM", "ANA"];
const today = new Date();
//#endregion
checkLogin();
$("#monthSel").val(
  `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}`
);
//#region BINDS
$(document).ready(function () {
  var start = $("#startSel").val();
  $.ajaxSetup({ async: false });
  getGroupList();

  $.ajaxSetup({ async: true });
  if (!start) {
    $("#endSel").attr("disabled", "disabled");
  }
});
$(document).on("click", ".bu", function () {
  getID = $(this).attr("id");
  $(`.${getID}.collapse`).toggleClass("show");
});
$(document).on("change", "#startSel", function () {
  $("#endSel").removeAttr("disabled");

  $("#endSel").attr("min", $("#startSel").val()); // Set min date for end date

  $("#endSel").val("");
});
$(document).on("change", "#endSel", function () {
  getEntries();
  $(".noShow").addClass("d-none");
  $(".tablecont").removeClass("d-none");
});
$(document).on("change", "#buSel", function () {
  var buSel = $(this).val();
  if (buSel) {
    $("#totalRow").addClass("d-none");
  } else {
    $("#totalRow").removeClass("d-none");
  }
  getEntries();
});
$(document).on("change", ".checkbox", function () {
  getEntries();
});
$(document).on("click", "#btnExport", function () {
  $("#exportModal").modal("show");
});
$(document).on("click", "#totAll", function () {
  $('.prc:contains("%")').each(function () {
    $(this).html($(this).html().split("%").join(""));
    $(this).html(parseFloat($(this).text()) / 100);
  });
  exportTable();
  $(".prc").append("%");
  $('.prc:contains("%")').each(function () {
    $(this).html(`${(parseFloat($(this).text()) * 100).toFixed(1)}%`);
  });
  $("#exportModal").modal("hide");
});
$(document).on("click", "#totOnly", function () {
  $(".collapse").attr("data-exclude", "true");
  $('.prc:contains("%")').each(function () {
    $(this).html($(this).html().split("%").join(""));
    $(this).html(parseFloat($(this).text()) / 100);
  });
  exportTable();
  $(".prc").append("%");
  $('.prc:contains("%")').each(function () {
    $(this).html(`${(parseFloat($(this).text()) * 100).toFixed(1)}%`);
  });
  $(".collapse").removeAttr("data-exclude");
  $("#exportModal").modal("hide");
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
function getEntries() {
  var $table = $("#cmrTable");
  if ($table.length) {
    // Select and remove all rows except the last one
    $table.find("tr:not(.heady):not(#totalRow)").remove();
  }

  var buSelected = $("#buSel").val();
  var groupSel = [buSelected];
  if (!buSelected) {
    groupSel = $("#buSel")
      .find("option:not(:first-child)")
      .map(function () {
        return $(this).text();
      })
      .get();
  }
  var startSel = $("#startSel").val();
  var endSel = $("#endSel").val();
  var ogpSel = $(`.checkbox`).is(":checked");
  $.post(
    "ajax/get_entries.php",
    {
      groupSel: groupSel,
      startSel: startSel,
      endSel: endSel,
      ogpSel: ogpSel,
    },
    function (data) {
      console.log(data);
      _entries = $.parseJSON(data);
      var upperString = "";
      var lowerString = "";
      $.each(_entries, function (groupName, group) {
        var buRowString = "";
        var et = "";
        if (_exceptTow.includes(groupName)) {
          et = "et";
        }
        buRowString += `
        <tr class="bu ent ${et}" id="${groupName}" >
        <td data-f-name="Arial" data-f-sz="9" data-f-bold="true" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" data-fill-color="e5eaff">${groupName}</td>
        <td class ="towtal" data-f-name="Arial" data-f-sz="9" data-f-bold="true" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" data-fill-color="e5eaff" data-t="n"></td>
        `;
        $.each(_tows, function (_, towName) {
          buRowString += `<td class='hrs' tow='${towName}'
          data-f-name="Arial" data-f-sz="9" data-f-bold="true" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" data-fill-color="e5eaff" data-t="n"></td><td class='prc' tow='${towName}' data-f-name="Arial" data-f-sz="9" data-f-bold="true" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" data-fill-color="e5eaff" data-t="n" data-num-fmt="0.0%"></td>`;
        });
        buRowString += `</tr>`;
        $.each(group, function (columnName, column) {
          buRowString += `
          <tr class="collapse ${groupName} ent ${et}">
          <td data-f-name="Arial" data-f-sz="9" data-a-h="left" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" >${columnName}</td>
          <td class ="towtal" data-f-name="Arial" data-f-sz="9" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000"  data-t="n" ></td>
          `;
          var propertiesObject = [];
          $.each(column, function (propertyName, propertyValue) {
            propertiesObject[propertyName] = propertyValue;
          });
          $.each(_tows, function (_, towName) {
            var towval = "0";
            if (towName in propertiesObject) {
              towval = propertiesObject[towName];
            }
            buRowString += `<td class='hrs' tow='${towName}'
            data-f-name="Arial" data-f-sz="9" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000"  data-t="n">${towval}</td><td class='prc' tow='${towName}'
            data-f-name="Arial" data-f-sz="9" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" data-t="n" data-num-fmt="0.0%">0</td>`;
          });
          buRowString += `</tr>`;
        });
        if (_exceptTow.includes(groupName)) {
          lowerString += buRowString;
        } else {
          upperString += buRowString;
        }
      });
      $(upperString).insertBefore("#totalRow");
      $(lowerString).insertAfter("#totalRow");
      computeTotals();
    }
  );
}
function horizontal() {
  var kit = $("tr.ent");
  kit.each(function () {
    var tds = $(this).find("td.hrs");
    var total = 0;
    tds.each(function () {
      var td = $(this);
      var content = td.text().trim();
      if (content.length > 0) {
        var parsedValue = parseFloat(content);

        if (!isNaN(parsedValue)) {
          // Do something with the parsed double value
          total += parsedValue;
        } else {
          console.log("Non-numeric content:", content);
        }
      }
    });
    $($(this).find("td.towtal")).text(total);
  });
}
function vertical() {
  var mari = $("tr.bu");
  var otenNew = 0;
  var otenKmod = 0;
  var otenMkdt = 0;
  var otenMkhi = 0;
  var otenChk = 0;
  var otenCal = 0;
  var otenDoc = 0;
  var otenOtter = 0;
  mari.each(function () {
    var getID = $(this).attr("id");
    var bu = $(`.${getID}`);
    var totalNew = 0,
      totalKmod = 0,
      totalMkdt = 0,
      totalMkhi = 0,
      totalChk = 0,
      totalCal = 0,
      totalDoc = 0,
      totalOtter = 0;
    bu.each(function (_, row) {
      var tds = $(this).find("td.hrs");
      tds.each(function () {
        var td = $(this);
        var content = td.text().trim();
        if (content.length > 0) {
          var parsedValue = parseFloat(content);
          if (!isNaN(parsedValue)) {
            // Do something with the parsed double value

            var tow = $(this).attr("tow");
            switch (tow) {
              case "New":
                totalNew += parsedValue;
                break;
              case "Kmod":
                totalKmod += parsedValue;
                break;
              case "Mkdt":
                totalMkdt += parsedValue;
                break;
              case "Mkhi":
                totalMkhi += parsedValue;
                break;
              case "Chk":
                totalChk += parsedValue;
                break;
              case "Cal":
                totalCal += parsedValue;
                break;
              case "Doc":
                totalDoc += parsedValue;
                break;
              case "Other":
                totalOtter += parsedValue;
                break;
            }
          } else {
            console.log("Non-numeric content:", content);
          }
        }
      });
    });
    $($(this).find(`.hrs[tow='New']`)).text(totalNew);
    $($(this).find(`.hrs[tow='Kmod']`)).text(totalKmod);
    $($(this).find(`.hrs[tow='Mkdt']`)).text(totalMkdt);
    $($(this).find(`.hrs[tow='Mkhi']`)).text(totalMkhi);
    $($(this).find(`.hrs[tow='Chk']`)).text(totalChk);
    $($(this).find(`.hrs[tow='Cal']`)).text(totalCal);
    $($(this).find(`.hrs[tow='Doc']`)).text(totalDoc);
    $($(this).find(`.hrs[tow='Other']`)).text(totalOtter);
    if (!$(this).hasClass("et")) {
      otenNew += totalNew;
      otenKmod += totalKmod;
      otenMkdt += totalMkdt;
      otenMkhi += totalMkhi;
      otenChk += totalChk;
      otenCal += totalCal;
      otenDoc += totalDoc;
      otenOtter += totalOtter;
    }
  });
  $($("#totalRow ").find(".hrs[tow='New']")).text(otenNew);
  $($("#totalRow ").find(".hrs[tow='Kmod']")).text(otenKmod);
  $($("#totalRow ").find(".hrs[tow='Mkdt']")).text(otenMkdt);
  $($("#totalRow ").find(".hrs[tow='Mkhi']")).text(otenMkhi);
  $($("#totalRow ").find(".hrs[tow='Chk']")).text(otenChk);
  $($("#totalRow ").find(".hrs[tow='Cal']")).text(otenCal);
  $($("#totalRow ").find(".hrs[tow='Doc']")).text(otenDoc);
  $($("#totalRow ").find(".hrs[tow='Other']")).text(otenOtter);
}
function computeTotals() {
  vertical();
  horizontal();
  getPercentage();
}
function getPercentage() {
  var kit = $("tr.ent");
  kit.each(function () {
    var tds = $(this).find("td.hrs");
    var percentage = 0;
    var total = $($(this).find("td.towtal")).text();
    var totalll = parseFloat(total);
    tds.each(function () {
      var td = $(this);
      var content = td.text().trim();
      if (content.length > 0) {
        var parsedValue = parseFloat(content);

        if (!isNaN(parsedValue)) {
          // Do something with the parsed double value
          percentage = ((parsedValue / totalll) * 100).toFixed(1);
        }
        var tow = $(this).attr("tow");
        $($(this).siblings(`[tow='${tow}']`)).text(`${percentage}%`);
      }
    });
  });
}
//#endregion
