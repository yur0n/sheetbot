function editTrigger(e) {
	if (e.range.getColumn() !== 10) { return; }
	var sheet = SpreadsheetApp.getActiveSheet();
	var editedRange = e.range;
	var data = [];
  
	// Loop through each edited cell in the range
	var numRows = editedRange.getNumRows();
	for (var i = 0; i < numRows; i++) {
		// Get the row number of the current edited cell
		var editedRow = editedRange.getRow() + i;

		var rowData = {
			row: editedRow, // Row number
			phone: sheet.getRange(editedRow, 13).getValue(), // Column M (phone)
			code: sheet.getRange(editedRow, 5).getValue(), // Column E (code)
			place: sheet.getRange(editedRow, 6).getValue(), // Column F (place)
			description: sheet.getRange(editedRow, 22).getValue(), // Column V (description)
			amount: sheet.getRange(editedRow, 15).getValue(), // Column O (amount)
			link: sheet.getRange(editedRow, 14).getValue() // Column N (link)
		};
		
		data.push(rowData);
	}
	// Send the phone numbers to the specified URL via POST request
	var status = UrlFetchApp.fetch(`http://yuron.xyz:8080/update`, {
	  method: 'post',
	  contentType: 'application/json',
	  payload: JSON.stringify(data)
	});
	Logger.log(status)
	var fetchedStatus = JSON.parse(status.getContentText());

	// Loop through fetched status and update column K
	for (var i = 0; i < fetchedStatus.length; i++) {
		var row = fetchedStatus[i].row;
		var updateValue = fetchedStatus[i].status ? 1 : 0;
		sheet.getRange(row, 11).setValue(updateValue); // Update column K (11)
	}
	// Consider adding error handling for the fetch request
}