sap.ui.define([
	"sap/m/Panel"
], function (Panel) {
	"use strict";

	var InfoHelper = Panel.extend("pinaki.ey.CIO.CIOControlPanel.extensions.InfoHelper", {
		metadata: {
			properties: {
				text: {
					type: "string"
				}, 
				path: {
					type: "string"
				},
				modelProperty: {
					type: "string"
				}
			}
		}
	});

	InfoHelper.prototype.init = function () {
		Panel.prototype.init.apply(this, arguments);
	};
	InfoHelper.prototype.onBeforeRendering = function () { 
		// this.addContent(new sap.m.Text({text  : this.getText()}));
		this.setExpandable(true);
		this._getIcon().setTooltip('Click to view help');
		this.attachExpand(function(oEvent){
			
			var control = oEvent.getSource();
			
			if(control.getContent().length<1){
				control.addContent(new sap.m.Text({text  : this.getText()}));
			}
			
			if(control.getExpanded()){
				control.addStyleClass("infoHelper");
				setTimeout(function(){control._getIcon().setSrc("sap-icon://decline")});
			}else{
				control.removeAllContent();
				control.removeStyleClass("infoHelper");
				control._getIcon().setSrc("sap-icon://lightbulb");
			}
		});
	};
	InfoHelper.prototype.onAfterRendering = function (oEvent) { 
		$("#"+this.getId()+'-header').parent().addClass('noBorder');
		if(this ._getIcon().getSrc() != "sap-icon://decline")this ._getIcon().setSrc("sap-icon://lightbulb");
	};
	return InfoHelper;
});