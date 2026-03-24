function getMyGroups() {
  $("#idGroup").html(`<option value="" hidden>Select Group</option>`);

  return postJson(
    "api/get_my_groups.php",
    {
      empNum: AppState.empDetails.empNum,
    },
    "Failed to load groups.",
  )
    .then((response) => {
      let groups = response.data || [];
      const groupSelect = $("#idGroup");

      groupSelect.html(
        `<option selected hidden value="0" grp-id="0">Select Group</option>`,
      );

      if (groups.length > 1) {
        groups = groups.sort(function (a, b) {
          const first = a.abbreviation.toUpperCase();
          const second = b.abbreviation.toUpperCase();
          return first < second ? -1 : first > second ? 1 : 0;
        });
      }

      $.each(groups, function (_index, item) {
        const option = $("<option>")
          .attr("value", item.id)
          .text(item.abbreviation)
          .attr("grp-id", item.id);

        groupSelect.append(option);
      });

      return groups;
    })
    .catch((error) => {
      console.error(error);
      alert(error);
      return [];
    });
}
function getDispatchLoc() {
  return postJson(
    "api/get_dispatch_loc.php",
    {},
    "Failed to load dispatch locations.",
  ).then((response) => {
    const locations = response.data || [];
    fillDispatchLocations(locations);
    return locations;
  });
}
function getTOW(projID) {
  $("#idTOW").prop("selectedIndex", 0);
  $("#idChecking").prop("selectedIndex", 0);
  $("#forChecking").hide();

  if (!projID) {
    resetTOWOptions();
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_tow.php",
    { projID },
    "An unspecified error occurred while fetching Types of Work.",
  ).then((response) => {
    const tows = response.data || [];
    fillTOWOptions(tows);
    return tows;
  });
}
function fetchProjects({ searchProj = "" } = {}) {
  const empGroup = $("#idGroup").val();

  if (!empGroup) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_projects.php",
    {
      empGroup: empGroup,
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      searchProj: searchProj,
    },
    "An unspecified error occurred while fetching Projects.",
  ).then((response) => response.data || []);
}
function getItems(projID) {
  $("#itemOptions").empty();
  $("#idItem").html(`<option value="" hidden>Select Item of Works</option>`);
  $("#labell").remove();

  if (!projID) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_items.php",
    {
      empGroup: $("#idGroup").val(),
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      projID: projID,
    },
    "An unspecified error occurred while fetching Items.",
  ).then((response) => {
    const items = response.data || [];
    sequenceValidation();
    return items;
  });
}
function getItemSearch(projID) {
  $("#itemOptions").empty();

  if (!projID) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_items.php",
    {
      empGroup: $("#idGroup").val(),
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      projID: projID,
      searchIOW: $("#searchitem").val(),
    },
    "An unspecified error occurred while fetching Items Search.",
  ).then((response) => response.data || []);
}
function getJobs(projID, itemID) {
  $("#jrdOptions").empty();
  $("#idJRD").html(
    `<option value="" hidden>Select Job Request Description</option>`,
  );

  if (!projID || !itemID) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_jobs.php",
    {
      empGroup: $("#idGroup").val(),
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      projID: projID,
      itemID: itemID,
    },
    "An unspecified error occurred while fetching Jobs.",
  ).then((response) => {
    const jobs = response.data || [];
    sequenceValidation();

    if (projID == AppState.mngID || projID == AppState.kiaID) {
      $($("#idJRD").children()[1]).prop("selected", true).change();
    }

    return jobs;
  });
}
function getJRDSearch(projID, itemID) {
  $("#jrdOptions").empty();

  if (!projID || !itemID) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_jobs.php",
    {
      empGroup: $("#idGroup").val(),
      empNum: AppState.empDetails.empNum,
      empPos: AppState.empDetails.empPos,
      projID: projID,
      itemID: itemID,
      searchjrd: $("#searchjrd").val(),
    },
    "An unspecified error occurred while fetching Jobs Search.",
  ).then((response) => response.data || []);
}
function isWorkDay(location) {
  const selDate = $("#idDRDate").val();
  const selLoc = location || "KDT";

  return postJson(
    "api/check_workday.php",
    {
      selDate: selDate,
      selLoc: selLoc,
    },
    "An unspecified error occurred while checking work day.",
  ).then((response) => {
    return Boolean(response.data?.isWorkday);
  });
}
function getTOWDesc(typesOfWorkID) {
  if (!typesOfWorkID || typesOfWorkID == 0) {
    $("#towDesc").html("-");
    return Promise.resolve("-");
  }

  return postJson(
    "api/get_tow_desc.php",
    { towID: typesOfWorkID },
    "An unspecified error occurred while fetching Type of Work description.",
  ).then((response) => {
    const description = response.data?.description || "-";
    $("#towDesc").html(description);
    return description;
  });
}
function getCheckers() {
  const grpNum = $("#idGroup").val();
  const projID = $("#idProject option:selected").attr("proj-id");

  if (!grpNum) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_checkers.php",
    {
      grpNum: grpNum,
      empNum: AppState.empDetails.empNum,
      projID: projID || "",
    },
    "An unspecified error occurred while fetching checkers.",
  ).then((response) => response.data || []);
}
function postJson(url, data, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: url,
      data: data,
      dataType: "json",
      success: function (response) {
        if (response && response.success === false) {
          reject(response.message || fallbackMessage);
          return;
        }

        resolve(response);
      },
      error: function (xhr, status, error) {
        let message = fallbackMessage;

        try {
          const responseJson = JSON.parse(xhr.responseText);
          message =
            responseJson.message ||
            responseJson.error ||
            responseJson.data?.message ||
            fallbackMessage;
        } catch (e) {
          if (xhr.responseText) {
            message = `${fallbackMessage}\n\n${xhr.responseText}`;
          } else if (error) {
            message = `${fallbackMessage}\n\n${error}`;
          }
        }

        console.error("POST JSON ERROR:", {
          url,
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
        });

        reject(message);
      },
    });
  });
}
function postFormData(url, formData, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: url,
      data: formData,
      contentType: false,
      cache: false,
      processData: false,
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(getAjaxErrorMessage(xhr, fallbackMessage));
      },
    });
  });
}
function getAjaxErrorMessage(xhr, fallbackMessage) {
  if (xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  }

  if (xhr.status === 500) {
    return "Internal Server Error: There was a server error.";
  }

  return fallbackMessage;
}
function getStartupConfig() {
  return postJson(
    "api/get_startup_config.php",
    {},
    "Failed to load startup config.",
  );
}
function fetchEntryDetails(primaryID) {
  return postJson(
    "api/get_data_edit.php",
    { primaryID },
    "Failed to load entry.",
  );
}