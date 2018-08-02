sap.ui.define([], function () {
	"use strict";
	return {
		tableList: [{
			name: "Cost Center",
			tableName: '"PINAKIP"."analyticscloud.db.CIO::CostCenter"'
		}, {
			name: "Cost Pool",
			tableName: '"PINAKIP"."analyticscloud.db.CIO::CostPool"'
		},
		{
			name : "Purchase Orders",
			tableName : '"PINAKIP"."analyticscloud.db.CIO::PurchaseOrders"'
		}]
	};

});