//#region APP
async function loadAuthUser() {
  const data = await fetchLoggedInUser();
  RequestPageState.auth.empDetails = data || {};

  if (!RequestPageState.auth.empDetails.empNum) {
    window.location.href = getRootFolder() + "/KDTPortalLogin";
    return;
  }
}

function initStaticUI() {
  $(".hello-user").text(RequestPageState.auth.empDetails.empFName || "User");

  updateSidebarResponsiveState();
  initSidebar();
  initMonthPickers();
  initStatusFilterUI();
  initTargetGroupFieldUI();
  initTargetEmployeeFieldUI();
  applyRequestMonthLimit();
}

function hydrateInitialUI() {
  updateMonthDisplay({
    inputSelector: "#requestMonthSel",
    triggerSelector: ".requestMonthCont",
    labelSelector: "#requestMonthLabel",
    removeId: "removeRequestMonth",
    defaultLabel: "Requested Month",
    onChange: filterMyRequestsSubmitted,
  });

  updateMonthDisplay({
    inputSelector: "#requestForMeMonthSel",
    triggerSelector: ".requestForMeMonthCont",
    labelSelector: "#requestForMeMonthLabel",
    removeId: "removeRequestForMeMonth",
    defaultLabel: "Requested Month",
    onChange: filterRequestsForMe,
  });

  updateMonthDisplay({
    inputSelector: "#requestCreateMonthSel",
    triggerSelector: ".requestCreateMonthCont",
    labelSelector: "#requestCreateMonthLabel",
    removeId: "removeRequestCreateMonth",
    defaultLabel: "Requested Month",
    onChange: function () {},
  });

  toggleStatusActive($("#requestStatusSel"));
  toggleStatusActive($("#requestForMeStatusSel"));

  setupRequestFormSelectors();
  setupRequestEmployeeField();

  filterMyRequestsSubmitted();
  filterRequestsForMe();
}

function renderPage() {
  renderSubmittedTable();
  renderForMeTable();
  renderSummaryCards();
  renderActivePanel();
}

async function initPage() {
  try {
    await loadAuthUser();
    await loadPageData();
    await loadFormData();

    initStaticUI();
    bindPageEvents();

    setTimeout(function () {
      hydrateInitialUI();
      renderPage();
    }, 50);
  } catch (err) {
    console.error("INIT FAILED:", err);
  } finally {
    $(".cs-loader").fadeOut(1000);
  }
}

async function loadPageData() {
  const data = await fetchRequestPageData();

  RequestPageState.data.submittedRequests = data.submitted || [];
  RequestPageState.data.requestsForMe = data.forMe || [];
}
async function loadFormData() {
  const data = await fetchRequestFormData();

  RequestPageState.form.groups = data.groups || [];
  RequestPageState.form.employeesByGroup = data.employeesByGroup || {};
  RequestPageState.form.defaultGroup = data.defaultGroup || "";
  RequestPageState.form.defaultEmployeeId = data.defaultEmployeeId || "";
}
//#endregion