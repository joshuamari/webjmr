function fillProj(projects) {
  $.each(projects, function (_, project) {
    const optionListItem = `
      <li proj-id="${project.projID}">${project.projName}${project.groupAppend}</li>
    `;

    const selectOption = `
      <option hidden proj-id="${project.projID}">${project.projName}${project.groupAppend}</option>
    `;

    $("#projOptions").append(optionListItem);
    $("#idProject").append(selectOption);
  });
}
function fillItem(items) {
  $.each(items, function (_, item) {
    const optionListItem = `
      <li item-id="${item.itemID}">${item.itemName}</li>
    `;

    const selectOption = `
      <option hidden item-id="${item.itemID}">${item.itemName}</option>
    `;

    $("#itemOptions").append(optionListItem);
    $("#idItem").append(selectOption);
  });
}
function fillJobs(jobs) {
  $.each(jobs, function (_, job) {
    const optionListItem = `
      <li job-id="${job.jobID}">${job.jobName}</li>
    `;

    const selectOption = `
      <option hidden job-id="${job.jobID}">${job.jobName}</option>
    `;

    $("#jrdOptions").append(optionListItem);
    $("#idJRD").append(selectOption);
  });
}
function fillCheckers(checks) {
  const checkSelect = $("#idChecking");

  checkSelect.html(
    `<option selected hidden value="0" chk-id="0">Select Employee</option>`,
  );

  $.each(checks, function (_, item) {
    const option = $("<option>")
      .attr("value", item.id)
      .text(item.name)
      .attr("chk-id", item.id);

    checkSelect.append(option);
  });
}
function ifSmallScreen() {
  if ($(window).width() < 550) {
    if ($(".sidebar").hasClass("close")) {
      $(".menu-two").addClass("d-none");
    } else {
      $(".menu-two").removeClass("d-none");
    }
    return;
  }

  $(".menu-two").addClass("d-none");
}
function refreshDailyReportView() {
  getEntries();
  initCalendar();
  getPlans();
}
function fillTOWOptions(tows) {
  const towSelect = $("#idTOW");

  towSelect.html(`<option value="" selected hidden>Select...</option>`);

  tows.forEach((tow) => {
    const label = `${tow.code} - ${tow.name}`;

    towSelect.append(`
      <option value="${label}" tow-id="${tow.id}">
        ${label}
      </option>
    `);
  });
}
function resetTOWOptions() {
  $("#idTOW").html(`<option value="" selected hidden>Select...</option>`);
}
function fillDispatchLocations(locations) {
  const locationSelect = $("#idLocation");

  locationSelect.html(
    `<option value="" hidden selected>Select Location</option>`,
  );

  locations.forEach((location) => {
    locationSelect.append(`
      <option value="${location.name}" loc-id="${location.id}">
        ${location.name}
      </option>
    `);
  });
}

function fillTrainingGroups(groups) {
  const groupSelect = $("#trGroup");

  groupSelect.html(`
    <option value="" hidden selected>Select Group to Train</option>
  `);

  groups.forEach((group) => {
    groupSelect.append(`
      <option value="${group.name}">${group.name}</option>
    `);
  });
}
