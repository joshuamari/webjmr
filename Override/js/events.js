function bindEvents() {
  $(document).off(".override");

  $(document).on("click.override", "body", function (event) {
    if (
      !$(".proj .content").is(event.target) &&
      $(".proj .content").has(event.target).length === 0
    ) {
      $(".proj").removeClass("active");
    }
    if (
      !$(".iow .content").is(event.target) &&
      $(".iow .content").has(event.target).length === 0
    ) {
      $(".iow").removeClass("active");
    }
    if (
      !$(".jord .content").is(event.target) &&
      $(".jord .content").has(event.target).length === 0
    ) {
      $(".jord").removeClass("active");
    }
  });

  $(document).on("click.override", "#back2Project", function () {
    $("#drInstruction").modal("hide");
    $("#idItem").val(0).change();
  });

  $(document).on("click.override", "#drInstruction .btn-close", function () {
    $("#back2Project").click();
  });

  $(document).on("click.override", ".btn-close", function () {
    resetEntry();
    removeOutlines();
    $(this).closest(".modal").find("input").attr("disabled", true);
    $(".editInputError").removeClass("block").addClass("hidden");
  });

  $(document).on("click.override", ".btn-Ecancel", function () {
    $(this).closest(".modal").find(".btn-close").click();
  });

  $(document).on("click.override", ".btn-Eupdate", function () {
    let emp = $("#idEmployee").val();

    saveEdit()
      .then((status) => {
        if (status) {
          getEntries(emp).then(fillEntries);
          resetEntry();
          $(this).closest(".modal").find(".btn-close").click();
          removeOutlines();
        } else {
          alert("Unsucessful Save of Edit");
        }
      })
      .catch((error) => {
        alert(`Save Edit Error: ${error}`);
      });
  });

  $(document).on("click.override", ".btn-Edelete", function () {
    deleteEntry(delTRID);
    $(this).closest(".modal").find(".btn-close").click();
  });

  $(document).on("click.override", ".btn-copyCancel", function () {
    $(this).closest(".modal").find(".btn-close").click();
  });

  $(document).on("click.override", ".btn-copyConfirm", function () {
    copyEntries();
    $(this).closest(".modal").find(".btn-close").click();
  });

  $(document).on(
    "click.override",
    "#idGroup, #idDRDate, #idLocation, #idEmployee, #idProject, #idItem, #idJRD, #idTOW, #idChecking, #idMH, #idRemarks, #trGroup, #getHour, #getMin",
    function () {
      $(this).removeClass("bg-err");
      $(this).removeClass("border border-danger");
      $(".missingInputs").addClass("hidden");
    },
  );

  $(document).on(
    "click.override",
    "#edit-selLoc, #edit-selProj, #edit-selIOW, #edit-selJRD, #edit-2d3d, #edit-rev, #edit-selTOW, #edit-selCheck, #edit-selMHType, #edit-newRemarks, #edit-trGroup, #edit-newHour, #edit-newMin",
    function () {
      $(".editInputError").removeClass("block").addClass("hidden");
      $(this).removeClass("bg-err");
      $(this).removeClass("border border-danger");
    },
  );

  $(document).on("change.override", "#idDRDate", function () {
    var thisEmpID = $($("#idEmployee").find("option:selected")).attr("emp-id");
    Promise.all([getEntries(thisEmpID)])
      .then(([entryList]) => {
        fillEntries(entryList);
        MHValidation();
        getMHCount();
        sequenceValidation(0);
        handleDateChange();
      })
      .catch((error) => {
        alert(`${error}`);
      });
  });

  $(document).on("change.override", "#idGroup", function () {
    resetEntry();
    sequenceValidation(0);

    getEmployees()
      .then((emps) => {
        fillEmployees(emps);
        let thisEmpID = $("#idEmployee").val();
        return getEntries(thisEmpID);
      })
      .then((entryList) => {
        fillEntries(entryList);
        getMHCount();
      })
      .catch((error) => {
        alert(`${error}`);
      });

    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#idLocation", function () {
    MHValidation();
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#idEmployee", function () {
    var thisEmpID = $($(this).find("option:selected")).attr("emp-id");
    var groupID = $("#idGroup").val();

    sequenceValidation(0);

    if (thisEmpID != 0 || thisEmpID != undefined) {
      Promise.all([getProjects(thisEmpID, groupID), getEntries(thisEmpID)])
        .then(([projs, entryList]) => {
          resetSelection(1, 0);
          fillProjects(projs, 0);
          fillEntries(entryList);
          getMHCount(thisEmpID);
        })
        .catch((error) => {
          alert(`${error}`);
        });
    }

    $("#idProject").prop("disabled", true);
    $("#idItem").prop("disabled", true);
    $("#idJRD").prop("disabled", true);
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#idProject", function () {
    var thisEmpID = $("#idEmployee").val();
    var projID = $($(this).find("option:selected")).attr("proj-id");
    var groupID = $("#idGroup").val();

    sequenceValidation(0);

    Promise.all([
      getItems(thisEmpID, projID, groupID),
      getTOW(projID),
      getCheckers(projID, groupID),
    ])
      .then(([items, tows, checks]) => {
        resetSelection(2, 0);
        fillItems(items, 0);
        fillTOW(tows, 0);
        disableTimeInput(projID, 0);
        MHValidation(0);
        fillCheckers(checks, 0);
        if (projID != null || projID != undefined) {
          isDrawing(0);
        }
      })
      .catch((error) => {
        alert(`${error}`);
      });

    if (projID == leaveID) {
      $("#itemlbl").html("Leave Type");
      $("#lbltow").html("Day Type");
    } else {
      $("#itemlbl").html("Item of Works");
      $("#lbltow").html("Type of Work");
    }

    $(".trgrp").remove();
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#edit-selProj", function () {
    var thisEmpID = $("#idEmployee").val();
    var projID = $($(this).find("option:selected")).attr("proj-id");

    Promise.all([
      getItems(thisEmpID, projID, editGrpID),
      getTOW(projID),
      getCheckers(projID, editGrpID),
    ])
      .then(([items, tows, checks]) => {
        resetSelection(2, 1);
        fillItems(items, 1);
        fillTOW(tows, 1);
        disableTimeInput(projID, 1);
        MHValidation(1);
        fillCheckers(checks, 1);
        if (projID != null || projID != undefined) {
          isDrawing(1);
        }
      })
      .catch((error) => {
        alert(`${error}`);
      });

    if (projID == leaveID) {
      $("#edit-itemlbl").html("Leave Type");
      $("#edit-lbltow").html("Day Type");
    } else {
      $("#edit-itemlbl").html("Item of Works");
      $("#edit-lbltow").html("Type of Work");
    }

    $(".trgrp").remove();
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#idItem", function () {
    var thisEmpID = $("#idEmployee").val();
    var projID = $("#idProject").val();
    var itemID = $($(this).find("option:selected")).attr("item-id");
    var groupID = $("#idGroup").val();
    var checkItemID = noMoreInputItems.includes(itemID);

    sequenceValidation(0);

    if (itemID != 0) {
      Promise.all([getJobs(thisEmpID, projID, itemID, groupID), getTRGroups()])
        .then(([jobs, allgrps]) => {
          resetSelection(3, 0);
          fillJobs(jobs, 0);
          getLabel(itemID, 0);
          createTRGroupDiv(itemID, allgrps, 0);
        })
        .catch((error) => {
          alert(`${error}`);
        });
    }

    if (checkItemID) $("#drInstruction").modal("show");
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#edit-selIOW", function () {
    var thisEmpID = $("#idEmployee").val();
    var projID = $("#edit-selProj").val();
    var itemID = $($(this).find("option:selected")).attr("item-id");
    var checkItemID = noMoreInputItems.includes(itemID);

    if (itemID != 0) {
      Promise.all([
        getJobs(thisEmpID, projID, itemID, editGrpID),
        getTRGroups(),
      ])
        .then(([jobs, allgrps]) => {
          resetSelection(3, 1);
          fillJobs(jobs, 1);
          getLabel(itemID, 1);
          createTRGroupDiv(itemID, allgrps, 1);
        })
        .catch((error) => {
          alert(`${error}`);
        });
    }

    if (checkItemID) $("#drInstruction").modal("show");
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#idTOW", function () {
    if (this.value == 3) $(".checker").removeClass("d-none");
    else $(".checker").addClass("d-none");

    if (this.value == 0) $(".checker").addClass("d-none");

    $("#idChecking").prop("selectedIndex", 0);

    var towVal = $($(this).find("option:selected")).attr("tow-id");
    if (towVal == 0) $("#getHour").val("").change();
    if (towVal == 10 || towVal == 11) $("#getHour").val("4");
    if (towVal == 12) $("#getHour").val("8");

    getTOWDesc(towVal, 0);
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#edit-selTOW", function () {
    if (this.value == 3) $(".edit-check").removeClass("d-none");
    else $(".edit-check").addClass("d-none");

    if (this.value == 0) $(".edit-check").addClass("d-none");

    $("#edit-selCheck").prop("selectedIndex", 0);

    var towVal = $($(this).find("option:selected")).attr("tow-id");
    if (towVal == 0) $("#edit-newHour").val("").change();
    if (towVal == 10 || towVal == 11) $("#edit-newHour").val("4");
    if (towVal == 12) $("#edit-newHour").val("8");

    getTOWDesc(towVal, 1);
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#idChecking", function () {
    $(this).removeClass("border-danger");
  });

  $(document).on("click.override", "#getHour, #getMin", function () {
    $(this).removeClass("border-danger");
  });

  $(document).on("change.override", "#idMH", function () {
    $(this).removeClass("border-danger");
  });

  $(document).on("click.override", "#idReset", function () {
    resetEntry();
  });

  $(document).on("click.override", "#idAdd", function () {
    addEntries();
  });

  $(document).on("click.override", "#dupeBut", function () {
    var entryID = $(this).closest("tr").attr("entry-id");
    const entryRow = entryArr.filter((entry) => entry.id == entryID);
    editGrpID = entryRow[0].groupID;
    dupeEntry(entryRow);
  });

  $(document).on("click.override", "#editBut", function () {
    var empText = $("#idEmployee option:selected").text();
    var entryID = $(this).closest("tr").attr("entry-id");
    const entryRow = entryArr.filter((entry) => entry.id == entryID);
    editTRID = entryID;

    fillEditFields(entryRow);
    $("#emp-edit").html(empText);
    $("#editEntry").modal("show");
  });

  $(document).on("click.override", "#delBut", function () {
    delTRID = $(this).closest("tr").attr("entry-id");
    $("#deleteEntry").modal("show");
  });

  $(document).on("click.override", "#idCopy", function () {
    var copyfrom = $("#idCopyDate").val();
    var empName = $($("#idEmployee").find("option:selected")).attr("emp-id");
    $("#copy-date-data").html(copyfrom);

    if (!copyfrom || !empName) {
      alert("Please Select an Employee & a Date to Copy From");
    } else {
      $("#copyEntriesConfirmation").modal("show");
    }
  });

  $(document).on(
    "click.override",
    "#btnRequestAccess",
    handleRequestAccessClick,
  );
  $(document).on(
    "click.override",
    "#btnGoCurrentMonth",
    handleGoCurrentMonthClick,
  );
}
