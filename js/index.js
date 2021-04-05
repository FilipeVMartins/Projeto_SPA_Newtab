





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

        // else, retrieves the alrdy existing string to add the new registry.
        } else {
            // get the string at local and converts to json.
            localStorageTable = JSON.parse(localStorage.getItem(this.lskey));
            
            // get the number of items and plus one to define the last pk number.
            newkey = Object.keys(localStorageTable).length+1;
            localStorageTable[newkey] = this.lsvalue;

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
}







class TableView{

}






function writeTableRows() {
    let newrow, lastrow;

    newrow = document.createElement("div");
    newrow.className = 'row';
    newrow.innerHTML = 'aaa';
    lastrow = document.querySelector("#table div.row:last-child");
    document.querySelector("#table").insertBefore(newrow, lastrow);
}




function formSubmit(event, tablename) {
    let transaction, storage;
    event.preventDefault();

    transaction = new NewTransaction (event.target.elements.tipot.value, event.target.elements.nomemerc.value, event.target.elements.valor.value);
    storage = new LocalStorages (tablename, transaction);
    storage.save();


    
    writeTableRows();
    
    

    storagetable = storage.loadAll();
    console.log(storagetable)

    //console.log(JSON.stringify(transaction));
    //console.log(JSON.parse(JSON.stringify(transaction)));
};






function cleanData(event, tablename) {
    let storageclean;
    event.preventDefault();

    storageclean = new localStorages (tablename);
    storageclean.deleteAll();
    return;
}