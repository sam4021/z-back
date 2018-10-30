const express = require('express');
const router = express.Router();
const json2csv = require('json2csv');
const csv = require('fast-csv');
const mongoose = require('mongoose');

let Client = require('../models/client');
let SaleWebContactSeller = require('../models/sale_web_contact_seller');
let Products = require('../models/products');

router.get('/', function(req, res, next){
    SaleWebContactSeller.
      find({})
      .populate('product','title',Products)
      .sort({"created_at": -1})
      .exec((err,saleCont)=>{
      res.render('pages/inquiry/index',{
        query:saleCont
      });
    });
});


//Update Inquiry Status
router.post('/status', (req, res) => {

     let query = {_id: req.body.id};
     let new_status =req.body.status;

     SaleWebContactSeller.update(query,{ status: new_status}).exec();

      req.flash('success','Inquiry Status Updated');
      res.redirect('/inquiry/view/'+req.body.id);
});

//Edit
router.get('/edit/:id', function(req, res, next){
  Inquiry.findById(req.params.id,(err, query)=>{
    ReminderInquiry.find({},(err,rInquiry)=>{
      Reminder.find({},(err,reminder)=>{
        Client.findById(query.client,(err,client)=>{
          res.render('pages/inquiry/edit',{
            query:query,
            client: client,
            rInquiry: rInquiry,
            reminder: reminder
          });
        });
      });
    });
  });
});

router.get('/view/:id',(req, res, next)=>{
  SaleWebContactSeller.
  findById(req.params.id).
  populate('product','title',Products).
  exec((err,salCont)=>{
    res.render('pages/ajax/web_inquery_view',{
      salCont: salCont
    });
  });
});

router.post('/edit/:id', (req, res) => {

  let query = {_id: req.params.id};
  status =req.body.status;
  note =req.body.note;

  SaleWebContactSeller.updateMany(query,{ $set:{ status: status , note: note }}, { multi: true }).exec();
      res.redirect('/inquiry');
});

module.exports = router;
