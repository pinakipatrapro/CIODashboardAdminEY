sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"pinaki/ey/CIO/CIOControlPanel/api/JSONToTable",
	"pinaki/ey/CIO/CIOControlPanel/api/MappingValidator"
], function (Controller, MessageBox, JSONToTable,MappingValidator) {
	"use strict";
	return Controller.extend("pinaki.ey.CIO.CIOControlPanel.controller.DataUploadMapping", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DataUploadMapping").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			var isValidContext = ' ';
			if (!!this.getView().getModel().getData().UploadedData) {
				if (!!this.getView().getModel().getData().UploadedData.currentSheetData)
					isValidContext = 'X';
			}
			if (isValidContext == ' ') {
				setTimeout(function () {
					MessageBox.error('Please upload excel data first', {
						onClose: function (oAction) {
							var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
							oRouter.navTo("DataUpload");
						}.bind(this)
					});
				}.bind(this), 1000);
			} else {
				this.clearData();
				this.getView().getModel().setProperty('/UploadedTableData', this.getView().getModel().getData().UploadedData.currentSheetData);
				this.setDBTableColumns();
				this.setExcelTableColumns(this.getView().getModel().getProperty('/UploadedTableData')[0]);
				this.filterList();
			}
		},
		clearData: function () {
			this.getView().getModel().setProperty('/dbColumns', null);
			this.getView().getModel().setProperty('/uploadedExcelColumns', null);
			this.getView().getModel().setProperty('/mappedColumns', null);
			this.getView().getModel().setProperty('/UploadedTableData', null);
		},
		setExcelTableColumns: function (obj) {
			var aKeys = [];
			Object.keys(obj).forEach(function (e) {
				aKeys.push({
					name: e
				});
			});
			this.getView().getModel().setProperty('/uploadedExcelColumns', aKeys);
		},
		setDBTableColumns: function () {
			var oModel = this.getView().getModel('viewModel');
			oModel.read('/TableColumns', {
				filters: [new sap.ui.model.Filter("TableName", sap.ui.model.FilterOperator.EQ, this.getView().getModel().getProperty(
					'/UploadedData/selectedTable'))],
				success: function (data) {
					this.getView().getModel().setProperty('/dbColumns', data.results);
					this.createInitialPreviewTable(data.results);
				}.bind(this)
			});
		},
		filterList: function () {
			var list = this.getView().byId('idTableColumnList');
			var uploadList = this.getView().byId('idUploadedDataColumns');
			var mappingList = this.getView().byId('idTableMappingList');

			list.bindAggregation("items", {
				path: '/dbColumns',
				sorter: {
					path: 'POSITION'
				},
				template: this.creatStandardListItem('COLUMN_NAME', 'DATA_TYPE_NAME')
			});

			uploadList.bindAggregation("items", {
				path: '/uploadedExcelColumns',
				sorter: {
					path: 'POSITION'
				},
				template: this.creatStandardListItem('name', '')
			});
			mappingList.bindAggregation("items", {
				path: '/mappedColumns',
				template: this.createCustomListItem('from', 'to')
			});
		},
		creatStandardListItem: function (title, info) {
			var customListItem = new sap.m.StandardListItem({
				title: '{' + title + '}',
				info: info.length > 0 ? '{' + info + '}' : ''
			});
			return customListItem;
		},
		createCustomListItem: function (title, info) {
			var customListItem = new sap.m.CustomListItem({
				content: [
					new sap.ui.core.Icon({
						src: "sap-icon://syntax",
						color : '#1de202',
						press : [this.openTransformationDialog,this]
					}).addStyleClass('sapUiTinyMarginBeginEnd'),
					new sap.m.Label({
						text: '{from}'
					}).addStyleClass('sapUiTinyMarginBeginEnd'),
					new sap.ui.core.Icon({
						src: 'sap-icon://arrow-right'
					}).addStyleClass('sapUiTinyMarginBeginEnd'),
					new sap.m.Label({
						text: '{to}'
					}).addStyleClass('sapUiTinyMarginBeginEnd')
				]
			});
			return customListItem;
		},
		onDroppedMapping: function (oEvent) {
			var draggedControl = oEvent.getParameter('draggedControl');
			var droppedControl = oEvent.getParameter('droppedControl');

			draggedControl.setVisible(false);
			droppedControl.setVisible(false);

			var draged = draggedControl.getProperty('title');
			var dropped = droppedControl.getProperty('title');

			var aExistingMappings = [];

			if (this.getView().getModel().getProperty('/mappedColumns')) {
				aExistingMappings = this.getView().getModel().getProperty('/mappedColumns');
			}
			aExistingMappings.push({
				from: draged,
				to: dropped,
				fromControl: draggedControl,
				toControl: droppedControl
			});
			this.getView().getModel().setProperty('/mappedColumns', aExistingMappings);
			this.onMappingUpdate();
		},
		onMappingsDeleted: function (oEvent) {
			oEvent.getParameter('listItem').getBindingContext().getProperty('toControl').setVisible(true);
			oEvent.getParameter('listItem').getBindingContext().getProperty('fromControl').setVisible(true);
			var bindingPath = oEvent.getParameter('listItem').getBindingContext().sPath;
			var index = bindingPath[bindingPath.length - 1];
			//Clear Mapping Columns
			var aExistingMappings = [];

			if (this.getView().getModel().getProperty('/mappedColumns')) {
				aExistingMappings = this.getView().getModel().getProperty('/mappedColumns');
			}
			aExistingMappings.splice(index, 1);
			this.getView().getModel().setProperty('/mappedColumns', aExistingMappings);
			this.onMappingUpdate();
		},
		createInitialPreviewTable: function (columns) {
			var previewTable = [];
			var tableRow = {};
			columns.forEach(function (e) {
				tableRow[e.COLUMN_NAME] = '';
			});
			previewTable.push(tableRow);
			if (sap.ui.getCore().byId('idMappedDataPreview') !== undefined) {
				sap.ui.getCore().byId('idMappedDataPreview').destroy();
			}
			var oTable = new JSONToTable('idMappedDataPreview', previewTable);
			this.getView().byId('idDataPreviewTable').addContent(oTable.getTable());
			this.getView().getModel().setProperty('/mappingsPreviewTable', previewTable);
		},
		onMappingUpdate: function () {

			var mappings = this.getView().getModel().getProperty('/mappedColumns');
			var sourceData = this.getView().getModel().getProperty('/UploadedData/currentSheetData');
			var aPreviewTableData = this.getView().getModel().getProperty('/mappingsPreviewTable');
			var oPreviewTableData = aPreviewTableData[0];
			Object.keys(oPreviewTableData).forEach(v => oPreviewTableData[v] = '') 
			var oPreviewTableDataCopy = oPreviewTableData;
			aPreviewTableData = [];

			sourceData.forEach(function (e) {
				oPreviewTableDataCopy = $.extend({}, oPreviewTableData);
				for (var i = 0; i < mappings.length; i++) {
					oPreviewTableDataCopy[mappings[i].from] = e[mappings[i].to];
				}
				aPreviewTableData.push(oPreviewTableDataCopy);
			});
			if (mappings.length < 0) {
				this.createInitialPreviewTable(this.getView().getModel().getProperty('/dbColumns'))
			} else {
				if (sap.ui.getCore().byId('idMappedDataPreview') !== undefined) {
					sap.ui.getCore().byId('idMappedDataPreview').destroy();
				}
				var oTable = new JSONToTable('idMappedDataPreview', aPreviewTableData);
				this.getView().byId('idDataPreviewTable').addContent(oTable.getTable());
			}
			this.getView().getModel().setProperty('/mappingsPreviewTable', aPreviewTableData);
		},
		validateMappings : function(){
			var columns = this.getView().getModel().getProperty('/dbColumns');
			var mappingData = this.getView().getModel().getProperty('/mappingsPreviewTable')
			var validator = new MappingValidator(mappingData,columns);
			validator.validateData();
		},
		openTransformationDialog : function(){
			var dialog = new sap.m.Dialog({
				title : 'Create transformation logic',
				content : [
					new sap.m.TextArea({
						cols : 100,
						rows : 20
					})
				],
				buttons : [
					new sap.m.Button({
						text : 'Ok',
						press : function(oEvent){
							oEvent.getSource().getParent().close();
						}
					})
					]
			});
			var messages = dialog.open();
		}

	});
});