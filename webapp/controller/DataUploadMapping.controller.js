sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"pinaki/ey/CIO/CIOControlPanel/api/JSONToTable",
	"pinaki/ey/CIO/CIOControlPanel/api/MappingValidator"
], function (Controller, MessageBox, JSONToTable, MappingValidator) {
	"use strict";
	return Controller.extend("pinaki.ey.CIO.CIOControlPanel.controller.DataUploadMapping", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("DataUploadMapping").attachPatternMatched(this._onRouteMatched, this);
		},
		navToExcelUpload: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("DataUpload");
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
						color: '#1de202',
						press: [this.openTransformationDialog, this]
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
			this.createDateTransformationLogic();
		},
		validateMappings: function () {
			var columns = this.getView().getModel().getProperty('/dbColumns');
			var mappingData = this.getView().getModel().getProperty('/mappingsPreviewTable')
			var validator = new MappingValidator(mappingData, columns);
			var validationMessages = validator.validateData();
			this.getView().getModel().setProperty('/uploadValidationMessages', validationMessages);
			if (validationMessages.length > 0) {
				this.openPopOverMessage();
			}
		},
		openTransformationDialog: function (oEvent) {
			var sourceObject = oEvent.getSource().getBindingContext().getObject();
			var dialog = new sap.m.Dialog({
				title: 'Create transformation logic',
				content: [
					new sap.m.MessageStrip({
						text: 'Transformation actions are not reversible. To change the data, please re-upload the data files',
						type: 'Warning'
					}),
					new sap.m.InputListItem({
						label: "Date format in sheets",
						content: new sap.m.Input({
							placeholder: 'Ex. yyy-mm-dd'
						})
					})
				],
				buttons: [
					new sap.m.Button({
						text: 'Ok',
						press: function (oEvent) {
							var dateFormat = oEvent.getSource().getParent().getContent()[1].getContent()[0].getValue();
							if (dateFormat.length > 0) {
								sourceObject['dateTransformationFormat'] = dateFormat;
							}
							oEvent.getSource().getParent().close();
							this.createDateTransformationLogic();
						}.bind(this)
					})
				]
			});
			dialog.open();
		},
		openPopOverMessage: function () {
			var messageAnchor = this.getView().byId('idMessageButton');
			var messageView = new sap.m.MessageView({
				groupItems: true,
				items: {
					path: '/uploadValidationMessages',
					template: new sap.m.MessageItem({
						title: '{description}',
						description: '{text}',
						type: '{state}',
						groupName: '{group}'
					})
				}
			});
			messageView.setModel(this.getView().getModel());
			var popover = new sap.m.Popover({
				placement: 'Top',
				resizable: true,
				title: 'Data Errors',
				content: messageView
			});

			popover.openBy(messageAnchor);
		},
		createDateTransformationLogic: function () {
			var aMappings = this.getView().getModel().getProperty('/mappedColumns');
			var data = this.getView().getModel().getProperty('/mappingsPreviewTable');
			for (var i = 0; i < aMappings.length; i++) {
				if (aMappings[i].dateTransformationFormat) {
					if (aMappings[i].dateTransformationFormat.length > 0) {
						var dateFormat = aMappings[i].dateTransformationFormat;
						if (dateFormat.indexOf('/') > 0) {
							var aDateElements = dateFormat.split('/');
						} else {
							var aDateElements = dateFormat.split('-');
						}
						data.forEach(function (e) {
							var inDate = e[aMappings[i].from];
							if (inDate.indexOf('/') > 0) {
								var aInDate = inDate.split('/');
							} else {
								var aInDate = inDate.split('-');
							}
							if (aInDate.length > 2) {
								for (var j = 0; j < aInDate.length; j++) {
									if (aDateElements[j].indexOf('y') > -1) {
										var y = aInDate[j].toLocaleLowerCase().padStart(4, "20");
									} else if (aDateElements[j].indexOf('m') > -1) {
										var m = aInDate[j].toLocaleLowerCase().padStart(2, "0");
									} else if (aDateElements[j].indexOf('d') > -1) {
										var d = aInDate[j].toLocaleLowerCase().padStart(2, "0");
									}
								}
								e[aMappings[i].from] = y + m + d;
							}
						})
					}
				}
			}

		}

	});
});