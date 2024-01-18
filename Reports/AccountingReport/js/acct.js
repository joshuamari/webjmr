//#region GLOBALS
switch (document.location.hostname) {
  case "kdt-ph":
    rootFolder = "//kdt-ph/";
    break;
  case "localhost":
    rootFolder = "//localhost/";
    break;
  default:
    rootFolder = "//kdt-ph/";
    break;
}

const today = new Date();
//#endregion
checkAccess()
  .then((acc) => {
    if (acc) {
      $(document).ready(function () {
        $("#monthSel").val(
          `${today.getFullYear()}-${(today.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`
        );
        getLocations()
          .then((locs) => {
            console.log(locs);
            getReportData()
              .then((repd) => {
                console.log(repd);
              })
              .catch((error) => {
                alert(`${error}`);
              });
          })
          .catch((error) => {
            alert(`${error}`);
          });
      });
    } else {
      alert("Access denied");
      window.location.href = "../";
    }
  })
  .catch((error) => {
    alert(`${error}`);
  });

//#region BINDS

//#endregion

//#region FUNCTION
function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_permission.php",
      dataType: "json",
      success: function (data) {
        const acc = data;
        resolve(acc);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred1.");
        }
      },
    });
  });
}
function getLocations() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "ajax/get_locations.php",
      dataType: "json",
      success: function (response) {
        const locs = response;
        resolve(locs);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (chr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occured2.");
        }
      },
    });
  });
}
function getReportData() {
  const locSel = $("#selLoc").find("option:selected").attr("loc-id");
  const yrMonth = $("#monthSel").val();
  const cutOff = $("#co").val();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "ajax/get_entries.php",
      data: {
        yearMonth: yrMonth,
        loc: locSel,
        cutOff: cutOff,
      },
      dataType: "json",
      success: function (response) {
        const repdata = response;
        resolve(repdata);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          rejected("Internal Server Error: There was a server error");
        } else {
          reject("An unspecified error occured3.");
        }
      },
    });
  });
}
//#endregion
