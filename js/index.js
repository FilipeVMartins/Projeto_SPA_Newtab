





class NewTransaction {

    constructor(tipot, nomemerc, valor) {
        this.ttype = tipot;
        this.prodname = nomemerc;
        this.value = valor;
      };
};


class LocalStorages {

    constructor(tablename, value) {
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
        let localStorageTable;
        if (localStorage.getItem(this.lskey) === null) {
            return null
        } else {
            localStorageTable = JSON.parse(localStorage.getItem(this.lskey));
            return localStorageTable;
        }
    }

    deleteAll(){
        localStorage.removeItem(this.lskey);
    }
};







class TableView{

    constructor (tablename, transactionkey){
        this.tablename = tablename;
        this.transactionkey = transactionkey;
    };





};






function writeTableRows(tipot, nomemerc, valor) {
    let newrow, lastrow;

    if (tipot == 'venda'){
        tipot = '+';
    } else if (tipot == 'compra') {
        tipot = '-';
    };

    newrow = document.createElement("div");
    newrow.className = 'row';
    newrow.setAttribute('transaction-key', 'teste1');
    newrow.innerHTML = `<div class="col">${tipot}</div>
                        <div class="col">${nomemerc}</div>
                        <div class="col">${valor}</div>`;
    lastrow = document.querySelector("#table div.row:last-child");
    document.querySelector("#table").insertBefore(newrow, lastrow);
};




function formSubmit(event, tablename) {
    let transaction, storage;
    event.preventDefault();

    transaction = new NewTransaction (event.target.elements.tipot.value, event.target.elements.nomemerc.value, event.target.elements.valor.value);
    storage = new LocalStorages (tablename, transaction);
    storage.save();


    
    writeTableRows(transaction.ttype, transaction.prodname, transaction.value);
    
    

    storagetable = storage.loadAll();
    console.log(storagetable);
    console.log(document.querySelector("#table").children);

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
    return;
};








window.onload = (event) => {
    console.log('page is fully loaded');





};
























//  window.addEventListener('load', (event) => {
//    console.log('page is fully loaded');
//  });
