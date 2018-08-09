const express = require('express');
const router = express.Router();

let User = require('../models/user');
let Sale = require('../models/sale');
let Products = require('../models/products');
let SaleProducts = require('../models/sale_products');
let PaymentClient = require('../models/payment_client');

router.get('/client_search/:id', function(req, res, next){
  var reg=new RegExp(req.params.id, 'i');
  Sale.distinct('phone',{phone: reg},function(err, phone){
      res.render('pages/ajax/h_client_search',{
        phone: phone
      });
  });
});

router.get('/client_data/:id', function(req, res, next){
  Sale.find({phone:req.params.id},(err,sale)=>{
    SaleProducts.find({},(err, sprod)=>{
      Products.find({},(err, product)=>{
        res.render('pages/home/client_data',{
          sale: sale,
          sprod: sprod,
          product: product
        });
      })
    });
  }).limit(1);
});

//Products
router.get('/products_search/:id',function(req, res,next){
  //var regex = new RegExp(req.query["term"], 'i');
  var reg=new RegExp(req.params.id, 'i');
  console.log(reg);
  Products.find({title: reg},function(err, products){
        res.render('pages/ajax/products_search',{
          products: products
        });
      });
});

module.exports = router;
