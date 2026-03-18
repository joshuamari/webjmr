function bindFormEvents() {
  $(document).on("change", "#idTOW", handleTowChange);
  $(document).on("change", "#idGroup", handleGroupChange);
  $(document).on("change", "#idProject", handleProjectChange);
  $(document).on("change", "#idItem", handleItemChange);
  $(document).on("change", "#idLocation", handleLocationChange);
  $(document).on("change", "#idMH", handleMhChange);
  $(document).on("change", "#idJRD", handleJrdChange);
  $(document).on("change", "#trGroup", handleTrainingGroupChange);

  $(document).on("click", "#idAdd", handleAddClick);
  $(document).on("click", "#idReset", handleResetClick);
  $(document).on("click", "#idCopy", handleCopyClick);
  $(document).on("click", "#refBtn", handleRefreshClick);
  $(document).on("click", ".delBut", handleDeleteClick);
  $(document).on("click", "button[edit-entry]", handleEditClick);
  $(document).on("click", ".selectBut", handleSelectClick);
  $(document).on("click", "#back2Project", handleBackToProjectClick);
  $(document).on(
    "click",
    "#drInstruction .btn-close",
    handleDrInstructionClose,
  );
}
function handleTowChange() {
  const towVal = $("#idTOW option:selected").attr("tow-id");

  if (this.value == "Chk - Checker") {
    $(".checker").removeClass("d-none");
  } else {
    $(".checker").addClass("d-none");
  }

  $("#idChecking").prop("selectedIndex", 0);

  if (towVal == 10 || towVal == 11) {
    $("#getHour").val("4");
  }

  if (towVal == 12) {
    $("#getHour").val("8");
  }

  getTOWDesc(towVal);
  $("#p11").text("");
  $(this).removeClass("border-danger");
}

function handleGroupChange() {
  resetOnGrpChange();

  fetchProjects().then((projects) => {
    resetProjectOptions();
    fillProj(projects);
    sequenceValidation();
  });

  $("#p1").text("");
  $("#idGroup").removeClass("border-danger");
  $(".iow").removeClass("active");
}

function handleProjectChange() {
  const projID = $("#idProject option:selected").attr("proj-id");

  $("#idJRD").val("");
  $("#idItem").val(null).change();

  if ($("#idItem").val() == null || $("#idItem").val() == "") {
    $("#idItem")
      .empty()
      .append(
        `<option selected hidden disabled value="">Select Item of Works</option>`,
      );
  }

  Promise.all([getItems(projID), getTOW(projID), getCheckers()])
    .then(([items, _towHtml, checks]) => {
      fillItem(items);
      fillCheckers(checks);

      isDrawing();
      disableTimeInput(projID);
      MHValidation().catch((error) => {
        console.error(error);
        alert(error);
      });

      $(".iow").removeClass("active");
      $(".trgrp").remove();

      $("#p4").text("");
      $("#idProject").removeClass("border-danger");

      if (projID == AppState.leaveID) {
        $("#itemlbl").html("Leave Type");
        $("#lbltow").html("Day Type");
      } else {
        $("#itemlbl").html("Item of Works");
        $("#lbltow").html("Type of Work");
      }
    })
    .catch((error) => {
      console.error("Failed during project change:", error);
      alert(error);
    });
}

async function handleItemChange() {
  const projID = $("#idProject option:selected").attr("proj-id");
  const itemID = Number($("#idItem option:selected").attr("item-id"));

  $(".trgrp").remove();
  $("#labell").remove();

  if (!projID || !itemID) {
    return;
  }

  getLabel(itemID);
  disableInputs(projID, itemID);
  if (AppState.noMoreInputItems.includes(itemID)) {
    $("#drInstruction").modal("show");
  }

  await trainingGroup(itemID);

  getJobs(projID, itemID).then((jobs) => {
    fillJobs(jobs);
  });

  $("#p5").text("");
  $("#idItem").removeClass("border-danger");
}

function handleLocationChange() {
  MHValidation().catch((error) => {
    console.error(error);
    alert(error);
  });

  $("#p3").text("");
  $("#idLocation").removeClass("border-danger");
}

function handleMhChange() {
  $("#p10").text("");
  $("#idMH").removeClass("border-danger");
}

function handleJrdChange() {
  $("#p6").text("");
  $("#idJRD").removeClass("border-danger");
}

function handleTrainingGroupChange() {
  $("#p12").text("");
  $("#trGroup").removeClass("border border-danger bg-err");
}

function handleAddClick() {
  switch ($("#idAdd").text().trim()) {
    case "Add":
      addEntries(0);
      break;
    case "Save Changes":
      saveFunction();
      break;
  }
}

function handleResetClick() {
  if ($("#idReset").text().trim() == "Clear") {
    resetEntry();
  } else {
    cancelEditFunction();
  }
}

function handleCopyClick() {
  if (!confirm("Confirm copy entries")) {
    return;
  }

  copyEntries();
}

function handleRefreshClick() {
  getEntries();
}

function handleDeleteClick() {
  const entryId = $(this).closest("tr").data("entry-id");

  if (!entryId) {
    console.error("Missing entry id for delete.");
    return;
  }

  if (!confirm("Delete this entry?")) {
    return;
  }

  deleteEntry(entryId);
}

function handleEditClick() {
  editEntry(this);
}

function handleSelectClick() {
  setAddMode();
  selectEntry(this);
}

function handleBackToProjectClick() {
  $("#drInstruction").modal("hide");
  $("#idItem").val(null).change();
}

function handleDrInstructionClose() {
  $("#back2Project").click();
}
