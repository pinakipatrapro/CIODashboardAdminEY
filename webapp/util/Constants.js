sap.ui.define([], function () {
	"use strict";
	var warningInfo = "Changes made to this table will be directly reflecting in the Dashboard / Allocation app \n even without using the Load Data functionality.";
	return {
		tableList: [
        {
            "name": "KPI",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::KPI"'
        },
        {
            "name": "IT Vendors",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::ITVendors"'
        },
        {
            "name": "Initiatives",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::Initiative"'
        },
        {
            "name": "Creditor Account",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::CreditorAccount"'
        },
        {
            "name": "Purchase Order",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::PurchaseOrder"'
        },
        {
            "name": "Reporting Unit",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::ReportingUnit"'
        },
        {
            "name": "Project",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::Project"'
        },
        {
            "name": "WBS",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::WBS"'
        },
        {
            "name": "Invoice Document",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::InvoiceDocument"'
        },
        {
            "name": "Actual Cost Accounting",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::ActualCostAccounting"'
        },
        {
            "name": "Cost Pool",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::CostPool"'
        },
        {
            "name": "Cost Center",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::CostCenter"'
        },
        {
            "name": "Chart Of Accounts",
            "tableName": '"CIO"."CIO.DataUploader.DB.Tables::ChartOfAccounts"'
        },
        //Directly Upload to Dashboard Tables
        {
            "name": "IT Services - Master Data",
            "tableName": '"CIO"."CIO.Dashboard.DB.Tables::ITServices"',
            "WarningInfo":warningInfo
        },
        {
            "name": "Business Services - Master Data",
            "tableName": '"CIO"."CIO.Dashboard.DB.Tables::BusinessServices"',
            "WarningInfo":warningInfo
        },
        {
            "name": "Business - Master Data",
            "tableName": '"CIO"."CIO.Dashboard.DB.Tables::Business"',
            "WarningInfo":warningInfo
        }
    ]
	};

});