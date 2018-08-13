sap.ui.define([
	"sap/m/Panel"
], function (Panel) {
	"use strict";

	var PanelExtension = Panel.extend("pinaki.ey.CIO.CIOControlPanel.extensions.PanelExtension", {
		metadata: {
			properties: {
				title: {
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

	PanelExtension.prototype.init = function () {
		Panel.prototype.init.apply(this, arguments);

	};
	PanelExtension.prototype.createList = function (path, property) {
		var oList = new sap.m.List({
			growing: true,
			growingThreshold: 10,
			mode: "Delete",
			items: {
				path: path,
				template: new sap.m.CustomListItem({
					content: [
						new sap.m.Input({
							value: "{" + property + "}"
						})
					]
				})
			},
			delete: function (oEvent) {
				var modelValues = this.getModel().getProperty(this.getPath());
				var mmodelPath = oEvent.getParameter('listItem').getBindingContext().sPath;
				var index = parseInt(mmodelPath.substring(mmodelPath.lastIndexOf('/') + 1), 0);
				modelValues.splice(index, 1);
				this.getModel().setProperty(this.getPath(),modelValues);
			}.bind(this)
		});
		var oHeaderToolbar = new sap.m.OverflowToolbar({
			content: [
				new sap.m.ToolbarSpacer(),
				new sap.m.Button({
					icon: "sap-icon://add",
					text: "Add",
					press: [this.addItemToList, this]
				}),
				new sap.m.Button({
					icon: "sap-icon://request",
					text: "Multi Edit",
					press: [this.openCSVDialog, this]
				})
			]
		});
		oList.setHeaderToolbar(oHeaderToolbar);
		return oList;
	};
	PanelExtension.prototype.openCSVDialog = function () {
		var oDialog = new sap.m.Dialog({
			afterOpen: function (oEvent) {
				var modelValues = this.getModel().getProperty(this.getPath());
				var aValues = [];
				modelValues.forEach(function (e) {
					aValues.push(e.name);
				});
				oEvent.getSource().getContent()[0].setValue(aValues.join('\n'));
			}.bind(this),
			afterClose: function (oEvent) {
				var textValues = oEvent.getSource().getContent()[0].getValue().split(/\n/);
				var aValues = [];
				textValues.forEach(function (e) {
					aValues.push({
						name: e
					});
				});
				this.getModel().setProperty(this.getPath(), aValues);
			}.bind(this),
			title: "CSV Editor",
			content: [
				new sap.m.TextArea({
					placeholder: 'Value 1\nValue2\nvalue3',
					cols: 50,
					rows: 30
				})
			],
			buttons: [new sap.m.Button({
				text: "Ok",
				press: function (oEvent) {
					oEvent.getSource().getParent().close();
				}
			})]
		});
		oDialog.open();
	};
	PanelExtension.prototype.getList = function () {
		return this.getContent()[0];
	};
	PanelExtension.prototype.addItemToList = function () {
		var aPath = this.getModel().getProperty(this.getPath());
		aPath.push({
			name: ""
		});
		this.getModel().setProperty(this.getPath(), aPath);
	};
	PanelExtension.prototype.onBeforeRendering = function () {
		Panel.prototype.onAfterRendering.apply(this, arguments);
		this.setHeaderText(this.getTitle());
		if(this.getContent().length < 1){
			this.addContent(this.createList(this.getPath(), this.getModelProperty()));
		}
	};

	return PanelExtension;
});