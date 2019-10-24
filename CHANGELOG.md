# CHANGELOG

## 4.2

* Added additional options to make approval and auto-locking the form optional.

## 4.1

* Moved changelog to separate file.
* Separated settings.js and removed old dependency on urlshortener.
* Added additional instructions to README.

## 4.0

* Added showdown to convert text to Markdown https://github.com/showdownjs/showdown
* Licensed under MIT.

## 3.4

* Updated for 2019-2020.
* Made TriggerManager to be able to automatically install time-based triggers to manage the sending of requests and the announcements as well as locking/unlocking the form.

## 3.3

* Added the ability to lock the form. (Could be configured to a trigger.)
* sendEnnouncementPrompt (auto sending) will now email the owner/user of the sheet if there are pending announcements.

## 3.2

* Added methods to send without prompting.

## 3.1

* Refactored to make a singular loop instead of one to build the array and one to build the HTML.

## 3.02

* Made a fix to Form linking and switches to sheet

## 3.01

* Added new form features to menu.

## 3.0

* Updated for 2018-2019.
* Can now properly create and link the Google Form from scratch and format the Sheet.
* Column references are now based on the proper order.

## 2.0

* Now supports categories.

## 1.3

* FIXED: Month in subject and message needed +1 because .getMonth() starts at 0.

## 1.2

* FIXED: Selecting "No" in send prompt.
* Added class email lists and staff to recipients list.

## 1.1

* FIXED: Contact email HTML.
* Added more comments and renamed some variables for clarity.
* Added a line to the beginning of the email with the date in ordinal format (th, st, etc).

## 1.01

* FIXED: multiline support with white-space: pre-wrap in message body.
* FIXED: Reads proper values in new sheet.

## 1.0

* Initial Release