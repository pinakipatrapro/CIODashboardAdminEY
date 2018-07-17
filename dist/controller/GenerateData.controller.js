sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
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
					}
				},
				status: {}
			}, true);
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
					action: "Display"
				},
				params: {
					"tableName": tableName
				}
			})) || ""; // generate the Hash to display a Supplier
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			}); // navigate to Supplier application

		}
	});
});