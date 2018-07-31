sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/base/Object"
], function (Table,Column,BaseObject) {
	"use strict";

	var tableConstructor = function (id, data) {
		this._table = new Table(id,{
			rows:"{/tableData}",
			threshold:99999,
			showColumnVisibilityMenu:true,
			alternateRowColors:true,
			visibleRowCount:20,
			enableColumnFreeze:true,
			enableCellFilter:true,
			toolbar : new sap.m.Toolbar({
				content : [
					new sap.m.Label({
						text : 'Data from uploaded sheet',
						design : 'Bold' 
					}),
					new sap.m.ToolbarSpacer(),
					new sap.m.Button({
						icon : 'sap-icon://add'
					})	
				]
			})
		});
		this._getObjectKeys = function(data){
			return Object.keys(data[0]);
		};
		this._localModel =  new sap.ui.model.json.JSONModel({tableData:data});
		
		this.getTable = function(){
			this._table.addStyleClass('sapUiSizeCompact');
			this._table.setModel(this._localModel);
			this._table.removeAllColumns();
			var aKey = Object.keys(this._localModel.getProperty('/tableData')[0]);
			aKey.forEach(function (e) {
				var input = new sap.m.Input({
					value: "{" + e + "}"
				});
				var column = new Column({
					label: new sap.m.Label({
						text: e
					}),
					sortProperty: e,
					filterProperty: e,
					showFilterMenuEntry: true,
					showSortMenuEntry: true,
					template: input
				});
				this._table.addColumn(column);
			}.bind(this));
			return this._table;
		};                  
		
	};

	var oTable = BaseObject.extend("pinaki.ey.CIO.CIOControlPanel.api.JSONToTable", {
		constructor: tableConstructor
	});
	return oTable;
});