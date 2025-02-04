const { v4: uuidv4 } = require("uuid");

function generateReference() {
    return `ORD-${uuidv4().split("-")[0].toUpperCase()}`; // Shortened UUID
}

function toMinorUnits(amount) {
    return Math.round(amount * 100); // Convert to smallest currency unit
}

module.exports = {
    generateReference,
    toMinorUnits
  };