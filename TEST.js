function editTrigger(e) {
	if (e.range.getColumn() !== 10) { return; }
	var sheet = SpreadsheetApp.getActiveSheet();
	var data = structureData(e.range, sheet)
	var status = sendData(data);
	updateCells(status, sheet);
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

function structureData(editedRange, sheet) {
	// Loop through each edited cell in the range
	var numRows = editedRange.getNumRows();
	var data = [];
	var goods = [];

	var initialCode;
	var initialPlace;
	var initialPhone;
	var initialName;

	var codeRow = editedRange.getRow();
	while (codeRow >= 1 && !sheet.getRange(codeRow, 5).getValue()) {
		codeRow--; // Move up a row if the code is still empty
	}
	if (codeRow >= 1) {
		initialCode = sheet.getRange(codeRow, 5).getValue();
		initialPlace = sheet.getRange(codeRow, 6).getValue();
		initialPhone = sheet.getRange(codeRow, 14).getValue();
		initialName = sheet.getRange(codeRow, 4).getValue();
		initialDeliveryPrice = sheet.getRange(codeRow, 19).getValue();
		initialTotalPrice = sheet.getRange(codeRow, 20).getValue();
	}

	for (var i = 0; i < numRows; i++) {
		var editedRow = editedRange.getRow() + i;

		var currCode = sheet.getRange(editedRow, 5).getValue(); // Column E (code)
		var currPhone = sheet.getRange(editedRow, 14).getValue();
		var currPlace = sheet.getRange(editedRow, 6).getValue(); // Column F (place)
		var currName = sheet.getRange(editedRow, 4).getValue(); // Column D (name)
		var currDeliveryPrice = sheet.getRange(editedRow, 19).getValue();
		var currTotalPrice = sheet.getRange(editedRow, 20).getValue();

		var rowData = {
            row: editedRow, // Row number
            description: trimSentence(sheet.getRange(editedRow, 23).getValue()), // Column V (description)
            totalAmount: sheet.getRange(editedRow, 16).getValue(), // Column O (amount)
            arrivedAmount: editedRange.getCell(i + 1, 1).getValue(),
            link: sheet.getRange(editedRow, 15).getValue(), // Column N (link)
			price: sheet.getRange(editedRow, 17).getValue()
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
				phone: initialPhone,
				place: initialPlace,
				name: initialName,
				deliveryPrice: initialDeliveryPrice,
				totalPrice: initialTotalPrice,
				goods: goods
			};
			data.push(client);
			goods = [];
			}

			// Start a new client with the current code
			initialCode = currCode;
			initialPhone = currPhone;
			initialPlace = currPlace;
			initialName = currName;
			initialDeliveryPrice = currDeliveryPrice;
			initialTotalPrice = currTotalPrice;
		}

		goods.push(rowData);
	}

	// Save the last client with goods
	if (goods.length > 0) {
		var client = {
			code: initialCode,
			phone: initialPhone,
			place: initialPlace,
			name: initialName,
			deliveryPrice: initialDeliveryPrice,
			totalPrice: initialTotalPrice,
			goods: goods
		};
		data.push(client);
	}
	return data;
}

function sendData(data) {
	var response;
		
	try {
		response = UrlFetchApp.fetch(`http://yuron.xyz:2052/update`, {
			method: 'post',
			contentType: 'application/json',
			payload: JSON.stringify(data)
		});
	} catch(e) {
		SpreadsheetApp.getUi().alert("Ошибка на сервере: не удалось отправить запрос на сервер");
		return [];
	}

	var status = JSON.parse(response.getContentText());
	if (status.error) {
		SpreadsheetApp.getUi().alert(status.error);
		return [];
	} else if (!status?.length) {
		SpreadsheetApp.getUi().alert("Ошибка на сервере: не удалось обработать отправленные данные, возможна ошибка с БД");
		return [];
	}
	return status;
}

function updateCells(status, sheet) {
	for (var i = 0; i < status.length; i++) {
		var row = status[i].row;
		var updateValue = status[i].status ? 1 : 0;
		var forHuman = updateValue ? 'Извещен' : 'Не извещен';
		var color = updateValue ? '#00FF00' : '#FF0000';
		var date = updateValue ? new Date() : '';
		sheet.getRange(row, 11).setValue(updateValue).setBackground(color); // Update column K (11)
    	sheet.getRange(row, 12).setValue(forHuman).setBackground(color); // Update column K (11)
		sheet.getRange(row, 13).setValue(date) // Date
	}
}
