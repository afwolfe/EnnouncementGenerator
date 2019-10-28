function buildForm() {
  var scriptProperties = PropertiesService.getScriptProperties();
  //Creates the form with all of the correct settings.
  //var userProperties = PropertiesService.getUserProperties();

  var form = FormApp.create("Ennouncements");
  form.setTitle("Ennouncements")
    .setAcceptingResponses(true)
    .setCollectEmail(true)
    .setShowLinkToRespondAgain(true)
    .setLimitOneResponsePerUser(false)
    .setDescription("Please submit your E-announcement for approval here.\n\
Messages that are approved will be printed as-is, so please proofread them before sending.\n\
Messages should be sent by Fridays at 3:15 PM.");

  //Add sample image.
  var img = DriveApp.getFileById('172r0YeajO3HRzy5Do-KK_lqPybFO7KPC');
  form.addImageItem()
    .setTitle("Sample Ennouncement")
    .setImage(img.getBlob())
    .setAlignment(FormApp.Alignment.CENTER);

  //Categories
  var category = form.addListItem();
  category.setTitle("Category")
    .setHelpText("Priority and Office is for use of office staff only.")
    .setChoices([
      category.createChoice("Priority"),
      category.createChoice("Office"),
      category.createChoice("Events"),
      category.createChoice("Clubs"),
      category.createChoice("Other")])
    .setRequired(true);

  //Title
  var textValidation = FormApp.createTextValidation()
        .requireTextLengthLessThanOrEqualTo(50)
        .setHelpText("Title must 50 characters or less.")
        .build();
  
  form.addTextItem()
    .setTitle("Announcement Title")
    .setHelpText("What would you like the title of your announcement to be? (50 characters or less)")
    .setValidation(textValidation)
    .setRequired(true);

  //Body Text
  //Formatting Tutorial
  form.addSectionHeaderItem()
    .setTitle("Announcement Text")
    .setHelpText("You can now format your text for emphasis by wrapping parts of your message in certain characters.\n\
*text* = italic text\n\
**text** = bold text\n\
__text__ = underline text\n\
\n\
Learn more here: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet");
  
  //Announcement Text"
  var textValidation =  FormApp.createParagraphTextValidation()
        .requireTextLengthLessThanOrEqualTo(500)
        .setHelpText("Messages must be 500 characters or less.")
        .build();
  form.addParagraphTextItem().setTitle("Announcement Text")
    .setHelpText("The content of your announcement. (500 characters or less) Need to shorten a link? Use https://goo.gl/ or https://bit.ly/")
    .setValidation(textValidation)
    .setRequired(true);

  //End Date
  form.addDateItem()
    .setHelpText("(OPTIONAL) If this is a multi-week announcement, please enter the LAST DAY it is applicable to. Leaving this blank = one-time announcement. Except in special cases, please be courteous and do not keep an ennouncement running for more than a month.")
    .setTitle("End Date");

  //Contact Email
  
  var textValidation = FormApp
        .createTextValidation()
        .requireTextIsEmail()
        .setHelpText("Not a valid E - mail address.")
        .build();
  form.addTextItem()
    .setHelpText("(OPTIONAL) If you want to include a contact email after your message.")
    .setTitle("Contact Email")
    .setValidation(textValidation);

  form.setAcceptingResponses(true)

  scriptProperties.setProperty('ennouncementFormId', form.getId());
  Logger.log(form.getPublishedUrl());
  return form;
}

function getSavedFormId() {
  //Returns the saved formId in the ScriptProperties
  var scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('ennouncementFormId');
}

function linkFormToSheet() {
  //Check if a form is already saved and links it. Else it creates a new one.
  //Returns the final sheet.
  var scriptProperties = PropertiesService.getScriptProperties();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss.getFormUrl() && scriptProperties.getProperty('ennouncementFormId')) {
    linkSavedForm()
  }
  else {
    linkNewForm()
  }
  var responseSheet = renameResponseSheet();
  ss.setActiveSheet(responseSheet);
  return responseSheet;
}

function linkNewForm() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var form = buildForm();
  scriptProperties.setProperty('ennouncementFormId', form.getId());

  return form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
}

function linkSavedForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var form = FormApp.openById(getSavedFormId());
  return form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
}

function renameResponseSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  for (i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name.indexOf("Form Responses") == 0) {
      break;
    }
  }
  return sheets[i].setName("Ennouncements");
}

function lockForm() {
  if (isAutoLockFormEnabled()) {
    var form = FormApp.openById(getSavedFormId());
    form.setCustomClosedFormMessage("The ennouncement form has been closed for this week. Please wait until next week to submit your ennouncement. \n Ennouncements are due by 3:15pm the week before.");
    form.setAcceptingResponses(false);
  }
}

function unlockForm() {
  if (isAutoLockFormEnabled()) {
    var form = FormApp.openById(getSavedFormId());
    form.setAcceptingResponses(true);
  }
}

function unlinkFormAndDeleteAll() {
  var form = FormApp.openById(getSavedFormId());
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Ennouncements");
  form.removeDestination();
  form.deleteAllResponses();
  var TODAY = new Date();
  sheet.setName("Archive " + TODAY.toString());
}