sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast) {
        "use strict";

        return Controller.extend("testprj.controller.test", {
            onInit: function () {
            },
            onGo: function () {
                const filterbar = this.byId("SmartfilterBar");
                this.getOwnerComponent().getRouter().navTo('MaterialTable');
            },
            onFilterChange: function (oEvent) {
                console.log(oEvent);
                let oModel = this.getView().getModel("oMaterialModel");
                var oTable = this.byId("SmartTable");
                var oFilterData = oEvent.getSource().getFilterData();
                var aFilters = [];

                for (var sKey in oFilterData) {
                    if (oFilterData.hasOwnProperty(sKey)) {
                        var sValue = oFilterData[sKey];
                        if (sValue) {
                            if (sValue.items.length > 0) {

                                for (let i = 0; i < sValue.items.length; i++) {

                                    aFilters.push(new sap.ui.model.Filter(sKey, "EQ", sValue.items[i].key));
                                }
                            } else {

                                for (let i = 0; i < sValue.ranges.length; i++) {

                                    aFilters.push(new sap.ui.model.Filter(sKey, sValue.ranges[i].operation, sValue.ranges[i].value1));
                                }
                            }
                        }
                    }
                }
                this.getOwnerComponent().getModel("FilterDataModel").setProperty("/FilterData", aFilters);
            }

        });
    });
