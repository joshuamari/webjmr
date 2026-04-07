//#region INIT FLOW
async function initPage() {
  try {
    showLoader();

    await loadAuthUser();

    initSidebar();
    handleResponsiveSidebar();
    bindEvents();

    await loadInitialData();
    renderPage();
  } catch (error) {
    console.error("INIT FAILED:", error);
    alert("Failed to initialize page.");
  } finally {
    hideLoader();
  }
}
//#endregion

//#region AUTH / DATA LOAD
async function loadAuthUser() {
  try {
    const response = await fetchLoggedInUser();
    const user = response.data || {};

    if (!response.success) {
      window.location.href = rootFolder + "/KDTPortalLogin";
      return;
    }

    if (!user.hasUnlock) {
      handleUnauthorizedAccess();
      return;
    }

    DRApprovalsState.auth.empDetails = user;
    DRApprovalsState.auth.canAccessPlanning = !!user.hasPlanning;
  } catch (error) {
    if (
      typeof error === "string" &&
      error.toLowerCase().includes("unauthorized")
    ) {
      window.location.href = rootFolder + "/KDTPortalLogin";
      return;
    }

    throw error;
  }
}

function handleUnauthorizedAccess() {
  alert("You do not have permission to access this page.");

  if (document.referrer && document.referrer !== window.location.href) {
    window.history.back();
    return;
  }

  window.location.href = rootFolder;
}

async function loadInitialData() {
  const [requestsResponse, groupsResponse] = await Promise.all([
    fetchApprovalRequests(),
    fetchGroups(),
  ]);

  const pageData = requestsResponse.data || {};
  const groupsData = groupsResponse.data || {};

  DRApprovalsState.data.pendingRequests = pageData.pendingRequests || [];
  DRApprovalsState.data.actionedRequests = pageData.actionedRequests || [];
  DRApprovalsState.summary = pageData.summary || {
    pendingCount: 0,
    approvedToday: 0,
    deniedToday: 0,
    expiringToday: 0,
  };

  DRApprovalsState.options = DRApprovalsState.options || {};
  DRApprovalsState.options.groups = groupsData.groups || [];
}

async function refreshApprovalData() {
  const response = await fetchApprovalRequests();
  const pageData = response.data || {};

  DRApprovalsState.data.pendingRequests = pageData.pendingRequests || [];
  DRApprovalsState.data.actionedRequests = pageData.actionedRequests || [];
  DRApprovalsState.summary = pageData.summary || {
    pendingCount: 0,
    approvedToday: 0,
    deniedToday: 0,
    expiringToday: 0,
  };

  renderPage();
}
//#endregion