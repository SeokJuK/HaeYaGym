const express = require("express");
const router = express.Router();
const dateFormat = require('dateformat');
const firestore = require('firebase-admin').firestore()

router.get("/list", async(req,res)=>{
    if(req.session.isOwner == true){
        await firestore.collection('board').orderBy("brddate", "desc").get()
        .then((snapshot) => {
            var rows = [];
            snapshot.forEach((doc) => {
                var childData = doc.data();
                childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
                rows.push(childData);
            });
            res.render('board_List', {
                rows: rows,
                isOwner : req.session.isOwner,
                nick : req.session.nick});
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });

    }else{
        await firestore.collection('board').orderBy("brddate", "desc").get()
        .then((snapshot) => {
            var rows = [];
            snapshot.forEach((doc) => {
                var childData = doc.data();
                childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
                rows.push(childData);
            });
            res.render('board_List', {
                rows: rows,
            isOwner : false
        });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
    }})

router.get("/write", async(req,res)=>{
    if (!req.query.brdno) { // new
        res.render('board_write', {row: "",nick : req.session.nick});
        return;
    }
    
    // update
    await firestore.collection('board').doc(req.query.brdno).get()
          .then((doc) => {
              var childData = doc.data();
              res.render('board_write', {
                row: childData,
                nick : req.session.nick
            });
          })
})
router.get("/view", async(req,res)=>{
    if(req.session.isOwner == true){
        await firestore.collection('board').doc(req.query.brdno).get()
    .then((doc) => {
        var childData = doc.data();
        firestore.collection('board').doc(req.query.brdno).update({
            view : childData.view+1
        })
        childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd hh:mm");
        res.render('board_view', {
            row: childData,
            isOwner : req.session.isOwner,
            nick : req.session.nick,
            email : req.session.email
        });
    })
    }else{
        await firestore.collection('board').doc(req.query.brdno).get()
    .then((doc) => {
        var childData = doc.data();
        firestore.collection('board').doc(req.query.brdno).update({
            view : childData.view+1
        })
        childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd hh:mm");
        res.render('board_view', {
            row: childData,
            isOwner : false,
            nick : req.session.nick,
            email : req.session.email
        });
    })
    }
})

router.post('/Save', function(req,res,next){
    var postData = req.body;
    console.log(postData)
    if (!postData.brdno) {  // new
        postData.email = req.session.email
        postData.nick = req.session.nick
        postData.view = 0
        postData.brddate = Date.now();
        var doc = firestore.collection("board").doc();
        postData.brdno = doc.id;
        doc.set(postData);
    } else {                // update
        var doc = firestore.collection("board").doc(postData.brdno);
        doc.update(postData);
    }
    
    res.redirect('/board/List');
});

router.get('/Delete', async function(req,res,next){
    await firestore.collection('board').doc(req.query.brdno).delete()

    res.redirect('/board/List');
});

module.exports = router