const RequestPageState = {
  auth: {
    empDetails: {},
  },

  data: {
    submittedRequests: [],
    requestsForMe: [],
  },

  form: {
    groups: [],
    employeesByGroup: {},
    defaultGroup: "",
    defaultEmployeeId: "",
  },

  pagination: {
    submitted: {
      currentPage: 1,
      rowsPerPage: 10,
    },
    forMe: {
      currentPage: 1,
      rowsPerPage: 10,
    },
  },

  filters: {
    submitted: {
      search: "",
      month: "",
      status: "",
    },
    forMe: {
      search: "",
      month: "",
      status: "",
    },
  },

  ui: {
    activeModalRequestId: null,
  },
};