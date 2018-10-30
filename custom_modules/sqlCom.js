// import { dbCon } from './node-practice'

let mysql = require('mysql')
let bcrypt = require('bcrypt')

const dbName = 'expressToDo'

let config = {
    host: "us-cdbr-iron-east-01.cleardb.net",
    user: "b186f7d42a6a43",
    password: "09481fe2",
    database: "heroku_213e6e7b74fb177"
}

function wrapString(string){
    return "'" + string + "'"
}

function toDateTime(date){
    const offset = (date.getTimezoneOffset()/60) * -3600000
    const newD = new Date(date.getTime() + offset)
    return newD.toISOString().slice(0, 19).replace('T', ' ')
}

function handleDisconnect() {
    connection = mysql.createConnection(config); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
}

class Database {
    constructor( config ) {
        this.connection = handleDisconnect();
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                console.log('SQL connection closed.')
                resolve();
            } );
        } );
    }
}

function runCommand(comm){
    // console.log(comm)
    return db.query(comm)
}

function selectTable(tbName,columnArr,limit,limitOffset){
    let comm
    if(!columnArr)
    {
        comm = "SELECT * FROM " + tbName
    }
    else
    {
        comm = "SELECT " + columnArr.join(", ") + "FROM " + tbName
    }
    if(limit){
        comm += " LIMIT " + limit
    }
    if(limit && limitOffset){
        comm += " OFFSET " + limitOffset
    }
    return comm
}

function createTable(tbName,argString){
    argString = " " + argString || ""
    comm = 'CREATE TABLE ' + tbName + argString
    return comm
}

function insertData(tbName,columnArr,valueArr){
    return "INSERT INTO " + tbName + " ( " + columnArr.join(", ") + " ) VALUES " + "( " + valueArr.join(", ") + " )"
}

function updateColumns(tbName,valueArr,valueColumnArr,filterValue,filterColumn){
    if(valueArr.length == 1){
        return "UPDATE " + tbName + " SET " + valueColumnArr[0] + " = " + valueArr[0] + " WHERE " + filterColumn + " = " + filterValue
    }
    else{
        comm = "UPDATE " + tbName + " SET "
        for(let i=0;i<valueArr.length;i++){
            comm += valueColumnArr[i] + " = " + valueArr[i]
            comm += i < valueArr.length - 1 ? ", ":" "
        }
        comm += " WHERE " + filterColumn + " = " + filterValue
        return comm
    }
}

function selectTableFiltered(tbName,filterColumn,filter,columnArr,limit,limitOffset){
    let comm
    if(!columnArr)
    {
        comm = "SELECT * FROM " + tbName + " WHERE " + filterColumn + " = '" + filter + "'"
    }
    else
    {
        comm = "SELECT " + columnArr.join(", ") + " FROM " + tbName + " WHERE " + filterColumn + " = '" + filter + "'"
    }
    if(limit){
        comm += " LIMIT " + limit
    }
    if(limit && limitOffset){
        comm += " OFFSET " + limitOffset
    }
    return comm
}

function selectSortedTable (tbName,sortColumn,columnArr,desc,limit,limitOffset){
    let comm
    if(!columnArr)
    {
        comm = "SELECT * FROM " + tbName + " ORDER BY " + sortColumn
    }
    else
    {
        comm = "SELECT " + columnArr.join(", ") + " FROM " + tbName + " ORDER BY " + sortColumn
    }
    if(desc){
        comm += " DESC"
    }
    if(limit){
        comm += " LIMIT " + limit
    }
    if(limit && limitOffset){
        comm += " OFFSET " + limitOffset
    }
    return comm
}

function deleteRecords(tbName,filterColumn,filterValue){
    return comm = "DELETE FROM " + tbName + " WHERE " + filterColumn + " = '" + filterValue + "'"
}

function deleteTable(tbName){
    return "DROP TABLE IF EXISTS " + tbName
}

let db
function useDb(){
    db = new Database(config)
    runCommand(selectTable('users')).catch(err => {
        runCommand(createTable('users',"( ID int NOT NULL AUTO_INCREMENT, username VARCHAR(20) NOT NULL , email VARCHAR(255) NOT NULL, pswd VARCHAR(255) NOT NULL, fullname VARCHAR(30), PRIMARY KEY (ID) )"))
            .catch(err => console.log(err))
    })
    runCommand(selectTable('tasks')).catch(err => {
        runCommand(createTable('tasks',"( ID int NOT NULL AUTO_INCREMENT, UID int NOT NULL, taskname VARCHAR(20) NOT NULL, taskdetails VARCHAR(255), datecreated DATETIME NOT NULL, datecompleted DATETIME, completed TINYINT(1) NOT NULL DEFAULT 0, priority varchar(4), PRIMARY KEY (ID) )"))
            .catch(err => console.log(err))
    })
}

useDb()

exports.runCommand = (comm) => {return runCommand(comm)}
exports.selectTable = (tbName,columnArr,limit,limitOffset) => {return runCommand(selectTable(tbName,columnArr,limit,limitOffset))}
exports.createTable = (tbName,argString) => {return runCommand(createTable(tbName,argString))}
exports.selectSortedTable = (tbName,sortColumn,columnArr,desc,limit,limitOffset) => {return runCommand(selectSortedTable(tbName,sortColumn,columnArr,desc,limit,limitOffset))}
exports.selectTableFiltered = (tbName,filterColumn,filter,columnArr,limit,limitOffset) => {return runCommand(selectTableFiltered(tbName,filterColumn,filter,columnArr,limit,limitOffset))}
exports.insertData = (tbName,columnArr,valueArr) => {return runCommand(insertData(tbName,columnArr,valueArr))}
exports.updateColumns = (tbName,valueArr,valueColumnArr,filterValue,filterColumn) => {return runCommand(updateColumns(tbName,valueArr,valueColumnArr,filterValue,filterColumn))}
exports.deleteRecords = (tbName,filterColumn,filterValue) => {return runCommand(deleteRecords(tbName,filterColumn,filterValue))}
exports.deleteTable = (tbName) => {return runCommand(deleteTable(tbName))}

exports.wrapString = (string) => {return wrapString(string)}
exports.toDateTime = (date) => {return toDateTime(date)}

exports.encryptPassword = (pswd) => {return bcrypt.hash(pswd, 5)}
exports.comparePasswords = (givenPswd,dbPswd) => {return bcrypt.compare(givenPswd, dbPswd)}
