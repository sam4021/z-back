const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const request = require('request');
const fs = require('fs');
var cloudinary = require('../config/cloudinary.js').cloudinary;

let Products = require('../models/products');
let Vendor = require('../models/vendor');
let ProductsVendor = require('../models/products_vendor');
let Category = require('../models/product_category');
let Attributes = require('../models/product_attributes');
let Entities = require('../models/product_entities');
let Brand = require('../models/product_brand');
let AttribEntities = require('../models/product_attributesEntities');

router.get('/', function(req, res, next){
  Products.
  find({deleted:0}).
  select('title category price special_price is_active is_web_active stock deleted').
  //populate('category','title',Category).
  exec((err, products)=>{
    Category.find({},(err,cat)=>{
      res.render('pages/products/index',{
        products: products,
        cat: cat
      });
    });
  });
});



//Create Form
router.get('/add', function(req, res, next){
  Attributes.find({},function(err, attrib){
    Brand.find({}, function(err, brand){
      Category.find({}, function(err, category){
          res.render('pages/products/add',{
            attrib: attrib,
            brand: brand,
            category: category
        });
      });
    });
  });
});

//Create Form
router.get('/quick-add', function(req, res, next){
  Attributes.find({},function(err, attrib){
    Brand.find({}, function(err, brand){
      Category.find({}, function(err, category){
          res.render('pages/products/quick-add',{
            attrib: attrib,
            brand: brand,
            category: category
          });
      });
    });
  });
});

//Add Products
router.post('/add', (req, res) => {
  req.checkBody('title','Title is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('pages/products/add',{
      errors: errors
    });
    console.log(errors);
  } else {

    let products= new Products();
    products.category = req.body.category;
    products.brand = req.body.brand;
    products.attribute = req.body.attrib_type;
    products.title = req.body.title;
    products.url = slugify(req.body.title,{remove: /[$*_+~.()'"!:@]/g,lower: true});
    products.price = req.body.price;
    products.cost = req.body.cost;
    products.special_price = req.body.special_price;
    products.descriptions.box_content = req.body.box_content;
    products.descriptions.short = req.body. short;
    products.descriptions.full = req.body.full;
    
    // var img = req.files.img;
    // var sort = req.body.sort;

    // var image=[];
    // for (var i = 0; i < img.length; i++) {
    //   //image[i]=[img[i],sort[i]];
    //   cloudinary.uploader.upload_stream((cloud_img) => {
    //     image[i]=[cloud_img.secure_url,sort[i]];

    // }).end(req.files.img[i].data);
    // }
    // products.images = image;

      products.save(function(err, new_product){
       if(err){
         req.flash('danger','Product not added');
        console.log(err);
        res.redirect('/products/add');
         return;
       } else{
        let prodId = new_product._id;
         req.flash('success','Product added');
         res.redirect('/products/view/'+prodId);
      }
    });
  }
});

//Add Quick Products
router.post('/quick-add', (req, res) => {
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('category', 'Please Select a Category').notEmpty();
  req.checkBody('brand', 'Please Select a Brand').notEmpty();
  req.checkBody('attrib_type', 'Please Select an Attribute').notEmpty();
  req.checkBody('price', 'Please Select a Price').notEmpty();
  req.checkBody('cost', 'Please Select a Cost').notEmpty();

  req.asyncValidationErrors().then(() => {

    let products= new Products();
    products.category = req.body.category;
    products.brand = req.body.brand;
    products.attribute = req.body.attrib_type;
    products.title = req.body.title;
    products.url = slugify(req.body.title,{remove: /[$*_+~.()'"!:@]/g,lower: true});
    products.price = req.body.price;
    products.cost = req.body.cost;
    products.special_price = req.body.special_price;
    products.descriptions.box_content = '';
    products.descriptions.short = '';
    products.descriptions.full = '';
    products.is_active = 1;

      products.save(function(err, new_product){
        let prodId = new_product._id;

       if(err){
         req.flash('danger','Product not added');
        console.log(err);
        res.redirect('/products/add');
         return;
       } else{
         req.flash('success','Product added');
         res.redirect('/products/view/'+prodId);
      }
    });
  }).catch((errors) => {

      if(errors) {console.log(errors);
        for (var i = 0; i < errors.length; i++) {
          var param = errors[i].param;
          var msg = errors[i].msg;
          req.flash('danger', errors[i].msg);
        }
        res.redirect('/products/quick-add');
        return;
      };
  });
});

//Products View
router.get('/view/:id', function(req, res, next){
  Products.
  findById(req.params.id).
  exec(function(err, products){
    ProductsVendor.
      find({products:req.params.id}).
      populate('vendor','name',Vendor).
      exec((err,pvendor)=>{
        Brand.findById(products.brand,(err,brand)=>{
          Category.findById(products.category,(err,category)=>{
            Category.find({},(err,allcategory)=>{
                Entities.find({},(err,entity)=>{
                  AttribEntities.find({},(err,a_entity)=>{
                    Products.find({}, function(err, allprod){
                        res.render('pages/products/view',{
                          products: products,
                          pvendor:pvendor,
                          brand: brand,
                          category: category,
                          allcategory: allcategory,
                          entity: entity,
                          a_entity: a_entity,
                          allprod:allprod
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

//Add Products Vendor
router.get('/add-vendor/:id', function(req, res, next){
  Products.findById(req.params.id, function(err, products){
    Vendor.find({}, function(err, vendor){
      ProductsVendor.find({products:req.params.id},(err,pvendor)=>{
        res.render('pages/products/add-vendor',{
          products: products,
          vendor: vendor,
          pvendor:pvendor
        });
      });
    });
  });
});

//Add Products Vendor
router.post('/add-vendor/:id', function(req, res, next){
  req.checkBody('vendor','Vendor is required').notEmpty();

  req.asyncValidationErrors().then(() => {
    const vendor = req.body.vendor;
    const cost = req.body.cost;
    const feature = req.body.feature;

    for (var i = 0; i < vendor.length; i++) {
      let ven= new ProductsVendor();
      ven.products = req.params.id
      ven.vendor = vendor[i];
      ven.cost = cost[i];
      ven.feature = feature[i];
       ven.save(function(err){
         if(err){
           console.log(err);
         }
       });
    }

         req.flash('success','Product Vendor added');
         res.redirect('/products/view/'+req.params.id);
  }).catch((errors) => {

      if(errors) {console.log(errors);
        for (var i = 0; i < errors.length; i++) {
          var param = errors[i].param;
          var msg = errors[i].msg;
          req.flash('danger', errors[i].msg);
        }
        res.redirect('/products/add-vendor/'+ req.params.id);
        return;
      };
  });
});

//Delete Products Vendor
router.get('/delete-vendor/:id/:product', function(req, res, next){
  ProductsVendor.remove({ _id:req.params.id }, function (err) {
    res.redirect('/products/view/'+req.params.product);
  });
});

//Edit Products Vendor
router.get('/edit-vendor/:id', function(req, res, next){
  Products.findById(req.params.id,(err,products)=>{
    ProductsVendor.find({}, function(err, pvendor){
      Vendor.find({}, function(err, vendor){
        res.render('pages/products/add-vendor',{
          products: products,
          vendor: vendor,
          pvendor:pvendor
        });
      });
    });
  });
});

//Assign Vendor
router.post('/assign_vendor', (req, res) => {
  req.checkBody('vendor','Vendor is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('pages/products/add',{
      errors: errors
    });
    console.log(errors);
  } else {
    let prod_ven= new ProductsVendor();
    prod_ven.products = req.body.product_id;
    prod_ven.vendor = req.body.vendor;

      prod_ven.save(function(err){
      if(err){
        req.flash('danger','Product not added');
        console.log(err);
        return;
      } else{
        req.flash('success','Product added');
        res.redirect('/products/view/'+req.body.product_id);
      }
      });
  }
});

//Products edit Info
router.get('/edit-info/:id', function(req, res, next){
  Products.findById(req.params.id, function(err, products){
    Brand.find({}, function(err, brand){
        res.render('pages/products/edit-info',{
          products: products,
          brand: brand
        });
      });
    });
  });

//Update Product info
router.post('/edit-info/:id', (req, res) => {

     let query = {_id: req.params.id};
     let title = req.body.title;
     let price = req.body.price;
     let cost = req.body.cost;
     let brand = req.body.brand;
     let special_price = req.body.special_price;

    Products.updateMany({ _id:req.params.id },{ $set:{ title: title , price: price , special_price:special_price, cost: cost, brand:brand }}, { multi: true }).exec();
         res.redirect('/products/view/'+req.params.id);
});

//Update Quick Product info
router.post('/quick-edit-info/:id', (req, res) => {

     let query = {_id: req.params.id};
     let title = req.body.title;
     let price = req.body.price;
     let special_price = req.body.special_price;
     let cost = req.body.cost;

    Products.updateMany({ _id:req.params.id },{ $set:{ title: title , price: price ,special_price: special_price, cost: cost }}, { multi: true }).exec();
         res.redirect('/products/');
}); 

//Products edit Image
router.get('/edit-image/:id', function(req, res, next){
  Products.findById(req.params.id, function(err, products){
    res.render('pages/products/edit-image',{
      products: products,
    });
  });
});

//Update Product Image
router.post('/add-image/:id', (req, res) => {
  // var path = req.files.images.path;
  // var name = req.files.images.name;
  // console.log(path);
  // console.log(name);
//   var data = {
//   file: fs.createReadStream( req.body.images )
// };
// request.post({ url:'http://npt.phonestablets.co.ke/index.php', formData:data }, function callback( err, response, body ) {
//     if( err ) {
//         return console.error( 'Failed to upload:', err );
//     }
//     console.log( 'Upload successful!' );
// });

  Products.findById(req.params.id,(err,product)=>{
    let image = product.images;
    cloudinary.uploader.upload_stream((cloud_img) => {
      image.push([cloud_img.secure_url,req.body.sort]);  
      Products.updateMany({ _id:req.params.id },{
        $set:{
          images: image
         }
      }, { multi: true }).exec(function (err, middle) {
        if (err) {
          console.log(err);
          return ;
        } else{
          // if(req.body.bottom_img){
          //   var image = /[^/]*$/.exec(req.body.bottom_img)[0];
          //   var publicId = image.replace(/\..+$/, '');
          //   cloudinary.v2.uploader.destroy(publicId, function(error, result){console.log(result, error)});
          // }
          req.flash('success','Product Image added');
          res.redirect('/products/view/'+req.params.id);
        }
      });
    }).end(req.files.image.data);  
    //Products.updateMany({ _id:req.params.id },{ $set:{ images: image }}, { multi: true }).exec();
  });
});

//Update Product Image
router.post('/delete-image/:id', (req, res) => {
  Products.findById(req.params.id,(err,product)=>{
    let oldImage = product.images;

    let image = req.body.image;
    var pos = oldImage.indexOf(image);
    oldImage.splice(pos, 1);

    var img = /[^/]*$/.exec(image)[0];
    var publicId = img.replace(/\..+$/, '');
    cloudinary.v2.uploader.destroy(publicId, function(error, result){console.log(result, error)});

    Products.updateMany({ _id:req.params.id },{ $set:{ images: oldImage }}, { multi: true }).exec();
    res.redirect('/products/view/'+req.params.id);
  });
});

//Update Product Status
router.post('/product_status/:id', (req, res) => {

     let query = {_id: req.params.id};
     let status =req.body.status;

      Products.update(query,{ is_active: status}).exec();

      if (status==0) {
        res.send('1');
      } else {
        res.send('0');
      }

});

//Deleted Products
router.get('/deleted', function(req, res, next){
  Products.find({deleted: 1},function(err, products){
    res.render('pages/products/deleted',{
      products: products
    });
  });
});

//Update Product Status Delete
router.get('/product_delete/:id', (req, res) => {

     let query = {_id: req.params.id};

      Products.updateMany(query,{ $set:{ deleted: 1,is_active: 0,is_web_active:0 }}, { multi: true }).exec();

      res.redirect('/products');

});

//Update Product Status Delete
router.get('/product_undelete/:id', (req, res) => {

     let query = {_id: req.params.id};

      Products.updateMany(query,{ $set:{ deleted: 0,is_active: 0,is_web_active:0 }}, { multi: true }).exec();

      res.redirect('/products');

});

//Update Product Web Status
router.post('/product_web_status/:id', (req, res) => {

     let query = {_id: req.params.id};
     let status =req.body.status;

      Products.update(query,{ is_web_active: status}).exec();
      if (status==0) {
        res.send('1');
      } else {
        res.send('0');
      }
});

//Update Product Stock Status
router.post('/product_stock_status/:id', (req, res) => {

  let query = {_id: req.params.id};
  let stock =req.body.stock;

   Products.update(query,{ stock: stock}).exec();
   if (stock==0) {
     res.send('1');
   } else {
     res.send('0');
   }
});

//Products edit description
router.get('/edit-description/:id', function(req, res, next){
  Products.findById(req.params.id, function(err, products){
    res.render('pages/products/edit-description',{
      products: products
    });
  });
});

//Update Product Description
router.post('/edit-description/:id', (req, res) => {

     let query = {_id: req.params.id};
     let box_content = req.body.box_content;
     let short = req.body.short;
     let full = req.body.full;

     Products.updateMany({ _id:req.params.id },{ $set:{ descriptions:{box_content: box_content , short: short , full: full} }}, { multi: true }).exec();
          res.redirect('/products/view/'+req.params.id);
});

//Update Product Category
router.post('/edit-category/:id', (req, res) => {
     let category = req.body.category;
     Products.updateMany({ _id:req.params.id },{ $set:{ category: category }}, { multi: true }).exec();
          res.redirect('/products/view/'+req.params.id);
});

//Get Edit Entity
router.get('/edit-entity/:id', function(req, res, next){
  Products.findById(req.params.id, function(err, products){
      AttribEntities.find({attributes:products.attribute}, function(err, attrib){
        Entities.find({},(err,entity)=>{
          res.render('pages/products/edit-entity',{
            products: products,
            attrib: attrib,
            entity: entity
        });
      });
    });
  });
});
//delete Entity
router.get('/delete-prod-ent/:id/:entity', (req, res) => {
  Products.findById(req.params.id,(err,product)=>{
    let olddesc = product.desc_entity;
    let newDesc=[];
    olddesc.forEach(entity => {
      if(entity.entity != req.params.entity){
        newDesc.push(entity);
      }
    });
    Products.updateMany({ _id:req.params.id },{ $set:{ desc_entity: newDesc }}, { multi: true }).exec();
    res.redirect('/products/view/'+req.params.id);
  });
});
//Post Add Entity
router.post('/add-entity/:id', (req, res) => {
  console.log(req.body);
  let id = req.body.product_id;
  let query = {_id: id};
  let entity = req.body.entity;
  let value = req.body.e_value;

    Products.update(query, { $push: { desc_entity: {entity:entity,value:value} } }).exec();
    // res.send(desc);
});

//Products edit Seo
router.get('/edit-seo/:id', function(req, res, next){
  Products.findById(req.params.id, function(err, products){
    res.render('pages/products/edit-seo',{
      products: products
    });
  });
});

//Update Product Description
router.post('/edit-seo/:id', (req, res) => {

     let query = {_id: req.params.id};
     let url = slugify(req.body.url,{remove: /[$*_+~.()'"!:@]/g,lower: true});
     let title = req.body.title;
     let keywords = req.body.keywords;
     let description = req.body.description;

     Products.updateMany({ _id:req.params.id },{ $set:{ url:url,seo:{title:title,description: description , keywords: keywords} }}, { multi: true }).exec();
          res.redirect('/products/view/'+req.params.id);
});

////////////////////////////////
////////AJax Functions/////////
///////////////////////////////
router.get('/attrib_type/:id',function(req, res,next){
  let query = {_id:req.params.id}
  let output='';
  AttribEntities.find({attributes:req.params.id}, function(err, attrib){

       Entities.find({}, function(err, entity){
         if(err){console.log(err);return err;}
         res.render('pages/ajax/attrib_type',{
           attrib: attrib,
           entity: entity
         });

       });
  });
});

router.get('/ajax_quick_edit/:id',(req, res, next)=>{
  Products.findById(req.params.id,(err,products)=>{
    res.send("<form action='/products/quick-edit-info/"+ products.id+"' method='post' role='form' class='row'><div class='col-md-12 col-sm-12 col-xs-12 row'><div class='col-md-12 col-sm-12 col-xs-12 form-group has-feedback'><label class='control-label col-md-3 col-sm-3 col-xs-12' for='title'>Title </label><div class='col-md-12 col-sm-12 col-xs-12'><input name='title' class='form-control' placeholder='Title' value='"+products.title+"' required></div></div><div class='col-md-6 col-sm-6 col-xs-12 form-group has-feedback'><label class='control-label col-md-3 col-sm-3 col-xs-12' for='price'>Price </label><div class='col-md-9 col-sm-9 col-xs-12'><input name='price' class = 'form-control' placeholder='Price' value='"+ products.price +"' required></div></div><div class='col-md-6 col-sm-6 col-xs-12 form-group has-feedback'></div><div class='col-md-6 col-sm-6 col-xs-12 form-group has-feedback'><label class='control-label col-md-12 col-sm-12 col-xs-12' for='special_price'>Special Price </label><div class='col-md-9 col-sm-9 col-xs-12'><input name='special_price' class = 'form-control' value='"+ products.special_price +"' placeholder='Special Price'></div></div><div class='col-md-6 col-sm-6 col-xs-12 form-group has-feedback'><label class='control-label col-md-3 col-sm-3 col-xs-12' for='cost'>Cost </label><div class='col-md-9 col-sm-9 col-xs-12'><input type='text' name='cost' class='form-control' placeholder='Cost' value='"+products.cost +"' required></div></div><div class='clearfix'></div></div><div class='form-group'><div class='col-md-9 col-sm-9 col-xs-12 col-md-offset-3'><button type='submit' class='btn btn-success'>Submit</button></div></div></form>");
  });
});

router.get('/ajax_quick_vendor/:id',(req, res, next)=>{
  ProductsVendor.
  find({products:req.params.id}).
  sort({cost:'ascending'}).
  populate('vendor','name',Vendor).
  exec((err,vendor)=>{
    res.render('pages/ajax/product_vendor',{
      vendor: vendor
    });
  });
});

module.exports = router;
