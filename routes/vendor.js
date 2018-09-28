const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

let User = require('../models/user');
let Sale = require('../models/sale');
let Vendor = require('../models/vendor');
let Products = require('../models/products');
let ProductBrand = require('../models/product_brand');
let SaleProducts = require('../models/sale_products');
let ProductsVendor = require('../models/products_vendor');

router.get('/', function(req, res, next){
  Vendor.find({},function(err, vendors){
      res.render('pages/vendor/index',{
        vendors: vendors
      });
  });
});

//Add Vendor Form
router.get('/add', function(req, res, next){
  res.render('pages/vendor/add');
});

//Add Vendor Route
router.post('/add', function(req,res){

  // Validation
  req.checkBody('name', 'Vendor Name is required').notEmpty();
  req.checkBody('phone', 'Phone number is required').notEmpty();

  req.asyncValidationErrors().then(() => {
    const name = req.body.name;
    const url = slugify(req.body.name);
    const email = req.body.email;
    const phone = req.body.phone;
    const location = req.body.location;

    //Get Errors
    let errors = req.getValidationResult();

    // if (errors) {
    //   //console.log(first_name);
    //
    //   res.render('pages/driver/add',{
    //     errors: errors
    //   });
    // } else {
      let vendor= new Vendor({
        name:name,
        url:url,
        email:email,
        phone:phone,
        location: location
      });

          vendor.save(function(err){
            if (err) {
              console.log(err);
            } else {
              req.flash('success', 'Vendor is now Registered');
              res.redirect('/vendor');
            }
          });
    //}
  }).catch((errors) => {

      if(errors) {
        for (var i = 0; i < errors.length; i++) {
          var param = errors[i].param;
          var msg = errors[i].msg;
          req.flash('danger', errors[i].msg);
        }
        res.redirect('/vendor/add');
        return;
      };
  });
});

// View
router.get('/view/:id', function(req, res, next){
   Vendor.findById(req.params.id, (err, vendor)=>{
      Products.find({},(err,products)=>{
        User.find({},(err,user)=>{
            ProductsVendor.
            find({vendor:req.params.id}).
            populate('products','title url price special_price cost',Products).
            exec((err, pVendor)=>{
              res.render('pages/vendor/view',{
                vendor: vendor,
                user: user,
                products: products,
                pVendor: pVendor
              });
            });

          });
        });
      });

});

// edit
router.get('/edit/:id', function(req, res, next){
  Vendor.findById(req.params.id, function(err, vendor){
    res.render('pages/vendor/edit',{
      vendor: vendor
    });
  });
});

//Update Vendor
router.post('/edit/:id', (req, res) => {

     let query = {_id: req.params.id};
     let name = req.body.name;
     let email = req.body.email;
     let phone = req.body.phone;
     let location = req.body.location;

     Vendor.updateMany({ _id:req.params.id },{ $set:{ name: name , email: email , phone: phone , location: location }}, { multi: true }).exec();
          res.redirect('/vendor/view/'+req.params.id);
});

//Update Quick Product info
router.post('/quick-edit-info/:id/:product', (req, res) => {
     let query = {_id: req.params.id};
     let cost = req.body.cost;
     let feature = req.body.feature;

     ProductsVendor.updateMany(query,{ $set:{ cost: cost, feature:feature }}, { multi: true }).exec();
console.log(req.body);
         res.redirect('/vendor/view/'+req.params.product);
});

//Add Products Vendor
router.post('/add-product/:id', function(req, res, next){
  req.checkBody('product','Product is required').notEmpty();

  req.asyncValidationErrors().then(() => {
    const product = req.body.product;
    const cost = req.body.cost;
    const feature = req.body.feature;
    for (var i = 0; i < product.length; i++) {
      let ven= new ProductsVendor();
      ven.vendor = req.params.id
      ven.products = product[i];
      ven.cost = cost[i];
      ven.feature = feature[i];
       ven.save(function(err){
         if(err){
           console.log(err);
         }
       });
      console.log(ven);
    }

         req.flash('success','Product Vendor added');
         res.redirect('/vendor/view/'+req.params.id);
  }).catch((errors) => {

      if(errors) {console.log(errors);
        for (var i = 0; i < errors.length; i++) {
          var param = errors[i].param;
          var msg = errors[i].msg;
          req.flash('danger', errors[i].msg);
        }
        res.redirect('/vendor/view/'+ req.params.id);
        return;
      };
  });
});

//Delete Products Vendor
router.get('/delete-product/:vendor/:product', function(req, res, next){
  ProductsVendor.remove({ _id:req.params.product }, function (err) {
    res.redirect('/vendor/view/'+req.params.vendor);
  });
});

router.get('/ajax_quick_edit/:id/:product',(req, res, next)=>{
  ProductsVendor.
  findById(req.params.id).
  populate('products','title ',Products).
  exec((err,products)=>{
    res.send('<form action="/vendor/quick-edit-info/'+ products.id +'/'+ req.params.product +'" method="post" role="form" class="row"><div class="col-md-6 col-sm-6 col-xs-12 form-group has-feedback"><label class="control-label col-md-3 col-sm-3 col-xs-12" for="cost">Title </label><div class="col-md-9 col-sm-9 col-xs-12">'+products.products.title +'</div></div><div class="col-md-6 col-sm-6 col-xs-12 form-group has-feedback"><label class="control-label col-md-3 col-sm-3 col-xs-12" for="cost">Cost </label><div class="col-md-9 col-sm-9 col-xs-12"><input type="text" name="cost" class="form-control" placeholder="Cost" value="'+products.cost +'" required></div></div><div class="col-md-6 col-sm-6 col-xs-12 form-group has-feedback"><label class="control-label col-md-3 col-sm-3 col-xs-12" for="feature">Feature </label><div class="col-md-9 col-sm-9 col-xs-12"><input type="text" name="feature" class="form-control" placeholder="Product Feature" value="'+products.feature +'"></div></div><div class="clearfix"></div></div><div class="form-group"><div class="col-md-9 col-sm-9 col-xs-12 col-md-offset-3"><button type="submit" class="btn btn-success">Submit</button></div></div></form>');
  });
});
module.exports = router;
