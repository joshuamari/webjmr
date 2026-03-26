function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/check_login.php",
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while checking login details.");
        }
      },
    });
  });
}

function getVariables() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/global_variables.php",
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.");
        }
      },
    });
  });
}

function getMyGroups(myEmpNum) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_my_groups.php",
      data: { empNum: myEmpNum },
      dataType: "json",
      success: function (response) {
        resolve(response["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching groups.");
        }
      },
    });
  });
}

function getDispatchLoc() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_dispatch_loc.php",
      dataType: "json",
      success: function (response) {
        resolve(response["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching locations.");
        }
      },
    });
  });
}

function getEmployees() {
  var groupID = $("#idGroup").val();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_member_list.php",
      data: { grpNum: groupID },
      dataType: "json",
      success: function (response) {
        resolve(response["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching employees.");
        }
      },
    });
  });
}

function getEmpSearch() {
  var searchEmp = $("#searchEmp").val();
  $("#empOptions").empty();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_member_list.php",
      data: {
        empGroup: $("#idGroup").val(),
        empNum: empDetails["empNum"],
        empPos: empDetails["empPos"],
        searchEmp: searchEmp,
      },
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject(
            "An unspecified error occurred while fetching Employee Search.",
          );
        }
      },
    });
  });
}

function getProjects(thisEmpID, grpID) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_projects.php",
      data: {
        grpNum: grpID,
        empNum: thisEmpID,
      },
      dataType: "json",
      success: function (response) {
        resolve(response["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching projects.");
        }
      },
    });
  });
}

function getItems(thisEmpID, projID, grpID) {
  $("#labell").remove();
  $("#edit-labell").remove();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_items.php",
      data: {
        empNum: thisEmpID,
        projID: projID,
        grpNum: grpID,
      },
      dataType: "json",
      success: function (response) {
        resolve(response["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching items.");
        }
      },
    });
  });
}

function getJobs(thisEmpID, projID, itemID, grpID) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_jobs.php",
      data: {
        empNum: thisEmpID,
        projID: projID,
        grpNum: grpID,
        itemID: itemID,
      },
      dataType: "json",
      success: function (response) {
        resolve(response["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching jobs.");
        }
      },
    });
  });
}

function getNoMoreInputItems() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_nomoreinput_items.php",
      dataType: "json",
      success: function (data) {
        resolve(data["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject(
            "An unspecified error occurred while fetching NoMoreInputItems.",
          );
        }
      },
    });
  });
}

function getTOW(projID) {
  $("#idChecking").prop("selectedIndex", 0);
  $("#forChecking").hide();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_tow.php",
      data: { projID: projID },
      dataType: "json",
      success: function (response) {
        resolve(response["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching ToW.");
        }
      },
    });
  });
}

function getCheckers(projID, grpID) {
  if (projID == 0 || projID == undefined) {
    $(".checker").addClass("d-none");
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_checkers.php",
      data: {
        grpNum: grpID,
        empNum: empDetails["empID"],
        projID: projID,
      },
      dataType: "json",
      success: function (response) {
        resolve(response["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching checkers.");
        }
      },
    });
  });
}

function getTRGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_groups.php",
      dataType: "json",
      success: function (data) {
        resolve(data["result"]);
      },
      error: function (xhr) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject(
            "An unspecified error occurred while fetching Training Groups.",
          );
        }
      },
    });
  });
}

function getEntries(thisEmpID) {
  var date = $("#idDRDate").val();

  return new Promise((resolve, reject) => {
    if (thisEmpID == undefined || thisEmpID == 0) {
      resolve(0);
    } else {
      $.ajax({
        type: "POST",
        url: "php/get_entries.php",
        data: {
          selDate: date,
          empNum: thisEmpID,
        },
        dataType: "json",
        success: function (response) {
          entryArr = response["result"];
          resolve(response);
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
