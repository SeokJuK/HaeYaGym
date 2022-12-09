const express = require("express")
const router = express.Router()
const firestore = require('firebase-admin').firestore();

router.get("/", async(req, res) => {
    if(req.session.isOwner == true){
        const userRef = firestore.collection('users').doc(req.session.email)
  const doc = await userRef.get()
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        req.session.isOwner = true
        req.session.email = doc.data().email
        req.session.nick = doc.data().nick
        req.session.name = doc.data().name
        req.session.birth = doc.data().birth
        req.session.height = doc.data().height
        req.session.weight = doc.data().weight

      }
      res.render('mypage',{
          isOwner : req.session.isOwner,
          email : req.session.email,
          nick : req.session.nick,
          name : req.session.name,
          birth : req.session.birth,
          height : req.session.height,
          weight : req.session.weight
      })
  }else{
      res.render('mypage',{
          isOwner : false
      })
  }})
  
 module.exports = router