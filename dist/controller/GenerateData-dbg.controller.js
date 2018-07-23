sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/Column"
], function (Controller, tableColumn) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.CIOControlPanel.controller.GenerateData", {
		onBeforeRendering: function () {
			this.setModelData();
			this.readData();
			this.readStatus();
		},
		setModelData: function () {
			var oModel = this.getView().getModel();
			oModel.setData({
				generateData: {
					clearAndRegenerate: true,
					noOfRecords: "100",
					datasetName: 'Data set Name',
					datasetDescription: 'Data set Description',
					advancedSettings: {
						costCenter: [],
						userNames: [],
						costPool: [],
						productName: [],
						uom: [],
						companyName: [],
						projectName: [],
						projectCategory: [],
						projectFundType: [],
						projBudgetCurrency: [],
						wbs: [],
						wbsProjName: [],
						wbsExpenseType: []
					},
					weightage: {
						costCentVglAcc: []
					}
				},
				status: {}
			}, true);
		},
		generateDataPrompt: function () {
			var oDialog = new sap.m.Dialog({
				title: "Data Generation Name",
				content: [
					new sap.m.VBox({
						alignItems: "Center",
						items: [
							new sap.m.Input({
								width: "30rem",
								value: "{/generateData/datasetName}"
							}),
							new sap.m.TextArea({
								value: "{/generateData/datasetDescription}",
								cols: 60,
								rows: 4
							}),
						]
					})
				],
				buttons: [
					new sap.m.Button({
						text: "Cancel",
						press: function (oEvent) {
							oEvent.getSource().getParent().close();
						}
					}),
					new sap.m.Button({
						text: "Generate",
						type: "Emphasized",
						press: function (oEvent) {
							oEvent.getSource().getParent().close();
							this.generateData();
						}.bind(this)
					})
				]
			});
			oDialog.setModel(this.getView().getModel());
			oDialog.open();
		},
		generateData: function () {
			var that = this;
			var data = that.getView().getModel().getData().generateData;
			that.getView().setBusy(true);
			$.ajax({
				url: "/eyhcp/Pinaki/RandomDataGenerator/Scripts/generateData.xsjs?mode=generateWithInput",
				method: "POST",
				data: JSON.stringify(data).replace(/%/g, 'X*PERC*X'),
				success: function (response) {
					that.getView().setBusy(false);
					that.getView().getModel().setData({
						generationResult: JSON.parse(response)
					}, true);
					that.openSuccessDialog(that.getView().getModel());
				},
				error: function (error, response) {
					that.getView().setBusy(false);
					if (error.responseText.indexOf('cannot insert NULL or update to NULL') > 0) {
						that.generateData();
					}
				}
			});
		},
		readData: function () {
			var that = this;
			$.ajax({
				url: "/eyhcp/Pinaki/RandomDataGenerator/Scripts/generateData.xsjs?mode=readMasterData",
				cache: false,
				success: function (data) {
					var responseData = JSON.parse(data).data;
					that.getView().getModel().setProperty('/generateData/advancedSettings/costCenter', responseData.costCenteres);
					that.getView().getModel().setProperty('/generateData/advancedSettings/userNames', responseData.userNames);
					that.getView().getModel().setProperty('/generateData/advancedSettings/costPool', responseData.costPoolName);
					that.getView().getModel().setProperty('/generateData/advancedSettings/productName', responseData.productName);
					that.getView().getModel().setProperty('/generateData/advancedSettings/uom', responseData.uom);
					that.getView().getModel().setProperty('/generateData/advancedSettings/projectName', responseData.projectName);
					that.getView().getModel().setProperty('/generateData/advancedSettings/companyName', responseData.companyName);
					that.getView().getModel().setProperty('/generateData/advancedSettings/projectCategory', responseData.projectCategory);
					that.getView().getModel().setProperty('/generateData/advancedSettings/projectFundType', responseData.projectFundType);
					that.getView().getModel().setProperty('/generateData/advancedSettings/projBudgetCurrency', responseData.projBudgetCurrency);
					that.getView().getModel().setProperty('/generateData/advancedSettings/wbs', responseData.wbs);
					that.getView().getModel().setProperty('/generateData/advancedSettings/wbsProjName', responseData.wbsProjName);
					that.getView().getModel().setProperty('/generateData/advancedSettings/wbsExpenseType', responseData.wbsExpenseType);
					that.getView().getModel().setProperty('/generateData/noOfRecords', responseData.noOfRecords);
				}
			});
		},
		readStatus: function () {
			var that = this;
			that.getView().setBusy(true);
			$.ajax({
				url: "/eyhcp/Pinaki/RandomDataGenerator/Scripts/generateData.xsjs?mode=status",
				cache: false,
				success: function (data) {
					var responseData = JSON.parse(data);
					that.getView().getModel().setProperty('/status', responseData);
					that.getView().setBusy(false);
				}
			});
		},
		openSuccessDialog: function (model) {
			var oDialog = new sap.m.Dialog({
				afterClose: function () {
					this.destroy();
				},
				title: "{/generationResult/text}",
				content: [
					new sap.m.List({
						items: {
							path: "/generationResult/messages",
							template: new sap.m.StandardListItem({
								title: "{text}",
								icon: "sap-icon://accept"
							})
						}
					})
				],
				buttons: [
					new sap.m.Button({
						text: "Ok",
						press: function (oEvent) {
							oEvent.getSource().getParent().close();
						}
					})
				]
			});
			oDialog.setModel(model);
			oDialog.open();
		},
		navToDisplayTable: function (oEvent) {
			var tableName = oEvent.getSource().getBindingContext().getProperty("tableName");
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "cioadmin",
					action: "Display&/tableViewer/" + btoa(tableName)
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			}); // navigate to Supplier application
		},
		openVersionSelector: function () {
			var that = this;
			var oSelectDialog = new sap.m.SelectDialog({
				title: "Select available versions",
				// search : function(){
				// 	oEvent	
				// },
				confirm: function (oEvent) {
					var id = oEvent.getParameter('selectedItem').getBindingContext().getProperty("ID");
					that.loadSavedDataset(id);
				},
				items: {
					path: "/DataGenLog?$orderby=ID",
					template: new sap.m.FeedListItem({
						text: "{DESCRIPTION}",
						timestamp: "{TIMESTAMP}",
						sender: "{NAME}",
						info: "Data Size : {DATA_LENGTH} (Chars)"
					})
				}
			});
			oSelectDialog.setModel(this.getView().getModel('viewModel'));
			oSelectDialog.open();
		},
		loadSavedDataset: function (id) {
			var that = this;
			that.getView().setBusy(true);
			$.ajax({
				url: "/eyhcp/Pinaki/RandomDataGenerator/Scripts/getLogFromId.xsjs?id=" + id,
				cache: false,
				success: function (data) {
					var responseData = JSON.parse(data);
					that.getView().getModel().setProperty('/generateData', responseData);
					that.getView().setBusy(false);
				}
			});
		},
		fetchWeightageData: function () {
			var that = this;
			that.getView().setBusy(true);
			$.ajax({
				url: "/eyhcp/Pinaki/RandomDataGenerator/Scripts/weightageDataRead.xsjs",
				cache: false,
				success: function (data) {
					that.getView().setBusy(false);
					that.generateWeightageAllocTable(data);
				}
			});
		},
		generateWeightageAllocTable: function (data) {
			var costCenteres = data.distinctCC;
			var glAccounts = data.distinctGlAcc;
			var aMappings = [];
			for (var i = 0; i < costCenteres.length; i++) {
				var currObj = {
					"Cost Center": costCenteres[i].CostCenterName
				};
				for (var j = 0; j < glAccounts.length; j++) {
					currObj[glAccounts[j].GLAccountName] = {
						value: 100 / glAccounts.length,
						state: "None",
						stateText: ""
					};
				}
				currObj["Sum"] = 100;
				aMappings.push(currObj);
			}
			var masterColumn = ["Cost Center", "Sum"];
			var masterColumnWidth = ["20rem", "4rem"];
			this.getView().getModel().setProperty('/generateData/weightage/costCentVglAcc', aMappings);
			var objKeys = [];
			for (var k in aMappings[0]) objKeys.push(k);
			this.createTableColumns(objKeys, masterColumn, masterColumnWidth);
		},
		createTableColumns: function (objKeys, masterColumn, masterColumnWidth) {
			var that = this;
			var table = this.getView().byId('idWeitageCostCvCostAcc');
			table.removeAllColumns();
			objKeys.forEach(function (e) {
				if (masterColumn.indexOf(e) > -1) {
					var input = new sap.m.Label({
						text: "{" + e + "}",
						design : "Bold"
					});
					var column = new tableColumn({
						label: new sap.m.Label({
							text: e,
							design : "Bold"
						}),
						width: masterColumnWidth[masterColumn.indexOf(e)],
						template: input
					});
				} else {
					input = new sap.m.Input({
						value: "{" + e + "/value}",
						valueState: "{" + e + "/state}",
						valueStateText: "{" + e + "/stateText}",
						liveChange: function () {
							setTimeout(function () {
								that.validateWeightage();
							}, 1000);
						}
					});
					column = new tableColumn({
						label: new sap.m.Label({
							text: e,
							design : "Bold"
						}),
						template: input
					});
				}
				table.addColumn(column);
			});
		},
		validateWeightage: function () {
			//Validate Data
			var isValid = 'X';
			var oModel = this.getView().getModel();
			var oWeightage = oModel.getData().generateData.weightage.costCentVglAcc;
			for (var i = 0; i < oWeightage.length; i++) {
				var total = 0;
				for (var key in oWeightage[i]) {
					if (oWeightage[i][key].value) {
						oModel.setProperty("/generateData/weightage/costCentVglAcc/" + i + "/" + key + "/state", "None");
						var value = parseFloat(oWeightage[i][key].value);
						total = total + value;
						oModel.setProperty("/generateData/weightage/costCentVglAcc/" + i + "/" + "Sum", total);
						if (isNaN(total)) {
							isValid = "E";
							oModel.setProperty("/generateData/weightage/costCentVglAcc/" + i + "/" + key + "/state", "Error");
							oModel.setProperty("/generateData/weightage/costCentVglAcc/" + i + "/" + key + "/state", "Not a valid Number");
							break;
						} else if (total > 100) {
							isValid = "E";
							oModel.setProperty("/generateData/weightage/costCentVglAcc/" + i + "/" + key + "/state", "Error");
							oModel.setProperty("/generateData/weightage/costCentVglAcc/" + i + "/" + key + "/stateText", "Sum of weightage exceeds 100");
							break;
						}
					}
				}
				if (total !== 100 && isValid == 'X') {
					sap.m.MessageToast.show("Sum of weightage does not equals 100");
					oModel.setProperty("/generateData/weightage/costCentVglAcc/" + i + "/" + "Sum", total);
				}
			};
			return isValid;
		}
	});
});