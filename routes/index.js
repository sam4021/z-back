const express = require('express');
const router = express.Router();

let User = require('../models/user');
let Sale = require('../models/sale');
let Products = require('../models/products');
let ProductBrand = require('../models/product_brand');
let SaleProducts = require('../models/sale_products');

router.get('/', function(req, res, next){
  Sale.find({},(err,sale)=>{
    SaleProducts.find({},(err,sproduct)=>{
      Products.find({},(err,product)=>{
        res.render('pages/index',{
          sale: sale, 
          sproduct: sproduct,
          product: product
        });
      });
    });
  });
});

//login Form
router.get('/login', function(req, res){
  res.render('pages/users/login');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}

module.exports = router;
