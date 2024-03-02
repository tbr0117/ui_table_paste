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

        return Controller.extend("testprj.controller.MaterialTable", {
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute('MaterialTable').attachPatternMatched(this._onRouteMatched, this);
                //BTNS MODELS
                const obtnsModel = new JSONModel();
                const obtns = {
                    Visible: false,
                    TableBusy: true
                };
                obtnsModel.setData(obtns);
                this.getView().setModel(obtnsModel, "oMaterialbtns");
                //EDITING MODELS
                const oMaterialDataModel = new JSONModel();
                const oMaterialInsertedModel = new JSONModel();
                const oData = {
                    "MaterialUpdatedTable": [],
                    "MaterialInsertedTable": [],
                    "MaterialDeletedTable": []
                };
                oMaterialDataModel.setData(oData);
                this.getView().setModel(oMaterialDataModel, "oMaterialData");

                const oModel = this.getOwnerComponent().getModel();
                let oSmartTable = this.byId("SmartTable");
                let oTable = oSmartTable.getTable();
                // oTable.allowTextSelection(false);
                // oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowSelector)
                // oTable.setSelectionMode("MultiToggle");

                // oSmartTable.attachBeforeRebindTable(this.onBeforeRebindTable, this);

            },
            _onRouteMatched: function () {
                let oNewModel = new JSONModel();
                let oSmartTable = this.byId("SmartTable");
                oSmartTable.setEditable(false);
                this.onEditorDisplay();
                this.getView().setModel(oNewModel, "oMaterialModel");
                const oFilterModel = this.getOwnerComponent().getModel("FilterDataModel");
                // const oModel = this.getView().getModel("oMaterialbtns");
                // oModel.setData({
                //     Visible: false,
                //     TableBusy: true,
                // });

                const aFilters = oFilterModel.getProperty("/FilterData");
                this.onTableLoad();
                // this.getOwnerComponent().getModel("YVIS_AGGREMENT_RATES_SRV").read("/aggrement_ratesSet", { service 1
                // this.getOwnerComponent().getModel().read("/YC_VIS_AG_RATESS1", { service 2
                // this.getOwnerComponent().getModel().read("/AgRateUnManagedS3", { service 3
                this.getOwnerComponent().getModel().read("/YC_VIS_AG_RATES", {
                    filters: aFilters,
                    success: function (oData) {
                        const aData = oData.results;
                        aData.map((ofield) => {
                            ofield['updkz'] = "";
                        });
                        this.onCloseLoadings();
                        console.log(aData);
                        oNewModel.setData(aData);
                        this.tempArr = jQuery.extend(true, {}, aData);

                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                        this.onCloseLoadings();
                        // Handle error
                    }.bind(this)

                });

            },
            onTableLoad: function () {
                this.getOwnerComponent().getModel("FilterDataModel").setProperty("/MaterialBtns", {
                    "Page": false,
                    "Table": true,
                    "BtnEnable": false,
                });
            },
            onCloseLoadings: function () {


                this.getOwnerComponent().getModel("FilterDataModel").setProperty("/MaterialBtns", {
                    "Page": false,
                    "Table": false,
                    "BtnEnable": true,
                });
            },
            onBeforeRebindTable: function (oEvent) {
                // var oBindingParams = oEvent.getParameter("bindingParams");

                // var oFilters = [];
                // oFilters.push(new sap.ui.model.Filter("agreement", sap.ui.model.FilterOperator.EQ, "90000001"));
                // oBindingParams.filters(...oFilters)
                // oBindingParams.events.dataRequested = () => {
                //     // Setting entity path to get data with parameters.
                //     // Remove this statement if found solution to get data with parameters.
                //     let sEntityName = this.getEntityName();
                //     if (!!this.oDataUtil.isParameterized(sEntityName)) {
                //         oEvent.getSource().sPath = this.oDataUtil.getEntityPath(sEntityName, this.getParameters());
                //     }
                // };
            },
            onInitialise: function (oEvent) {
                var oTable = oEvent.getSource().getTable();
                var aColumns = oTable.getColumns();
                this.onTableLoad();

                for (var i = 0; i < aColumns.length; i++) {
                    var sPath = "oMaterialModel>" + aColumns[i].data("p13nData").columnKey;
                    if (sPath === "oMaterialModel>price") {
                        aColumns[i].getTemplate().getDisplay().getItems()[0].bindText(sPath);
                        aColumns[i].getTemplate().getDisplay().getItems()[1].bindText("oMaterialModel>priceunit");
                        aColumns[i].getTemplate().getEdit().bindValue(sPath);

                    }
                    else {
                        aColumns[i].getTemplate().getDisplay().bindText(sPath);
                        aColumns[i].getTemplate().getEdit().bindValue(sPath);

                        //commented code for disable the key inputs
                        // if (sPath === "oMaterialModel>agreement" || sPath === "oMaterialModel>customer" || sPath === "oMaterialModel>validto") {

                        //     aColumns[i].getTemplate().getEdit().setEditable(false);
                        // }
                        // aColumns[i].getTemplate().getDisplay().setEdit(true);
                        // aColumns[i].getTemplate().getEdit().setValueLiveUpdate("onFieldChange")
                        // aColumns[i].getTemplate().setEdit(false)
                    }
                }

                oTable.bindRows("oMaterialModel>/");
            },
            onAdd: function () {
                let oModel = this.getView().getModel("oMaterialModel");
                var oTable = this.byId("SmartTable");
                const oData = oModel.getData();
                let oNewRowData = {
                    agreement: "",
                    customer: "",
                    Product: "",
                    validto: "",
                    validfrom: "",
                    price: "10",
                    priceunit: "",
                    updkz: "I"
                };
                oModel.setData([...oData, oNewRowData]);
            },
            onDelete: function () {
                const oModel = this.getView().getModel("oMaterialData");
                const oMaterialModel = this.getView().getModel("oMaterialModel");
                const oModelData = oMaterialModel.oData;
                const oDeletedData = oModel.getProperty("/MaterialDeletedTable");
                const oTable = this.byId("SmartTable");
                const aSelectedIndices = oTable.getTable().getSelectedIndices();
                const aDeletedData = [];
                if (aSelectedIndices.length > 0) {

                    for (let i = aSelectedIndices.length - 1; i >= 0; i--) {
                        if (oModelData[aSelectedIndices[i]].updkz !== "I") {
                            oDeletedData.push(oModelData[aSelectedIndices[i]]);

                        }
                        oModelData.splice(aSelectedIndices[i], 1);
                    }

                    oModel.setProperty("/MaterialDeletedTable", oDeletedData);
                    oMaterialModel.setData(oModelData);

                    // const oChgedDeletedData = aData.filter(oData => oData.updkz !== "U");
                } else {
                    MessageToast.show("Selected a row to Delete", {
                        width: "75vw"
                    });
                }
            },
            onSave: function () {
                const oMainModel = this.getOwnerComponent().getModel();
                let oModel = this.getView().getModel("oMaterialModel");
                const oChangesModel = this.getView().getModel("oMaterialData");
                const oDeletedData = oChangesModel.getProperty("/MaterialDeletedTable");
                const oUpdatedData = oChangesModel.getProperty("/MaterialUpdatedTable");
                const oMaterialdata = oModel.oData;
                const oInsertedData = [];
                oMaterialdata.map((ofield) => {
                    delete ofield.__metadata;
                    if (ofield['updkz'] === "I") {
                        ofield.validfrom = new Date(ofield["validfrom"]);
                        ofield.validto = new Date(ofield["validto"]);
                        if (ofield['agreement'] !== "" && ofield['customer'] !== "" && ofield['validto'] !== "") {
                            oInsertedData.push(ofield);
                        }
                    }
                });
                if (oDeletedData.length > 0 || oUpdatedData.length > 0 || oInsertedData.length > 0) {


                    this.onTableLoad();

                    for (let i = 0; i < oInsertedData.length; i++) {
                        delete oInsertedData[i].updkz;
                        this.getOwnerComponent().getModel().create("/YC_VIS_AG_RATES", oInsertedData[i], {
                            method: "POST",
                            success: function (oSucess, omsg) {

                                oChangesModel.setProperty("/MaterialInsertedTable", []);

                                this._onRouteMatched();
                                MessageToast.show("Data Creation Successfully");
                            }.bind(this),
                            error: function (oError) {

                                this.onCloseLoadings();
                                oInsertedData[i]["updkz"] = "I";
                                console.log(oError);
                                MessageToast.show("Data Creation Failed");
                            }.bind(this)
                        });
                    }
                    for (let i = 0; i < oUpdatedData.length; i++) {
                        delete oUpdatedData[i].updkz;
                        const year = oUpdatedData[i]['validto'].getFullYear();
                        const month = String(oUpdatedData[i]['validto'].getMonth() + 1).padStart(2, '0');
                        const day = String(oUpdatedData[i]['validto'].getDate()).padStart(2, '0');
                        const hours = String(oUpdatedData[i]['validto'].getHours() + 1).padStart(2, '0');
                        const min = String(oUpdatedData[i]['validto'].getMinutes() + 1).padStart(2, '0');
                        const sec = String(oUpdatedData[i]['validto'].getSeconds() + 1).padStart(2, '0');
                        const time = year + "-" + month + "-" + day + "T00:00:00";
                        this.getOwnerComponent().getModel().update(`/YC_VIS_AG_RATES(agreement='${oUpdatedData[i].agreement}',customer='${oUpdatedData[i].customer}',Product='${oUpdatedData[i].Product}',validto=datetime'${URI.encodeQuery(time)}')`, oUpdatedData[i], {
                            method: "PUT",
                            success: function (oSucess, omsg) {
                                oChangesModel.setProperty("/MaterialUpdatedTable", []);

                                this._onRouteMatched();
                                MessageToast.show("Data Updation Successfully");
                            }.bind(this),
                            error: function (oError) {
                                this.onCloseLoadings();
                                oUpdatedData[i]["updkz"] = "U";
                                console.log(oError);
                                MessageToast.show("Data Updation Failed");
                            }.bind(this)
                        });
                    }
                    for (let i = 0; i < oDeletedData.length; i++) {
                        delete oDeletedData[i].updkz;
                        const year = oDeletedData[i]['validto'].getFullYear();
                        const month = String(oDeletedData[i]['validto'].getMonth() + 1).padStart(2, '0');
                        const day = String(oDeletedData[i]['validto'].getDate()).padStart(2, '0');
                        const time = year + "-" + month + "-" + day + "T00:00:00";
                        this.getOwnerComponent().getModel().remove(`/YC_VIS_AG_RATES(agreement='${oDeletedData[i].agreement}',customer='${oDeletedData[i].customer}',Product='${oDeletedData[i].Product}',validto=datetime'${URI.encodeQuery(time)}')`, {
                            method: "DELETE",
                            success: function (oSucess) {

                                oChangesModel.setProperty("/MaterialDeletedTable", []);

                                this._onRouteMatched();
                                console.log(oSucess);
                                MessageToast.show("Data Deleted successfully");
                            }.bind(this),
                            error: function (oError) {
                                this.onCloseLoadings();
                                console.log(oError);
                                MessageToast.show("Error Deleting data");
                            }.bind(this)
                        });
                    }
                } else {
                    MessageToast.show("No Changes Available");
                }

            },
            onEditorDisplay: function (oEvent) {

                let oSmartTable = this.byId("SmartTable");
                const bPaste = oSmartTable.getEnablePaste();
                oSmartTable.setEnablePaste(!bPaste);
                const oModel = this.getView().getModel("oMaterialbtns");
                // const bVal = oModel.getProperty('/Visible');
                oModel.setData({
                    Visible: oSmartTable.getEditable()
                });
            },
            onFieldChange: function (oEvent1, oEVT2) {
                debugger;
                var tempArr = this.tempArr;
                let oModel = this.getView().getModel("oMaterialModel");
                let sValue = "";
                const aData = oModel.oData;
                const oChangesModel = this.getView().getModel("oMaterialData");
                const oTable = this.byId("SmartTable");
                console.log(oTable);
                const sCOl = oEvent1.getParameters('oParent').changeEvent.getSource().getParent().getEdit().getBindingInfo('value').binding.sPath;
                if (sCOl === "validfrom") {
                    sValue = oEvent1.getParameters('oParent').changeEvent.getSource().getParent().getEdit().getProperty('dateValue');

                } else {

                    sValue = oEvent1.getParameters('oParent').changeEvent.getSource().getParent().getEdit().getBindingInfo('value').binding.oValue;
                }
                const sIndex = oEvent1.getParameters('oParent').changeEvent.getSource().getParent().getEdit().getBindingInfo('value').binding.getContext('sPath').sPath.split('/')[1];
                if ((aData[sIndex].updkz === "" || aData[sIndex].updkz === "U") && (sCOl === "agreement" || sCOl === "customer" || sCOl === "validto" || sCOl === "Product")) {

                    aData[sIndex][sCOl] = tempArr[sIndex][sCOl];
                    MessageToast.show("Key fields Not Changeable");
                } else {

                    if (aData[sIndex].updkz === "" || aData[sIndex].updkz === "U") {
                        aData[sIndex][sCOl] = sValue;
                        aData[sIndex].updkz = "U";
                        const oUpdatedData = aData.filter(oData => oData.updkz === "U");
                        oChangesModel.setProperty("/MaterialUpdatedTable", oUpdatedData);
                    } else if (aData[sIndex].updkz === "I") {
                        aData[sIndex][sCOl] = sValue;
                        const oInsertedData = aData.filter(oData => oData.updkz === "I");
                        oChangesModel.setProperty("/MaterialInsertedTable", oInsertedData);

                    }
                }
            },
            onPaste: function (oEvent) {
                const oModel = this.getView().getModel("oMaterialModel");
                const aData = oModel.getData();
                let oSmartTable = this.byId("SmartTable");

                const oChangesModel = this.getView().getModel("oMaterialData");
                // oSmartTable.beforePaste()
                let oTable = oSmartTable.getTable();
                const oEventData = oEvent.getParameters("results").result;
                // if (selectedindex < 0) {
                //     MessageToast.show("Selected a row to paste", {
                //         width: "75vw"
                //     });
                // } else {

                if (oEventData.errors !== null) {
                    let oResult = oEvent.getParameter("result");//JSON.stringify(oResult.errors)
                    MessageToast.show("Paste result:" + "Binding is Not Supported", {
                        width: "75vw"
                    });
                } else {

                    const tabindex = $(`#${oEvent.mParameters.id} tbody td[tabindex=0]`)[0]?.parentElement?.rowIndex - 1;
                    let cellIndex = oTable.getRows()[tabindex]?.oBindingContexts?.oMaterialModel.sPath.split('/')[1];
                    const oPasteData = oEventData.parsedData;
                    const oParsedLength = oPasteData.length;
                    for (let i = 0; i < oParsedLength; i++) {
                        const oUpadateData = oPasteData[i];
                        if (cellIndex < aData.length) {
                            if (aData[cellIndex].updkz === "") {
                                aData[cellIndex].updkz = "U";
                            }
                            aData[cellIndex] = { ...aData[cellIndex], ...oUpadateData };
                            cellIndex++;
                        }
                        else {
                            let oNewRowData = {
                                agreement: "",
                                customer: "",
                                Product: "",
                                validto: "",
                                validfrom: "",
                                price: "10",
                                priceunit: "",
                                updkz: "I"
                            };
                            oNewRowData = { ...oNewRowData, ...oUpadateData };
                            aData.push(oNewRowData);
                            cellIndex++;
                        }
                    }

                    const oUpdatedData = aData.filter(oData => oData.updkz === "U");
                    oChangesModel.setProperty("/MaterialUpdatedTable", oUpdatedData);
                    const oInsertedData = aData.filter(oData => oData.updkz === "I");
                    oChangesModel.setProperty("/MaterialInsertedTable", oInsertedData);
                    oModel.setData(aData);
                }
                // }
                // aData
                // } else {
                //     const oPasteData = oEventData.parsedData;
                //     const oParsedLength = oPasteData.length;
                //     for (let i = 0; i < oParsedLength; i++) {
                //         if (selectedindex < aData.length) {

                //             oModel.setData({ ...aData[selectedindex], oPasteData });
                //             selectedindex + 1;
                //         }
                //         console.log(oPasteData[i]);
                //         console.log(aData[i]);
                //     }
                // }
            },
            onBeforePaste: function (oEvent) {
                let oSmartTable = this.byId("SmartTable");
                const tabindex = $(`#${oEvent.mParameters.id} tbody td[tabindex=0]`)[0];
                if (tabindex === undefined) {
                    MessageToast.show("Select a Cell to Paste");
                } else {

                    const oAttribute = sap.ui.getCore().byId(tabindex.getAttribute('data-sap-ui-colid'));
                    const name = oAttribute.getProperty("filterProperty");
                    oEvent.mParameters.columnInfos.find((col) => { if (col.property == name) { return true; } col.ignore = true; });
                    const colIndex = oEvent.mParameters.columnInfos.findIndex((col) => col.property == name);
                    oEvent.mParameters.columnInfos.splice(0, colIndex);
                }

                console.log(oEvent);
            },
            onDiscard: function () {

                const oChangesModel = this.getView().getModel("oMaterialData");
                const oDeletedData = oChangesModel.getProperty("/MaterialDeletedTable");
                const oUpdatedData = oChangesModel.getProperty("/MaterialUpdatedTable");
                const oInsertedData = oChangesModel.getProperty("/MaterialInsertedTable");
                if (oDeletedData.length > 0 || oUpdatedData.length > 0 || oInsertedData.length > 0) {
                    const oData = {
                        "MaterialUpdatedTable": [],
                        "MaterialInsertedTable": [],
                        "MaterialDeletedTable": []
                    };
                    this.getView().setModel("oMaterialData", oData);
                    this._onRouteMatched();
                    // this.getOwnerComponent().getModel("FilterDataModel").setProperty("/MaterialBtns", {
                    //     "Page": false,
                    //     "Table": true,
                    //     "BtnEnable": false,
                    // });
                    // let oModel = this.getView().getModel("oMaterialModel");
                    // this.getOwnerComponent().getModel().read("/YC_VIS_AG_RATES", {
                    //     success: function (oData) {

                    //         console.log(oData);
                    //         oModel.setData(oData.results);
                    //         this.getOwnerComponent().getModel("FilterDataModel").setProperty("/MaterialBtns", {
                    //             "Page": false,
                    //             "Table": false,
                    //             "BtnEnable": true,
                    //         });
                    //     }.bind(this),
                    //     error: function (oError) {
                    //         // Handle error
                    //     }
                    // });


                } else {
                    MessageToast.show("No Changes Available");
                }
            }


        });
    });
