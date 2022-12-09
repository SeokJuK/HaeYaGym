const express = require("express");
const router = express.Router();
const fs = require("fs")
router.get("/", (req,res)=>{
        res.render('calendar',{
            isOwner : req.session.isOwner,
            nick : req.session.nick
        })})
module.exports = router