function bindPlanningEvents() {
  $(document).on("click", ".planEntries", handlePlanEntryClick);
  $(document).on("click", ".planned .header", handlePlanningHeaderClick);
}
function handlePlanEntryClick() {
  $("#drPlanning").modal("show");

  const planID = $(this).attr("plan-id");
  getDeets(planID);
}
function handlePlanningHeaderClick() {
  $(".planned").toggleClass("open");

  if ($(".planned").hasClass("open")) {
    $(".right-cont .table-container").css("height", "calc(100% - 500px)");
    $(".planned .header small").html(
      `<i class="bx bx-info-circle"></i>Please click each
row to see more details about the item.`,
    );
  } else {
    $(".right-cont .table-container").css("height", "calc(100% - 248px)");
    $(".planned .header")
      .find("small")
      .html(
        `<i class="bx bx-info-circle"></i>Please click here to toggle this collapsible element.`,
      );
  }
}
function getPlans() {
  const selectedDate = $("#idDRDate").val();
  const emptyState = `<tr><td colspan="6" class="text-center">No Entries Found</td></tr>`;

  $("#plannedItems").empty();

  postJson(
    "api/get_plans.php",
    {
      getEmployee: AppState.empDetails.empNum,
      selDate: selectedDate,
    },
    "Failed to load plans.",
  )
    .then((response) => {
      const plans = response.data || [];

      if (plans.length === 0) {
        $("#plannedItems").html(emptyState);
        return;
      }

      plans.forEach(fillPlans);
    })
    .catch((error) => {
      console.error(error);
      $("#plannedItems").html(
        `<tr><td colspan="6" class="text-center">Failed to load plans</td></tr>`,
      );
    });
}
function fillPlans(plan) {
  const row = `
    <tr class="planEntries" plan-id="${plan.planID}">
      <td>${plan.projName || ""}</td>
      <td>${plan.projItem || ""}</td>
      <td>${plan.projJob || ""}</td>
      <td>${Number(plan.projMH || 0).toFixed(2)}</td>
      <td>${Number(plan.usedHours || 0).toFixed(2)}</td>
    </tr>
  `;

  $("#plannedItems").append(row);
}
function getDeets(planID) {
  return postJson(
    "api/get_deets.php",
    {
      planID: planID,
      empID: AppState.empDetails.empNum,
    },
    "Failed to load planning details.",
  )
    .then((response) => {
      const details = response.data || [];
      details.forEach(fillEditPlan);
      return details;
    })
    .catch((error) => {
      console.error(error);
      alert(error);
      return [];
    });
}
function fillEditPlan(details) {
  if (!details) return;

  const projStatus = details.projStatus || "";
  const statusBadge =
    projStatus.length > 0
      ? `<span class="badge text-bg-success fs-5">${projStatus}</span>`
      : `<span class="badge text-bg-warning fs-5">Ongoing</span>`;

  $("#projectPlan").val(details.projName || "");
  $("#itemPlan").val(details.projItem || "");
  $("#jrdPlan").val(details.projJob || "");
  $("#sDatePlan").val(details.projStart || "");
  $("#eDatePlan").val(details.projEnd || "");
  $("#mhPlan").val(Number(details.hoursRemaining || 0).toFixed(2));
  $("#statusPlan").html(statusBadge);
  $("#plannerPlan").val(details.planner || "");
  $("#plannerDatePlan").val(details.plannedDate || "");
  $("#modifiedPlan").val(details.plannedModified || "");
}
