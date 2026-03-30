function initializeDate() {
  var getDate = new Date();
  var offsetDate = getDate.getTimezoneOffset() * 60 * 1000;
  var localTime = new Date(getDate - offsetDate);
  var iso = localTime.toISOString();
  var ISOFormatDate = iso.split("T")[0];
  $("#idDRDate").val(ISOFormatDate);
}

function ifSmallScreen() {
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

function sequenceValidation(type) {
  if (type == 0) {
    $("#idEmployee").prop("disabled", true);
    $("#idProject").prop("disabled", true);
    $("#idItem").prop("disabled", true);
    $("#idJRD").prop("disabled", true);

    if ($("#idItem").val() > 0) $("#idJRD").prop("disabled", false);
    if ($("#idProject").val() > 0) $("#idItem").prop("disabled", false);
    if ($("#idEmployee").val() > 0) $("#idProject").prop("disabled", false);
    if ($("#idGroup").val() > 0) $("#idEmployee").prop("disabled", false);
  } else {
    $("#edit-selIOW").prop("disabled", true);
    $("#edit-selJRD").prop("disabled", true);

    if ($("#edit-selIOW").val() > 0) $("#edit-selJRD").prop("disabled", false);
    if ($("#edit-selProj").val() > 0) $("#edit-selIOW").prop("disabled", false);
  }
}

function resetSelection(num, type) {
  if (type == 0) {
    var proj = $("#idProject");
    var iow = $("#idItem");
    var jrd = $("#idJRD");
    var tow = $("#idTOW");

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
    var eproj = $("#edit-selProj");
    var eiow = $("#edit-selIOW");
    var ejrd = $("#edit-selJRD");
    var etow = $("#edit-selTOW");

    if (num == 1) {
      eproj.val(0).change();
      eiow.val(0).change();
      ejrd.val(0).change();
    } else if (num == 2) {
      ejrd.val(0).change();
      eiow.val(0).change();
      etow.val(0).change();
    } else if (num == 3) {
      ejrd.val(0).change();
    }
  }
}

function removeOutlines() {
  $(
    "#edit-selLoc, #edit-selProj, #edit-selIOW, #edit-selJRD, #edit-2d3d, #edit-rev, #edit-selTOW, #edit-selCheck, #edit-selMHType, #edit-newRemarks, #edit-trGroup, #edit-newHour, #edit-newMin",
  )
    .removeClass("border border-danger")
    .removeClass("bg-err");
  $(".editInputError").removeClass("block").addClass("hidden");
  $(".editIoWLbl").removeClass("block").addClass("hidden");
}

function disableTimeInput(projID, type) {
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
  if (type == 0 || type == undefined) {
    var projID = $($("#idProject").find("option:selected")).attr("proj-id");
    var selLoc = $("#idLocation").val() || "KDT";

    if (projID != leaveID) {
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
    var eprojID = $($("#edit-selProj").find("option:selected")).attr("proj-id");
    var eselLoc = $("#edit-selLoc").val() || "KDT";

    if (eprojID != leaveID) {
      $("#edit-selMHType").prop("disabled", false);
      if (!isWorkDay(eselLoc)) {
        $("#edit-selMHType").val("Overtime");
        $("#edit-selMHType").prop("disabled", true);
      }
      if (eselLoc == "WFH") {
        $("#edit-selMHType").val("Regular");
        $("#edit-selMHType").prop("disabled", true);
      }
    } else {
      $("#edit-selMHType").prop("disabled", true);
      $("#edit-selMHType").val(0);
      if (!isWorkDay(eselLoc)) {
        alert("Leave disabled on holidays/weekends");
        $("#edit-selProj").val(0).change();
      }
    }
  }

  return true;
}

function isDrawing(type) {
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
  var projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id"),
  );
  var editprojID = parseInt(
    $($("#edit-selProj").find("option:selected")).attr("proj-id"),
  );
  var selGroup = $("#idGroup").val();

  if (type == 0) {
    var show =
      !defaults.includes(projID) &&
      selGroup != 16 &&
      selGroup != 10 &&
      projID != 0 &&
      projID != null &&
      projID != undefined;

    $("#id2DDiv").toggleClass("d-none", !show);
    $("#idRevDiv").toggleClass("d-none", !show);
  } else {
    var eshow =
      !defaults.includes(editprojID) &&
      editGrpID != 16 &&
      editGrpID != 10 &&
      editprojID != 0 &&
      editprojID != null &&
      editprojID != undefined;

    if (eshow) {
      $("input[name=edt-radio]").prop("disabled", false);
      $("#edit-rev").prop("disabled", false);
    }
    $("#edit-2D3DDiv").toggleClass("d-none", !eshow);
    $("#edit-RevDiv").toggleClass("d-none", !eshow);
  }
}

function hasJRD(type) {
  var projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id"),
  );
  var editprojID = parseInt(
    $($("#edit-selProj").find("option:selected")).attr("proj-id"),
  );

  if (type == 0) {
    $("#idJRDDiv").toggleClass(
      "d-none",
      !(projID != leaveID && projID != otherID),
    );
  } else {
    $("#edit-JRDDiv").toggleClass(
      "d-none",
      !(editprojID != leaveID && editprojID != otherID),
    );
  }
}

function hasTOW(type) {
  var projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id"),
  );
  var editprojID = parseInt(
    $($("#edit-selProj").find("option:selected")).attr("proj-id"),
  );

  if (type == 0) {
    var show = (!defaults.includes(projID) && projID) || projID == leaveID;
    $("#idTowDiv").toggleClass("d-none", !show);
    $("#idTowDescDiv").toggleClass("d-none", !show);
  } else {
    var eshow =
      (!defaults.includes(editprojID) && editprojID) || editprojID == leaveID;
    $("#edit-TOWDiv").toggleClass("d-none", !eshow);
    $("#edit-TOWDescDiv").toggleClass("d-none", !eshow);
  }
}

function createTRGroupDiv(itemID, allgrps, type) {
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

function getMHCount() {
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
    if (ot > 0) $("#cardOt").addClass("new");
    if (lv > 0) $("#cardLv").addClass("new");
  } else {
    if (isWorkDay(loc)) {
      if (ot > 0 && (reg < 8 || lv > 0)) $("#cardOt").addClass("new");
      if (lv == 4 && reg < 4) $("#cardLv").addClass("new");
      if (reg > 8 || (reg > 0 && reg + lv < 8)) $("#cardReg").addClass("new");
    } else {
      if (reg > 0) $("#cardReg").addClass("new");
      if (lv > 0) $("#cardLv").addClass("new");
    }
  }
}

function resetEntry() {
  $("#getHour,#getMin,#idRemarks").val("").change();
  $("#idMH").val("null").change();
  $("#idLocation,#idProject,#idItem,#idJRD,#idTOW,#trGroup").val(0).change();
  $("#idRev").prop("checked", false);
  $("#edit-rev").prop("checked", false);

  $(
    "#idGroup,#idEmployee,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate,#trGroup",
  )
    .removeClass("border border-danger")
    .removeClass("bg-err");

  $(".checker").addClass("d-none");
  $("#id2DDiv").addClass("d-none");
  $("#idRevDiv").addClass("d-none");
  sequenceValidation(0);
}

function saveEdit() {
  const grp = editGrpID;
  const date = $("#idDRDate").val();
  const emp = $($("#idEmployee").find("option:selected")).attr("emp-id");
  const entryID = editTRID;
  const loc = $($("#edit-selLoc").find("option:selected")).attr("loc-id");
  const proj = $($("#edit-selProj").find("option:selected")).attr("proj-id");
  const item = $($("#edit-selIOW").find("option:selected")).attr("item-id");
  const trgrp = $("#edit-trGroup").val() || "";
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

  if ($("#edit-2D3DDiv").hasClass("d-none")) tutri = "";

  if (!grp || grp == 0) mgaKulang.push("GROUP");
  if (!date) mgaKulang.push("DATE");
  if (!emp || emp == 0) mgaKulang.push("EMPLOYEE");
  if (!loc || loc == 0) mgaKulang.push("LOCATION");
  if (!proj || proj == 0) mgaKulang.push("PROJECT");
  if (!item || item == 0) mgaKulang.push("ITEM");
  if (!jobreq && proj != leaveID && proj != otherID) mgaKulang.push("JRD");
  if (revision) revision = 1;
  else revision = 0;
  if (!tow && (!defaults.includes(proj) || proj == leaveID))
    mgaKulang.push("TOW");
  if (tow == 3 && (!checker || checker == 0)) mgaKulang.push("CHECKER");
  if (hour > 1200 || hour < 0 || hour == 0) mgaKulang.push("ORAS");
  if (mins > 59 || mins < 0) mgaKulang.push("ORAS");
  if ((!mhtype && proj != leaveID) || mhtype == "null")
    mgaKulang.push("MHTYPE");
  if (proj == leaveID) mhtype = 2;
  if (item == 14 && (!trgrp || trgrp == 0)) mgaKulang.push("TRGROUP");

  return new Promise((resolve, reject) => {
    if (mgaKulang.length > 0) {
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
        success: function () {
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

function addEntries() {
  let tutri = $('input[name="radio"]:checked').val();
  const grp = $("#idGroup").val();
  const date = $("#idDRDate").val();
  const loc = $($("#idLocation").find("option:selected")).attr("loc-id");
  const emp = $($("#idEmployee").find("option:selected")).attr("emp-id");
  const proj = $($("#idProject").find("option:selected")).attr("proj-id");
  const item = $($("#idItem").find("option:selected")).attr("item-id");
  const trgrp = $("#trGroup").val() || "";
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

  if ($("#id2DDiv").hasClass("d-none")) tutri = "";
  if (!grp || grp == 0) mgaKulang.push("GROUP");
  if (!date) mgaKulang.push("DATE");
  if (!loc || loc == 0) mgaKulang.push("LOCATION");
  if (!emp || emp == 0) mgaKulang.push("EMPLOYEE");
  if (!proj || proj == 0) mgaKulang.push("PROJECT");
  if (!item || item == 0) mgaKulang.push("ITEM");
  if (!jobreq && proj != leaveID && proj != otherID) mgaKulang.push("JRD");
  if (revision) revision = 1;
  else revision = 0;
  if (!tow && (!defaults.includes(proj) || proj == leaveID))
    mgaKulang.push("TOW");
  if (tow == 3 && !checker) mgaKulang.push("CHECKER");
  if (hour > 1200 || hour < 0 || hour == 0) mgaKulang.push("ORAS");
  if (mins > 59 || mins < 0) mgaKulang.push("ORAS");
  if (!mhtype && proj != leaveID) mgaKulang.push("MHTYPE");
  if (proj == leaveID) mhtype = 2;
  if (item == 14 && (!trgrp || trgrp == 0)) mgaKulang.push("TRGROUP");

  return new Promise((resolve, reject) => {
    if (mgaKulang.length > 0) {
      $(".missingInputs").removeClass("hidden");
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
          getEntries(emp).then(fillEntries);
          resetEntry();
          resolve(response);
        },
        error: function (xhr, status, error) {
          if (xhr.status === 404)
            reject("Not Found Error: The requested resources are not found.");
          else if (xhr.status === 500)
            reject("Internal Server Error: There was a server error.");
          else reject(error);
        },
      });
    }
  });
}

function deleteEntry(trID) {
  const emp = $($("#idEmployee").find("option:selected")).attr("emp-id");

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/delete_entry.php",
      data: { drID: trID },
      dataType: "json",
      success: function (response) {
        getEntries(emp).then(fillEntries);
        resolve(response);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404)
          reject("Not Found Error: The requested resources are not found.");
        else if (xhr.status === 500)
          reject("Internal Server Error: There was a server error.");
        else reject(error);
      },
    });
  });
}

function copyEntries() {
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
        getEntries(getEmp).then(fillEntries);
        resolve(response);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404)
          reject("Not Found Error: The requested resources are not found.");
        else if (xhr.status === 500)
          reject("Internal Server Error: There was a server error.");
        else reject(error);
      },
    });
  });
}

function fillEditFields(editData) {
  var thisEmpID = $("#idEmployee").val();
  var entry = editData[0];

  editGrpID = entry["groupID"];
  const mhtype = entry["MHType"];
  const tow = entry["TOW"];
  const checker = entry["checkerID"];
  const timeFormat = entry["duration"];
  const duration = timeFormat * 60;
  const newhrs = Math.floor(duration / 60);
  const newmins = duration % 60;
  const iow = entry["itemID"];
  const jrd = entry["jobReqDesc"];
  const location = entry["locID"];
  const proj = entry["projID"];
  const remarks = entry["remarks"];
  const revision = entry["revision"];
  const trgrp = entry["trGrp"];
  const tutridi = entry["twoDthreeD"];

  let checkItemID = noMoreInputItems.includes(iow);

  Promise.all([getDispatchLoc(), getProjects(thisEmpID, editGrpID)]).then(
    ([locs, projs]) => {
      fillDispatchLoc(locs, 1);
      fillProjects(projs, 1);
      fillMHType(1);

      $("#edit-selLoc").val(location);
      $("#edit-selProj").val(proj);
      $("#edit-newRemarks").val(remarks);

      Promise.all([
        getItems(thisEmpID, proj, editGrpID),
        getTOW(proj),
        getCheckers(proj, editGrpID),
      ]).then(([items, tows, checks]) => {
        resetSelection(2, 1);
        fillItems(items, 1);
        $("#edit-selIOW").val(iow);

        Promise.all([
          getJobs(thisEmpID, proj, iow, editGrpID),
          getTRGroups(),
        ]).then(([jobs, allgrps]) => {
          resetSelection(3, 1);
          fillJobs(jobs, 1);
          $("#edit-selJRD").val(jrd);
          getLabel(iow, 1);
          createTRGroupDiv(iow, allgrps, 1);
          if (trgrp) $("#edit-trGroup").val(trgrp);
        });

        if (checkItemID) $("#drInstruction").modal("show");

        fillTOW(tows, 1);
        disableTimeInput(proj, 1);
        MHValidation(1);
        fillCheckers(checks, 1);
        if (proj != null || proj != undefined) isDrawing(1);

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
          if (tow == 3) {
            $(".edit-check").removeClass("d-none");
            $("#edit-selCheck").val(checker);
          } else {
            $(".edit-check").addClass("d-none");
          }
          if (tow == 0) $("#edit-newHour").val("");
          if (tow == 10 || tow == 11) $("#edit-newHour").val("4");
          if (tow == 12) $("#edit-newHour").val("8");
          getTOWDesc(tow, 1);
          $("#edit-newHour").val(newhrs);
          $("#edit-newMin").val(newmins);
          $("#edit-selMHType").val(mhtype).change();
        } else {
          $("#edit-newHour").val(newhrs);
          $("#edit-newMin").val(newmins);
          $("#edit-selMHType").val(mhtype).change();
        }

        if (tutridi) $(`#${tutridi}`).prop("checked", true);
        if (revision != 0) $("#edit-rev").prop("checked", true);
      });
    },
  );
}

function dupeEntry(entryData) {
  const dupeData = entryData[0];
  const emp = $($("#idEmployee").find("option:selected")).attr("emp-id");
  const grp = editGrpID;
  const date = $("#idDRDate").val();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/add_entries.php",
      data: {
        twoDthreeD: dupeData["twoDthreeD"],
        grpNum: grp,
        selDate: date,
        locID: dupeData["locID"],
        empNum: emp,
        projID: dupeData["projID"],
        itemID: dupeData["itemID"],
        jobReqDesc: dupeData["jobReqDesc"],
        trGrp: dupeData["trGrp"],
        TOWID: dupeData["TOW"],
        revision: dupeData["revision"],
        duration: dupeData["duration"] * 60,
        manhour: dupeData["MHType"],
        remarks: dupeData["remarks"],
        checker: dupeData["checkerID"],
        overrideEmpNum: empDetails["empID"],
      },
      dataType: "json",
      success: function (response) {
        getEntries(emp).then(fillEntries);
        resetEntry();
        resolve(response);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404)
          reject("Not Found Error: The requested resources are not found.");
        else if (xhr.status === 500)
          reject("Internal Server Error: There was a server error.");
        else reject(error);
      },
    });
  });
}

// LOCKING
async function handleDateChange() {
  const isLocked = await evaluateMonthLock();

  if (!isLocked) {
    try {
      await Promise.resolve(MHValidation());
    } catch (error) {
      console.error(error);
      alert(error);
    }

    sequenceValidation(0);
  }
}

function setLockedState(isLocked) {
  const lockTargets = [
    "#idLocation",
    "#idProject",
    "#idItem",
    "#idJRD",
    "#idTOW",
    "#idChecking",
    "#getHour",
    "#getMin",
    "#idMH",
    "#idRemarks",
    "#idAdd",
    "#idReset",
    "#idCopyDate",
    "#idCopy",
    "#searchproj",
    "#searchitem",
    "#searchjrd",
    "#idRev",
    "#towDesc",
    "#trGroup",
  ];

  if (isLocked) {
    $("#lockingOverlay").removeClass("hidden");
    lockTargets.forEach((selector) => $(selector).prop("disabled", true));
    $("#idCopyDate").val("");
    $("#drEntries")
      .find(
        ".selectBut, .edit, .delBut, button[edit-entry], #dupeBut, #editBut, #delBut",
      )
      .prop("disabled", true)
      .addClass("disabled");
  } else {
    $("#lockingOverlay").addClass("hidden");
    lockTargets.forEach((selector) => $(selector).prop("disabled", false));
    $("#drEntries")
      .find(
        ".selectBut, .edit, .delBut, button[edit-entry], #dupeBut, #editBut, #delBut",
      )
      .prop("disabled", false)
      .removeClass("disabled");

    sequenceValidation(0);
    Promise.resolve(MHValidation()).catch((error) => {
      console.error("MHValidation failed in setLockedState:", error);
    });

    const projID = $($("#idProject").find("option:selected")).attr("proj-id");
    const itemID = $($("#idItem").find("option:selected")).attr("item-id");

    if (projID) disableTimeInput(projID, 0);
    if (typeof disableInputs === "function" && projID && itemID) {
      disableInputs(projID, itemID);
    }
  }
}

function updateLockedMonthLabel() {
  const selectedDate = $("#idDRDate").val();
  $("#lockedMonthLabel").text(getMonthYearLabel(selectedDate));
}

async function evaluateMonthLock() {
  const yearMonth = $("#idDRDate").val();
  const employeeNumber = $($("#idEmployee").find("option:selected")).attr("emp-id");

  updateLockedMonthLabel();
  updateLockingMessage();

  if (!yearMonth || !employeeNumber || employeeNumber == 0) {
    setLockedState(false);
    return false;
  }

  const canEdit = await canEditSelectedDate(yearMonth);
  const locked = !canEdit;

  setLockedState(locked);
  return locked;
}

function updateLockingMessage() {
  const selectedDate = $("#idDRDate").val();
  const isPrevMonth = isPreviousMonth(selectedDate);
  const canAccessPreviousMonth = false;

  let message = `
    This Daily Report is outside the current editable month.
    You may still view the details, but changes are disabled.
  `;

  if (isPrevMonth && !canAccessPreviousMonth) {
    message = `
      Previous-month editing is currently disabled for your account.
      You may still view the details, but changes are disabled.
    `;
  }

  if (isPrevMonth && canAccessPreviousMonth) {
    message = `
      Previous-month access is currently active for your account.
      You may edit entries for the selected previous-month date.
    `;
  }

  $("#lockingMessage").html(message);
}

function clearInputErrorState() {
  $(this).removeClass("bg-err");
}

function handleRequestAccessClick() {
  const selectedDate = $("#idDRDate").val();

  if (!selectedDate) {
    alert("Please select a date first.");
    return;
  }

  window.location.href = `${rootFolder}/webJMR/DRTemporaryAccess/`;
}

function handleGoCurrentMonthClick() {
  const todayString = getTodayLocalDateString();
  $("#idDRDate").val(todayString).trigger("change");
}
