exports.neat = function (yourName) {
  let firstChar = yourName.slice(0, 1);
  firstChar = firstChar.toUpperCase();
  let restChar = yourName.slice(1, yourName.length);
  restChar = restChar.toLowerCase();
  const newName = firstChar + restChar;

  return newName;
};
exports.neatSmallz = function (yourName) {
  let firstChar = yourName;
  let newChar = firstChar.toLowerCase();

  return newChar;
};
exports.neatCapz = function (yourName) {
  let firstChar = yourName;
  let newChar = firstChar.toUpperCase();

  return newChar;
};

//  regime id prefix helper
exports.regimeTypePrefix = (regimeType) => {
  if (regimeType.toLowerCase() === "concert") {
    return "CT".toLowerCase();
  } else if (regimeType.toLowerCase() === "conference"){
    return "CF".toLowerCase();
  } else if (regimeType.toLowerCase() === "theatre"){
    return "TH".toLowerCase();
  } else if (regimeType.toLowerCase() === "pageantry"){
    return "PG".toLowerCase();
  } else if (regimeType.toLowerCase() === "service"){
    return "SC".toLowerCase();
  } else if (regimeType.toLowerCase() === "education"){
    return "ED".toLowerCase();
  } else if (regimeType.toLowerCase() === "carnival"){
    return "CV".toLowerCase();
  } else if (regimeType.toLowerCase() === "festival"){
    return "FV".toLowerCase();
  } else if (regimeType.toLowerCase() === "party"){
    return "PT".toLowerCase();
  } else if (regimeType.toLowerCase() === "sport"){
    return "SP".toLowerCase();
  } else if (regimeType.toLowerCase() === "talentshow"){
    return "TS".toLowerCase();
  } else {
    return "Error method not allowed";
  }
}