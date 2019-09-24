function installTriggers() {
  var userProperties = PropertiesService.getUserProperties(); 
  var properties = userProperties.getProperties();
  
  //Check if each of the triggers have an ID (are currently installed)
  var sendTriggerID = properties["sendTrigger"];
  var requestTriggerID = properties["requestTrigger"];
  var lockTriggerID = properties["lockTrigger"];
  var unlockTriggerID = properties["unlockTrigger"];
  
  if (!sendTriggerID && !requestTriggerID && !lockTriggerID && !unlockTriggerID) {
    // Send every week on Monday at 0800.
    var sendTrigger = ScriptApp.newTrigger('sendEnnouncementAuto')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
    
    userProperties.setProperty("sendTrigger", sendTrigger.getUniqueId()); //Remember the ID for the user to delete it later.
    
    // Request submissions every Thursday at 1200.
    var requestTrigger = ScriptApp.newTrigger('sendRequestAuto')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.THURSDAY)
    .atHour(12)
    .create();
    
    userProperties.setProperty("requestTrigger", requestTrigger.getUniqueId());
    
    // Lock the form every Friday at 1515.
    var lockTrigger = ScriptApp.newTrigger('lockForm')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(15)
    .nearMinute(15)
    .create();
    
    userProperties.setProperty("lockTrigger", lockTrigger.getUniqueId());
    
    // Unlock the form every Monday at 0800.
    var unlockTrigger = ScriptApp.newTrigger('unlockForm')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
    
    userProperties.setProperty("unlockTrigger", unlockTrigger.getUniqueId());
  }
  else {throw ("Triggers are already installed. Stopping.");}
}

function deleteTriggers() {
  var userProperties = PropertiesService.getUserProperties();
  var properties = userProperties.getProperties();
  var sendTriggerID = properties["sendTrigger"];
  var requestTriggerID = properties["requestTrigger"];
  var lockTriggerID = properties["lockTrigger"];
  var unlockTriggerID = properties["unlockTrigger"];
  
  if (sendTriggerID && requestTriggerID && lockTriggerID && unlockTriggerID) {
    deleteTrigger(sendTriggerID);
    deleteTrigger(requestTriggerID);
    deleteTrigger(lockTriggerID);
    deleteTrigger(unlockTriggerID);
    
    userProperties.deleteProperty("sendTrigger");
    userProperties.deleteProperty("requestTrigger");
    userProperties.deleteProperty("lockTrigger");
    userProperties.deleteProperty("unlockTrigger");
  }
  else {throw ("Triggers are not currently installed. Stopping.");}
}

function deleteTrigger(triggerId) {
  // Loop over all triggers.
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    // If the current trigger is the correct one, delete it.
    if (allTriggers[i].getUniqueId() === triggerId) {
      ScriptApp.deleteTrigger(allTriggers[i]);
      break;
    }
  }
}