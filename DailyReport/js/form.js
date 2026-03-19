function sequenceValidation() {
  $("#idProject").prop("disabled", true);
  $("#idItem").prop("disabled", true);
  $("#idJRD").prop("disabled", true);

  if ($("#idItem").prop("selectedIndex") > 0) {
    $("#idJRD").prop("disabled", false);
  }

  if ($("#idProject").prop("selectedIndex") > 0) {
    $("#idItem").prop("disabled", false);
  }

  if ($("#idGroup").prop("selectedIndex") > 0) {
    $("#idProject").prop("disabled", false);
  }
}

function resetEntry() {
  clearFormFieldValues();
  resetModeButtons();
  resetFormState();
}

function resetOnGrpChange() {
  resetDependentSelectionsAfterGroupChange();
}

function setAddMode() {
  $("#idAdd").text("Add");
  $("#idReset").text("Clear");
}

function setEditMode() {
  $("#idAdd").text("Save Changes");
  $("#idReset").text("Cancel");
}

function disableTimeInput(projID) {
  $("#getHour").prop("disabled", false);
  $("#getMin").prop("disabled", false);

  if (projID == AppState.leaveID) {
    $("#getHour").prop("disabled", true);
    $("#getMin").prop("disabled", true);
  }
}

function isDrawing() {
  isEngineering();
  hasJRD();
  hasTOW();
}

function isEngineering() {
  const projID = $($("#idProject").find("option:selected")).attr("proj-id");
  const selGroup = $("#idGroup").val();

  const isDrawingEnabled =
    !AppState.defaults.includes(Number(projID)) &&
    ![10, 16].includes(Number(selGroup)) &&
    Boolean(projID);

  if (isDrawingEnabled) {
    $("#id2DDiv").removeClass("d-none");
    $("#idRevDiv").removeClass("d-none");
  } else {
    $("#id2DDiv").addClass("d-none");
    $("#idRevDiv").addClass("d-none");
  }
}

function hasJRD() {
  const projID = $($("#idProject").find("option:selected")).attr("proj-id");
  const shouldShowJRD =
    projID != AppState.leaveID && projID != AppState.otherID;

  if (shouldShowJRD) {
    $("#idJRDDiv").removeClass("d-none");
  } else {
    $("#idJRDDiv").addClass("d-none");
  }
}

function hasTOW() {
  const projID = parseInt(
    $($("#idProject").find("option:selected")).attr("proj-id"),
  );

  const shouldShowTOW =
    (!AppState.defaults.includes(projID) && projID) ||
    projID == AppState.leaveID;

  if (shouldShowTOW) {
    $("#idTowDiv").removeClass("d-none");
    $("#idTowDescDiv").removeClass("d-none");
  } else {
    $("#idTowDiv").addClass("d-none");
    $("#idTowDescDiv").addClass("d-none");
  }
}

function MHValidation() {
  const projID = $("#idProject option:selected").attr("proj-id");
  const selLoc = $("#idLocation").val() || "KDT";

  if (projID != AppState.leaveID) {
    $("#idMH").prop("disabled", false);

    return isWorkDay(selLoc).then((workDay) => {
      if (!workDay) {
        $("#idMH").val("Overtime");
        $("#idMH").prop("disabled", true);
        return;
      }

      if (selLoc == "WFH") {
        $("#idMH").val("Regular");
        $("#idMH").prop("disabled", true);
        return;
      }

      $("#idMH").prop("disabled", false);
    });
  }

  $("#idMH").prop("disabled", true);
  $("#idMH").val("");

  return isWorkDay(selLoc).then((workDay) => {
    if (!workDay) {
      alert("Leave disabled on holidays/weekends");
      $("#idProject").val("").change();
    }
  });
}

function disableInputs(projID, itemID) {
  $("#getHour").prop("disabled", true);
  $("#getMin").prop("disabled", true);
  $("#idMH").prop("disabled", true);
  $("#idRemarks").prop("disabled", true);
  $("#idAdd").prop("disabled", true);

  if (projID != AppState.leaveID) {
    if (!AppState.noMoreInputItems.includes(Number(itemID))) {
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

function trainingGroup(itemID) {
  $(".trgrp").remove();

  if (Number(itemID) !== Number(AppState.oneBUTrainerID)) {
    return Promise.resolve([]);
  }

  $(".iow").after(`
    <div class="col-12 my-2 trgrp">
      <label for="trGroup" class="form-label">Group of Trainees</label>
      <div class="input-group">
        <select class="form-select" id="trGroup" required>
          <option value="" selected hidden>Select Group to Train</option>
        </select>
      </div>
      <span class="col-12 mt-1 alert-danger text-danger" id="p12" role="alert"></span>
    </div>
  `);

  return getTRGroups().catch((error) => {
    console.error(error);
    return [];
  });
}

function getTRGroups() {
  return postJson(
    "api/get_groups.php",
    {},
    "Failed to load training groups.",
  ).then((response) => {
    const groups = response.data || [];
    fillTrainingGroups(groups);
    return groups;
  });
}

function getLabel(itemOfWorkID) {
  return postJson(
    "api/get_label.php",
    {
      itemID: itemOfWorkID,
    },
    "Failed to load item label.",
  )
    .then((response) => {
      const label = response.data?.label || "";

      $("#labell").remove();

      if (!label.trim()) {
        return "";
      }

      $("#p5").after(`
        <span class="col-12 alert-primary text-primary" id="labell" role="alert">${label}</span>
      `);

      return label;
    })
    .catch((error) => {
      console.error(error);
      return "";
    });
}

function addEntries(addMode) {
  if (evaluateMonthLock()) {
    alert("Editing is locked for dates outside the current month.");
    return;
  }

  let tutri = $('input[name="radio"]:checked').val() || "";
  const grp = $("#idGroup").val();
  const date = $("#idDRDate").val();
  const loc = $("#idLocation option:selected").attr("loc-id");
  const proj = Number($("#idProject option:selected").attr("proj-id") || 0);
  const item = Number($("#idItem option:selected").attr("item-id") || 0);
  const trgrp = $("#trGroup option:selected").val() || "";
  const jobreq = $("#idJRD option:selected").attr("job-id") || "";
  const tow = Number($("#idTOW option:selected").attr("tow-id") || 0);

  const rawHour = $("#getHour").val();
  const rawMin = $("#getMin").val();

  const hour = Number(rawHour || 0) * 60;
  const mins = Number(rawMin || 0);
  const getDuration = String(hour + mins);

  const remarks = $("#idRemarks").val();
  const checker = $("#idChecking option:selected").attr("chk-id") || "";
  const mgaKulang = [];

  let revision = 0;
  let mhtype = $("#idMH option:selected").attr("mhid");

  if ($("#id2DDiv").hasClass("d-none")) {
    tutri = "";
  }

  if (!grp) {
    $("#p1").text("Please select group");
    $("#idGroup").addClass("border border-danger bg-err");
    mgaKulang.push("GROUP");
  }

  if (!date) {
    $("#p2").text("Please select date");
    $("#idDRDate").addClass("border border-danger bg-err");
    mgaKulang.push("DATE");
  }

  if (!loc) {
    $("#p3").text("Please select location");
    $("#idLocation").addClass("border border-danger bg-err");
    mgaKulang.push("LOCATION");
  }

  if (!proj) {
    $("#p4").text("Please select project");
    $("#idProject").addClass("border border-danger bg-err");
    mgaKulang.push("PROJECT");
  }

  if (!item) {
    $("#p5").text("Please select item of works");
    $("#idItem").addClass("border border-danger bg-err");
    mgaKulang.push("ITEM");
  }

  if (!jobreq && proj !== AppState.leaveID && proj !== AppState.otherID) {
    $("#p6").text("Please select job request description");
    $("#idJRD").addClass("border border-danger bg-err");
    mgaKulang.push("JRD");
  }

  revision =
    $("#idRev").is(":checked") && !$("#idRevDiv").hasClass("d-none") ? 1 : 0;

  if (
    !tow &&
    (!AppState.defaults.includes(proj) || proj === AppState.leaveID)
  ) {
    $("#p11").text(
      proj === AppState.leaveID
        ? "Please select day type"
        : "Please select type of work",
    );
    $("#idTOW").addClass("border border-danger bg-err");
    mgaKulang.push("TOW");
  }

  if (tow === 3 && !checker) {
    $("#p8").text("Please select member");
    $("#idChecking").addClass("border border-danger bg-err");
    mgaKulang.push("CHECKER");
  }

  if (rawHour === "" && rawMin === "") {
    $("#p9").text("Please input valid time");
    $("#getHour").addClass("border border-danger bg-err");
    $("#getMin").addClass("border border-danger bg-err");
    mgaKulang.push("ORAS");
  }

  if (hour > 1200 || hour < 0) {
    $("#p9").text("Please input valid time");
    $("#getHour").addClass("border border-danger bg-err");
    mgaKulang.push("ORAS");
  }

  if (mins > 59 || mins < 0) {
    $("#p9").text("Please input valid time");
    $("#getMin").addClass("border border-danger bg-err");
    mgaKulang.push("ORAS");
  }

  if (!mhtype && proj !== AppState.leaveID) {
    $("#p10").text("Please select manhour type");
    $("#idMH").addClass("border border-danger bg-err");
    mgaKulang.push("MHTYPE");
  }

  if (proj === AppState.leaveID) {
    mhtype = 2;
  }

  if (item === Number(AppState.oneBUTrainerID) && !trgrp) {
    $("#p12").text("Please select group to train");
    $("#trGroup").addClass("border border-danger bg-err");
    mgaKulang.push("TRGROUP");
  }

  if (mgaKulang.length > 0) {
    console.log(mgaKulang);
    return;
  }

  const fd = new FormData();
  fd.append("getTwoThree", tutri);
  fd.append("grpNum", grp);
  fd.append("getDate", date);
  fd.append("getLocation", loc);
  fd.append("getProject", proj);
  fd.append("getItem", item);
  fd.append("getTrGrp", trgrp);
  fd.append("getDescription", jobreq);
  fd.append("getType", tow);
  fd.append("getRev", revision);
  fd.append("getDuration", getDuration);
  fd.append("getMHType", mhtype);
  fd.append("getRemarks", remarks);
  fd.append("getChecking", checker);
  fd.append("addType", addMode);
  fd.append("empNum", AppState.empDetails.empNum);

  postFormData("api/add_entries.php", fd, "Failed to save entry.")
    .then(() => {
      resetEntry();
      setAddMode();
      isDrawing();
      refreshDailyReportView();
    })
    .catch((error) => {
      console.error(error);
      alert(error);
    });
}
function clearFormFieldValues() {
  $(
    "#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#trGroup",
  )
    .val("")
    .change();

  $("#one").click();
  $("#idRev").prop("checked", false);
}

function clearValidationMessages() {
  $("#p1,#p2,#p3,#p4,#p5,#p6,#p7,#p8,#p9,#p10,#p11,#p12").text("");
}

function clearValidationStyles() {
  $(
    "#idGroup,#idLocation,#getHour,#getMin,#idProject,#idItem,#idJRD,#idTOW,#idMH,#idRemarks,#idDRDate,#trGroup",
  ).removeClass("border border-danger bg-err");
}

function hideConditionalSections() {
  $(".checker").addClass("d-none");
  $("#id2DDiv").addClass("d-none");
  $("#idRevDiv").addClass("d-none");
  $(".trgrp").remove();
  $("#labell").remove();
}

function resetModeButtons() {
  setAddMode();
}

function resetProjectItemJobSelectors() {
  $("#idProject,#idItem,#idJRD,#idTOW,#trGroup").val("").change();
}

function resetFormState() {
  clearValidationMessages();
  clearValidationStyles();
  hideConditionalSections();
  sequenceValidation();
}

function resetDependentSelectionsAfterGroupChange() {
  resetProjectItemJobSelectors();
  clearValidationMessages();
  clearValidationStyles();
  hideConditionalSections();
  $("#idRev").prop("checked", false);
  sequenceValidation();
}
