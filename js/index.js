
class NewTransaction {

    constructor(tipot, nomemerc, valor) {
        this.ttype = tipot;
        this.prodname = nomemerc;
        // clean value and convert comma to dot to prevent further erros with math functions in json table.
        this.value = valor;
      };

    validate(){
        let succeeded = true;

        if (this.ttype == ''){
            emptyInputMessage ('tipot');
            succeeded = false;
        }

        if (this.prodname == ''){
            emptyInputMessage ('nomemerc');
            succeeded = false;
        }

        this.value = this.value.replace(/\./g, "").replace(",", ".").replace('R$ ', '');
        if (this.value == ''){
            emptyInputMessage ('valor');
            succeeded = false;
        }

        return succeeded;
    }

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
            

            
            //console.log(JSON.parse(JSON.stringify(transaction)));
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

        
        // add or remove the row notification to no registries were found
        this.checkNoTableRow(jsonkeylist);

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

        this.sumTableRowsValue(tabledata);
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
                            <div class="col">R$ ${formatTableValue(valor.replace('.',','))}</div>`;
        lastrow = document.querySelector("#table div.row:last-child");
        document.querySelector("#table").insertBefore(newrow, lastrow);
    };

    checkNoTableRow (jsonkeylist){
        let norow, lastrow;
        //check if the notification doesn't alrdy exists
        let notification = document.querySelector("#table div.row.no-rows");

        // check if there are registries to be sent to view
        if (jsonkeylist.length == 0 && notification == null){
            // add the row notification
            norow = document.createElement("div");
            norow.className = 'row no-rows';
            norow.innerHTML =  `<div class="col">&nbsp;&nbsp;&nbsp;</div>
                                <div class="col">Sem Transações Adicionadas!</div>
                                <div class="col">R$ 0,00</div>`;
            lastrow = document.querySelector("#table div.row:last-child");
            document.querySelector("#table").insertBefore(norow, lastrow);

        } else if (jsonkeylist.length > 0 && notification != null) {
            // remove the row notification
            notification.remove();
        }
    }

    deleteTableRow (key){
        let row = document.querySelector(`#table  div.row[transaction-key="${key}"]`);
        if (row != null){
            row.remove();
        };
    };

    sumTableRowsValue(tabledata){

        let sumvalues = 0;

        // sum up the total values of json table
        Object.entries(tabledata).forEach(
            ([key, value]) => {
                if (value.ttype == 'venda'){
                    sumvalues += parseFloat(value.value);   //console.log(key, value)//debug
                } else if (value.ttype == 'compra'){
                    sumvalues -= parseFloat(value.value);
                };
            }
        );
        sumvalues = Math.round(sumvalues * 100) / 100;

        // updates the total value in the view
        document.querySelector('div.table #total').innerHTML = 'R$ ' + formatTableValue(String(sumvalues).replace('-', '').replace('.', ','));
        
        if (sumvalues > 0){
            document.querySelector('div.table #profitOrloss').innerHTML = '[LUCRO]';
        } else if (sumvalues < 0) {
            document.querySelector('div.table #profitOrloss').innerHTML = '[PREJUÍZO]';
        } else {
            document.querySelector('div.table #profitOrloss').innerHTML = '[------]';
        };
    };

};



/// user events functions

function formSubmit(event, tablename) {
    let transaction, storage;
    event.preventDefault();

    transaction = new NewTransaction (event.target.elements.tipot.value, event.target.elements.nomemerc.value, event.target.elements.valor.value);

    if (transaction.validate()){
        // storage refers to the new registry beeing storaged to the json table.
        storage = new LocalStorages (tablename, transaction);
        storage.save();

        document.querySelector("section.transacao form").reset();
        console.log('form submit succeeded')
    } else {
        console.log('form submit failed')
    }
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
    const menubarclasses = document.querySelector('header div.wrapper div.menu div.menubar').classList;

    if (window.innerWidth <= 820) {
        if ([...menubarclasses].includes('not-minimized') == true){
            menubarclasses.remove('not-minimized');
        } else {
            menubarclasses.add('not-minimized');
        };
    };
};

/// end user events functions



/// form masks

// number mask for BRL.
function applyValueMask(event) {
    event.preventDefault();
    inputvalue = event.target.value;

    //sets an initial mask value
    if (inputvalue == ''){
        inputvalue = 'R$ 0,00';
    };

    if (event.key.match(/[0-9]/) != null){

        //remove dots
        inputvalue = inputvalue.replace(/\./g , "");

        //removes the initial left zeros from 'R$ 0,00'
        if (inputvalue[3] == '0'){
            inputvalue = inputvalue.slice(0, 3) + inputvalue.slice(4);
        };
        
        inputvalue += event.key;
        //corrects the comma position
        inputvalue = inputvalue.replace(",", "");
        inputvalue = addstr (inputvalue, ',', -3);

        // add dots
        // lenght of the integer value, the characters between 'R$ ' + 'integervalue' + ',00'
        let integervalue = inputvalue.slice(3, inputvalue.length-3);
        // new integer with dots
        let newintegervalue=integervalue;
        // loop the integervalue string re-writting it with the dots at after every third position
        for (i=integervalue.length ; i != 0 ; i--){
            if ((i % 3) == 0 ){
                newintegervalue = addstr (newintegervalue, '.', -(i+1));   
            }
        }    
        // take out the first dot from 0 division
        if (newintegervalue.slice(0,1) == '.'){
            newintegervalue = newintegervalue.slice(1);
        };
        // inserts the new formatted integer part of the value in it, replaceing the previous one
        inputvalue = inputvalue.slice(0,3) + newintegervalue + inputvalue.slice(-3);

        // return value
        event.target.value = inputvalue;

    } else if( event.key == 'Backspace') {
        // remove dots
        inputvalue = inputvalue.replace(/\./g , "");

        inputvalue = inputvalue.slice(0, -1);
        inputvalue = inputvalue.replace(",", "");

        if (inputvalue.length < 6){
            inputvalue = addstr(inputvalue, '0', -3);
        };
        inputvalue = addstr(inputvalue, ',', -3);

        // add dots
        // lenght of the integer value, the characters between 'R$ ' + 'integervalue' + ',00'
        let integervalue = inputvalue.slice(3, inputvalue.length-3);
        // new integer with dots
        let newintegervalue=integervalue;
        //loop the integervalue string re-writting it with the dots at after every third position
        for (i=integervalue.length ; i != 0 ; i--){
            if ((i % 3) == 0 ){
                newintegervalue = addstr (newintegervalue, '.', -(i+1));   
            }
        }    
        // take out the first dot from 0 division
        if (newintegervalue.slice(0,1) == '.'){
            newintegervalue = newintegervalue.slice(1);
        };
        // inserts the new formatted integer part of the value in it, replaceing the previous one
        inputvalue = inputvalue.slice(0,3) + newintegervalue + inputvalue.slice(-3);

        //return value
        event.target.value = inputvalue;
    }
};

// since i'm not using html5 native required validation i couldn't change text color of empty state to #888888 via css only.
function emptySelectInput(){
    let elem = document.querySelector('#tipot');
    if (elem.value == ''){
        elem.classList.add('empty');
    } else {
        elem.classList.remove('empty');
    }
};

// add dots to table numbers
function formatTableValue(inputvalue){

    // lenght of the integer value, the characters between 'R$ ' + 'integervalue' + ',00'
    let integervalue = inputvalue.slice(0, -3);
    // new integer with dots
    let newintegervalue=integervalue;
    //loop the integervalue string re-writting it with the dots at after every third position
    for (i=integervalue.length ; i != 0 ; i--){
        if ((i % 3) == 0 ){
            newintegervalue = addstr (newintegervalue, '.', -(i+1));   
        }
    }    
    // take out the first dot from 0 division
    if (newintegervalue.slice(0,1) == '.'){
        newintegervalue = newintegervalue.slice(1);
    };
    inputvalue = newintegervalue + inputvalue.slice(-3);
    return inputvalue;
}

/// end form masks



///helpers

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



function addstr (strA, strB, position) {
    let output;

    //falta limitar a entrada de position e verificar parametros obrigatorios

    if (position < 0){
        output = [strA.slice(0, strA.length+1+position), strB, strA.slice(strA.length+1+position, strA.length)].join('');
    } else {
        output = [strA.slice(0, position), strB, strA.slice(position)].join('');
    };

    return output;
};



function emptyInputMessage (inputname){

    // check if msg doesn't alrdy exists
    if(document.querySelector(`form > div.${inputname} em`) == null){

        // create <em> tag to display the message
        let msg = document.createElement("em");
        msg.className = 'validationMsg';
        msg.setAttribute("style", "color: red; font-size:11px");
        msg.innerHTML = `O campo acima é obrigatório!`;

        let inputwrapper = document.querySelector(`form > div.${inputname}`);
        inputwrapper.appendChild(msg);

        let inputfield = document.querySelector(`form > div.${inputname} .input`)
        inputfield.setAttribute("style", "border-color: #dc3545;");

        
        //add the event to remove the messages   /// change event doesn't work with keydown+preventDefault(), https://stackoverflow.com/questions/46825587/preventdefault-in-a-keydown-event-onchange-event-not-trigger
        inputfield.addEventListener('blur', removeEmptyMsg);
    

    };
};
// using the parameter function this way (external) prevents multiples instances of blur event being added.
var removeEmptyMsg = function(event) {
    let inputfield = event.target;
    let inputname = inputfield.getAttribute("id");
    //check if field isn't empty anymore
    if (inputfield.value != ''){
        
        //remove red border from input field
        inputfield.removeAttribute("style");

        // remove <em> tag
        let emtagmsg = document.querySelector(`form > div.${inputname} em`);
        if (emtagmsg != null){
            emtagmsg.parentNode.removeChild(emtagmsg);
        };

        //remove the listener itself
        inputfield.removeEventListener('blur', removeEmptyMsg);
    };
};

/// end helpers









window.onload = (event) => {
    console.log('page is fully loaded');


    
    //initialize table view, json data table will be initialized (if it doesn't exist alrdy) after the first form submit.
    table = new TableView('transactions');

    //on page load, initial table demand.
    table.loadData();

    //set storage events.
    setLocalStorageEvents();

};

