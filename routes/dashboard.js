let express = require('express');
let router = express.Router();
let path = require("path")
let sql = require("../custom_modules/sqlCom")
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')

let userCookie
let user

const milRegex = new RegExp(/:[\d][\d] /)

function niceDateString(ISODate){
   const date =  new Date(Date.parse(ISODate))
   return date.toLocaleTimeString().replace(milRegex,'') + ' ' + date.toDateString()
}

router.get('/',(req,res,next) => {
    const cookies = req.cookies
    if(cookies.TODOEXPRESSUSER)
    {
      userCookie = cookies.TODOEXPRESSUSER.split('::')
    }
    else
    {
      res.redirect('../')
    }
    sql.selectTableFiltered('tasks','UID',userCookie[0]).then(rows => {
      let convertedRows = []
      if(rows){
        rows.forEach(row =>{
          convertedRows.push({
            ID: row.ID,
            taskname:row.taskname,
            taskdetails:row.taskdetails ? row.taskdetails:'',
            datecreated:niceDateString(row.datecreated),
            datecompleted:row.datecompleted ? niceDateString(row.datecompleted):'',
            priority: row.priority,
            completed:row.completed ? true:false})
        })
        res.render('dashboard',{username: userCookie[1],tasks:convertedRows})
      }
    })
})

router.post('/addTask',(req,res,next) => {
    const cookies = req.cookies
    if(!userCookie){
        if(cookies.TODOEXPRESSUSER)
        {
          userCookie = cookies.TODOEXPRESSUSER.split('::')
          res.render('dashboard',{username: userCookie[1]})
        }
        else
        {
          res.redirect('../')
        }
    }
    const currentDate = sql.wrapString(sql.toDateTime(new Date()))
    const taskName = sql.wrapString(req.body.taskName)
    const taskDetails = req.body.taskDetails
    const taskPriority = sql.wrapString(req.body.taskPriority)
    let dataToSend = [userCookie[0],taskName,currentDate,taskPriority]
    let columnsToEdit = ['UID','taskname','datecreated','priority']
    if(taskDetails){
      dataToSend.push(sql.wrapString(taskDetails))
      columnsToEdit.push('taskdetails')
    }
    sql.insertData('tasks',columnsToEdit,dataToSend).then(result => {
       res.redirect('../')
    })
})

router.post('/remTask',(req,res,next) => {
  const cookies = req.cookies
  if(!userCookie){
    if(cookies.TODOEXPRESSUSER)
    {
      userCookie = cookies.TODOEXPRESSUSER.split('::')
    }
    else
    {
      res.redirect('../')
    }
  }
  sql.deleteRecords('tasks','ID',req.body.taskID).then(after => res.redirect('../'))
})

router.post('/comTask',(req,res,next) => {
  const cookies = req.cookies
  if(!userCookie){
    if(cookies.TODOEXPRESSUSER)
    {
      userCookie = cookies.TODOEXPRESSUSER.split('::')
    }
    else
    {
      res.redirect('../')
    }
  }
  sql.updateColumns(
      'tasks',
      [true,sql.wrapString(sql.toDateTime(new Date()))],
      ['completed','datecompleted'],
      req.body.taskID,['ID'])
  .then(after => res.redirect('../'))
})

router.get('/addTask',(req,res,next)=>{
   res.redirect('../')
})
router.get('/remTask',(req,res,next)=>{
  res.redirect('../')
})

module.exports = router;