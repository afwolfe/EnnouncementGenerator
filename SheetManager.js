/*
Name: SheetManager.gs
Author: Alex Wolfe
Description: Provides functions for managing the Google Sheet.
*/

function sheetSetup() {
  //Configures the desired settings for the sheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = linkFormToSheet();
  saveSheetId();

  //Bold and freeze top row.
  var firstRow = sheet.getRange(1, 1, 1, sheet.getMaxColumns());
  firstRow.setFontWeight("bold");
  sheet.setFrozenRows(1);


  //Delete extra columns
  var maxColumns = sheet.getMaxColumns();
  var lastColumn = sheet.getLastColumn();
  if (lastColumn == 7) {
    sheet.getRange(1, 8).setValue("Approved");
    sheet.getRange(1, 9).setValue("Sent?");
    lastColumn += 2;
  }
  if (maxColumns > lastColumn) {
    sheet.deleteColumns(lastColumn + 1, maxColumns - (lastColumn));
  }


  //Create formatting rules for Y/N/R.
  var range = sheet.getRange(1, 8, sheet.getMaxRows(), 9);
  var rules = sheet.getConditionalFormatRules();

  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Y")
      .setBackground("#00AA00")
      .setRanges([range])
      .build());
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("N")
      .setBackground("#AA0000")
      .setRanges([range])
      .build());
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("R")
      .setBackground("#FFCC00")
      .setRanges([range])
      .build());
  
  //Highlight recurring dates that are past.
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenDateBefore(SpreadsheetApp.RelativeDate.TODAY)
      .setBackground("#AA0000")
      .setRanges([sheet.getRange(1, 6, sheet.getMaxRows(), 6)])
      .build());

  sheet.setConditionalFormatRules(rules);
}

function copyRowToSheet(sourceSheet, sourceRow, destSheet, destRow) {
  sourceSheet = SpreadsheetApp.getActiveSheet();
  destSheet = SpreadsheetApp.getActiveSheet();
  var sourceRow = sourceSheet.getRange(sourceRow, sourceRow, 1, sourceSheet.getMaxColumns()).
    destSheet.appendRow(rowContents)
}

function saveSheetId() {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('ennouncementSheetId', SpreadsheetApp.getActiveSpreadsheet().getId());
}

function getSavedSheetId() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('ennouncementSheetId');
}