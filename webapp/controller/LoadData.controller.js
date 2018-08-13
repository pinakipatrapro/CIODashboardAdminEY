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
	return Controller.extend("pinaki.ey.CIO.CIOControlPanel.controller.LoadData", {
		
		loadData : function(oEvent){
			var that = this;
			var targets = oEvent.getSource().data("targets");
			targets = targets.replace('*','&');
			that.getView().setBusy(true);
			$.ajax({
				url: "/eyhcp/CIO/Dashboard/Scripts/DataFlower.xsjs?"+ targets,
				cache: false,
				success: function (data) {
					sap.m.MessageToast.show('Successfully loaded the data')
					that.getView().setBusy(false);
				}
			});
		}		
	});
});