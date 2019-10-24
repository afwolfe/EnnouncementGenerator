/*
  Name:     Ennouncement Generator
  Author:   Alex Wolfe
  Version:  4.1

  License:  GPLv3 (https://www.gnu.org/licenses/gpl.html)

  Features:
  -Creates a simple HTML email of submitted announcements.
  -Checks that announcements have been approved in the sheet and not already sent.
  -Support for recurring announcements (will send on endDate).
  -Uses showdown.js to convert Markdown to HTML.

  ISSUES:
  -Cancelling a "Send command" will still cause announcements to update their "Sent?" status. Make sure you use the undo button if this happens.

*/
var showdownConverter;

function getVersion() {
  return "4.1"
}


function onOpen() {
  //Add a menu to the spreadsheet.
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Ennouncements')
    //.addItem('Test and Send Ennouncement', 'testAndSendEnnouncement') //Test and Send appears to be broken at the moment.
    .addItem('Send Only', 'sendEnnouncement')
    .addItem('Test Only', 'testEnnouncement')
    .addItem('Send to Self', 'sendToSelf')
    .addItem('Send REQUEST', 'sendRequest')
    .addItem('Test REQUEST', 'testRequest')
    .addSeparator()
    .addItem('Setup Sheet', 'sheetSetup')
    .addItem('Unlink Form and Archive Responses', 'unlinkFormAndDeleteAll')
    .addSeparator()
    .addItem('Install Triggers', 'installTriggers')
    .addItem('Delete Triggers', 'deleteTriggers')
    .addToUi();
}

function processRow(row) {
  /*
    [i][0] Datestamp (unused)
    [i][1] Author's email (unused)
    [i][2] Category
    [i][3] Title
    [i][4] Body Text
    [i][5] End Date (optional)
    [i][6] Contact Email (optional)
    [i][7] Approved? (Y/N)
    [i][8] Sent? (Y/N/R)
  */
  //If category doesn't match, set to Other.
  var TODAY = new Date();
  TODAY.setHours(0);
  TODAY.setMinutes(0);
  TODAY.setSeconds(0);
  TODAY.setMilliseconds(0);

  if (getCategories().indexOf(row[2]) == -1) { row[2] = "Other" };

  row[3].replace(/(<([^>]+)>)/ig, ""); //clear HTML tags
  row[4].replace(/(<([^>]+)>)/ig, ""); // clear HTML tags
  
  var showdown = getConverter();
  var html = showdown.makeHtml(row[4]);
  row[4] = html;

  //EndDate Handling
  if (row[5] == "") {
    row[5] = new Date(TODAY); //If no tempEndDate, set it to be TODAY.
  } else {
    row[8] = "R"
    row[5] = new Date(row[5].getTime());
  }
  row[5].setHours(0);
  row[5].setMinutes(0);
  row[5].setSeconds(0);
  row[5].setMilliseconds(0);

  return row;
}

function buildRowHtml(row) {
  //Builds the individual HTML for a row and returns it.
  var tempHtml = '';
  var tempCategory = getCategories().indexOf(row[2]);
  tempHtml += '<u><h3>' + row[3] + '</h3></u>\n';
  tempHtml += "<p style='white-space:pre-wrap;'>" + row[4] + "</p>\n";
  if (row[6] != "") { tempHtml += '<em>For more details, please contact: <a href="mailto:' + row[6] + '">' + row[6] + '</a></em>\n'; }
  tempHtml += "<hr />"
  return tempHtml;
}

function buildEnnouncement(spreadsheet, testOnly) {
  if (arguments.length == 1) {
    var testOnly = false;
  } else {
    var testOnly = testOnly;
  }
  //Make a variable for today and set the time to 00:00h for ease of checking.
  var TODAY = new Date();
  TODAY.setHours(0);
  TODAY.setMinutes(0);
  TODAY.setSeconds(0);
  TODAY.setMilliseconds(0);

  var announcementSheet = spreadsheet.getSheetByName("Ennouncements");
  var maxRows = announcementSheet.getLastRow();

  var announcementArray = announcementSheet.getRange(2, 1, maxRows - 1, 9).getValues();
  var announcementCount = 0;

  //Setup HTML stuff.
  var html = new String();
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var categories = getCategories();
  //Creates an array to hold the HTML for each category in order.
  var categoryHtml = new Array(categories.length);
  for (i = 0; i < categoryHtml.length; i++) { categoryHtml[i] = ''; }

  html += "<h2>Ennouncements for the Week of " + (TODAY.getMonth() + 1) + "/" + TODAY.getDate() + "/" + TODAY.getYear() + "</h2>\n \
    <p>Thank you students and staff for your submissions, here are your ennouncements for " + DAYS[TODAY.getDay()] + ", " + MONTHS[TODAY.getMonth()] + " " + dateOrdinal(TODAY.getDate()) + ", " + TODAY.getYear() + ".</p>\n \
    </br>\n";

  for (i = 0; i < announcementArray.length; i++) {
    //Logger.log(announcementArray[i]);
    //For each row...
    /*
    [i][0] Datestamp (unused)
    [i][1] Author's email (unused)
    [i][2] Category
    [i][3] Title
    [i][4] Body Text
    [i][5] End Date (optional)
    [i][6] Contact Email (optional)
    [i][7] Approved? (Y/N)
    [i][8] Sent? (Y/N/R)
    */

    //Process the row.
    var tempRow = processRow(announcementArray[i]);
    var tempEndDate = tempRow[5];
    var isApproved = false;
    if (tempRow[7] == "Y") { isApproved = true; }
    
    //Logger.log(tempRow);
    
    var isSent = false;
    var isRecurring = false;

    if (tempRow[8] == "Y") { isSent = true; }
    else if (tempRow[8] == "R") { isRecurring = true; }
    //Done processing row.

    //Build the HTML for the row
    if (isSent || !isApproved || TODAY.getTime() > tempEndDate.getTime()) {
      //If already sent, or not approved, or past the tempEndDate then don't add to HTML.
      continue;
    }
    else {
      announcementCount++;
      var tempCategory = categories.indexOf(tempRow[2]);
      categoryHtml[tempCategory] += buildRowHtml(tempRow);
    }

    //TODO: Write sent value AFTER confirming send?
    if (!testOnly) {
      //Logger.log("Not in testing mode. Writing sent value.");
      var statusCell = announcementSheet.getRange(2 + i, 9, 1);
      if ((isApproved && isRecurring && (TODAY.getTime() >= tempEndDate.getTime())) || (!isRecurring && isApproved)) {
        //End of recurring announcement, or sending a one-time event.
        statusCell.setValue("Y");
      }
      else if (isApproved && isRecurring) {
        //Unfinished recurring announcement
        statusCell.setValue("R");
      }
      else {
        //Do not send.
        statusCell.setValue("N");
      }

    }
    /*
    Logger.log("Title: "+announcementArray[i][2]);
    Logger.log("Body: "+announcementArray[i][3]);
    Logger.log("isApproved "+isApproved);
    Logger.log("isSent "+isSent);
    Logger.log("tempEndDate "+tempEndDate.getTime());
    Logger.log("isRecurring "+isRecurring);
    */
  }

  if (announcementCount == 0) { throw ("No ennouncements that need sent. Stopping."); }

  for (i = 0; i < categories.length; i++) {
    if (categoryHtml[i] != '') {
      html += '<strong><h1>' + categories[i] + '</h1></strong>'
      html += categoryHtml[i];
    }
  }
  html += getByline();

  //Logger.log(announcementArray);
  return html;
}

function dateOrdinal(d) {
  //Returns a nice ordinal for a given date (d).
  return d + (31 == d || 21 == d || 1 == d ? "st" : 22 == d || 2 == d ? "nd" : 23 == d || 3 == d ? "rd" : "th")
}

function sendToSelf() {
  //Shows the HTMLOutput before sending to your own email address.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var RECIPIENTS = Session.getEffectiveUser().getEmail();
  var SUBJECT = getSubject();

  var htmlBody = buildEnnouncement(ss);

  return sendEnnouncementEmail(RECIPIENTS, SUBJECT, htmlBody);
}

function sendEnnouncement() {
  //Sends the ennouncement.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var RECIPIENTS = getRecipients();
  var SUBJECT = getSubject();

  var htmlBody = buildEnnouncement(ss);

  return sendEnnouncementEmail(RECIPIENTS, SUBJECT, htmlBody, true);
}

function sendEnnouncementAuto() {
  //Despite the name it actually sends wih NO prompt.
  var ss = SpreadsheetApp.openById(getSavedSheetId());
  var RECIPIENTS = getRecipients();
  var SUBJECT = getSubject();

  if (areSubmissionsApproved()) {
    var htmlBody = buildEnnouncement(ss);
    return sendEnnouncementEmail(RECIPIENTS, SUBJECT, htmlBody, false);
  }
  else {
    var url = ss.getUrl();
    return MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "Ennouncement Problem", "Not all submissions on the sheet were approved, go to: " + url + "\n" +
    "To approve/deny all pending announcements and then manually send using the Ennouncements->Send Only menu.");
  }
}

function sendEnnouncementEmail(recipients, subject, htmlBody, doPrompt) {

  if (doPrompt) {
    var ui = SpreadsheetApp.getUi();
    //Sends the ennouncement email.
    var response = ui.alert("Send Ennouncement", "Do you want to send the ennouncement to " + recipients + "?", ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      var send = true;
    } else {
      throw ("User chose to not send ennouncement. Stopping.");
    }
  }
  return MailApp.sendEmail({
    to: recipients,
    bcc: getCC(),
    subject: subject,
    htmlBody: htmlBody,
  })
}

function sendRequest() {
  var ui = SpreadsheetApp.getUi();
  var recipients = getRecipients();
  var response = ui.alert("Send REQUEST for Ennouncements", "Do you want to send the REQUEST to " + recipients + "?", ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    var send = true;
  } else {
    throw ("User chose to not send ennouncement. Stopping.");
  }
  var htmlBody = buildRequestHtml();

  return MailApp.sendEmail({
    to: recipients,
    bcc: getCC(),
    subject: "Request for Ennouncements",
    htmlBody: htmlBody
  });
}

function sendRequestAuto() {
  //Automatically send the request without prompting.
  var htmlBody = buildRequestHtml();
  var recipients = getRecipients();
  
  return MailApp.sendEmail({
    to: recipients,
    bcc: getCC(),
    subject: "Request for Ennouncements",
    htmlBody: htmlBody
  });
}

function getByline() {
  html = '<br /> \
<p style="color:#C0C0C0; font-size: xx-small"><a href="https://github.com/afwolfe/EnnouncementGenerator">EnnouncementGen</a> by Alex Wolfe v' + getVersion() +'<br /> \
Uses <a href="https://github.com/showdownjs/showdown">showdown.js</a> licensed under <a href="https://www.opensource.org/licenses/MIT">MIT License.</a></p>';
  return html;
}


function areSubmissionsApproved() {
  //Checks if all submissions are approved.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ennouncements = ss.getSheetByName('Ennouncements');
  var maxRows = ennouncements.getLastRow();

  var ennouncementArray = ennouncements.getRange(2, 1, maxRows - 1, 9).getValues();

  for (i = 0; i < ennouncementArray.length; i++) {
    if (ennouncementArray[i][7] == '') {
      Logger.log('false');
      return false;
    }
  }

  return true
}

function getConverter() {
  if (!showdownConverter) {
    showdownConverter = new showdown.Converter();
    showdownConverter.setOption('headerLevelStart', 4);
    showdownConverter.setOption('simplifiedAutoLink', true);
    showdownConverter.setOption('simpleLineBreaks', true);
  }
  return showdownConverter;
}
