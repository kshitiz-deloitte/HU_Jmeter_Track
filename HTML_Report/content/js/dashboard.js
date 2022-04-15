/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 56.666666666666664, "KoPercent": 43.333333333333336};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.48717948717948717, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3333333333333333, 500, 1500, "Get Items in Cart After deletion"], "isController": false}, {"data": [0.9333333333333333, 500, 1500, "Login - Transaction Controller"], "isController": true}, {"data": [0.3, 500, 1500, "Get Items in Cart"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "Purchase Items - Transaction Controller"], "isController": true}, {"data": [0.9333333333333333, 500, 1500, "Login Into demoblaze"], "isController": false}, {"data": [0.9333333333333333, 500, 1500, "Delete Cart"], "isController": false}, {"data": [0.0, 500, 1500, "Signup into Demoblaze"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "Delete an item"], "isController": false}, {"data": [0.3111111111111111, 500, 1500, "Add To Cart"], "isController": false}, {"data": [0.0, 500, 1500, "SignUp - Transaction Controller"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150, 65, 43.333333333333336, 381.75333333333356, 0, 1786, 391.0, 567.8000000000001, 663.8999999999997, 1274.4700000000091, 6.418759895588173, 2.171471487333647, 1.3293017726475245], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Items in Cart After deletion", 15, 10, 66.66666666666667, 356.93333333333334, 307, 465, 332.0, 453.0, 465.0, 465.0, 0.8363534987454698, 0.30916765402843605, 0.1734235607750209], "isController": false}, {"data": ["Login - Transaction Controller", 15, 0, 0.0, 436.06666666666666, 385, 523, 425.0, 517.6, 523.0, 523.0, 0.8370068634562804, 0.22232994810557447, 0.1855474199263434], "isController": true}, {"data": ["Get Items in Cart", 15, 10, 66.66666666666667, 387.20000000000005, 303, 557, 392.0, 509.0, 557.0, 557.0, 0.8371002846140967, 0.34557636098554606, 0.17357841188124337], "isController": false}, {"data": ["Debug Sampler", 15, 0, 0.0, 0.39999999999999997, 0, 2, 0.0, 1.4000000000000004, 2.0, 2.0, 0.8556759840273817, 0.4896739517969195, 0.0], "isController": false}, {"data": ["Purchase Items - Transaction Controller", 15, 10, 66.66666666666667, 2663.5333333333333, 2387, 3168, 2595.0, 3142.8, 3168.0, 3168.0, 0.7439000198373339, 1.6891760997321958, 1.210048307007538], "isController": true}, {"data": ["Login Into demoblaze", 15, 0, 0.0, 436.06666666666666, 385, 523, 425.0, 517.6, 523.0, 523.0, 0.8367267250515982, 0.22225553634183076, 0.1854853189323367], "isController": false}, {"data": ["Delete Cart", 15, 0, 0.0, 411.26666666666665, 321, 636, 404.0, 555.0, 636.0, 636.0, 0.8334259362151349, 0.187412316646294, 0.16440628819868874], "isController": false}, {"data": ["Signup into Demoblaze", 15, 15, 100.0, 717.5333333333333, 517, 1786, 654.0, 1184.2000000000003, 1786.0, 1786.0, 0.77780658542909, 0.2134410649468499, 0.1731834975369458], "isController": false}, {"data": ["Delete an item", 15, 0, 0.0, 393.40000000000003, 324, 507, 384.0, 498.6, 507.0, 507.0, 0.8371937266283418, 0.20820833565887145, 0.18558884369593123], "isController": false}, {"data": ["Add To Cart", 45, 30, 66.66666666666667, 371.5777777777778, 306, 511, 358.0, 473.2, 509.4, 511.0, 2.4111879119112682, 0.815502682446552, 0.6373322215077961], "isController": false}, {"data": ["SignUp - Transaction Controller", 15, 15, 100.0, 717.5333333333333, 517, 1786, 654.0, 1184.2000000000003, 1786.0, 1786.0, 0.7730763284028243, 0.21214301589960316, 0.17213027624594135], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected not to contain /errorMessage/", 15, 23.076923076923077, 10.0], "isController": false}, {"data": ["400/Bad Request", 50, 76.92307692307692, 33.333333333333336], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150, 65, "400/Bad Request", 50, "Test failed: text expected not to contain /errorMessage/", 15, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Items in Cart After deletion", 15, 10, "400/Bad Request", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Items in Cart", 15, 10, "400/Bad Request", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Signup into Demoblaze", 15, 15, "Test failed: text expected not to contain /errorMessage/", 15, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Add To Cart", 45, 30, "400/Bad Request", 30, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
