function editTrigger(e) {
	if (e.range.getColumn() !== 10) { return; }
	var sheet = SpreadsheetApp.getActiveSheet();
	var editedRange = e.range;
  
	// Loop through each edited cell in the range
	var numRows = editedRange.getNumRows();
	var data = [];
	var goods = [];

	var initialCode;
	var initialPlace;
	var initialPhone;

	var codeRow = e.range.getRow();
	while (codeRow >= 1 && !sheet.getRange(codeRow, 5).getValue()) {
		codeRow--; // Move up a row if the code is still empty
	}
	if (codeRow >= 1) {
		initialCode = sheet.getRange(codeRow, 5).getValue()
		initialPlace = sheet.getRange(codeRow, 6).getValue()
		initialPhone = sheet.getRange(codeRow, 14).getValue()
	}
			

	Logger.log(initialCode)

	for (var i = 0; i < numRows; i++) {
		var editedRow = editedRange.getRow() + i;

		var currCode = sheet.getRange(editedRow, 5).getValue(); // Column E (code)
		var currPhone = sheet.getRange(editedRow, 14).getValue();
		var currPlace = sheet.getRange(editedRow, 6).getValue(); // Column F (place)

		var rowData = {
            row: editedRow, // Row number
            description: trimSentence(sheet.getRange(editedRow, 23).getValue()), // Column V (description)
            totalAmount: sheet.getRange(editedRow, 16).getValue(), // Column O (amount)
            arrivedAmount: editedRange.getCell(i + 1, 1).getValue(),
            link: sheet.getRange(editedRow, 15).getValue() // Column N (link)
		};

		if (!currCode) {
			goods.push(rowData);
			continue;
		}

		// If there's a code change or first client creation:
		if (currCode !== initialCode) {
			if (goods.length > 0) {
			// Save the previous client with goods
			var client = {
				code: initialCode,
				phone: initialPhone, // Assuming phone and place are already set
				place: initialPlace,
				goods: goods
			};
			data.push(client);
			goods = [];
			}

			// Start a new client with the current code
			initialCode = currCode;
			initialPhone = currPhone;
			initialPlace = currPlace;
		}

		goods.push(rowData);
	}

// Save the last client with goods
	if (goods.length > 0) {
		var client = {
			code: initialCode,
			phone: initialPhone,
			place: initialPlace,
			goods: goods
		};
		data.push(client);
	}

	var response;
		
	try {
		response = UrlFetchApp.fetch(`http://yuron.xyz:2052/update`, {
			method: 'post',
			contentType: 'application/json',
			payload: JSON.stringify(data)
		});
	} catch(e) {
		SpreadsheetApp.getUi().alert("Ошибка на сервере: не удалось отправить запрос на сервер");
		return;
	}

	Logger.log(response)
	var status = JSON.parse(response.getContentText());
	if (status.error) {
		SpreadsheetApp.getUi().alert(status.error);
		return;
	} else if (!status?.length) {
		SpreadsheetApp.getUi().alert("Ошибка на сервере: не удалось обработать отправленные данные, возможна ошибка с БД");
		return;
	}
	// Loop through fetched status and update column K
	for (var i = 0; i < status.length; i++) {
		var row = status[i].row;
		var updateValue = status[i].status ? 1 : 0;
		var forHuman = status[i].status ? 'Извещен' : 'Не извещен';
		var color = updateValue ? '#00FF00' : '#FF0000';
		sheet.getRange(row, 11).setValue(updateValue).setBackground(color); // Update column K (11)
    	sheet.getRange(row, 12).setValue(forHuman).setBackground(color); // Update column K (11)
	}
}

// delete long descriptions
function trimSentence(sentence) {
	try {
		var words = sentence.split(' ');
		return words.length < 4 ? sentence : words.slice(0, 3).join(' ');
	} catch(e) {
		return sentence;
	}
}
