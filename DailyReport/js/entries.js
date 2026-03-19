function addRow(entry) {
  const pId = entry.entryId;
  const loc = entry.locationName || "";
  const group = entry.groupName || "";
  const project = entry.projectName || "";
  const item = entry.itemName || "";
  const desc = entry.jobName || "";
  const hour = Number(entry.durationMinutes || 0);
  const mht = String(entry.mhType ?? 0);
  const rmrks = entry.remarks || "";
  const isDeleted = Number(entry.projectDeleted || 0) === 1;
  const tow = entry.towName || "-";

  const deletedLabel = isDeleted ? `<strong>(Deleted)</strong>` : ``;
  const mhTypes = ["Regular", "OT", "Leave"];

  switch (mht) {
    case "0":
      AppState.regCount += hour;
      break;
    case "1":
      AppState.otCount += hour;
      break;
    case "2":
      AppState.lvCount += hour;
      break;
    default:
      console.error("Unknown manhour type:", mht);
      return;
  }

  const rowHtml = `
    <tr data-entry-id="${pId}" data-mh="${mht}" title="${rmrks}">
      <td>${loc}</td>
      <td>${group}</td>
      <td>${deletedLabel}${project}</td>
      <td>${item}</td>
      <td>${desc}</td>
      <td>${tow}</td>
      <td>${(hour / 60).toFixed(2)}</td>
      <td>${mhTypes[Number(mht)] || "-"}</td>
      <td>
        <button class="btn btn-primary action selectBut" title="Duplicate Items">
          <i class="text-light bx bx-duplicate"></i>
        </button>
        <button class="btn btn-warning action edit" title="Edit" edit-entry>
          <i class="fa fa-pencil"></i>
        </button>
        <button class="btn btn-danger action delBut" title="Delete">
          <i class="text-light fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `;

  $("#drEntries").append(rowHtml);
}

function getEntries() {
  AppState.regCount = 0;
  AppState.otCount = 0;
  AppState.lvCount = 0;

  $("#drEntries").empty();

  postJson(
    "api/get_entries.php",
    {
      curDay: $("#idDRDate").val(),
      empNum: AppState.empDetails.empNum,
    },
    "Failed to load entries.",
  )
    .then((response) => {
      const entries = response.data || [];

      if (entries.length > 0) {
        entries.forEach(addRow);
      } else {
        $("#drEntries").append(`
          <tr>
            <td colspan="9" class="text-center py-5">
              <h3>No Entries Found</h3>
            </td>
          </tr>
        `);
      }

      getMHCount();
    })
    .catch((error) => {
      console.error(error);
      $("#drEntries").append(`
        <tr>
          <td colspan="9" class="text-center py-5">
            <h3>Failed to load entries</h3>
          </td>
        </tr>
      `);
    });
}

async function getMHCount() {
  const reg = AppState.regCount / 60;
  const ot = AppState.otCount / 60;
  const lv = AppState.lvCount / 60;

  let loc = "KDT";

  $("#drEntries")
    .children("tr")
    .each(function () {
      const firstCellText = $(this).children().eq(0).text();
      if (firstCellText) {
        loc = firstCellText;
      }
    });

  $("#regCount").text(reg.toFixed(2));
  $("#otCount").text(ot.toFixed(2));
  $("#lvCount").text(lv.toFixed(2));

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

    return;
  }

  try {
    const workDay = await isWorkDay(loc);

    if (workDay) {
      if (ot > 0 && (reg < 8 || lv > 0)) {
        $("#cardOt").addClass("new");
      }

      if (lv == 4 && reg < 4) {
        $("#cardLv").addClass("new");
      }

      if (reg > 8 || (reg > 0 && reg + lv < 8)) {
        $("#cardReg").addClass("new");
      }

      return;
    }

    if (reg > 0) {
      $("#cardReg").addClass("new");
    }

    if (lv > 0) {
      $("#cardLv").addClass("new");
    }
  } catch (error) {
    console.error("Failed to evaluate MH count workday status:", error);
  }
}

function deleteEntry(entryId) {
  if (evaluateMonthLock()) {
    alert("Deleting is locked for dates outside the current month.");
    return;
  }

  postJson("api/delete_entry.php", { trID: entryId }, "Failed to delete entry.")
    .then(() => {
      refreshDailyReportView();
    })
    .catch((error) => {
      console.error(error);
      alert(error);
    });
}

function populateBaseFields(entryData) {
  $(`#idLocation option[loc-id="${entryData.locationId}"]`)
    .prop("selected", true)
    .change();

  $("#idGroup").val(entryData.groupId);
  $("#idRemarks").val(entryData.remarks);
}

async function populateProjectSection(entryData) {
  const projects = await fetchProjects();

  resetProjectOptions();
  fillProj(projects);
  sequenceValidation();

  $(`#idProject option[proj-id="${entryData.projectId}"]`).prop(
    "selected",
    true,
  );

  isDrawing();
}

async function populateItemAndJobSection(entryData) {
  const [items, checks] = await Promise.all([
    getItems(entryData.projectId),
    getCheckers(),
    Promise.resolve(getTOW(entryData.projectId)),
  ]);

  fillItem(items);
  fillCheckers(checks);

  $(`#idItem option[item-id="${entryData.itemId}"]`).prop("selected", true);

  const jobs = await getJobs(entryData.projectId, entryData.itemId);
  fillJobs(jobs);

  $(`#idJRD option[job-id="${entryData.jobId}"]`).prop("selected", true);

  if (
    Number(entryData.itemId) === Number(AppState.oneBUTrainerID) &&
    entryData.trainingGroupId
  ) {
    trainingGroup(entryData.itemId);
    $("#trGroup").val(entryData.trainingGroupId);
  }

  $(`#idTOW option[tow-id="${entryData.towId}"]`)
    .prop("selected", true)
    .change();

  getTOWDesc(entryData.towId);

  if (entryData.checkerId != null && entryData.checkerId !== "") {
    $(`#idChecking option[chk-id="${entryData.checkerId}"]`)
      .prop("selected", true)
      .change();
  }
}

async function populateRemainingFields(entryData) {
  const durationMinutes = Number(entryData.durationMinutes || 0);

  $("#getHour").val(Math.floor(durationMinutes / 60));
  $("#getMin").val(durationMinutes % 60);

  disableTimeInput(entryData.projectId);
  await MHValidation();

  $(`#idMH option[mhid="${entryData.mhTypeId}"]`)
    .prop("selected", true)
    .change();

  if (entryData.twoThreeId != null && entryData.twoThreeId !== "") {
    $(`#${entryData.twoThreeId}`).click();
  }

  if (Number(entryData.isRevision) === 1) {
    $("#idRev").click();
  }
}

async function loadEntryToForm(response) {
  const entryData = response.data;

  populateBaseFields(entryData);
  await populateProjectSection(entryData);
  await populateItemAndJobSection(entryData);
  await populateRemainingFields(entryData);
}

function editEntry(currentObject) {
  if (evaluateMonthLock()) {
    alert("Editing is locked for dates outside the current month.");
    return;
  }

  setEditMode();
  $("#idLocation").val("");
  $(".trgrp").remove();

  AppState.editID = $(currentObject).closest("tr").data("entry-id");

  fetchEntryDetails(AppState.editID)
    .then(loadEntryToForm)
    .catch((error) => {
      console.error("Failed to load entry for edit:", error);
      alert("Failed to load entry.");
    });
}

function selectEntry(currentObject) {
  if (evaluateMonthLock()) {
    alert("Duplicating entries is locked for dates outside the current month.");
    return;
  }

  const selectID = $(currentObject).closest("tr").data("entry-id");

  fetchEntryDetails(selectID)
    .then(loadEntryToForm)
    .then(() => {
      setAddMode();
    })
    .catch((error) => {
      console.error("Failed to load entry for duplicate:", error);
      alert("Failed to load entry.");
    });
}

function copyEntries() {
  if (evaluateMonthLock()) {
    alert("Copy is disabled for dates outside the current month.");
    return;
  }

  const getDate = $("#idDRDate").val();
  const copyDate = $("#idCopyDate").val();

  postJson(
    "api/copy_entries.php",
    {
      empNum: AppState.empDetails.empNum,
      getDate: getDate,
      copyDate: copyDate,
    },
    "Failed to copy entries.",
  )
    .then(() => {
      resetEntry();
      refreshDailyReportView();
    })
    .catch((error) => {
      console.error(error);
      alert(error);
    });
}

function saveFunction() {
  addEntries(AppState.editID);
}

function cancelEditFunction() {
  setAddMode();
  resetEntry();
}
