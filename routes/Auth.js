const express = require("express");
const router = express.Router();
const { getAuth,  
    signInWithEmailAndPassword,signOut, sendPasswordResetEmail,
    GoogleAuthProvider,signInWithCredential,
    } = require('firebase/auth');
  const firestore = require('firebase-admin').firestore();
const admin = require('firebase-admin');



router.get("/sign_in", (req,res)=>{
    res.render('sign_in')})

router.post('/sign_in_process', async(req, res) =>{
  const auth = getAuth(); 
  const user = {
        email:req.body.email,
        password:req.body.pw
    }
    const userRef = firestore.collection('users').doc(req.body.email)
    
    signInWithEmailAndPassword(auth, user.email, user.password)
    .then( () =>{
      res.status(200)
      }
    ).catch ((error) => {const errorCode = error.code;
      const errorMessage = error.message;
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
      res.write(`<script>alert('${errorCode} ${errorMessage}')</script>`)
      res.write("<script>window.location=\"/auth/sign_in\"</script>")}
      )
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
        console.log('Document data:', doc.data().nick); 
      }
      console.log(req.session)
      res.redirect('/')
    })
      
router.get("/sign_up", (req,res)=>
        res.render('sign_up'))


router.post('/sign_up_process', async(req, res) =>{
    if (req.body.password != req.body.pw2){
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write("<script>alert('비밀번호가 다릅니다')</script>")
        res.write("<script>window.location=\"/auth/sign_up\"</script>")
        
    } else{
        const user = {
            email: req.body.email,
            name:req.body.name,
            nick:req.body.nick,
            weight:req.body.weight,
            height:req.body.height,
            year:req.body.year,
            month:req.body.month,
            day:req.body.day
          }
        const userres = await admin.auth().createUser({
        email:user.email,
        password:req.body.password,
        emailVerified:false,
        disabled:false
        })
        
        await firestore.collection("users").doc(user.email).set({
                    email:user.email,
                    name: user.name,
                    nick: user.nick,
                    weight:user.weight,
                    height:user.height,
                    birth: user.year + "-" + user.month + "-" + user.day 
                  })
                  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
  res.write("<script>alert('회원가입에 성공하였습니다!')</script>")
  res.write("<script>window.location=\"/auth/sign_in\"</script>")
    }})

router.get('/update_password', async(req, res)=>{
  const auth = getAuth()
  const user = auth.currentUser
  await sendPasswordResetEmail(auth, user.email)
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
  res.write("<script>alert('이메일을 확인해주세요!')</script>")
  res.write("<script>window.location=\"/auth/sign_in\"</script>")
  }
  )  

router.post("/update", async(req,res)=>{

  await firestore.collection("users").doc(req.session.email).update({
    nick: req.body.nick,
    weight: req.body.weight,
    height: req.body.height
  })
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
  res.write("<script>alert('변경되었습니다!')</script>")
  res.write("<script>window.location=\"/mypage\"</script>")})
  
router.get('/logout', async(req, res)=>{
  const auth = getAuth();
  await signOut(auth);
    req.session.destroy(function(error){
        req.session})
    res.redirect('/')
})    
        
module.exports = router