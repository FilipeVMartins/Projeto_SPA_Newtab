





class NewTransaction {

    constructor(tipot, nomemerc, valor) {
        this.ttype = tipot;
        this.prodname = nomemerc;
        this.value = valor;
      };
};


class LocalStorages {

    constructor(tablename, value=null) {
        this.lskey = tablename;
        this.lsvalue = value;
    };

    save() {
        let localStorageTable, newkey;

        // verify if storage wasn't already created
        if (localStorage.getItem(this.lskey) === null) {
            // create it with the incoming value
            let jsontable = {};
            //initialize the table
            jsontable[1] = this.lsvalue

            //localStorage.setItem(this.lskey, '{"1":' + JSON.stringify(this.lsvalue) + '}'); //alternative way

            //convert the json table to string and save.
            localStorage.setItem(this.lskey, JSON.stringify(jsontable));

            //store the last used key for this table
            localStorage.setItem(this.lskey + '-lastkey', '1');

        // else, retrieves the alrdy existing string to add the new registry.
        } else {
            // get the string at local and converts to json.
            localStorageTable = JSON.parse(localStorage.getItem(this.lskey));
            
            // get the last used key and plus one to define the new key number.
            newkey = parseInt(localStorage.getItem(this.lskey + '-lastkey')) + 1;
            localStorageTable[newkey] = this.lsvalue;

            //store the last used key for this table
            localStorage.setItem(this.lskey + '-lastkey', newkey);

            //convert json to string and save all to local.
            localStorage.setItem(this.lskey, JSON.stringify(localStorageTable));
            

            ///debugs
            ///console.log(localStorageTable) //returns the newTransaction obj
            ///console.log(JSON.stringify(localStorageTable));
            ///console.log(JSON.parse(localStorageTable));
            ///localStorageTable = '{'+'"1":'+localStorageTable + ',' + '"2":'+JSON.stringify(this.lsvalue)+'}';
        }
    }

    loadAll(){
        let localStorageTable = localStorage.getItem(this.lskey);

        if( typeof localStorageTable === 'undefined' || localStorageTable === null ){
            localStorageTable = {};
        } else {
            localStorageTable = JSON.parse(localStorageTable);
        }
        return localStorageTable;
    }

    deleteAll(){
        localStorage.removeItem(this.lskey);
        localStorage.removeItem(this.lskey + '-lastkey');
    }
};







class TableView{

    constructor (tablename, transactionkey=null){
        this.tablename = tablename;
        this.transactionkey = transactionkey;
    };

    // function to update view whenever json table is altered in any way.
    /// it's avoind unecessary re-writing of non-changed nodes, but it could be split into 2 more specific functions that would be triggered after the given specific event. 
    loadData(){
        let storage = new LocalStorages (this.tablename);
        let tabledata = storage.loadAll();
        //generates a list with all the keys alrdy present in the table view.
        let viewkeyslist = this.tableViewRows();
        // generate a list with all keys from json tabledata, 
        let jsonkeylist = Object.keys(tabledata);

        // loop through this json key list accessing the tabledata items with the given rowkey.
        jsonkeylist.forEach(rowkey => {
            //add to the table view only the keys from json table that are not alrdy present in the view.
            if (viewkeyslist.includes(rowkey) == false){
                this.writeTableRow(tabledata[rowkey].ttype, tabledata[rowkey].prodname, tabledata[rowkey].value, rowkey);
            }          
            
        });

        // loop through keys present in the view
        for (let i=0 ; i < viewkeyslist.length ; i++){
            //delete from table view the absent keys in json table.
            if (jsonkeylist.includes(viewkeyslist[i]) == false){
                this.deleteTableRow(viewkeyslist[i]);
            }
        }
    };

    tableViewRows (){
        /// i could've used a more specific selector and avoid using .children and comparison with .getAttribute(). like, querySelector('#table div.row[transaction-key]');
        let tablenodes = document.querySelector("#table").children;
        var rowskeylist = new Array();

        //creates a list of the transaction-key attribute values present in the table. i'm gonna use this list to sync the data between table view and json table.
        for (let i=0 ; i < tablenodes.length ; i++){
            if (tablenodes[i].getAttribute("transaction-key") != null){
                rowskeylist.push(tablenodes[i].getAttribute("transaction-key"));
            }
        }

        return rowskeylist;
    }

    writeTableRow(tipot, nomemerc, valor, rowkey) {
        let newrow, lastrow;
    
        if (tipot == 'venda'){
            tipot = '+';
        } else if (tipot == 'compra') {
            tipot = '-';
        };
    
        newrow = document.createElement("div");
        newrow.className = 'row';
        newrow.setAttribute('transaction-key', rowkey);
        newrow.innerHTML = `<div class="col">${tipot}</div>
                            <div class="col">${nomemerc}</div>
                            <div class="col">R$ ${valor}</div>`;
        lastrow = document.querySelector("#table div.row:last-child");
        document.querySelector("#table").insertBefore(newrow, lastrow);
    };

    deleteTableRow (key){
        let row = document.querySelector(`#table  div.row[transaction-key="${key}"]`);
        if (row != null){
            row.remove();
        }
    };





};





function formSubmit(event, tablename) {
    let transaction, storage;
    event.preventDefault();

    transaction = new NewTransaction (event.target.elements.tipot.value, event.target.elements.nomemerc.value, event.target.elements.valor.value);
    // storage refers to the new registry beeing storaged to the json table.
    storage = new LocalStorages (tablename, transaction);
    storage.save();

    //after a new record being added
    //table.loadData();
    


    //writeTableRow(transaction.ttype, transaction.prodname, transaction.value);

    //retrieves all registries data from json table.
    //storagetable = storage.loadAll();
    //console.log(storagetable);

    //nodes = document.querySelector("#table").children;
    //console.log(nodes);

    //console.log(JSON.stringify(transaction));
    //console.log(JSON.parse(JSON.stringify(transaction)));
};


//helper
function addstr (strA, strB, position) {
    let output;

    //falta limitar a entrada de position e verificar parametros obrigatorios

    if (position < 0){
        output = [strA.slice(0, strA.length+1+position), strB, strA.slice(strA.length+1+position, strA.length)].join('');
    } else {
        output = [strA.slice(0, position), strB, strA.slice(position)].join('');
    }

    return output;
};



function cleanData(event, tablename) {
    let storageclean;
    event.preventDefault();

    storageclean = new LocalStorages (tablename);
    storageclean.deleteAll();

    //after delete all
    //table.loadData();
    return;
};



function toggleMenu() {
    let togglestate = document.querySelector('header div.wrapper div.menu div.menubar');

    if (togglestate.getAttribute('minimized') == 'true'){
        togglestate.setAttribute('minimized', 'false');
    } else {
        togglestate.setAttribute('minimized', 'true');
    }
};



// instead of just putting 'table.loadData();' at two other different places i've tried this way, so i won't need to worry about any further uses of this in the future.
function setLocalStorageEvents(){
    
    var originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
        originalSetItem.apply(this, arguments);

        var event = new Event('localStorageChange');
        document.dispatchEvent(event);
    };

    var originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function() {
        originalRemoveItem.apply(this, arguments);
        
        var event = new Event('localStorageChange');
        document.dispatchEvent(event);
    };

    let dataevent = function(){
        table.loadData();
    }
    document.addEventListener("localStorageChange", dataevent, false);
};







window.onload = (event) => {
    console.log('page is fully loaded');


    
    //initialize table view, json data table will be initialized (if it doesn't exist alrdy) after the first form submit.
    table = new TableView('transactions');

    //on page load, initial table demand.
    table.loadData();

    //set storage events.
    setLocalStorageEvents();

};























