window.addEventListener('load',()=>{
    const regForm = document.getElementById('reg-form')
    const regBlame = document.getElementById('reg-blame')
    const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    const userNameRegex = new RegExp(/^[A-Za-z]+[A-Za-z0-9]+/)

    const badUserNames = [
        "admin", "support", "auth",
        "authorization","authorized",
        "authorizeduser","administration",
        "webmaster","website","authenticator",
        "authentication","contactus",
        "administrator","help","contact",
        "playground","root","password",
        "login","register","registration",
        "signup"
    ]

    const x = function submitReg(e){
        const username = regForm.children[0].value
        const email = regForm.children[1].value
        const confirmEmail = regForm.children[2].value
        const pswd = regForm.children[3].value
        const confirmPswd = regForm.children[4].value
        if(username.length < 4){
            console.log(badUserNames)
            e.preventDefault()
            regBlame.innerHTML = 'Username too short.'
        }
        else if(username.length > 20){
            e.preventDefault()
            regBlame.innerHTML = 'Username too long.'
        }
        else if(!username.match(userNameRegex)){
            e.preventDefault()
            regBlame.innerHTML = 'Invalid username'
        }
        else if(badUserNames.includes(username.toLowerCase())){
            e.preventDefault()
            regBlame.innerHTML =  'Invalid username'
        }
        else if(!email.match(emailRegex)){
            e.preventDefault()
            regBlame.innerHTML =  'Invalid email'
        }
        else if(email != confirmEmail){
            e.preventDefault()
            regBlame.innerHTML =  "Emails don't match."
        }
        else if(pswd.length < 6){
            e.preventDefault()
            regBlame.innerHTML = "Password too short."
        }
        else if(pswd != confirmPswd){
            e.preventDefault()
            regBlame.innerHTML = "Passwords don't match."
        }
    }
    regForm.addEventListener('submit',(e) => x(e))
})