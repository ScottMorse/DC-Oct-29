let express = require('express');
let router = express.Router();
let path = require("path")
let sql = require("../custom_modules/sqlCom")
let cookieParser = require('cookie-parser')

let user
let cookies

/* GET home page. */
router.get('/', function(req, res, next) {
  let cookies = req.cookies
  if(cookies.TODOEXPRESSUSER){
    res.redirect('/dashboard')
  }
  else{
    res.render('index');
  }
})

//Registration
router.post('/register', function(req,res,next){
  const username = req.body.regUsername
  const email = req.body.regEmail
  const pswd = sql.encryptPassword(req.body.regPswd).then(pswdHash => {
    sql.selectTable('users').then(userTableRows => {
      if(userTableRows.length == 0){
         sql.insertData('users',['username','email','pswd'],[
              sql.wrapString(username),
              sql.wrapString(email),
              sql.wrapString(pswdHash)
         ]).then(result =>{
            sql.selectTable('users').then(userTableRows => {
              userTableRows.forEach(row => {
                if(username == row.username){
                  user = row
                  res.cookie('TODOEXPRESSUSER',user.ID + "::" + user.username)
                    res.redirect('/dashboard')
                    console.log('User added.')
                }
              })
            })
         })
      }
      else{
         let valid = true
         let blame
         userTableRows.forEach(row=> {
           if(row.username == username)
           {
             valid = false
             blame = 'username'
           }
           else if(row.email == email)
           {
             valid = false
             blame = 'email'
           }
         })
         if(!valid){
           res.render('index',{regBlame: 'Sorry, that ' + blame + ' is not available!'})
           console.log("User denied")
         }
         else{
          sql.insertData('users',['username','email','pswd'],[
            sql.wrapString(username),
            sql.wrapString(email),
            sql.wrapString(pswdHash)
          ]).then(result =>{
            sql.selectTable('users').then(userTableRows => {
              userTableRows.forEach(row => {
                if(username == row.username){
                   user = row
                   res.cookie('TODOEXPRESSUSER',user.ID + "::" + user.username)
                    res.redirect('/dashboard')
                    console.log('User added.')
                }
              })
            })
          })
         }
      }
    })
  })
})

//Login 
router.post('/login',(req,res,next) => {
  const username = req.body.logUsername
  const pswd = req.body.logPswd
  sql.selectTable('users').then(userTableRows => {
     userTableRows.forEach(row => {
       if(username == row.username){
          user = row
       }
     })
     if(!user){
      res.render('index',{logBlame: 'Sorry, that username does not exist.'})
     }
     else{
       sql.comparePasswords(pswd,user.pswd).then(isMatch => {
          if(isMatch){
            res.cookie('TODOEXPRESSUSER',user.ID + "::" + user.username)
            res.redirect('/dashboard')
          }
          else{
            res.render('index',{logBlame: 'Sorry, incorrect password.'})
          }
        }
      )}
  })
})

router.post('/logout',(req,res,next) => {
   user = undefined
   res.clearCookie('TODOEXPRESSUSER')
   res.redirect('/')
})

router.get('/login',(req,res,next)=>{
  res.redirect('/')
})
router.get('/logout',(req,res,next)=>{
  res.redirect('/')
})
router.get('/register',(req,res,next)=>{
  res.redirect('/')
})

module.exports = router;
