//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
let empDetails = [];

//pwede rin to galing db (initialize once)
const codeArr = {
  DXT: "6104360-8900",
  CEM: "61W2201-8900",
  MIL: "61W2201-8900",
  CHE: "61W2252-8900",
  CRY: "61W2971-8900",
  MHAH: "61W2202-8900",
  AH: "61W2714-8900",
  ENV: "61W2322-8900",
  EE: "61W2283-8900",
  CIV: "61W2211-8900",
  PIP: "61W2510-8900",
  BOI: "61W2723-8900",
  KHI: "61W2102-8900",
  KDT: "61W2102-8900",
  TEG: "NA",
};
//#endregion
checkAccess()
  .then((result) => {
    if (result.isSuccess) {
      empDetails = result.data;
      $(document).ready(function () {
        setDate();
        getGroups()
          .then((grps) => {
            if (grps.isSuccess) {
              fillGroups(grps.data);
              $("#buSel")
                .find(`option[grp-id="${empDetails.group_id}"]`)
                .prop("selected", true);
              $("#buSel").change();
              return;
            }
            alert(grps.message || "Could not load groups.");
          })
          .catch((error) => {
            alert(mhAlertText(error));
          });
      });
    } else {
      alert(result.message);
      window.location.href = `${rootFolder}/webJMR/DailyReport`;
    }
  })
  .catch((error) => {
    alert(mhAlertText(error));
  });

//#region BINDS

$(document).on("change", "#buSel", function () {
  getTable();
  // getTestHeader();
  // getEmplist();
  // getEntries();
  // getMgaNahiram();
  // getHiramEntries();
  // getMngKdt();
});
$(document).on("change", "#monthSel", function () {
  getTable();
});
$(document).on("change", "#CO", function () {
  var cutoff = $(this).val();
  getTable();
  if (cutoff == 4 || cutoff == 5) {
    $("#monthSelContainer ").addClass("d-none");
  } else {
    $("#monthSelContainer ").removeClass("d-none");
  }
});
//#endregion

//#region FUNCTIONS
function mhAlertText(error) {
  if (!error) {
    return "Could not load MH Report data.";
  }
  if (typeof error === "string") {
    return error;
  }
  return error.message || "Could not load MH Report data.";
}

function mhAjaxMessage(xhr, fallback) {
  if (xhr && xhr.responseJSON && xhr.responseJSON.message) {
    return xhr.responseJSON.message;
  }
  if (xhr && xhr.responseText) {
    try {
      var parsed = JSON.parse(xhr.responseText);
      if (parsed && parsed.message) {
        return parsed.message;
      }
    } catch (ignore) {}
  }
  if (xhr && xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  }
  return fallback;
}

function mhPostJson(url, data) {
  var result = null;
  var failedMessage = null;
  $.ajax({
    type: "POST",
    url: url,
    data: data,
    dataType: "json",
    async: false,
    success: function (response) {
      result = response;
    },
    error: function (xhr) {
      failedMessage = mhAjaxMessage(xhr, "Could not load MH Report data.");
    },
  });
  if (failedMessage) {
    throw new Error(failedMessage);
  }
  return result;
}

function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_mh_access.php",
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(
          mhAjaxMessage(
            xhr,
            "An error occurred in the PHP script while checking login details."
          )
        );
      },
    });
  });
}
function setDate() {
  //set default month
  var today = new Date();

  var rawMonth = `${today.getMonth() + 1}`;
  var dateString = `${today.getFullYear()}-${rawMonth.padStart(2, "0")}`;
  $("#monthSel").val(dateString);
}
function getGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_user_groups.php",
      dataType: "json",
      success: function (response) {
        const grps = response;
        resolve(grps);
      },
      error: function (xhr) {
        reject(
          mhAjaxMessage(
            xhr,
            "An error occurred in the PHP script while fetching group details."
          )
        );
      },
    });
  });
}

function fillGroups(grps) {
  $("#buSel").html(`<option value='' selected hidden>Select Group</option>`);
  $.each(grps, function (index, group) {
    $("#buSel").append(
      `<option grp-id="${group.group_id}">${group.abbreviation}</option>`
    );
  });
}
function mhReportFilters() {
  return {
    getYMSel: $("#monthSel").val(),
    getHalfSel: $("#CO").val(),
    getGroup: $("#buSel").val(),
  };
}

function getTable() {
  if (!$("#buSel").val()) {
    return;
  }
  try {
    var _testHeader = getTestHeader();
    var _empList = getEmplist();
    var _entries = getEntries();
    var _mgaNahiram = getMgaNahiram();
    var _hiramEntries = getHiramEntries();
    var _mngkdt = getMngKdt();
    var _getGroup = $("#buSel").val();
    createTable(
      _testHeader,
      _empList,
      _entries,
      _mgaNahiram,
      _hiramEntries,
      _mngkdt,
      _getGroup
    );
    $(".xTot").each(function () {
      var content = $(this).text();
      if ($.isNumeric(content)) {
        $(this).attr("data-t", "n");
      }
    });
  } catch (error) {
    alert(mhAlertText(error));
  }
}
function getTestHeader() {
  return mhPostJson("php/get_testheader.php", mhReportFilters()) || [];
}
function getEmplist() {
  return mhPostJson("php/get_emplist.php", mhReportFilters()) || [];
}
function getEntries() {
  return mhPostJson("php/get_entries.php", mhReportFilters()) || [];
}
function getMgaNahiram() {
  return mhPostJson("php/get_mganahiram.php", mhReportFilters()) || [];
}
function getHiramEntries() {
  return mhPostJson("php/get_hiram_entries.php", mhReportFilters()) || [];
}
function getMngKdt() {
  return mhPostJson("php/get_mngkdt.php", mhReportFilters()) || [];
}
function createTable(
  mainProjects,
  employeeList,
  mainProjEntries,
  hiramProjects,
  hiramProjEntries,
  mngProjEntries,
  BU
) {
  $("#mainTable").html(`<thead>
  <tr id="tr1">
    <th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle" class="text-center" rowspan="4" title="Employee Number">Emp. No.</th>
    <th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle" rowspan="4">Name</th>
    <th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin">Budget in Charge</th>
  </tr>
  <tr id="tr2">
    <th data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin">Order No.</th>
  </tr>
  <tr id="tr3">
    <th data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin">Project</th>
  </tr>
  <tr id="tr4">
    <th data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin">Location</th>
  </tr>
</thead>
<tbody id="mainTbody">

</tbody>`);
  addEmp(employeeList);
  pHead(mainProjects);
  // $('#tr1').append(`<th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin"	data-f-bold="true" data-a-h="center" data-a-v="middle" rowspan="4" class="st-color">Sub-total</th>`);
  // $('.empRow').append(`<td data-f-name="Arial" data-f-sz="9" data-f-color="ff0000" data-b-a-s="thin" data-t="n" data-a-h="center" class="st st-color"></td>`);
  // $('#tot1').append(`<td data-f-name="Arial" data-f-sz="9" data-f-bold="true" data-f-color="ff0000" data-b-a-s="thin" data-t="n" data-a-h="center" id="tot1-st" class="st-color"></td>`);
  // $('#multiplier').append(`<td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" class="st-color"></td>`);
  // $('#xd').append(`<td data-f-name="Arial" data-f-sz="9" data-f-bold="true" data-f-color="ff0000" data-b-a-s="thin" data-t="s" data-a-h="center" id="xd-st" class="st-color"></td>`);
  afterSub(BU);
  $("#tr1").append(
    `<th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle" rowspan="4" class="mhpp-color">Monthly Man-hour per Person</th>`
  );
  $(".empRow").append(
    `<td data-f-name="Arial" data-f-sz="9" data-f-color="ff0000" data-b-a-s="thin" data-t="n" data-a-h="center" class="mhpp mhpp-color"></td>`
  );
  $("#tot1").append(
    `<td data-f-name="Arial" data-f-sz="9" data-f-color="ff0000" data-b-a-s="thin" data-t="n" data-a-h="center" id="tot1-mhpp" class="mhpp-color" ></td>`
  );
  $("#multiplier").append(
    `<td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" class="mhpp-color"></td>`
  );
  $("#xd").append(
    `<td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" class="mhpp-color"></td>`
  );

  pHead(hiramProjects);
  //for entries
  // $($(".empRow[data-val='300']").children('td[data-val="51"]')).text('w3-black')
  addEntries(mainProjEntries);
  addEntries(mngProjEntries);
  addEntries(hiramProjEntries);
  total();
  addFooter();
}

function addEmp(empList) {
  //emp#||Name||Group and Desig
  empList.forEach((element) => {
    var splitVal = element.split("||");
    $("#mainTbody").append(`
  <tr class="empRow" data-val="${splitVal[0]}">
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-t="n" data-a-h="left">${splitVal[0]}</td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-wrap="false" data-a-h="left">${splitVal[1]}</td>
  <td data-a-v="middle" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="left" class="frfr">${splitVal[2]}</td>
  </tr>
  `);
  });
  $("#mainTbody").append(`
<tr id="tot1">
  <td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="left" colspan="2">Total Man-Hour per Order</td>
  <td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="left">Hr</td>
</tr>
<tr id="multiplier">
  <td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="left" colspan="2">単価</td>
  <td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="left">（千円）</td>
</tr>
<tr id="xd">
  <td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="left" colspan="2">請求額</td>
  <td data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="left">（千円）</td>
</tr>
`);
}

function pHead(projHeader) {
  projHeader.forEach(function callback(element) {
    //Grp||Proj Code||Proj Name||Location(P/J)||dbIndex
    var splitVal = element.split("||");
    var multi = ``;
    var backColorE = ``;
    var backColorH = ``;
    if (
      splitVal[0] == $(`#buSel`).val() ||
      splitVal[0] == "KDT" ||
      splitVal[0] == "Management"
    ) {
      if (splitVal[3] == "P") {
        multi = 2;
      } else {
        multi = 2.85;
      }
      backColorE = `C6E0B4`;
    } else {
      backColorH = `BFBFBF`;
      backColorE = `BFBFBF`;
    }
    $("#tr1").append(
      `<th data-a-v="middle" data-fill-color="${backColorH}" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center">${splitVal[0]}</th>`
    );
    $("#tr2").append(
      `<th data-a-v="middle" data-fill-color="${backColorH}" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-t="s" data-a-h="center" data-a-wrap="false">${
        splitVal[1] == "undefined" ? "" : splitVal[1]
      }</th>`
    );
    $("#tr3").append(
      `<th data-a-v="middle" data-fill-color="${backColorH}" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-t="s" data-a-h="center" data-a-wrap="false">${splitVal[2]}</th>`
    );
    $("#tr4").append(
      `<th data-a-v="middle" data-fill-color="${backColorH}" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-t="s" data-a-h="center">${splitVal[3]}</th>`
    );
    $(".empRow").append(
      `<td data-a-v="middle" data-fill-color="${backColorE}" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-t="n" data-a-h="center" data-val="${splitVal[4]}"></td>`
    );
    $("#tot1").append(
      `<td data-a-v="middle" data-fill-color="${backColorE}" data-f-name="Arial" data-f-sz="9" data-f-color="ff0000" data-b-a-s="thin" data-t="n" data-a-h="center" data-tot="${splitVal[4]}" class="tot"></td>`
    );
    // $('#multiplier').append(`<td data-b-a-s="thin" data-t="n" data-a-h="center" class="multiplier-${splitVal[4]}">${splitVal[3] == "P" ? "2" : "2.85"}</td>`);
    $("#multiplier").append(
      `<td data-a-v="middle" data-fill-color="${backColorH}" data-f-color="7030A0" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-t="n" data-a-h="center" class="multiplier-${splitVal[4]}">${multi}</td>`
    );
    $("#xd").append(
      `<td data-a-v="middle" data-fill-color="${backColorE}" data-f-name="Arial" data-f-sz="9" data-f-color="ff0000" data-b-a-s="thin" data-t="s" data-a-h="center" data-xtot="${splitVal[4]}" class="xTot"></td>`
    );
  });
}

function afterSub(kdtGroup) {
  const except = ["SYS", "IT", "ANA", "ETCL", "MPM", "MNG", "INT", "TEG"];

  if (kdtGroup == "DXT") {
    pHead([
      `Management||${codeArr[kdtGroup]}||100%||P||M1`,
      `Management||${codeArr[kdtGroup]}||100%||j||M2`,
      `KDT||${codeArr["KDT"]}||100%||P||K1`,
      `KDT||${codeArr["KDT"]}||100%||J||K2`,
    ]);
  } else if (!except.includes(kdtGroup)) {
    pHead([
      `Management||${codeArr[kdtGroup]}||100%||P||M1`,
      `Management||${codeArr[kdtGroup]}||100%||J||M2`,
      `${kdtGroup}||${codeArr[kdtGroup]}||50%||P||B1`,
      `${kdtGroup}||${codeArr[kdtGroup]}||50%||J||B2`,
      `KDT||${codeArr["KDT"]}||50%||P||K1`,
      `KDT||${codeArr["KDT"]}||50%||J||K2`,
    ]);
  } else {
    pHead([`KDT||61W2102-8900||100%||P||K1`, `KDT||61W2102-8900||100%||J||K2`]);
  }
}
function addEntries(entriesArrayElement) {
  entriesArrayElement.forEach((element) => {
    var splitVal = element.split("||");
    //emp#||dbIndex||duration
    $(
      $(`.empRow[data-val='${splitVal[0]}']`).children(
        `td[data-val="${splitVal[1]}"]`
      )
    ).text(splitVal[2]);
  });
}

function total() {
  // Left
  var getTots = $(".tot");
  for (let x = 0; x < getTots.length; x++) {
    $(getTots[x]).text(getTotal($($(getTots)[x]).attr("data-tot")));
  }

  // Multiplied (2 || 2.85) .xTot
  var getXTot = $(".xTot");
  for (let x = 0; x < getXTot.length; x++) {
    var totalmh = parseFloat(
      $(`.tot[data-tot="${$($(getTots)[x]).attr("data-tot")}"]`).text()
    );
    var multi = parseFloat(
      $(`.multiplier-${$($(getTots)[x]).attr("data-tot")}`).text()
    );
    var overall = Math.round((totalmh * multi + Number.EPSILON) * 100) / 100;
    if (!overall && overall != 0) {
      overall = `他部門請求`;
      $(getXTot[x]).attr("data-f-color", "");
    }
    $(getXTot[x]).text(overall);
    // $(getXTot[x]).text(parseFloat($(`.tot[data-tot="${$($(getTots)[x]).attr('data-tot')}"]`).text()) * parseFloat($(`.multiplier-${$($(getTots)[x]).attr('data-tot')}`).text()));
    // $('#xd-st').text(`${ parseFloat($('#xd-st').text() != ""? $('#xd-st').text() : "0") + parseFloat($(getXTot[x]).text())}`);
  }

  // total ng multiplied
  var mTot = $("#xd-st").prevAll(".xTot");
  for (let x = 0; x < mTot.length; x++) {
    var mtotleft = parseFloat(
      $("#xd-st").text() != "" ? $("#xd-st").text() : "0"
    );
    var mtotright = parseFloat($(mTot[x]).text());
    var mtottotal =
      Math.round((mtotleft + mtotright + Number.EPSILON) * 100) / 100;
    // $('#xd-st').text(`${ parseFloat($('#xd-st').text() != ""? $('#xd-st').text() : "0") + parseFloat($(mTot[x]).text())}`);
    $("#xd-st").text(`${mtottotal}`);
  }

  //subTot $('.st')
  var getST = $(".st");
  for (let x = 0; x < getST.length; x++) {
    $(getST[x]).text(sTot($(getST[x])));
  }

  // mhpp
  var getmhpp = $(".mhpp");
  for (let x = 0; x < getmhpp.length; x++) {
    $(getmhpp[x]).text(totmhpp(getmhpp[x]));
  }
}

function getTotal(iVal) {
  var getTots = $(`td[data-val="${iVal}"]`);
  var rVal = 0;
  for (let x = 0; x < getTots.length; x++) {
    rVal += parseFloat(getTots[x].innerText != "" ? getTots[x].innerText : "0");
  }
  rVal = Math.round((rVal + Number.EPSILON) * 100) / 100;
  return rVal;
}

function sTot(iVal) {
  var rVal = 0;
  var getsTot = $(iVal).prevAll("td[data-val]");
  for (let x = 0; x < getsTot.length; x++) {
    rVal += parseFloat($(getsTot[x]).text() != "" ? $(getsTot[x]).text() : "0");
  }
  rVal = Math.round((rVal + Number.EPSILON) * 100) / 100;
  //total ng subTot
  $("#tot1-st").text(
    `${
      parseFloat($("#tot1-st").text() != "" ? $("#tot1-st").text() : "0") +
      parseFloat(rVal)
    }`
  );
  return rVal;
}

function totmhpp(iVal) {
  // var rVal = parseFloat($($(iVal).siblings('.st')).text());
  var rVal = 0;
  var getLeft = $(iVal).prevUntil(".frfr");
  for (let x = 0; x < getLeft.length; x++) {
    rVal += parseFloat($(getLeft[x]).text() != "" ? $(getLeft[x]).text() : "0");
  }
  rVal = Math.round((rVal + Number.EPSILON) * 100) / 100;
  //total ng mhpp
  $("#tot1-mhpp").text(
    `${
      parseFloat($("#tot1-mhpp").text() != "" ? $("#tot1-mhpp").text() : "0") +
      parseFloat(rVal)
    }`
  );
  return rVal;
}
//#endregion

function addFooter() {
  var addString = `
  <tr style="display:none">
    <td>単価</td>
    <td>Unit Rate</td>
    <td>（千円）</td>
    <td></td>
    <td data-f-color="ff0000" colspan="10">注意：本表はシステム出力され計算式は含まれていないため、数値を変更した場合は合計や請求額の再計算をお願いします。</td>
  </tr>
  <tr style="display:none">
    <td>P</td>
    <td>Philippines</td>
    <td data-f-color="7030A0">2.0</td>
  </tr>
  <tr style="display:none">
    <td>J</td>
    <td>Japan or Overseas</td>
    <td data-f-color="7030A0">2.85</td>
  </tr>
  `;
  $("#mainTbody").append(addString);
}

//#region Print and Export

$(document).on("click", "#btnPrint", function () {
  $(".xPrint").toggle();
  $(".lower").toggleClass("lower lower_");
  print();
  $(".lower_").toggleClass("lower lower_");
  $(".xPrint").toggle();
});

$(document).on("click", "#btnExport", function () {
  try {
    var addString = `
  <tr class="fx" style="display:none">
  <th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle">${$(
    "#buSel"
  ).val()}</th>
  <th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle">${$(
    "#monthSel"
  ).val()}</th>
  <th data-fill-color="C6E0B4" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle">KHI入力、確認欄</th>
  <th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle">日付</th>
  <th data-fill-color="C6E0B4" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle"></th>
  <th data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle">確認者</th>
  <th data-fill-color="C6E0B4" data-f-name="Arial" data-f-sz="9" data-b-a-s="thin" data-a-h="center" data-a-v="middle"></th>
  </tr>
  <tr class="fx"></tr>`;

  $("thead").prepend(addString);
  // $(`#mainTable`).attr('data-cols-width','10,20,30');
  var periodName = exportName();
  var xlsName = `${periodName}_${$(`#buSel`).val()} Man-Hour Report.xlsx`;
  TableToExcel.convert(document.getElementById("mainTable"), {
    name: xlsName,
    sheet: {
      name: `${$("#buSel").val()}`,
    },
  });
  $(".fx").remove();
  $("#mainTable").addClass("ayos");
  } catch (error) {
    $(".fx").remove();
    alert(mhAlertText(error));
  }
});

function exportName() {
  var expName = "";
  var failedMessage = null;
  $.ajax({
    type: "POST",
    url: "php/get_exportname.php",
    data: {
      ymSel: $("#monthSel").val(),
      cOff: $("#CO").val(),
    },
    dataType: "text",
    async: false,
    success: function (data) {
      expName = data;
    },
    error: function (xhr) {
      failedMessage = mhAjaxMessage(xhr, "Could not build export file name.");
    },
  });
  if (failedMessage) {
    throw new Error(failedMessage);
  }
  return expName;
}

//#endregion
