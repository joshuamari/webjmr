//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
let empDetails = [];
let defaults = [];
var regCount = 0;
var otCount = 0;
var lvCount = 0;
let leaveID = 0;
let otherID = 0;
let mngID = 0;
let kiaID = 0;
let noMoreInputItems = [];
let oneBUTrainerID = "";
let entryArr = [];
let editTRID = [];
let delTRID = [];
const mhtypes = [
  { id: 0, type: "Regular" },
  { id: 1, type: "Overtime" },
];
let editGrpID = 0;

let calendar = null;

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const overrideAccessState = {
  hasUnlock: false,
  hasPlanning: false
}
function initStateRefs() {
  calendar = document.querySelector(".calendar");
}
//#endregion
