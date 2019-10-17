function testEnnouncement() {
    //Only does a test run of which ennouncements to send and shows the HTMLOutput.
    var ui = SpreadsheetApp.getUi();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var htmlBody = buildEnnouncement(ss, true);
    ui.showModalDialog(HtmlService.createHtmlOutput(htmlBody), 'Ennouncement Output');
}

function testRequest() {
    //Only does a test run of the request message to send and shows the HTMLOutput.
    var ui = SpreadsheetApp.getUi();
    var htmlBody = buildRequestHtml();
    ui.showModalDialog(HtmlService.createHtmlOutput(htmlBody), 'Ennouncement Output');
}

function testARA() {
    Logger.log(areSubmissionsApproved());
}