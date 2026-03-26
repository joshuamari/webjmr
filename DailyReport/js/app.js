const rootFolder = `//${document.location.hostname}`;

$(document).ready(function () {
  initializeApp();
});

function initializeApp() {
  loadSession();
}

function loadSession() {
  $.ajax({
    url: "api/session.php",
    dataType: "json",
    success: async function (data) {
      AppState.empDetails = data;
      console.log("session:", AppState.empDetails);

      try {
        await loadInitialData();
        startPage();
      } catch (error) {
        console.error("Startup config load failed:", error);
        alert("Failed to load startup configuration.");
      }
    },
    error: function (xhr, status, error) {
      console.error("Session load failed");
      console.error("status:", status);
      console.error("error:", error);
      console.error("response:", xhr.responseText);

      if (xhr.status === 401) {
        window.location.href = rootFolder + "/KDTPortalLogin";
        return;
      }

      alert("Failed to load session.");
    },
  });
}

async function loadInitialData() {
  const response = await getStartupConfig();
  const config = response.data;

  AppState.defaults = config.defaults || [];
  AppState.leaveID = config.leaveID || null;
  AppState.otherID = config.otherID || null;
  AppState.mngID = config.mngID || null;
  AppState.kiaID = config.kiaID || null;
  AppState.noMoreInputItems = config.noMoreInputItems || [];
  AppState.oneBUTrainerID = config.oneBUTrainerID || null;

  AppState.solProjID = config.solProjID || null;
  AppState.trainProjID = config.trainProjID || null;
  AppState.kdtwAccess = config.kdtwAccess || [];
  AppState.managementPositions = config.managementPositions || [];
  AppState.devs = config.devs || [];
}

function startPage() {
  bindPageEvents();
  $(".hello-user").text(AppState.empDetails.empFName || "");

  initSidebar();
  handleResponsiveSidebar();

  initializeDate();
  getMyGroups();
  getDispatchLoc();
  getTOW();
  getEntries();
  sequenceValidation();
  initCalendar();
  getPlans();

  $(".cs-loader").fadeOut(1000);

  if (AppState.empDetails.hasOverride) {
    $(".override-btn").show();
  } else {
    $(".override-btn").hide();
  }

  updateLockedMonthLabel();
  evaluateMonthLock();
}

function initializeDate() {
  $("#idDRDate").val(getTodayLocalDateString());
}
