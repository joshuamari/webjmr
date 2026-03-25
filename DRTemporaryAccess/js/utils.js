//#region UTILS
function getRootFolder() {
  return `//${document.location.hostname}`;
}

function getEmployeeFullName(empDetails = {}) {
  return (
    [
      empDetails.empFName || "",
      empDetails.empSName || "",
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() || "User"
  );
}

function hasOverridePermission(empDetails = {}) {
  const value = empDetails.hasOverride;
  return value === true || value === 1 || value === "1";
}

function hasUnlockPermission(empDetails = {}) {
  const value = empDetails.hasUnlock;
  return value === true || value === 1 || value === "1";
}

function hasPlanningPermission(empDetails = {}) {
  const value = empDetails.hasPlanning;
  return value === true || value === 1 || value === "1";
}

function formatMonthValue(value) {
  if (!value) return "";

  const [year, month] = value.split("-");
  const monthDate = new Date(year, parseInt(month, 10) - 1, 1);
  const monthName = monthDate.toLocaleString("en-US", { month: "long" });

  return `${monthName} ${year}`;
}

function formatDateTime(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = String(hours).padStart(2, "0");

  return `${year}-${month}-${day} ${hourStr}:${minutes} ${ampm}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function capitalize(value) {
  if (!value || value === "—") return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
//#endregion

function getPreviousMonthValue() {
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth(); // 0-based, current month

  const previousMonthDate = new Date(year, monthIndex - 1, 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = String(previousMonthDate.getMonth() + 1).padStart(2, "0");

  return `${previousYear}-${previousMonth}`;
}