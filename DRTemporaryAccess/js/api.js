//#region API
function fetchLoggedInUser() {
  return $.ajax({
    url: "api/session.php",
    method: "GET",
    dataType: "json",
  }).then(function (response) {
    if (!response || response.success !== true || !response.data) {
      throw new Error(response?.message || "Invalid session response.");
    }

    return response.data;
  });
}

function fetchRequestPageData() {
  return $.ajax({
    url: "api/list.php",
    method: "GET",
    dataType: "json",
  }).then(function (response) {
    if (!response || response.success !== true || !response.data) {
      throw new Error(response?.message || "Failed to load request data.");
    }

    return response.data;
  });
}

function fetchRequestFormData() {
  return $.ajax({
    url: "api/request-form-data.php",
    method: "GET",
    dataType: "json",
  }).then(function (response) {
    if (!response || response.success !== true || !response.data) {
      throw new Error(response?.message || "Failed to load request form data.");
    }

    return response.data;
  });
}

function createTemporaryAccessRequest(payload) {
  return $.ajax({
    url: "api/request_unlock.php",
    method: "POST",
    dataType: "json",
    data: payload,
  }).then(function (response) {
    if (!response || response.success !== true) {
      throw response;
    }

    return response.data;
  });
}
//#endregion