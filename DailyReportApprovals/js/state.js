//#region GLOBAL STATE
const rootFolder = `//${document.location.hostname}`;

const DRApprovalsState = {
  auth: {
    empDetails: {},
    canAccessPlanning: false,
  },

  data: {
    pendingRequests: [],
    actionedRequests: [],
  },

  filters: {
    pending: {
      search: "",
      month: "",
      group: "",
    },
    actioned: {
      search: "",
      month: "",
      group: "",
    },
  },
  options: {
    groups: [],
  },
  pagination: {
    actioned: {
      currentPage: 1,
      rowsPerPage: 10,
    },
  },

  ui: {
    pendingModalRequestId: null,
    actionedModalRequestId: null,
  },

  summary: {
    pendingCount: 0,
    approvedToday: 0,
    deniedToday: 0,
    expiringToday: 0,
  },
};
//#endregion