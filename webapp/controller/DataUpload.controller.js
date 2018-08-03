sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/Column",
	"pinaki/ey/CIO/CIOControlPanel/util/Constants",
	"pinaki/ey/CIO/CIOControlPanel/api/JSONToTable",
	"pinaki/ey/CIO/CIOControlPanel/api/xlsxfullmin",
	"pinaki/ey/CIO/CIOControlPanel/api/RawDataValidator",
	'sap/m/MessageBox'
], function (Controller, tableColumn, constants, JSONToTable, XLLIB, RawDataValidator,MessageBox) {
	"use strict";
	var modelData = {
		tableList: constants.tableList,
		uploadedFileSheets: null,
		currentSheetData: null,
		workbook: null,
		selectedTable: ""
	};
	return Controller.extend("pinaki.ey.CIO.CIOControlPanel.controller.DataUpload", {
		onInit: function () {
			//Set Upload Model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(modelData);
			this.getView().setModel(oModel, 'idUploadDataModel');
		},
		onAfterRendering: function () {
			var fileUploader = this.getView().byId("fileUploader").getId();
			this.attachEventOnFileUpload(fileUploader);
		},
		attachEventOnFileUpload: function (fileUploader) {
			$('#' + fileUploader).change(function (event) {
				if (event.target.value.length > 0) {   //Ensure Selection
					this.getView().setBusyIndicatorDelay(0).setBusy(true);
				}
				setTimeout(function () {
					var input = event.target;
					var reader = new FileReader();
					reader.onload = function () {
						var fileData = reader.result;
						var wb = XLSX.read(fileData, {
							type: 'binary'
						});
						if(!wb.Workbook){
							MessageBox.error('Please upload data in xls format only');
							this.getView().setBusyIndicatorDelay(0).setBusy(false);
							return;
						}
						var jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
						this.getView().getModel('idUploadDataModel').setProperty('/uploadedFileSheets', wb.Workbook.Sheets);
						this.getView().getModel('idUploadDataModel').setProperty('/workbook', wb);
						this.getView().getModel('idUploadDataModel').setProperty('/currentSheetData', jsonData);
						this.getView().getModel('idUploadDataModel').setProperty('/uploadedRawDataQuality', new RawDataValidator(jsonData).validateData());

						this.getView().byId('idSelectSheetUploadData').setVisible(true);
						this.getView().byId('rawDataQualityHeader').setVisible(true);
						this.openTableViewer();
						this.getView().setBusy(false);
					}.bind(this);
					reader.readAsBinaryString(input.files[0]);
				}.bind(this), 100);
			}.bind(this));
		},
		arrayToJson: function (a) {
			var o = [];
			a.forEach(function (e) {
				o.push({
					"name": e
				});
			});
			return o;
		},
		onSheetSelectionChange: function (oEvent) {
			var selectedKey = oEvent.getParameter('selectedItem').getKey();
			var oModel = this.getView().getModel('idUploadDataModel');
			var wb = oModel.getProperty('/workbook', wb);
			var jsonData = XLSX.utils.sheet_to_json(wb.Sheets[selectedKey]);
			this.getView().getModel('idUploadDataModel').setProperty('/currentSheetData', jsonData);
			this.getView().getModel('idUploadDataModel').setProperty('/uploadedRawDataQuality', new RawDataValidator(jsonData).validateData());
			this.openTableViewer();

		},
		openTableViewer: function () {
			if (sap.ui.getCore().byId('idUploadDataPreview') !== undefined) {
				sap.ui.getCore().byId('idUploadDataPreview').destroy();
			}
			var oTable = new JSONToTable('idUploadDataPreview', this.getView().getModel('idUploadDataModel').getProperty('/currentSheetData'),true);
			this.getView().byId('idUploadExcelData').addContent(oTable.getTable());
		},
		navToDataUploadMapping: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// map data to global model
			this.getView().getModel().setProperty('/UploadedData',this.getView().getModel('idUploadDataModel').getData());
			oRouter.navTo("DataUploadMapping");
		},
	});
});