const express = require("express");
const admin = require('firebase-admin');
const firebaseConfig = require('./config/database.js');
const { initializeApp } = require('firebase/app');
const cors = require('cors');
const morgan = require('morgan');
const serviceAccount = require('../Web/haeyagym.json')
const session = require('express-session')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
initializeApp(firebaseConfig)

const app = express()
app.use(cors());
app.use(morgan('dev'));

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.static('views'))
app.use(session({
  secret:'hyg',
  resave: false,
  saveUninitialized: true,
  cookie:{
    secure:false
  }
}))
  
const authrouter = require("./routes/Auth"),
  boardrouter = require("./routes/Board"),
  calendarrouter = require("./routes/Calendar"),
  mypagerouter = require("./routes/Mypage");

app.use("/auth", authrouter)
app.use("/board", boardrouter)
app.use("/calendar", calendarrouter)
app.use("/mypage", mypagerouter)

app.get("/", (req, res) => {
  console.log(req.session)
  if(req.session.isOwner == true){
    res.render('index',{
    nick : req.session.nick,
    email : req.session.email,
    isOwner : req.session.isOwner
})
  }
  else{
    res.render('index',{
        isOwner : false
    })
  }
})

// app.post('/s', async(req, res) => {
//   const user = {
//     email: req.body.email,
//     password: req.body.password
//   }
//   const userRes = await admin.auth().createUser({
//     email:user.email,
//     password:user.password,
//     emailVerified:false,
//     disabled:false
//   })
//   res.json(userRes)
// })

const port = 8000
app.listen(port, () => {
  console.log(`SERVER ON! PORT : ${port}`)
})