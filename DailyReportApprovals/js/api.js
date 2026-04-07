//#region GENERIC REQUEST HELPERS
function getJson(url, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: url,
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

        console.error("GET JSON ERROR:", {
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

        console.error("POST FORMDATA ERROR:", {
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
//#endregion

//#region AUTH / ACCESS API
function fetchLoggedInUser() {
  return getJson("api/session.php", "Failed to get session.");
}

function fetchPlanAccess() {
  return getJson("api/plan_access.php", "Failed to check planning access.");
}
//#endregion

//#region REQUEST ACTION API (BACKEND READY STUBS)
function fetchApprovalRequests() {
  return getJson("api/get_requests.php", "Failed to load approval requests.");
}

function approveRequest(requestId) {
  return postJson(
    "api/approve_request.php",
    { unlockId: requestId },
    "Failed to approve request.",
  );
}

function denyRequest(requestId, reason) {
  return postJson(
    "api/deny_request.php",
    { unlockId: requestId, remarks: reason },
    "Failed to deny request.",
  );
}
//#endregion

function fetchGroups() {
  return getJson("api/get_groups.php", "Failed to load groups.");
}
