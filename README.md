# EnnouncementGen

A Google Apps Script solution for building a weekly email announcement system.

## Instructions

This script is intended to be used with a Google Sheet.

### Getting Started
1. Upload the scripts to a Google Sheets file.
2. Create a settings.js file from settings.js.dist.
3. In settings.js you can customize the categories, recipients, who to CC the message to, and the weekly request notification.
4. Reload the sheet to see the menu.
5. Click Ennouncements -> Setup Sheet to create and link the form as well as format the sheet correctly.

### Sending Ennouncements

#### Automatic Method (easiest)

1. Click Install Triggers to schedule the reminder and weekly ennouncement email automatically and lock the form at the deadline each week.
2. You will only have to approve submissions before the email is automatically sent out.
3. If you miss one, you will get a reminder to approve and send the email manually.

#### Manual Method

1. As submissions come in, you will have to approve them by typing a  "Y" or "N" in the `Approved?` column.
2. To preview the email, click "Test Only" and you will see the final output in a popup box.
3. To send the email click "Send Ennouncements" and you will be prompted to confirm who you'd like to send it to.
   1. **NOTE:** If you click no, make sure you undo the updated `Sent?` statuses. This is a current issue.
4. To send a reminder email asking users for their submissions, click "Send Request." The "Test Request" button will let you preview this email. It automatically includes a link to the linked submission form.