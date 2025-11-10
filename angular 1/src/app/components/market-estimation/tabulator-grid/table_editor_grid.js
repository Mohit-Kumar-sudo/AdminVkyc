export class MEGrid {
    constructor(dateData, regionData, segmentData, tableDataMap, meData = null) {
        this.dateData = dateData;
        this.factorYearDataVal = {};
        this.factorYearDataVol = {};
        this.apiMeData = meData
        this.regionData = regionData;
        this.segmentData = segmentData;
        this.tableDataMap = tableDataMap;
        this.isSplitColFilled = -1;
        this.isACAGRColFilled = -1;
        this.tabNames = [];
        this.CONSTANTS = {
            COLS: {
                SPLIT: "% Split",
                ASSUMED_CAGR: "Assumed CAGR (%)",
                CAGR: "CAGR (%)"
            },
            ROWS: {
                TOTAL: "Total"
            },
            EVENTS: {
                GEO_PARENT_BASE_VALUE_SET: "GEO_PARENT_BASE_VALUE_SET",
                GEO_PARENT_TABLE_SET: "GEO_PARENT_TABLE_SET",
                SEG_PARENT_TABLE_SET: "SEG_PARENT_TABLE_SET"
            },
            VOL: "Volume",
            VAL: "Value",
            AVG: "AvgP",
            FACTOR: 'factor'
        };
    };

    // for updating table with API response for table data
    updateTableData() {
        for (let key in this.tableDataMap) {
            // tableDataMap[key].setData({});  // set api response
        }
    }

    // send grid data to angular component for server side storage of data
    getGridData(tableDataMap, metric) {
        let otableDataArr = [];
        let otableDataMap = tableDataMap;
        for (let key in otableDataMap) {
            let rowHeaders = [];
            otableDataMap[key.toLowerCase()].getColumns().forEach((ele) => {
                rowHeaders.push(ele.getField());
            });

          let meKeyData = _.find(this.apiMeData, ['key', key])
            otableDataArr.push({
                'key': key.toLowerCase(),
                'value': otableDataMap[key].getData(),
                'rowHeaders': rowHeaders,
                'metric': metric,
                'custom_text': (meKeyData && meKeyData.custom_text) ? meKeyData.custom_text : '',
                // 'text': meKeyData.text ? meKeyData.text : ''
            });
        }
        return otableDataArr;
    };

    // helper functions
    procesSegments(segmentData) {
        let finalSegData = {};
        finalSegData.mainParentKeys = [];
        let segProcData = {};
        let segNameMap = {};
        for (let i = 0; i < segmentData.length; i++) {
            let ele = segmentData[i];
            segProcData[ele.id] = ele;
            segNameMap[ele.name] = ele;

            if (ele.pid && segProcData[ele.pid]) {
                let parentName = segProcData[ele.pid].name;
                if (ele.pid === '1') {
                    finalSegData.mainParentKeys.push(segProcData[ele.id].name);
                }
                if (finalSegData[parentName] && Array.isArray(finalSegData[parentName])) {
                    finalSegData[parentName].push(ele.name);
                } else {
                    finalSegData[parentName] = [ele.name];
                }
            } else {    // add a parent segment
                finalSegData[ele.name] = [];
            }
        }

        return finalSegData;
    }

    processRegionData(regionData) {
        let respData = {};

        for (let i = 0; i < regionData.length; i++) {
            let countries = [];
            let regionDetails = regionData[i];

            regionDetails.countries.forEach((ele) => {
                countries.push(ele.name);
            });

            respData[regionDetails.region] = countries;
        }

        return respData;
    }

    // Tabs in ME
    constructTabData(finalSegData) {
        let tabDataObj = {};
        tabDataObj.numberOfTabs = finalSegData.mainParentKeys.length;
        tabDataObj.tabNames = [{ "header": `Geography Parent`, "key": `geography_parent` }];

        for (let i = 0; i < finalSegData.mainParentKeys.length; i++) {
            let seg = finalSegData.mainParentKeys[i];
            tabDataObj.tabNames.push({ "header": `Geography ${seg}`, "key": `geography_${seg}`.toLowerCase() });
            tabDataObj.tabNames.push({ "header": `${seg} Parent`, "key": `${seg}_parent`.toLowerCase() });
        }

        return tabDataObj
    }

    appendTableLabelsRow(labelcontentDiv) {
        // Value
        let rowColValDiv = document.createElement('div');
        rowColValDiv.id = "VAL";
        rowColValDiv.classList = ["col-md-5 text-center p-1"];
        let paraVolEle = document.createElement('p');
        paraVolEle.innerHTML = this.CONSTANTS.VAL
        paraVolEle.classList = ["font-weight-bold"];
        rowColValDiv.appendChild(paraVolEle);
        // rowDiv.appendChild(rowColValDiv);
        labelcontentDiv.appendChild(rowColValDiv);

        // avg price
        let rowColAvgDiv = document.createElement('div');
        rowColAvgDiv.id = "AVG";
        rowColAvgDiv.classList = ["col-md-1.7 text-center p-1"];
        paraVolEle = document.createElement('p');
        paraVolEle.innerHTML = this.CONSTANTS.AVG
        paraVolEle.classList = ["font-weight-bold"];
        rowColAvgDiv.appendChild(paraVolEle);
        //rowDiv.appendChild(rowColAvgDiv);
        labelcontentDiv.appendChild(rowColAvgDiv);

        // Volume
        let rowColVolDiv = document.createElement('div');
        rowColVolDiv.id = "VOL";
        rowColVolDiv.classList = ["col-md-4 text-center p-1"];
        paraVolEle = document.createElement('p');
        paraVolEle.innerHTML = this.CONSTANTS.VOL
        paraVolEle.classList = ["font-weight-bold"];
        rowColVolDiv.appendChild(paraVolEle);
        //rowDiv.appendChild(rowColVolDiv);
        labelcontentDiv.appendChild(rowColVolDiv);

    }


    // define tables in each tab
    defineTables(dateData, regionData, finalSegData, tabDataObj) {
        let tableDataMap = {};

        tabDataObj.tabNames.forEach((tabName) => {
            this.tabNames.push(tabName.key);
        })

        let tabNames = tabDataObj.tabNames;

        // Tabs injected in Page for all segments (2n+1)
        for (let i = 0; i < tabNames.length; i++) {

            let tabName = tabNames[i].key;

            let tabContentDiv = document.getElementById(tabName);
            let labelcontentDiv = document.getElementById(tabName + '_section_label');

            // form a boot row - a grid structure to accomodate volume and value in same row
            this.appendTableLabelsRow(labelcontentDiv)

            if (tabName == 'geography_parent') {    // geo parent tab

                this.geographyParentTables(dateData, regionData, finalSegData, tabDataObj, tabName, tableDataMap);

            } else if (tabName.startsWith('geography')) {    // for Geography_<seg_name> tabs

                this.geograpySegTables(dateData, regionData, finalSegData, tabDataObj, tabName, tableDataMap);

            } else if (tabName.endsWith('_parent')) {  // for <seg_name>_Parent tabs

                this.segParentTables(dateData, regionData, finalSegData, tabDataObj, tabName, tableDataMap);

            }

        }
        this.tableDataMap = tableDataMap;

        return tableDataMap;
    }


    // I. For all handling of tables related to 'geography_parent' tab
    // construct a table with defined div - For Volume and Value tables can be generated from this
    geographyParentTables(dateData, regionData, finalSegData, tabDataObj, tabName, tableDataMap) {
        // table for regions - I. Main tables
        let valueTabDiv = this.createTableDiv(tabName, this.CONSTANTS.VAL);
        let avgPrTabDiv = this.createTableDiv(tabName, this.CONSTANTS.AVG);
        let volumeTabDiv = this.createTableDiv(tabName, this.CONSTANTS.VOL);
        let ValFactor = this.createTableDiv(tabName, this.CONSTANTS.VAL + "_factor");
        let VolFactor = this.createTableDiv(tabName, this.CONSTANTS.VOL + "_factor");
        let spacer = this.createTableDiv(tabName, this.CONSTANTS.AVG + "_spacer");

        let tabContentDiv = document.getElementById(tabName);
        this.injectTablesInPage(tabContentDiv, volumeTabDiv, valueTabDiv, avgPrTabDiv, ValFactor, VolFactor, spacer);

        this.constructGeoParTable(regionData, dateData, tabName, this.CONSTANTS.VOL, volumeTabDiv.id, tableDataMap, true, ValFactor.id, VolFactor.id);
        this.constructGeoParTable(regionData, dateData, tabName, this.CONSTANTS.VAL, valueTabDiv.id, tableDataMap, true, "", "", "");
        this.constructAvgPriceTable(regionData, avgPrTabDiv.id, tableDataMap, true, tableDataMap[volumeTabDiv.id], tableDataMap[valueTabDiv.id], tabName, spacer.id);

        // for all countries of a region - II. sub tables
        for (var region in regionData) {
            valueTabDiv = this.createTableDiv(region, this.CONSTANTS.VAL);
            avgPrTabDiv = this.createTableDiv(region, this.CONSTANTS.AVG);
            volumeTabDiv = this.createTableDiv(region, this.CONSTANTS.VOL);

            this.injectTablesInPage(tabContentDiv, volumeTabDiv, valueTabDiv, avgPrTabDiv, "", "", "");

            this.constructGeoParTable(regionData[region], dateData, region, this.CONSTANTS.VOL, volumeTabDiv.id, tableDataMap, false, "", "");
            this.constructGeoParTable(regionData[region], dateData, region, this.CONSTANTS.VAL, valueTabDiv.id, tableDataMap, false, "", "");
            this.constructAvgPriceTable(regionData[region], avgPrTabDiv.id, tableDataMap, false, volumeTabDiv.id, valueTabDiv.id, tabName,"");
        }
    }

    tableFunctions(that, mainTable) {
        return {
            editCheck: (function (that, mainTable) {
                // return true;
                return (function (cell) {
                    let col = cell.getField();
                    let tab = cell.getTable();
                    let isColCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check
                    let retVal = false;
                    switch (col) {
                        case that.CONSTANTS.COLS.SPLIT:
                            // for vol, split is disabled
                            if (tab.element.id.includes('_volume'))
                                retVal = false;
                            if (!isColCell) { retVal = true; }
                            else { retVal = false; }
                            break;
                        case that.CONSTANTS.COLS.ASSUMED_CAGR:
                            if (!isColCell) { retVal = true; }
                            else { retVal = false; }
                            break;
                        case that.dateData.baseYear.toString():
                            if (mainTable && isColCell) {
                                retVal = true;
                            } else {
                                retVal = false;
                            }
                            break;
                        default:
                            retVal = false;
                            break;
                    }

                    if (retVal) {
                        cell.getElement().style.backgroundColor = "#B8CCE4";
                    }
                    return retVal;
                });
            })(that, mainTable),
            // on cell edit
            onCellEdit: function (cell) {
                // console.log(cell);
                let colHeader = cell.getField();
                let val = cell.getValue();
                let tableElementId = cell.getTable().element.id;

                let tableType = '';
                if (tableElementId.includes('value'))
                    tableType = 'value';
                else if (tableElementId.includes('volume'))
                    tableType = 'volume';
                else
                    tableType = 'avgp';

                let isColTotCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check

                // base year value edit
                if (colHeader == this.dateData.baseYear
                    && isColTotCell && tableElementId.includes('geography_parent')) { // last row in table check

                    let evt = new CustomEvent(this.CONSTANTS.EVENTS.GEO_PARENT_BASE_VALUE_SET, { "detail": { "baseYearTotVal": val, "type": tableElementId.includes('_value') ? 'value' : 'volume' } });
                    window.dispatchEvent(evt);
                    let func = this.tableFunctions().onCellEdit.bind(this);
                    let colCells = cell.getColumn().getCells();
                    colCells.forEach((colCell, idx) => {
                        if (idx != (colCells.length - 1)) { // dont set last cell in base year col, since its the total cell
                            let splitCellVal = colCell.getRow().getCell(this.CONSTANTS.COLS.SPLIT).getValue();
                            colCell.setValue((splitCellVal / 100) * val);
                            func(colCell.getRow().getCell(this.CONSTANTS.COLS.ASSUMED_CAGR))
                        }
                    });
                }

                if (isColTotCell)
                    return;

                // split col value edit
                if (colHeader == this.CONSTANTS.COLS.SPLIT) { // last row in table check
                    let baseYearRowCell = cell.getRow().getCell(this.dateData.baseYear);

                    let tab = cell.getTable();
                    let baseYearCol = tab.getColumn(this.dateData.baseYear);
                    let baseYearTotCell = baseYearCol.getCells()[tab.getRows().length - 1];
                    baseYearRowCell.setValue((cell.getValue() / 100) * baseYearTotCell.getValue());

                    let func = this.tableFunctions().onCellEdit.bind(this);
                    func(cell.getRow().getCell(this.CONSTANTS.COLS.ASSUMED_CAGR))
                }

                // assumed CAGR edit
                if (colHeader == this.CONSTANTS.COLS.ASSUMED_CAGR) {

                    let assumedCagrVal = (cell.getValue() !== "" || typeof cell.getValue() !== "undefined") ? parseFloat(cell.getValue()) : -1; // cell value
                    assumedCagrVal = assumedCagrVal / 100; // since its mentioned in % value

                    let cellRow = cell.getRow();
                    let baseYearVal = cellRow.getCell(this.dateData.baseYear).getValue();

                    // for all years < base year
                    // formulae: (+1 year value) * (1+assumed CAGR Value) * year_factor
                    let factorYearData = 0;
                    if (tableType == 'value')
                        factorYearData = this.factorYearDataVal;
                    else if (tableType == 'volume')
                        factorYearData = this.factorYearDataVol;

                    let year = this.dateData.baseYear - 1;
                    let yearVal = -1;
                    while (year >= this.dateData.startYear) {
                        yearVal = cellRow.getCell(year + 1).getValue() / (1 + assumedCagrVal) * factorYearData[year] || 0.0;
                        cellRow.getCell(year).setValue(yearVal.toFixed(2));
                        year--;
                    }

                    // for all years < base year
                    // formulae: (-1 year value) * (1+assumed CAGR Value) * year_factor
                    year = this.dateData.baseYear + 1;
                    yearVal = -1;
                    while (year <= this.dateData.endYear) {
                        yearVal = cellRow.getCell(year - 1).getValue() * (1 + assumedCagrVal) * factorYearData[year] || 0.0;
                        cellRow.getCell(year).setValue(yearVal.toFixed(2));
                        year++;
                    }

                    // CAGR %
                    let syear = this.dateData.baseYear + 1;
                    let yearDiff = this.dateData.endYear - this.dateData.baseYear;
                    let endYearVal = cellRow.getCell(this.dateData.endYear).getValue();
                    let syearVal = cellRow.getCell(syear).getValue();

                    let cagrVal = (Math.pow(endYearVal / syearVal, (1 / 1)) - 1) * 100 || 0.0;
                    let cagrColHeader = `${this.CONSTANTS.COLS.CAGR} (${this.dateData.startYear}-${this.dateData.endYear})`;
                    cellRow.getCell(cagrColHeader).setValue(cagrVal.toFixed(2));

                    let colCells = cell.getColumn().getCells();
                    this.isSplitColFilled = 1;
                    colCells.forEach((cell) => {
                        if (cell.getValue() == 0 || cell.getValue() == -1 || cell.getValue() == '')
                            this.isSplitColFilled = 0;
                    })

                }

                // call sort and copy row on split column only when all the values of split columns are filled
                /* let colCells = cell.getColumn().getCells();
                this.isSplitColFilled = 1;
                colCells.forEach((cell)=>{
                    if (cell.getValue() == 0 || cell.getValue() == -1 || cell.getValue() == '')
                    this.isSplitColFilled = 0;
                })
                if (this.isSplitColFilled == 1) {
                    tab.setSort(this.CONSTANTS.COLS.SPLIT, "asc");
                } */

                let tab = cell.getTable();
                let res = this.areTableAllRowsFilled(tab);
                if (res.tabFilled) {
                    // max row data = total row data - sum(all other rows excluding max row)
                    let rowsData = tab.getData();
                    let maxRowIdx = res.maxRowIdx;
                    let totlRowData = rowsData[rowsData.length - 1];
                    let nonMaxRowMap = {};
                    let maxRowMap = {};

                    // calc all row data sum except maxrowidx
                    for (let i = 0; i < rowsData.length - 1; i++) {  // skip total row
                        let rowData = rowsData[i];
                        if (maxRowIdx == i) {
                            continue;
                        } else {
                            for (let key in rowData) {
                                let nonMaxVal = 0.0;
                                if (!nonMaxRowMap[key]) {
                                    nonMaxVal = !isNaN(nonMaxRowMap[key]) ? parseFloat(nonMaxRowMap[key]) : 0.0;
                                }
                                nonMaxRowMap[key] = (nonMaxVal + parseFloat(rowData[key])).toFixed(2);
                            }
                        }
                    };

                    // calc maxrow data after negation
                    for (let key in res.maxRowData) {
                        if (!isNaN(parseInt(key))) {
                            maxRowMap[key] = (parseFloat(totlRowData[key]) - parseFloat(nonMaxRowMap[key])).toFixed(2);
                        }
                    }
                    maxRowMap['id'] = res.maxRowData[this.CONSTANTS.COLS.SPLIT];

                    // console.log(maxRowMap);
                    // console.log(res.maxRowData);

                    let splitTot = parseFloat(res.maxRowData[this.CONSTANTS.COLS.SPLIT]) + parseFloat(nonMaxRowMap[this.CONSTANTS.COLS.SPLIT]);
                    if (splitTot < 100) {
                        // alert("Error: Split Column sum should not be less than 100%!!!");
                        // return;
                    }
                    //    + parseFloat(res.maxRowData[this.CONSTANTS.COLS.SPLIT]);

                    // asc order sort for rows
                    tab.setSort(this.CONSTANTS.COLS.SPLIT, "asc");

                    /* tab.updateRow(maxRowMap['id'], maxRowMap)
                    .then((suc) => {
                        console.log("success: " + suc);
                    })
                    .catch((err) => {
                        console.log("error: " + err);
                    }); */

                    let evt = new CustomEvent(this.CONSTANTS.EVENTS.GEO_PARENT_TABLE_SET, { "detail": { "tab": tab, "type": tableElementId.includes('_value') ? 'value' : 'volume' } });
                    window.dispatchEvent(evt);
                }

                // APPLICABLE TO ONLY PARENT TABLES

                // all below processing is only applicable to parent table
                // so if the table id is not in the parent table names (i.e tab names)
                // then skip the processing assuming the the current table is subtable and not parent tbale
                let tableName = cell.getTable().element.id.replace('_value', '');
                tableName = tableName.replace('_volume', '');
                if (!this.tabNames.includes(tableName)) {
                    return;
                }

                // set total row Value on each cell edit
                let allCols = cell.getTable().getColumns();
                allCols.shift();    // removed header column
                allCols.forEach((col) => {
                    if (!col.getField().includes(this.CONSTANTS.COLS.ASSUMED_CAGR)
                        && !col.getField().includes(this.CONSTANTS.COLS.SPLIT)
                        && !col.getField().includes(this.CONSTANTS.COLS.CAGR)
                        && !col.getField().includes(this.dateData.baseYear)) {
                        // let col = cell.getColumn();
                        let colCells = col.getCells();
                        let i = 0;
                        let sum = 0;
                        while (i < colCells.length - 1) {
                            sum = sum + parseFloat(colCells[i].getValue());
                            i++;
                        }
                        colCells[i].setValue(sum.toFixed(2));
                    }
                });

                // copy the total rows from parent to sub-tables
                let allRows = cell.getTable().getRows();
                let tabType = cell.getTable().element.id || "";

                let tabKeys = [];
                for (let i = 0; i < allRows.length - 1; i++) { // skip the total row
                    let key = allRows[i].getCells()[0].getValue();
                    key = key.replace(/ /ig, '_');
                    key = tabType.includes('volume') ? `${key}_volume` : `${key}_value`;
                    key = key.toLowerCase();
                    let tabObj = this.tableDataMap[key];

                    // if child table does not exists
                    if (!tabObj)
                        continue;

                    let lastRow = tabObj.getRows()[tabObj.getRows().length - 1];
                    let lastRowCells = lastRow.getCells();
                    lastRowCells.forEach((cell) => {
                        if (!cell.getField().includes(this.CONSTANTS.COLS.ASSUMED_CAGR)
                            && !cell.getField().includes(this.CONSTANTS.COLS.SPLIT)
                            && !cell.getField().includes(this.CONSTANTS.COLS.CAGR)) {
                            let val = allRows[i].getData()[cell.getField()];
                            if (!isNaN(parseInt(val)))
                                cell.setValue(allRows[i].getData()[cell.getField()]);
                        }
                    });
                }
            },
            onFactCellEdit: function (cell) {
                let factorVal = cell.getValue();
                let factorColField = cell.getField() || 0;
                let tableElementId = cell.getTable().element.id;
                let tableType = '';
                if (tableElementId.includes('value'))
                    tableType = 'value';
                else if (tableElementId.includes('volume'))
                    tableType = 'volume';
                else
                    tableType = 'avgp';

                if (tableType == 'value')
                    this.factorYearDataVal[factorColField] = parseFloat(factorVal);
                else if (tableType == 'volume')
                    this.factorYearDataVol[factorColField] = parseFloat(factorVal);

            },
            onAvgPEditCheck: (function (that) {
                // return true;
                return (function (cell) {
                    let isColLastCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check
                    return (isColLastCell ? false : true);
                });
            })(this),
            onAvgPCellEdit: function (cell) {
                let pos = cell.getRow().getPosition(true);
                let volRowComp = this.valueTabObj.getRowFromPosition(pos, true);
                let valRowComp = this.volTabObj.getRowFromPosition(pos, true);

                let volSplitCellComp = volRowComp.getCell(this.CONSTANTS.COLS.SPLIT);
                // volSplitCellComp.setValue((parseFloat(valRowComp.getData()[this.CONSTANTS.COLS.SPLIT]) / parseFloat(cell.getValue())).toFixed(2));

            }
        };
    };

    constructGeoParTable(rowData, dateData, segmentName, tableType, divId, tableDataMap, mainTable, valFactorId, volFactorId) {

        let origSegName = segmentName;
        segmentName = segmentName.replace(/ /g, '_').toLowerCase();

        // column data generation
        let column_width = 70;
        let column_height = 50;
        let isEditable = false; // inplace editing
        let isSort = false;

        // Header Col
        let columns = [{
            title: origSegName,
            field: segmentName,
            width: column_width + 100,
            editor: "input", editable: this.tableFunctions(this, mainTable).editCheck,
            headerSort: isSort,
            formatter: function (cell, formatterParams) {
                //cell - the cell component
                //formatterParams - parameters set for the column
                cell.getElement().style.backgroundColor = "lightgray";
                return cell.getValue();
            }
        }];

        // SPLIT COLS
        columns.push({
            title: this.CONSTANTS.COLS.SPLIT,
            field: this.CONSTANTS.COLS.SPLIT,
            width: column_width + 10,
            editor: "input", editable: this.tableFunctions(this, mainTable).editCheck,
            validator: ["required", "numeric", "max:100", {
                type: function (cell, newVal, params) {
                    let sum = 0;
                    let allColCells = cell.getColumn().getCells();
                    for (let i = 0; i < allColCells.length - 1; i++) {
                        let colCell = allColCells[i];
                        if (cell.getValue() == colCell.getValue()) {
                            continue;
                        }
                        sum = sum + parseInt(colCell.getValue());
                    };

                    if ((sum + parseInt(newVal)) > 100) {
                        return false;
                    } else
                        return true;
                }
            }],
            cellEdited: this.tableFunctions(this, mainTable).onCellEdit.bind(this),
            sorter: "number",
            headerSort: isSort,
            formatter: function (cell, formatterParams) {
                //cell - the cell component
                //formatterParams - parameters set for the column
                cell.getElement().style.backgroundColor = "#B8CCE4";
                return cell.getValue();
            }
        });

        // year cols
        let yearCounter = dateData.startYear;
        while (yearCounter <= dateData.endYear) {
            let colConfig = {
                title: `${yearCounter}`,
                field: `${yearCounter}`,
                width: column_width,
                headerSort: isSort,
                editor: "input", editable: this.tableFunctions(this, mainTable).editCheck,
                validator: ["required", "numeric"]
            };

            if (yearCounter == dateData.baseYear) {
                // on cell edit
                colConfig.cellEdited = this.tableFunctions(this, mainTable).onCellEdit.bind(this);
                // colConfig["cssClass"] = "bg-light";
            }

            columns.push(colConfig);

            yearCounter++;
        }

        // CAGR COLS
        columns.push({
            title: this.CONSTANTS.COLS.ASSUMED_CAGR,
            field: this.CONSTANTS.COLS.ASSUMED_CAGR,
            width: column_width + 80,
            editor: "input", editable: this.tableFunctions(this, mainTable).editCheck,
            headerSort: isSort,
            validator: ["required", "numeric"],
            cellEdited: this.tableFunctions(this, mainTable).onCellEdit.bind(this),
            formatter: function (cell, formatterParams) {
                //cell - the cell component
                //formatterParams - parameters set for the column
                cell.getElement().style.backgroundColor = "#B8CCE4";
                return cell.getValue();
            }
        });
        columns.push({ title: `${this.CONSTANTS.COLS.CAGR} (${dateData.startYear}-${dateData.endYear})`, field: `${this.CONSTANTS.COLS.CAGR} (${dateData.startYear}-${dateData.endYear})`, width: column_width + 120, editor: "input", editable: this.tableFunctions(this, mainTable).editCheck, headerSort: isSort, validator: ["required", "numeric"] });

        divId = divId.replace(/\./ig, "\\.");
        //Build Tabulator
        var tableConfig = new Tabulator(`#${divId}`, {
            layout: "fitColumns",
            index: this.CONSTANTS.COLS.SPLIT,
            rowFormatter: (function (segmentName, that) {
                return (function (row) {
                    if (row.getData()['' + segmentName] == that.CONSTANTS.ROWS.TOTAL) {
                        row.getElement().style.backgroundColor = "lightgray";
                        row.getElement().style.fontWeight = "bold";
                        if (row.getCell(that.dateData.baseYear)) {
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.backgroundColor = "#ffffed";
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.fontWeight = "bold";
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.color = "black";
                        }
                    }
                });
            })(segmentName, this),
            columns: columns,
        });

        // ROWS

        // define rows with column obj
        if (Array.isArray(rowData)) {
            for (let i = 0; i < rowData.length; i++) {
                let rowObj = { ['' + segmentName]: rowData[i] };
                columns.forEach((col) => {
                    if (col.field !== segmentName)
                        rowObj = { ...rowObj, ...{ ['' + col.title]: 0 } };
                });
                tableConfig.addRow(rowObj);
                // tableConfig.addRow({[''+segmentName]: key});
            }
        } else {
            for (var key in rowData) {
                // tableConfig.addRow({[''+segmentName]: key});
                let rowObj = { ['' + segmentName]: key };
                columns.forEach((col) => {
                    if (col.field !== segmentName)
                        rowObj = { ...rowObj, ...{ ['' + col.title]: 0 } };
                });
                tableConfig.addRow(rowObj);
            }
        }

        // tableConfig.addRow({[''+segmentName]: 'Total'});
        let rowObj = { ['' + segmentName]: this.CONSTANTS.ROWS.TOTAL };

        columns.forEach((col) => {
            if (col.field !== segmentName
                && col.field !== this.CONSTANTS.COLS.SPLIT)
                rowObj = { ...rowObj, ...{ ['' + col.title]: '' } };
            else if (col.field === this.CONSTANTS.COLS.SPLIT)
                rowObj = { ...rowObj, ...{ ['' + col.title]: 100 } };

        });
        tableConfig.addRow(rowObj);

        tableDataMap[`${divId.toLowerCase()}`] = tableConfig;

        if (valFactorId) {
            let cols = [
                {
                    title: 'Factor',
                    "headerSort": false,
                    width: column_width
                }
            ]

            let factObj = { "title": "factor", "headerSort": false }

            let dateStart = dateData.startYear
            while (dateStart <= dateData.endYear) {
                if (dateStart != dateData.baseYear) {
                    cols.push({
                        title: `${dateStart}`,
                        field: `${dateStart}`,
                        width: column_width,
                        editor: "input",
                        editable: true,
                        headerSort: false,
                        validator: ["required", "numeric"],
                        cellEdited: this.tableFunctions(this, mainTable).onFactCellEdit.bind(this)
                    })
                    factObj[dateStart] = 0
                    this.factorYearDataVal[dateStart] = 0;
                    this.factorYearDataVol[dateStart] = 0;
                }
                dateStart++;
            }

            var factTables = new Tabulator(`#${valFactorId}`, {
                columns: cols
            });

            var volFacttable = new Tabulator(`#${volFactorId}`, {
                columns: cols
            })
            document.getElementById(volFactorId).style.background = "#fff"
            document.getElementById(valFactorId).style.background = "#fff"
            factTables.addRow(factObj);
            volFacttable.addRow(factObj);
            tableDataMap[`${valFactorId}`] = factTables
            tableDataMap[`${volFactorId}`] = volFacttable
        }
    }

    // II. for handling of tables related to tabs of format 'geography_segment'
    // construct a table with defined div - For Volume and Value tables can be generated from this
    geograpySegTables(dateData, regionData, finalSegData, tabDataObj, tabName, tableDataMap) {
        let segName = tabName.replace('geography_', '');

        let subseg = finalSegData[segName.charAt(0).toUpperCase() + segName.substring(1)]
            || finalSegData[segName] || finalSegData[segName.toUpperCase()] || []; // subseg array

        let rowDataObj = {};

        // table for regions - I. Main Table
        let valueTabDiv = this.createTableDiv(tabName, this.CONSTANTS.VAL);
        let avgPrTabDiv = this.createTableDiv(tabName, this.CONSTANTS.AVG);
        let volumeTabDiv = this.createTableDiv(tabName, this.CONSTANTS.VOL);
        let ValFactor = this.createTableDiv(tabName, this.CONSTANTS.VAL + "_factor");
        let VolFactor = this.createTableDiv(tabName, this.CONSTANTS.VOL + "_factor");

        let tabContentDiv = document.getElementById(tabName);
        this.injectTablesInPage(tabContentDiv, volumeTabDiv, valueTabDiv, avgPrTabDiv, ValFactor, VolFactor, "");
        this.constructGeoSegTable(subseg, dateData, tabName, this.CONSTANTS.VOL, volumeTabDiv.id, tableDataMap, true, ValFactor.id, VolFactor.id);
        this.constructGeoSegTable(subseg, dateData, tabName, this.CONSTANTS.VAL, valueTabDiv.id, tableDataMap, true, "", "");
        this.constructAvgPriceTable(subseg, avgPrTabDiv.id, tableDataMap, true, tableDataMap[volumeTabDiv.id], tableDataMap[valueTabDiv.id], tabName);


        // II. sub tables
        for (var region in regionData) {
            rowDataObj['' + region.toLowerCase()] = subseg;
            for (let i = 0; i < regionData[region].length; i++) {
                let country = regionData[region][i];
                rowDataObj['' + country.toLowerCase()] = subseg;
            }
        }

        // for all countries of a region
        for (var key in rowDataObj) {
            valueTabDiv = this.createTableDiv(`${segName}_${key}`, this.CONSTANTS.VAL);
            avgPrTabDiv = this.createTableDiv(`${segName}_${key}`, this.CONSTANTS.AVG);
            volumeTabDiv = this.createTableDiv(`${segName}_${key}`, this.CONSTANTS.VOL);

            this.injectTablesInPage(tabContentDiv, volumeTabDiv, valueTabDiv, avgPrTabDiv, "", "", "");

            this.constructGeoSegTable(rowDataObj[key], dateData, `${segName}_${key}`, this.CONSTANTS.VOL, volumeTabDiv.id, tableDataMap, false, "", "");
            this.constructGeoSegTable(rowDataObj[key], dateData, `${segName}_${key}`, this.CONSTANTS.VAL, valueTabDiv.id, tableDataMap, false, "", "");
            this.constructAvgPriceTable(rowDataObj[key], avgPrTabDiv.id, tableDataMap, false, tableDataMap[volumeTabDiv.id], tableDataMap[valueTabDiv.id], tabName);
        }

      // Starting of Further bifurcation for creating the sub segments tables;
      if (this.dateData.bifurcationLevel && this.dateData.bifurcationLevel > 1) {
        let segNames = [];
        subseg.forEach(subsegItem => {
          if (finalSegData[subsegItem] && finalSegData[subsegItem].length) {
            if (!segNames.includes(subsegItem))
              segNames.push(subsegItem);
          }
        });
        if (segNames.length) {
          let extraRowDataObj = {}

          segNames.forEach(segNameItem => {
            for (var region in regionData) {
              extraRowDataObj['' + region.toLowerCase()] = finalSegData[segNameItem];
              for (let i = 0; i < regionData[region].length; i++) {
                let country = regionData[region][i];
                extraRowDataObj['' + country.toLowerCase()] = finalSegData[segNameItem];
              }
            }

            for (var key in extraRowDataObj) {
              valueTabDiv = this.createTableDiv(`${segNameItem}_${key}`, this.CONSTANTS.VAL);
              avgPrTabDiv = this.createTableDiv(`${segNameItem}_${key}`, this.CONSTANTS.AVG);
              volumeTabDiv = this.createTableDiv(`${segNameItem}_${key}`, this.CONSTANTS.VOL);

              this.injectTablesInPage(tabContentDiv, volumeTabDiv, valueTabDiv, avgPrTabDiv, "", "", "");

              this.constructGeoSegTable(extraRowDataObj[key], dateData, `${segNameItem}_${key}`, this.CONSTANTS.VOL, volumeTabDiv.id, tableDataMap, false, "", "");
              this.constructGeoSegTable(extraRowDataObj[key], dateData, `${segNameItem}_${key}`, this.CONSTANTS.VAL, valueTabDiv.id, tableDataMap, false, "", "");
              this.constructAvgPriceTable(extraRowDataObj[key], avgPrTabDiv.id, tableDataMap, false, tableDataMap[volumeTabDiv.id], tableDataMap[valueTabDiv.id], tabName);
            }
          });
        }
      }
      // Ending of Further bifurcation for creating the sub segments tables code

        var updateTotalValForRegions = function (e) {

            var tab = e.detail.tab;
            let tabDataRows = tab.getData();
            tabDataRows.forEach((row, idx) => {
                let headerColName = tab.element.id;
                headerColName = headerColName.replace(`_${e.detail.type}`, '').toLowerCase();

                let reg = row[headerColName];

                if (reg.indexOf('Total') === -1) {  // do processing only for regions / countries and not for total rows in table
                    let key = `${segName}_${reg.replace(/ /ig, '_')}_${e.detail.type}`;
                    key = key.toLowerCase();

                    let keyTab = this.tableDataMap[key];
                    let keyTabTotalRow = keyTab.getRows()[keyTab.getRows().length - 1];
                    let keyTabTotalRowCells = keyTabTotalRow.getCells();
                    keyTabTotalRowCells.forEach((cell, idx) => {
                        if (!cell.getField().includes(this.CONSTANTS.COLS.SPLIT)
                            &&  !cell.getField().includes(this.CONSTANTS.COLS.CAGR)
                            && !cell.getField().includes(this.CONSTANTS.COLS.ASSUMED_CAGR))
                        {
                            let val = row[cell.getField()];
                            if (val)
                                cell.setValue(val);
                        }
                    });
                }
            });
        };
        updateTotalValForRegions = updateTotalValForRegions.bind(this);

        window.addEventListener(this.CONSTANTS.EVENTS.GEO_PARENT_TABLE_SET, updateTotalValForRegions, { "capture": false });

    }

    geoSegTableFunctions(that, mainTable) {
        return {
            editCheck: (function (that, mainTable) {
                // return true;
                return (function (cell) {
                    let col = cell.getField();
                    let tab = cell.getTable();
                    let isColCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check
                    let retVal = false;

                    if (mainTable) {
                        return false;
                    }

                    switch (col) {
                        case that.CONSTANTS.COLS.SPLIT:
                            // for vol, split is disabled
                            if (tab.element.id.includes('_volume'))
                                retVal = false;
                            if (!isColCell) { retVal = true; }
                            else { retVal = false; }
                            break;
                        case that.CONSTANTS.COLS.ASSUMED_CAGR:
                            if (!isColCell) { retVal = true; }
                            else { retVal = false; }
                            break;
                        case that.dateData.baseYear.toString():
                            return false;
                            // if(isColCell)
                            //     retVal = false;
                            // else
                            //     retVal = true;
                            break;
                        default:
                            retVal = false;
                            break;
                    }
                    if (retVal) {
                        cell.getElement().style.backgroundColor = "#B8CCE4";
                    }
                    return retVal;
                });
            })(that, mainTable),
            // on cell edit
            onCellEdit: function (cell) {
                console.log(cell);
                let colHeader = cell.getField();
                let val = cell.getValue();
                let tableElementId = cell.getTable().element.id;
                let isColTotCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check

                let tableType = '';
                if (tableElementId.includes('value'))
                    tableType = 'value';
                else if (tableElementId.includes('volume'))
                    tableType = 'volume';
                else
                    tableType = 'avgp';

                // base year value edit
                if (colHeader == this.dateData.baseYear
                    && isColTotCell) { // last row in table check
                    let func = this.geoSegTableFunctions().onCellEdit.bind(this);
                    let colCells = cell.getColumn().getCells();
                    colCells.forEach((colCell, idx) => {
                        if (idx != (colCells.length - 1)) { // dont set last cell in base year col, since its the total cell
                            let splitCellVal = colCell.getRow().getCell(this.CONSTANTS.COLS.SPLIT).getValue();
                            colCell.setValue((splitCellVal / 100) * val);
                            func(colCell.getRow().getCell(this.CONSTANTS.COLS.ASSUMED_CAGR))
                        }
                    });
                }

                if (isColTotCell)
                    return;

                // split col value edit
                if (colHeader == this.CONSTANTS.COLS.SPLIT) { // last row in table check
                    let baseYearRowCell = cell.getRow().getCell(this.dateData.baseYear);

                    let tab = cell.getTable();
                    let baseYearCol = tab.getColumn(this.dateData.baseYear);
                    let baseYearTotCell = baseYearCol.getCells()[tab.getRows().length - 1];
                    baseYearRowCell.setValue((cell.getValue() / 100) * baseYearTotCell.getValue());

                    let func = this.geoSegTableFunctions().onCellEdit.bind(this);
                    func(cell.getRow().getCell(this.CONSTANTS.COLS.ASSUMED_CAGR))
                }

                // assumed CAGR edit
                if (colHeader == this.CONSTANTS.COLS.ASSUMED_CAGR) {

                    let assumedCagrVal = (cell.getValue() !== "" || typeof cell.getValue() !== "undefined") ? parseFloat(cell.getValue()) : -1; // cell value
                    assumedCagrVal = assumedCagrVal / 100; // since its mentioned in % value

                    let cellRow = cell.getRow();
                    let baseYearVal = cellRow.getCell(this.dateData.baseYear).getValue();



                    // for all years < base year
                    // formulae: (+1 year value) * (1+assumed CAGR Value) * year_factor
                    let factorYearData = {};
                    if (tableType == 'value')
                        factorYearData = this.factorYearDataVal;
                    else if (tableType == 'volume')
                        factorYearData = this.factorYearDataVol;

                    let year = this.dateData.baseYear - 1;
                    let yearVal = -1;

                    while (year >= this.dateData.startYear) {
                        yearVal = cellRow.getCell(year + 1).getValue() / (1 + assumedCagrVal) * factorYearData[year] || 0.0;
                        cellRow.getCell(year).setValue(yearVal.toFixed(2));
                        year--;
                    }

                    // for all years < base year
                    // formulae: (-1 year value) * (1+assumed CAGR Value) * year_factor
                    year = this.dateData.baseYear + 1;
                    yearVal = -1;
                    while (year <= this.dateData.endYear) {
                        yearVal = cellRow.getCell(year - 1).getValue() * (1 + assumedCagrVal) * factorYearData[year] || 0.0;
                        cellRow.getCell(year).setValue(yearVal.toFixed(2));
                        year++;
                    }

                    // CAGR %
                    let syear = this.dateData.baseYear + 1;
                    let yearDiff = this.dateData.endYear - this.dateData.baseYear;
                    let endYearVal = cellRow.getCell(this.dateData.endYear).getValue();
                    let syearVal = cellRow.getCell(syear).getValue();

                    let cagrVal = (Math.pow(endYearVal / syearVal, (1 / 1)) - 1) * 100 || 0.0;
                    let cagrColHeader = `${this.CONSTANTS.COLS.CAGR} (${this.dateData.startYear}-${this.dateData.endYear})`;
                    cellRow.getCell(cagrColHeader).setValue(cagrVal.toFixed(2));

                    let colCells = cell.getColumn().getCells();
                    this.isSplitColFilled = 1;
                    colCells.forEach((cell) => {
                        if (cell.getValue() == 0 || cell.getValue() == -1 || cell.getValue() == '')
                            this.isSplitColFilled = 0;
                    })

                }

                return false;
                // call sort and copy row on split column only when all the values of split columns are filled
                /* let colCells = cell.getColumn().getCells();
                this.isSplitColFilled = 1;
                colCells.forEach((cell)=>{
                    if (cell.getValue() == 0 || cell.getValue() == -1 || cell.getValue() == '')
                    this.isSplitColFilled = 0;
                })
                if (this.isSplitColFilled == 1) {
                    tab.setSort(this.CONSTANTS.COLS.SPLIT, "asc");
                } */

                let tab = cell.getTable();
                let res = this.areTableAllRowsFilled(tab);
                if (res.tabFilled) {

                    // max row data = total row data - sum(all other rows excluding max row)
                    let rowsData = tab.getData();
                    let maxRowIdx = res.maxRowIdx;
                    let totlRowData = rowsData[rowsData.length - 1];
                    let nonMaxRowMap = {};
                    let maxRowMap = {};

                    // calc all row data sum except maxrowidx
                    for (let i = 0; i < rowsData.length - 1; i++) {  // skip total row
                        let rowData = rowsData[i];
                        if (maxRowIdx == i) {
                            continue;
                        } else {
                            for (let key in rowData) {
                                let nonMaxVal = 0.0;
                                if (!nonMaxRowMap[key]) {
                                    nonMaxVal = !isNaN(nonMaxRowMap[key]) ? parseFloat(nonMaxRowMap[key]) : 0.0;
                                }
                                nonMaxRowMap[key] = (nonMaxVal + parseFloat(rowData[key])).toFixed(2);
                            }
                        }
                    };

                    // calc maxrow data after negation
                    for (let key in res.maxRowData) {
                        if (!isNaN(parseInt(key))) {
                            maxRowMap[key] = (parseFloat(totlRowData[key]) - parseFloat(nonMaxRowMap[key])).toFixed(2);
                        }
                    }
                    maxRowMap['id'] = res.maxRowData[this.CONSTANTS.COLS.SPLIT];

                    console.log(maxRowMap);
                    console.log(res.maxRowData);

                    let splitTot = parseFloat(res.maxRowData[this.CONSTANTS.COLS.SPLIT]) + parseFloat(nonMaxRowMap[this.CONSTANTS.COLS.SPLIT]);
                    if (splitTot < 100) {
                        // alert("Error: Split Column sum should not be less than 100%!!!");
                        // return;
                    }
                    //    + parseFloat(res.maxRowData[this.CONSTANTS.COLS.SPLIT]);

                    // asc order sort for rows
                    tab.setSort(this.CONSTANTS.COLS.SPLIT, "asc");

                    /* tab.updateRow(maxRowMap['id'], maxRowMap)
                    .then((suc) => {
                        console.log("success: " + suc);
                    })
                    .catch((err) => {
                        console.log("error: " + err);
                    }); */
                }

                // APPLICABLE TO ONLY PARENT TABLES

                // all below processing is only applicable to parent table
                // so if the table id is not in the parent table names (i.e tab names)
                // then skip the processing assuming the the current table is subtable and not parent tbale
                let tableName = cell.getTable().element.id.replace('_value', '');
                tableName = tableName.replace('_volume', '');
                if (!this.tabNames.includes(tableName)) {
                    // return;
                }

                // set total row Value on each cell edit
                let allCols = cell.getTable().getColumns();
                allCols.shift();    // removed header column
                allCols.forEach((col) => {
                    if (!col.getField().includes(this.CONSTANTS.COLS.ASSUMED_CAGR)
                        && !col.getField().includes(this.CONSTANTS.COLS.SPLIT)
                        && !col.getField().includes(this.CONSTANTS.COLS.CAGR)
                        && !col.getField().includes(this.dateData.baseYear)) {
                        // let col = cell.getColumn();
                        let colCells = col.getCells();
                        let i = 0;
                        let sum = 0;
                        while (i < colCells.length - 1) {
                            sum = sum + parseFloat(colCells[i].getValue());
                            i++;
                        }
                        colCells[i].setValue(sum.toFixed(2));
                    }
                });

                // copy the total rows from parent to sub-tables
                let allRows = cell.getTable().getRows();
                let tabType = cell.getTable().element.id || "";

                let tabKeys = [];
                for (let i = 0; i < allRows.length - 1; i++) { // skip the total row
                    let key = allRows[i].getCells()[0].getValue();
                    key = key.replace(/ /ig, '_');
                    key = tabType.includes('volume') ? `${key}_volume` : `${key}_value`;
                    key = key.toLowerCase();
                    let tabObj = this.tableDataMap[key] ? this.tableDataMap[key].getRows() : [];
                    if (tabObj.length > 0) {
                        let lastRow = tabObj[tabObj.length - 1];
                        let lastRowCells = lastRow.getCells();
                        lastRowCells.forEach((cell) => {
                            if (!cell.getField().includes(this.CONSTANTS.COLS.ASSUMED_CAGR)
                                && !cell.getField().includes(this.CONSTANTS.COLS.SPLIT)
                                && !cell.getField().includes(this.CONSTANTS.COLS.CAGR)) {
                                let val = allRows[i].getData()[cell.getField()];
                                if (!isNaN(parseInt(val)))
                                    cell.setValue(allRows[i].getData()[cell.getField()]);
                            }
                        });
                    }
                }
            },
            onAvgPEditCheck: (function (that) {
                // return true;
                return (function (cell) {
                    if (mainTable)
                        return false;
                    let isColLastCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check
                    return (isColLastCell ? false : true);
                });
            })(this),
            onAvgPCellEdit: function (cell) {
                let pos = cell.getRow().getPosition(true);
                let volRowComp = this.valueTabObj.getRowFromPosition(pos, true);
                let valRowComp = this.volTabObj.getRowFromPosition(pos, true);

                let volSplitCellComp = volRowComp.getCell(this.CONSTANTS.COLS.SPLIT);
                // volSplitCellComp.setValue((parseFloat(valRowComp.getData()[this.CONSTANTS.COLS.SPLIT]) / parseFloat(cell.getValue())).toFixed(2));

            }
        };
    };

    constructGeoSegTable(rowData, dateData, segmentName, tableType, divId, tableDataMap, mainTable, valFactorId, volFactorId) {
        let origSegName = segmentName;
        segmentName = segmentName.replace(/ /g, '_').toLowerCase();

        // column data generation
        let column_width = 70;
        let column_height = 50;
        let isEditable = false; // inplace editing
        let isSort = false;

        // Header Col
        let columns = [{
            title: origSegName,
            field: segmentName,
            width: column_width + 100,
            editor: "input", editable: this.geoSegTableFunctions(this, mainTable).editCheck,
            headerSort: isSort,
            formatter: function (cell, formatterParams) {
                //cell - the cell component
                //formatterParams - parameters set for the column
                cell.getElement().style.backgroundColor = "lightgray";
                return cell.getValue();
            }
        }];

        // SPLIT COLS
        columns.push({
            title: this.CONSTANTS.COLS.SPLIT,
            field: this.CONSTANTS.COLS.SPLIT,
            width: column_width + 10,
            editor: "input", editable: this.geoSegTableFunctions(this, mainTable).editCheck, headerSort: isSort,
            validator: ["required", "numeric", "max:100", {
                type: function (cell, newVal, params) {
                    let sum = 0;
                    let allColCells = cell.getColumn().getCells();
                    for (let i = 0; i < allColCells.length - 1; i++) {
                        let colCell = allColCells[i];
                        if (cell.getValue() == colCell.getValue()) {
                            continue;
                        }
                        sum = sum + parseInt(colCell.getValue());
                    };

                    if ((sum + parseInt(newVal)) > 100) {
                        return false;
                    } else
                        return true;
                }
            }],
            cellEdited: this.geoSegTableFunctions(this, mainTable).onCellEdit.bind(this),
            sorter: "number",
            formatter: function (cell, formatterParams) {
                //cell - the cell component
                //formatterParams - parameters set for the column
                cell.getElement().style.backgroundColor = "#B8CCE4";
                return cell.getValue();
            }
        });

        // year cols
        let yearCounter = dateData.startYear;
        while (yearCounter <= dateData.endYear) {
            let colConfig = {
                title: `${yearCounter}`,
                field: `${yearCounter}`,
                width: column_width,
                headerSort: isSort,
                editor: "input", editable: this.geoSegTableFunctions(this, mainTable).editCheck,
                validator: ["required", "numeric"]
            };

            if (yearCounter === dateData.baseYear) {
                // colConfig["cssClass"] = "olive";
            }

            columns.push(colConfig);

            yearCounter++;
        }

        // CAGR COLS
        columns.push({
            title: this.CONSTANTS.COLS.ASSUMED_CAGR,
            field: this.CONSTANTS.COLS.ASSUMED_CAGR,
            width: column_width + 80,
            editor: "input", editable: this.geoSegTableFunctions(this, mainTable).editCheck, headerSort: isSort,
            validator: ["required", "numeric"],
            cellEdited: this.geoSegTableFunctions(this, mainTable).onCellEdit.bind(this)
        });
        columns.push({ title: `${this.CONSTANTS.COLS.CAGR} (${dateData.startYear}-${dateData.endYear})`, field: `${this.CONSTANTS.COLS.CAGR} (${dateData.startYear}-${dateData.endYear})`, width: column_width + 120, editor: "input", editable: this.geoSegTableFunctions(this, mainTable).editCheck, headerSort: isSort, validator: ["required", "numeric"] });

        divId = divId.replace(/\./ig, "\\.");
        //Build Tabulator
        var tableConfig = new Tabulator(`#${divId}`, {
            rowFormatter: (function (segmentName, that) {
                return (function (row) {
                    if (row.getData()['' + segmentName] == that.CONSTANTS.ROWS.TOTAL) {
                        row.getElement().style.backgroundColor = "lightgray";
                        row.getElement().style.fontWeight = "bold";
                        if (row.getCell(that.dateData.baseYear)) {
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.backgroundColor = "#ffffed";
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.fontWeight = "bold";
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.color = "black";
                        }
                    }
                });
            })(segmentName, this),
            columns: columns,
        });

        // ROWS

        // define rows with column obj
        if (Array.isArray(rowData)) {
            for (let i = 0; i < rowData.length; i++) {
                let rowObj = { ['' + segmentName]: rowData[i] };
                columns.forEach((col) => {
                    if (col.field !== segmentName)
                        rowObj = { ...rowObj, ...{ ['' + col.title]: 0 } };
                });
                tableConfig.addRow(rowObj);
                // tableConfig.addRow({[''+segmentName]: key});
            }
        } else {
            for (var key in rowData) {
                // tableConfig.addRow({[''+segmentName]: key});
                let rowObj = { ['' + segmentName]: key };
                columns.forEach((col) => {
                    if (col.field !== segmentName)
                        rowObj = { ...rowObj, ...{ ['' + col.title]: 0 } };
                });
                tableConfig.addRow(rowObj);
            }
        }

        // tableConfig.addRow({[''+segmentName]: 'Total'});
        let rowObj = { ['' + segmentName]: this.CONSTANTS.ROWS.TOTAL };
        columns.forEach((col) => {
            if (col.field !== segmentName
                && col.field !== this.CONSTANTS.COLS.SPLIT)
                rowObj = { ...rowObj, ...{ ['' + col.title]: '' } };
            else if (col.field === this.CONSTANTS.COLS.SPLIT)
                rowObj = { ...rowObj, ...{ ['' + col.title]: 100 } };

        });
        tableConfig.addRow(rowObj);

        tableDataMap[`${divId.toLowerCase()}`] = tableConfig;
    }


    // III. for handling of tables related to tabs of format 'segment_parent'

    segParentTableFunctions(that, mainTable) {
        return {
            editCheck: (function (that, mainTable) {
                // return true;
                return (function (cell) {
                    let col = cell.getField();
                    let tab = cell.getTable();
                    let isColCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check
                    let retVal = false;

                    switch (col) {
                        case that.CONSTANTS.COLS.SPLIT:
                            // for vol, split is disabled
                            if (tab.element.id.includes('_volume'))
                                retVal = false;
                            if (!isColCell) { retVal = true; }
                            else { retVal = false; }
                            break;
                        case that.CONSTANTS.COLS.ASSUMED_CAGR:
                            if (!isColCell) { retVal = true; }
                            else { retVal = false; }
                            break;
                        case that.dateData.baseYear.toString():
                            retVal = false;
                            break;
                        default:
                            retVal = false;
                            break;
                    }
                    if (retVal) {
                        cell.getElement().style.backgroundColor = "#B8CCE4";
                    }
                    return retVal;
                });
            })(that, mainTable),
            // on cell edit
            onCellEdit: function (cell) {
                console.log(cell);
                let colHeader = cell.getField();
                let val = cell.getValue();
                let tableElementId = cell.getTable().element.id;
                let isColTotCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check

                let tableType = '';
                if (tableElementId.includes('value'))
                    tableType = 'value';
                else if (tableElementId.includes('volume'))
                    tableType = 'volume';
                else
                    tableType = 'avgp';

                // base year value edit
                if (colHeader == this.dateData.baseYear
                    && isColTotCell) { // last row in table check
                    let func = this.segParentTableFunctions().onCellEdit.bind(this);
                    let colCells = cell.getColumn().getCells();
                    colCells.forEach((colCell, idx) => {
                        if (idx != (colCells.length - 1)) { // dont set last cell in base year col, since its the total cell
                            let splitCellVal = colCell.getRow().getCell(this.CONSTANTS.COLS.SPLIT).getValue();
                            colCell.setValue((splitCellVal / 100) * val);
                            func(colCell.getRow().getCell(this.CONSTANTS.COLS.ASSUMED_CAGR))
                        }
                    });
                }

                if (isColTotCell)
                    return;

                // split col value edit
                if (colHeader == this.CONSTANTS.COLS.SPLIT) { // last row in table check
                    let baseYearRowCell = cell.getRow().getCell(this.dateData.baseYear);

                    let tab = cell.getTable();
                    let baseYearCol = tab.getColumn(this.dateData.baseYear);
                    let baseYearTotCell = baseYearCol.getCells()[tab.getRows().length - 1];
                    baseYearRowCell.setValue((cell.getValue() / 100) * baseYearTotCell.getValue());

                    let func = this.segParentTableFunctions().onCellEdit.bind(this);
                    func(cell.getRow().getCell(this.CONSTANTS.COLS.ASSUMED_CAGR))
                }

                // assumed CAGR edit
                if (colHeader == this.CONSTANTS.COLS.ASSUMED_CAGR) {

                    let assumedCagrVal = (cell.getValue() !== "" || typeof cell.getValue() !== "undefined") ? parseFloat(cell.getValue()) : -1; // cell value
                    assumedCagrVal = assumedCagrVal / 100; // since its mentioned in % value

                    let cellRow = cell.getRow();
                    let baseYearVal = cellRow.getCell(this.dateData.baseYear).getValue();

                    // for all years < base year
                    // formulae: (+1 year value) * (1+assumed CAGR Value) * year_factor

                    let factorYearData = 0;
                    if (tableType == 'value')
                        factorYearData = this.factorYearDataVal;
                    else if (tableType == 'volume')
                        factorYearData = this.factorYearDataVol;

                    let year = this.dateData.baseYear - 1;
                    let yearVal = -1;
                    while (year >= this.dateData.startYear) {
                        yearVal = cellRow.getCell(year + 1).getValue() / (1 + assumedCagrVal) * factorYearData[year] || 0.0;
                        cellRow.getCell(year).setValue(yearVal.toFixed(2));
                        year--;
                    }

                    // for all years < base year
                    // formulae: (-1 year value) * (1+assumed CAGR Value) * year_factor
                    year = this.dateData.baseYear + 1;
                    yearVal = -1;
                    while (year <= this.dateData.endYear) {
                        yearVal = cellRow.getCell(year - 1).getValue() * (1 + assumedCagrVal) * factorYearData[year] || 0.0;
                        cellRow.getCell(year).setValue(yearVal.toFixed(2));
                        year++;
                    }

                    // CAGR %
                    let syear = this.dateData.baseYear + 1;
                    let yearDiff = this.dateData.endYear - this.dateData.baseYear;
                    let endYearVal = cellRow.getCell(this.dateData.endYear).getValue();
                    let syearVal = cellRow.getCell(syear).getValue();

                    let cagrVal = (Math.pow(endYearVal / syearVal, (1 / 1)) - 1) * 100 || 0.0;
                    let cagrColHeader = `${this.CONSTANTS.COLS.CAGR} (${this.dateData.startYear}-${this.dateData.endYear})`;
                    cellRow.getCell(cagrColHeader).setValue(cagrVal.toFixed(2));

                    let colCells = cell.getColumn().getCells();
                    this.isSplitColFilled = 1;
                    colCells.forEach((cell) => {
                        if (cell.getValue() == 0 || cell.getValue() == -1 || cell.getValue() == '')
                            this.isSplitColFilled = 0;
                    })

                }

                let tab = cell.getTable();
                let res = this.areTableAllRowsFilled(tab);
                if (res.tabFilled) {

                    // max row data = total row data - sum(all other rows excluding max row)
                    let rowsData = tab.getData();
                    let maxRowIdx = res.maxRowIdx;
                    let totlRowData = rowsData[rowsData.length - 1];
                    let nonMaxRowMap = {};
                    let maxRowMap = {};

                    // calc all row data sum except maxrowidx
                    for (let i = 0; i < rowsData.length - 1; i++) {  // skip total row
                        let rowData = rowsData[i];
                        if (maxRowIdx == i) {
                            continue;
                        } else {
                            for (let key in rowData) {
                                let nonMaxVal = 0.0;
                                if (!nonMaxRowMap[key]) {
                                    nonMaxVal = !isNaN(nonMaxRowMap[key]) ? parseFloat(nonMaxRowMap[key]) : 0.0;
                                }
                                nonMaxRowMap[key] = (nonMaxVal + parseFloat(rowData[key])).toFixed(2);
                            }
                        }
                    };

                    // calc maxrow data after negation
                    for (let key in res.maxRowData) {
                        if (!isNaN(parseInt(key))) {
                            maxRowMap[key] = (parseFloat(totlRowData[key]) - parseFloat(nonMaxRowMap[key])).toFixed(2);
                        }
                    }
                    maxRowMap['id'] = res.maxRowData[this.CONSTANTS.COLS.SPLIT];

                    // console.log(maxRowMap);
                    // console.log(res.maxRowData);

                    let splitTot = parseFloat(res.maxRowData[this.CONSTANTS.COLS.SPLIT]) + parseFloat(nonMaxRowMap[this.CONSTANTS.COLS.SPLIT]);
                    if (splitTot < 100) {
                        // alert("Error: Split Column sum should not be less than 100%!!!");
                        // return;
                    }
                    //    + parseFloat(res.maxRowData[this.CONSTANTS.COLS.SPLIT]);

                    // asc order sort for rows
                    tab.setSort(this.CONSTANTS.COLS.SPLIT, "asc");

                    /* tab.updateRow(maxRowMap['id'], maxRowMap)
                    .then((suc) => {
                        console.log("success: " + suc);
                    })
                    .catch((err) => {
                        console.log("error: " + err);
                    }); */

                }

                // APPLICABLE TO ONLY PARENT TABLES

                // all below processing is only applicable to parent table
                // so if the table id is not in the parent table names (i.e tab names)
                // then skip the processing assuming the the current table is subtable and not parent tbale
                let tableName = cell.getTable().element.id.replace('_value', '');
                tableName = tableName.replace('_volume', '');
                if (!this.tabNames.includes(tableName)) {
                    return;
                }

                // set total row Value on each cell edit
                let allCols = cell.getTable().getColumns();
                allCols.shift();    // removed header column
                allCols.forEach((col) => {
                    if (!col.getField().includes(this.CONSTANTS.COLS.ASSUMED_CAGR)
                        && !col.getField().includes(this.CONSTANTS.COLS.SPLIT)
                        && !col.getField().includes(this.CONSTANTS.COLS.CAGR)
                        && !col.getField().includes(this.dateData.baseYear)) {
                        // let col = cell.getColumn();
                        let colCells = col.getCells();
                        let i = 0;
                        let sum = 0;
                        while (i < colCells.length - 1) {
                            sum = sum + parseFloat(colCells[i].getValue());
                            i++;
                        }
                        colCells[i].setValue(sum.toFixed(2));
                    }
                });

                // copy the total rows from parent to sub-tables
                let allRows = cell.getTable().getRows();
                let tabType = cell.getTable().element.id || "";

                let tabKeys = [];
                for (let i = 0; i < allRows.length - 1; i++) { // skip the total row
                    let key = allRows[i].getCells()[0].getValue();
                    key = key.replace(/ /ig, '_');
                    key = tabType.includes('volume') ? `${key}_volume` : `${key}_value`;
                    let parentTabKey = tabType.replace('_parent_volume','');
                    parentTabKey = parentTabKey.replace('_parent_value','');

                    key = `${parentTabKey}_${key}`.toLowerCase();
                    let tabObj = this.tableDataMap[key] ? this.tableDataMap[key].getRows() : [];
                    if (tabObj.length > 0) {
                        let lastRow = tabObj[tabObj.length - 1];
                        let lastRowCells = lastRow.getCells();
                        lastRowCells.forEach((cell) => {
                            if (!cell.getField().includes(this.CONSTANTS.COLS.ASSUMED_CAGR)
                                && !cell.getField().includes(this.CONSTANTS.COLS.SPLIT)
                                && !cell.getField().includes(this.CONSTANTS.COLS.CAGR)) {
                                let val = allRows[i].getData()[cell.getField()];
                                if (!isNaN(parseInt(val)))
                                    cell.setValue(allRows[i].getData()[cell.getField()]);
                            }
                        });
                    }
                }

                if (res.tabFilled) {
                    // dispatch table set event for copying the table data to geo_segment tab parent table
                    let evt = new CustomEvent(this.CONSTANTS.EVENTS.SEG_PARENT_TABLE_SET, { "detail": { "segmentParentTabObj": cell.getTable(), "type": cell.getTable().element.id.includes('_value') ? 'value' : 'volume' } });
                    window.dispatchEvent(evt);
                }
            },
            onAvgPEditCheck: (function (that) {
                // return true;
                return (function (cell) {
                    let isColLastCell = (cell.getRow().getPosition() == (cell.getTable().getRows().length - 1)); // last row in table check
                    return (isColLastCell ? false : true);
                });
            })(this),
            onAvgPCellEdit: function (cell) {
                let pos = cell.getRow().getPosition(true);
                let volRowComp = this.valueTabObj.getRowFromPosition(pos, true);
                let valRowComp = this.volTabObj.getRowFromPosition(pos, true);

                let volSplitCellComp = volRowComp.getCell(this.CONSTANTS.COLS.SPLIT);
                // volSplitCellComp.setValue((parseFloat(valRowComp.getData()[this.CONSTANTS.COLS.SPLIT]) / parseFloat(cell.getValue())).toFixed(2));

                let allRows = cell.getTable().getData();
                let tabFilled = true;
                for (let i=0;i<allRows.length-1;i++) {
                    let row = allRows[i];
                    for (var colKey in row) {
                        let val = row[colKey];
                        if (val == -1 || val == 0 || val == '' || typeof(val) == "undefined") {
                            tabFilled = false;
                        }
                    }
                }

                if (tabFilled) {
                    let evt = new CustomEvent(this.CONSTANTS.EVENTS.AVGP_SEG_PARENT_VALUE_SET, { "detail": { "avgParentTabObj": cell.getTable(), "type": 'avgp' } });
                    window.dispatchEvent(evt);
                }
            }
        };
    };

    // construct a table with defined div - For Volume and Value tables can be generated from this
    segParentTables(dateData, regionData, finalSegData, tabDataObj, tabName, tableDataMap) {
        let segName = tabName.replace('_parent', '');
        let subseg = finalSegData[segName.charAt(0).toUpperCase() + segName.substring(1)]
            || finalSegData[segName] || finalSegData[segName.toUpperCase()] || []; // subseg array
        let rowDataObj = {};

        // table for regions - I. Main Table
        let valueTabDiv = this.createTableDiv(tabName, this.CONSTANTS.VAL);
        let avgPrTabDiv = this.createTableDiv(tabName, this.CONSTANTS.AVG);
        let volumeTabDiv = this.createTableDiv(tabName, this.CONSTANTS.VOL);
        let ValFactor = this.createTableDiv(tabName, this.CONSTANTS.VAL + "_factor");
        let VolFactor = this.createTableDiv(tabName, this.CONSTANTS.VOL + "_factor");

        let tabContentDiv = document.getElementById(tabName);
        this.injectTablesInPage(tabContentDiv, volumeTabDiv, valueTabDiv, avgPrTabDiv, ValFactor, VolFactor, "");
        this.constructSegParTable(subseg, dateData, tabName, this.CONSTANTS.VOL, volumeTabDiv.id, tableDataMap, true, ValFactor.id, VolFactor.id);
        this.constructSegParTable(subseg, dateData, tabName, this.CONSTANTS.VAL, valueTabDiv.id, tableDataMap, true, "", "");
        this.constructAvgPriceTable(subseg, avgPrTabDiv.id, tableDataMap, true, tableDataMap[volumeTabDiv.id], tableDataMap[valueTabDiv.id], tabName);


        // II. Sub Tables
        for (let i = 0; i < subseg.length; i++) {
            let subsegName = subseg[i];
            if (finalSegData.hasOwnProperty(subsegName)) {
                rowDataObj['' + subseg[i]] = finalSegData[subsegName];
            }
        }

        // for all sub sub segments of a segment
        for (var key in rowDataObj) {
            valueTabDiv = this.createTableDiv(`${segName}_${key}`, this.CONSTANTS.VAL);
            avgPrTabDiv = this.createTableDiv(`${segName}_${key}`, this.CONSTANTS.AVG);
            volumeTabDiv = this.createTableDiv(`${segName}_${key}`, this.CONSTANTS.VOL);

            this.injectTablesInPage(tabContentDiv, volumeTabDiv, valueTabDiv, avgPrTabDiv, "", "", "");

            this.constructSegParTable(rowDataObj[key], dateData, `${segName}_${key}`, this.CONSTANTS.VOL, volumeTabDiv.id, tableDataMap, false);
            this.constructSegParTable(rowDataObj[key], dateData, `${segName}_${key}`, this.CONSTANTS.VAL, valueTabDiv.id, tableDataMap, false);
            this.constructAvgPriceTable(rowDataObj[key], avgPrTabDiv.id, tableDataMap, true, tableDataMap[volumeTabDiv.id], tableDataMap[valueTabDiv.id], tabName);
        }

        var updateGeoSegTab = function (e) {
            // console.log(this);
            let origTabName = e.detail.segmentParentTabObj.element.id;
            origTabName = origTabName.replace('_value', '');
            origTabName = origTabName.replace('_volume', '');

            let tabName = origTabName.replace('_parent', '');
            tabName = `geography_${tabName}`;

            let tabData = e.detail.segmentParentTabObj.getData();
            tabData.forEach((rowData)=>{
                for (let key in rowData) {
                    if (key == origTabName)
                        rowData[tabName] = rowData[key];
                }
            });

            let tabKeys = Object.keys(this.tableDataMap);

            tabKeys.forEach((key) => {
                if (key == `${tabName}_${e.detail.type}`) {
                    this.tableDataMap[key].replaceData(tabData);
                    this.tableDataMap[key].redraw(); //restore table redrawing
                }
            });

        };
        updateGeoSegTab = updateGeoSegTab.bind(this);

        window.addEventListener(this.CONSTANTS.EVENTS.SEG_PARENT_TABLE_SET, updateGeoSegTab, { "capture": false });


        let updateavgPGeoSegTab = function (e) {
            let origTabName = e.detail.avgParentTabObj.element.id;
            origTabName = origTabName.replace('_value', '');
            origTabName = origTabName.replace('_volume', '');
            origTabName = origTabName.replace('_avgp', '');

            let tabName = origTabName.replace('_parent', '');
            tabName = `geography_${tabName}`;

            let tabData = e.detail.avgParentTabObj.getData();
            tabData.forEach((rowData)=>{
                for (let key in rowData) {
                    if (key == origTabName)
                        rowData[tabName] = rowData[key];
                }
            });

            let tabKeys = Object.keys(this.tableDataMap);

            tabKeys.forEach((key) => {
                if (key == `${tabName}_${e.detail.type}`) {
                    this.tableDataMap[key].replaceData(tabData);
                    this.tableDataMap[key].redraw(); //restore table redrawing
                }
            });

        };
        updateavgPGeoSegTab = updateavgPGeoSegTab.bind(this);

        window.addEventListener(this.CONSTANTS.EVENTS.AVGP_SEG_PARENT_VALUE_SET, updateavgPGeoSegTab, { "capture": false });

    }

    constructSegParTable(rowData, dateData, segmentName, tableType, divId, tableDataMap, mainTable, valFactorId, volFactorId) {
        let origSegName = segmentName;
        segmentName = segmentName.replace(/ /g, '_').toLowerCase();

        // column data generation
        let column_width = 70;
        let column_height = 50;
        let isEditable = false; // inplace editing
        let isSort = false;

        // Header Col
        let columns = [{
            title: origSegName,
            field: segmentName,
            width: column_width + 100,
            editor: "input", editable: this.segParentTableFunctions(this, mainTable).editCheck,
            headerSort: isSort,
            formatter: function (cell, formatterParams) {
                //cell - the cell component
                //formatterParams - parameters set for the column
                cell.getElement().style.backgroundColor = "lightgray";
                return cell.getValue();
            }
        }];

        // SPLIT COLS
        columns.push({
            title: this.CONSTANTS.COLS.SPLIT,
            field: this.CONSTANTS.COLS.SPLIT,
            width: column_width + 10,
            editor: "input", editable: this.segParentTableFunctions(this, mainTable).editCheck,
            headerSort: isSort,
            validator: ["required", "numeric", "max:100", {
                type: function (cell, newVal, params) {
                    let sum = 0;
                    let allColCells = cell.getColumn().getCells();
                    for (let i = 0; i < allColCells.length - 1; i++) {
                        let colCell = allColCells[i];
                        if (cell.getValue() == colCell.getValue()) {
                            continue;
                        }
                        sum = sum + parseInt(colCell.getValue());
                    };

                    if ((sum + parseInt(newVal)) > 100) {
                        return false;
                    } else
                        return true;
                }
            }],
            cellEdited: this.segParentTableFunctions(this, mainTable).onCellEdit.bind(this),
            cellEditing: (cell) => {
                // let domEle = cell.getElement();
            },
            sorter: "number",
            formatter: function (cell, formatterParams) {
                //cell - the cell component
                //formatterParams - parameters set for the column
                cell.getElement().style.backgroundColor = "#B8CCE4";
                return cell.getValue();
            }
        });

        // year cols
        let yearCounter = dateData.startYear;
        while (yearCounter <= dateData.endYear) {
            let colConfig = {
                title: `${yearCounter}`,
                field: `${yearCounter}`,
                width: column_width,
                headerSort: isSort,
                editor: "input", editable: this.segParentTableFunctions(this, mainTable).editCheck,
                validator: ["required", "numeric"]
            };
            columns.push(colConfig);

            yearCounter++;
        }

        // CAGR COLS
        columns.push({
            title: this.CONSTANTS.COLS.ASSUMED_CAGR,
            field: this.CONSTANTS.COLS.ASSUMED_CAGR,
            width: column_width + 80,
            editor: "input", editable: this.segParentTableFunctions(this, mainTable).editCheck,
            headerSort: isSort,
            validator: ["required", "numeric"],
            cellEdited: this.segParentTableFunctions(this, mainTable).onCellEdit.bind(this)
        });
        columns.push({ title: `${this.CONSTANTS.COLS.CAGR} (${dateData.startYear}-${dateData.endYear})`, field: `${this.CONSTANTS.COLS.CAGR} (${dateData.startYear}-${dateData.endYear})`, width: column_width + 120, editor: "input", editable: this.segParentTableFunctions(this, mainTable).editCheck, headerSort: isSort, validator: ["required", "numeric"] });

        divId = divId.replace(/\./ig, "\\.");
        //Build Tabulator
        var tableConfig = new Tabulator(`#${divId}`, {
            rowFormatter: (function (segmentName, that) {
                return (function (row) {
                    if (row.getData()['' + segmentName] == that.CONSTANTS.ROWS.TOTAL) {
                        row.getElement().style.backgroundColor = "lightgray";
                        row.getElement().style.fontWeight = "bold";
                        if (row.getCell(that.dateData.baseYear)) {
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.backgroundColor = "#ffffed";
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.fontWeight = "bold";
                            row.getCell(that.dateData.baseYear).getColumn().getElement().style.color = "black";
                        }
                    }
                });
            })(segmentName, this),
            columns: columns,
        });

        // ROWS

        // define rows with column obj
        if (Array.isArray(rowData)) {
            for (let i = 0; i < rowData.length; i++) {
                let rowObj = { ['' + segmentName]: rowData[i] };
                columns.forEach((col) => {
                    if (col.field !== segmentName)
                        rowObj = { ...rowObj, ...{ ['' + col.title]: 0 } };
                });
                tableConfig.addRow(rowObj);
                // tableConfig.addRow({[''+segmentName]: key});
            }
        } else {
            for (var key in rowData) {
                // tableConfig.addRow({[''+segmentName]: key});
                let rowObj = { ['' + segmentName]: key };
                columns.forEach((col) => {
                    if (col.field !== segmentName)
                        rowObj = { ...rowObj, ...{ ['' + col.title]: 0 } };
                });
                tableConfig.addRow(rowObj);
            }
        }

        // tableConfig.addRow({[''+segmentName]: 'Total'});
        let rowObj = { ['' + segmentName]: this.CONSTANTS.ROWS.TOTAL };
        columns.forEach((col) => {
            if (col.field === this.CONSTANTS.COLS.SPLIT)
                rowObj = { ...rowObj, ...{ ['' + col.title]: 100 } };
            else if (col.field !== segmentName)
                rowObj = { ...rowObj, ...{ ['' + col.title]: '' } };

        });
        tableConfig.addRow(rowObj);

        tableDataMap[`${divId.toLowerCase()}`] = tableConfig;

        // if (valFactorId) {
        //     let cols = [
        //         {
        //             title: 'Factor',
        //             "headerSort": false,
        //             width: column_width
        //         }
        //     ]

        //     let factObj = { "title": "factor", "headerSort": false }

        //     let dateStart = dateData.startYear
        //     while (dateStart <= dateData.endYear) {
        //         if (dateStart != dateData.baseYear) {
        //             cols.push({
        //                 title: `${dateStart}`,
        //                 field: `${dateStart}`,
        //                 width: column_width,
        //                 editor: "input",
        //                 editable: true,
        //                 headerSort: false,
        //                 validator: ["required", "numeric"],
        //                 cellEdited: this.tableFunctions(this, mainTable).onFactCellEdit.bind(this)
        //             })
        //             factObj[dateStart] = 0
        //         }
        //         dateStart++;
        //     }

        //     var factTables = new Tabulator(`#${valFactorId}`, {
        //         columns: cols
        //     });

        //     var volFacttable = new Tabulator(`#${volFactorId}`, {
        //         columns: cols
        //     })
        //     factTables.addRow(factObj);
        //     volFacttable.addRow(factObj);
        //     tableDataMap[`${valFactorId}`] = factTables
        //     tableDataMap[`${volFactorId}`] = volFacttable
        // }
        // add event listeners for table auto value population
        var updateValTabBaseYearTotalVal = function (e) {
            // console.log(this);
            let tabKeys = Object.keys(this.tableDataMap);

            // setting the base year total value to every `segment_parent` main table base year total value
            tabKeys = tabKeys.filter((ele) => { return ((ele.endsWith('_parent_value') || ele.endsWith('_parent_volume')) && !ele.includes('geography_') && !ele.includes('_avgp') && ele.endsWith(`_${e.detail.type}`)) });
            tabKeys.forEach((key) => {
                let baseYearCol = this.tableDataMap[key].getColumn(this.dateData.baseYear);
                let baseYearTotCell = baseYearCol.getCells()[this.tableDataMap[key].getRows().length - 1];
                baseYearTotCell.setValue(e.detail.baseYearTotVal);
            });
        };
        updateValTabBaseYearTotalVal = updateValTabBaseYearTotalVal.bind(this);

        window.addEventListener(this.CONSTANTS.EVENTS.GEO_PARENT_BASE_VALUE_SET, updateValTabBaseYearTotalVal, { "capture": false });
    }


    // construct Average Price tables
    constructAvgPriceTable(rowData, divId, tableDataMap, mainTable, volTabObj, valueTabObj, tabName, spacerId) {
        // column data generation
        let column_width = 100;
        let column_height = 50;
        let isEditable = true; // inplace editing
        let isSort = false;

        divId = divId.replace(/\./ig, "\\.");

        let oThis = { ...{}, ...this };
        oThis.valueTabObj = volTabObj;
        oThis.volTabObj = valueTabObj;
        let tabFunctions = this.tableFunctions(oThis, mainTable); // default

        if (tabName == 'geography_parent') {    // geo parent tab
            tabFunctions = this.tableFunctions(oThis, mainTable);
        } else if (tabName.startsWith('geography')) {    // for Geography_<seg_name> tabs
            tabFunctions = this.geoSegTableFunctions(oThis, mainTable);
        } else if (tabName.endsWith('_parent')) {  // for <seg_name>_Parent tabs
            tabFunctions = this.segParentTableFunctions(oThis, mainTable);
        }

        //Build Tabulator
        var tableConfig = new Tabulator(`#${divId.toLowerCase()}`, {
            columns: [{
                title: this.CONSTANTS.AVG,
                field: this.CONSTANTS.AVG,
                validator: ["required", "numeric"],
                height: column_height,
                width: column_width,
                editor: "input", editable: tabFunctions.onAvgPEditCheck,
                headerSort: isSort,
                cellEdited: tabFunctions.onAvgPCellEdit.bind(oThis),
                formatter: function (cell, formatterParams) {
                    //cell - the cell component
                    //formatterParams - parameters set for the column
                    cell.getElement().style.backgroundColor = "#B8CCE4";
                    return cell.getValue();
                }
            }]
        });

        // define rows with column obj
        if (Array.isArray(rowData)) {
            for (let i = 0; i < rowData.length; i++) {
                //tableConfig.addRow({});
                tableConfig.addRow({ [`${this.CONSTANTS.AVG}`]: 0 });
            }
        } else {
            for (var key in rowData) {
                // tableConfig.addRow({});
                tableConfig.addRow({ [`${this.CONSTANTS.AVG}`]: 0 });
            }
        }
        // tableConfig.addRow({});
        tableConfig.addRow({ [`${this.CONSTANTS.AVG}`]: 0 });

        if (spacerId) {
            document.getElementById(spacerId).style.margin = "65px 0 0 0"
        }
        // tableDataMap[`${divId.toLowerCase()}`] = tableConfig;
        tableDataMap[`${divId.toLowerCase()}`] = tableConfig;
    }

    // create a Table Div
    createTableDiv(segmentName, tableType) {
        segmentName = segmentName.replace(/ /g, '_');

        let div = document.createElement('div');
        div.id = `${segmentName}_${tableType}`.toLowerCase();
        div.className = "table-bordered thead-dark table-sm";
        div.style = "overflow:visible";
        return div;
    }

    injectTabsinPage(tabNames) {
        let navEle = document.createElement('nav');
        let divEle = document.createElement('div');
        divEle.className = "nav nav-tabs";
        divEle.id = "nav-tab";
        divEle.role = "tablist";

        for (let i = 0; i < tabNames.length; i++) {
            let tabName = tabNames[i];
            tabName = tabName.replace(/ /g, '_');
            let aEle = document.createElement('a');
            aEle.setAttribute('data-toggle', "tab");
            aEle.setAttribute("role", "tab");
            aEle.id = `nav-${tabName}-tab`;
            aEle.href = `#/nav-${tabName}`;

            aEle.innerHTML = tabName;

            if (tabName.indexOf('Geography_Parent') !== -1) {    // geography parent should be active by default
                aEle.className = "nav-item nav-link active";
                aEle.setAttribute('aria-controls', "nav-home")
                aEle.setAttribute('aria-selected', "true");
            } else {
                aEle.className = "nav-item nav-link";
                aEle.setAttribute('aria-controls', "nav-profile");
                aEle.setAttribute('aria-selected', "false");
            }

            divEle.appendChild(aEle);
        }

        navEle.appendChild(divEle);

        divEle = document.createElement('div');
        divEle.className = "tab-content";
        divEle.id = "nav-tabContent";

        for (let i = 0; i < tabNames.length; i++) {
            let tabName = tabNames[i];
            tabName = tabName.replace(/ /g, '_');

            let divEleChild = document.createElement('div');
            divEleChild.id = `nav-${tabName}`;
            divEleChild.setAttribute("role", "tabpanel");
            divEleChild.setAttribute('aria-labelledby', `nav-${tabName}-tab`);

            if (tabName.indexOf('Geography_Parent') !== -1) {
                divEleChild.className = "tab-pane fade show active";
            } else {
                divEleChild.className = "tab-pane fade";
            }

            // form a boot row - a grid structure to accomodate volume and value in same row
            let rowDiv = document.createElement('div');
            rowDiv.classList = ["row"];

            divEleChild.innerHTML = '<br/>';

            // form volume column
            let rowColVolDiv = document.createElement('div');
            rowColVolDiv.classList = ["col-md-6"];
            let volP = document.createElement('p');
            volP.innerHTML = `<b>${this.CONSTANTS.VOL}</b>`;
            rowColVolDiv.appendChild(volP);

            // form Average Price Table
            let rowColAvgDiv = document.createElement('div');
            rowColAvgDiv.classList = ["col-md-1"];
            let avgP = document.createElement('p');
            avgP.innerHTML = "<b></b>";
            rowColAvgDiv.appendChild(avgP);

            // form value column
            let rowColValDiv = document.createElement('div');
            rowColValDiv.classList = ["col-md-5"];
            let valP = document.createElement('p');
            valP.innerHTML = `<b>${this.CONSTANTS.VAL}</b>`;
            rowColValDiv.appendChild(valP);

            rowDiv.appendChild(rowColVolDiv);
            rowDiv.appendChild(rowColAvgDiv);
            rowDiv.appendChild(rowColValDiv);

            divEleChild.appendChild(rowDiv);

            divEle.appendChild(divEleChild);
        }

        document.body.appendChild(navEle);
        document.body.appendChild(divEle);

    }

    // function to inject the volume, avg price and value tables alongside in the page for single fieldset
    injectTablesInPage(panelBodyDiv, volumeTabDiv, valueTabDiv, avgPrTabDiv, valFactor, volFactor, spacer) {

        let br = document.createElement("br");
        panelBodyDiv.appendChild(br);
        // panelBodyDiv.appendChild(br);

        // form a boot row - a grid structure to accomodate volume and value in same row
        let rowDiv = document.createElement('div');
        rowDiv.classList = ["row"];

        let rowFactorValDiv;
        let rowFactorVolDiv;
        let spacerDiv;
        // form value column
        let rowColValDiv = document.createElement('div');
        rowColValDiv.classList = ["col-md-6"];
        rowColValDiv.appendChild(valueTabDiv);

        if (valFactor && volFactor) {
            rowFactorValDiv = document.createElement('div');
            rowFactorValDiv.appendChild(valFactor);
            rowColValDiv.prepend(rowFactorValDiv)
        }
        // form Average Price Table
        let rowColAvgDiv = document.createElement('div');
        rowColAvgDiv.classList = ["col-md-1.5"];
        rowColAvgDiv.appendChild(avgPrTabDiv);

        // form volume column
        let rowColVolDiv = document.createElement('div');
        rowColVolDiv.classList = ["col-md-5"];
        rowColVolDiv.appendChild(volumeTabDiv);

        if (volFactor && valFactor) {
            // volFactor.innerHTML = "Factor"
            rowFactorVolDiv = document.createElement('div');
            rowFactorVolDiv.appendChild(volFactor);
            rowColVolDiv.prepend(rowFactorVolDiv);

        }
        if (spacer) {
            spacerDiv = document.createElement('div');
            spacerDiv.appendChild(spacer)
            rowColAvgDiv.prepend(spacerDiv);
        }
        rowDiv.appendChild(rowColValDiv);
        rowDiv.appendChild(rowColAvgDiv);
        rowDiv.appendChild(rowColVolDiv);

        panelBodyDiv.appendChild(rowDiv);
    }

    areTableAllRowsFilled(table) {
        let data = table.getData();
        let headerColName = table.element.id;
        headerColName = headerColName.replace('_value', '');
        headerColName = headerColName.replace('_volume', '');
        let tabFilled = true;
        let maxRowIdx = -1;
        let maxSplit = -1;
        let maxRowData = {};
        data.forEach((row, indx) => {
            if (!Object.values(row).includes('Total')
                && row[this.CONSTANTS.COLS.SPLIT] > maxSplit) {
                maxSplit = row[this.CONSTANTS.COLS.SPLIT];
                maxRowIdx = indx;
                maxRowData = row;
            }

            for (let key in row) {

                if (Object.values(row).includes('Total')
                    || key.includes(this.CONSTANTS.COLS.CAGR)
                    && key != this.CONSTANTS.COLS.ASSUMED_CAGR)
                    continue;

                if (row[key] == 0 || row[key] == -1 || row[key] == '') {
                    tabFilled = false;
                }
            }
        });

        return { 'tabFilled': tabFilled, 'maxRowIdx': maxRowIdx, 'maxRowData': maxRowData };
    }

}

// module.exports = {
//     MEGrid
// }
