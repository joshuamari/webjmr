//#region MOCK DATA
function getMockRequests() {
  return {
    pendingRequests: [
      {
        requestId: "REQ-1001",
        employeeName: "Collene Keith",
        employeeId: "1042",
        group: "env",
        requestedOn: "2026-03-01 08:15 AM",
        requestedMonthLabel: "February 2026",
        requestedMonthValue: "2026-02",
        status: "pending",
      },
    ],

    actionedRequests: [
      {
        requestId: "REQ-1002",
        employeeName: "Collene Keith",
        employeeId: "1042",
        group: "env",
        requestedOn: "2026-03-05 10:35 AM",
        requestedMonthLabel: "February 2026",
        requestedMonthValue: "2026-02",
        status: "active",
        actionTakenOn: "2026-03-01 09:02 AM",
        actionTakenBy: "Joshua Coquia",
        expiringOn: "2026-03-02 08:15 AM",
      },
      {
        requestId: "REQ-1003",
        employeeName: "Joshua Coquia",
        employeeId: "1038",
        group: "elec",
        requestedOn: "2026-03-01 08:15 AM",
        requestedMonthLabel: "January 2026",
        requestedMonthValue: "2026-01",
        status: "cancelled",
        actionTakenOn: "2026-03-01 08:10 AM",
        actionTakenBy: "Collene Keith",
        expiringOn: "",
      },
      {
        requestId: "REQ-1004",
        employeeName: "Dexmel Hernandez",
        employeeId: "1051",
        group: "pmd",
        requestedOn: "2026-03-10 09:04 AM",
        requestedMonthLabel: "January 2026",
        requestedMonthValue: "2026-01",
        status: "expired",
        actionTakenOn: "2026-02-27 03:45 PM",
        actionTakenBy: "Joshua Coquia",
        expiringOn: "2026-02-28 03:45 PM",
      },
    ],
  };
}
//#endregion