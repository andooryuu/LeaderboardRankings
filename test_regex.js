// Test the regex pattern with the activity names from the real CSV
const activityNames = [
  "TDS3B5",
  "TDS2B5", 
  "TDS1B5",
  "TDS3A4",
  "TDS2A4",
  "TDS1A4",
  "TDS1E1",
  "TDS2E1",
  "TDS3E1"
];

console.log("Testing regex pattern with real activity names:");

activityNames.forEach(activityName => {
  const activityMatch = activityName.match(/([A-Za-z\s]+?)(\d+)/);
  
  if (activityMatch) {
    let fullPrefix = activityMatch[1].trim().replace(/\s+/g, "_").toUpperCase();
    let activityPrefix = "";
    
    if (fullPrefix.startsWith("TDS") || fullPrefix.startsWith("TD")) {
      activityPrefix = "TD";
    } else if (fullPrefix.startsWith("EXS") || fullPrefix.startsWith("EX")) {
      activityPrefix = "EX";
    } else {
      activityPrefix = fullPrefix;
    }
    
    const baseActivityType = activityMatch[2];
    
    console.log(`${activityName} -> Prefix: ${activityPrefix}, Sequence: ${baseActivityType}`);
  } else {
    console.log(`${activityName} -> NO MATCH`);
  }
});
