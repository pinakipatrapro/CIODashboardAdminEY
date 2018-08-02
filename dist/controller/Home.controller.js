sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("pinaki.ey.CIO.CIOControlPanel.controller.Home", {
		navToGenerateData: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("GenerateData");
		},
		navToDataUpload: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("DataUpload");
		},
		chlidItemPress: function (oEvent) {
			var source = oEvent.getSource();
			source.getParent().fireEvent('select');
			var app = this.getView().byId('idToolPageApp');
			var navControlId = source.data("idControl");
			var attachedAfterNavigate = function (e) {
				app.detachAfterNavigate(attachedAfterNavigate);
				var currentPage = app.getCurrentPage().getContent()[0];
				try {
					currentPage.scrollToElement(currentPage.getParent().byId(navControlId));
				} catch (err) {
					jQuery.sap.log.info(err);
				}
			}.bind(this);
			attachedAfterNavigate();
			app.attachAfterNavigate(attachedAfterNavigate);
		},
		toggleSidebar : function(oEvent){
			var toolPage = oEvent.getSource().getParent().getParent().getParent();
			toolPage.setSideExpanded(! toolPage.getSideExpanded());
		}
	});
});