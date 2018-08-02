sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var mapingsValidator = function (jsonData, columns) {
		this._jsonData = jsonData;
		this._columns = columns;
		this._messages = []; // Format {columnsName:'CC1',text:'Null Error',status : [{state:"Error",text:"ABC"}]}

		this.validateData = function () {
			//Reset Messages
			this._messages = [];

			this._columns.forEach(function (e) {
				this._validateColumn(e);
			}.bind(this))
			return this._messages;
		};
		this._validateColumn = function (column) {
			var aColumnsValues = [];
			this._jsonData.forEach(function (e) {
				aColumnsValues.push(e[column.COLUMN_NAME]);
			});
			if (column.IS_NULLABLE === "FALSE") {
				var errorResult = this._checkNullValues(aColumnsValues);
				if (errorResult.length > 0) {
					this._messages.push({
						columnsName: column.COLUMN_NAME,
						text: 'Null values in non nullable columns',
						status: errorResult
					})
				}
			};
			var errorResult = this._checkLength(aColumnsValues, column.LENGTH);
			if (errorResult.length > 0) {
				this._messages.push({
					columnsName: column.COLUMN_NAME,
					text: 'Exceeds maximum permitted length',
					status: errorResult
				})
			};
			var errorResult = this._checkDataType(aColumnsValues, column.DATA_TYPE_NAME);
			if (errorResult.length > 0) {
				this._messages.push({
					columnsName: column.COLUMN_NAME,
					text: 'Data type mismatch',
					status: errorResult
				})
			}
		};

		//Implement Validators
		this._checkNullValues = function (aValues) {
			var aMessages = [];
			aValues.forEach(function (e, index) {
				if (!e) {
					aMessages.push({
						state: 'Error',
						text: 'Cannot have null values in a non-nullable column. Error row : ' + (index + 1)
					})
				}
			});
			return aMessages;
		};
		this._checkLength = function (aValues, length) {
			var aMessages = [];
			aValues.forEach(function (e, index) {
				if (e) {
					if (e.length > length) {
						aMessages.push({
							state: 'Error',
							text: 'Exceeds the maximum permitted length :' + e.length + ' / ' + length + ' . Error row : ' + (index + 1)
						})
					}
				}
			});
			return aMessages;
		};
		this._checkDataType = function (aValues, datatype) {
			var aMessages = [];
			aValues.forEach(function (e, index) {
				if (datatype == 'DECIMAL' || datatype == 'DOUBLE' || datatype == 'INTEGER' || datatype == 'FLOAT' || datatype == 'SMALLINT' ||
					datatype == 'TINYINT') {
					if (isNaN(parseFloat(e, 0))) {
						aMessages.push({
							state: 'Error',
							text: 'Data type mismatch Expected :' + datatype + ' , Found  String/Charedter . Error row : ' + (index + 1)
						})
					}
				} else if (datatype == "DATE") {
					if (isNaN(Date.parse(new Date(e.substring(0, 4) + '-' + e.substring(4, 6) + '-' + e.substring(6, 8))))) {
						aMessages.push({
							state: 'Error',
							text: 'Data type mismatch Expected :' + datatype +
								' , Found  String/Charedter/Decimal.Apply transformation for a quick fix . Error row : ' + (index + 1)
						})
					}
				}
			});
			return aMessages;
		}
	};

	var mapingsValidator = BaseObject.extend("pinaki.ey.CIO.CIOControlPanel.api.MappingValidator", {
		constructor: mapingsValidator
	});
	return mapingsValidator;
});