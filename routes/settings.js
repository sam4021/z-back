const express = require('express');
const global = require('../config/global');
const router = express.Router();
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  console.log(file);
  
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})
var cloudinary = require('../config/cloudinary.js').cloudinary;
// const cloudinary = require('cloudinary');

// cloudinary.config({ 
//   cloud_name: global.CLOUD_NAME, 
//   api_key: global.CLOUDINARY_API_KEY, 
//   api_secret: global.CLOUDINARY_API_SECRET 
// });



let Attributes = require('../models/product_attributes');
let Entities = require('../models/product_entities');
let Brand = require('../models/product_brand');
let Products = require('../models/products');
let AttribEntities = require('../models/product_attributesEntities');
let Category = require('../models/product_category');
let PhoneMainCategory = require('../models/phone_main_category');
let PhoneMainAds = require('../models/phone_main_ads');
let PhoneMainSlider = require('../models/phone_main_slider');
let PhoneMainSide = require('../models/phone_main_side');
let PhoneMainMiddle = require('../models/phone_main_middle');
let PhoneProductsFeatured = require('../models/phone_products_featured');
let PhoneMainShipping = require('../models/phone_main_shipping');
let Courier = require('../models/courier');
let CourierLocation = require('../models/courier_location');
let DeliveryLocation = require('../models/delivery_locations');
let PhoneMainCategoryFoot = require('../models/phone_main_categories_foot');
let PhoneMainFoot = require('../models/phone_main_foot');

router.get('/', function(req, res, next){
  Attributes.find({},function(err, attrib){
    Brand.find({}, function(err, brand){
      Entities.find({}, function(err, entity){
        Category.find({}, (err, category) =>{ 
          AttribEntities.find({},(err,att)=>{
              PhoneMainAds.find({},(err,ads)=>{
                PhoneMainSlider.find({},(err,slider)=>{
                  PhoneMainSide.find({},(err,side_ad)=>{
                    PhoneMainMiddle.find({},(err,middle_ad)=>{
                  PhoneMainCategory.find({},(err,mCategory)=>{
                    PhoneProductsFeatured.find({},(err,featured)=>{
                      Products.find({is_active:1, deleted: 0},(err,products)=>{
                        Courier.find({},(err,courier)=>{
                          DeliveryLocation.find({},(err,location)=>{
                            PhoneMainShipping.find({},(err,shipping)=>{
                              PhoneMainCategoryFoot.find({},(err,mCategoryf)=>{
                                PhoneMainFoot.find({},(err,mainf)=>{
                              res.render('pages/settings/index',{
                                attrib: attrib,
                                brand: brand,
                                entity: entity,
                                category: category,
                                att: att,
                                ads: ads,
                                slider: slider,
                                side_ad: side_ad,
                                middle_ad: middle_ad,
                                mCategory: mCategory,
                                featured: featured,
                                products: products,
                                courier: courier,
                                location: location,
                                shipping: shipping,
                                mCategoryf: mCategoryf,
                                mainf: mainf
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
              });
              });
            });
          });
        });
      });
    });
  });
});

//Add Main Shipping
router.get('/add-main-shipping', function(req, res){
  DeliveryLocation.find({}, (err, location) =>{
    res.render('pages/settings/add-main-shipping',{
      location: location
    });
  });
});

//Add Main Category Foot
router.get('/add-main-category-foot', function(req, res){
  Products.find({is_active:1}).
  exec((err,products)=>{
      res.render('pages/settings/add-main-category-foot',{
        products: products
    });
  });
});

//Add Main Category Foot
router.post('/add-main-category-foot', function(req,res){
  req.checkBody('product','Product is required').notEmpty();
  
  req.asyncValidationErrors().then(() => {
        let cat= new PhoneMainCategoryFoot();
        cat.title = req.body.title;
        cat.sort = req.body.sort;
        cat.products = req.body.product;
        cat.save(function(err){
          if(err){
            req.flash('danger','Main Category Foot not added');
            console.log(err);
            res.redirect('/settings/add-main-category-foot');
            return;
          }
        });
  
      req.flash('success','Main Category Foot added');
      res.redirect('/settings/');
      console.log(cat);
      console.log(link);
    }).catch((errors) => {
  
        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings/add-main-category-foot');
          return;
        };
    });
  });

//Add Main Foot
router.get('/add-main-foot', function(req, res){
    res.render('pages/settings/main/add-main-foot',{});
});

//Add Main Foot
router.post('/add-main-foot', function(req,res){
req.checkBody('title','Title is required').notEmpty();
req.checkBody('details','Details is required').notEmpty();

req.asyncValidationErrors().then(() => {
      let cat= new PhoneMainFoot();
      cat.title = req.body.title;
      cat.sort = req.body.sort;
      cat.details = req.body.details;
      cat.save(function(err){
        if(err){
          req.flash('danger','Main Foot not added');
          console.log(err);
          res.redirect('/settings/add-main-foot');
          return;
        }
      });

    req.flash('success','Main Foot added');
    res.redirect('/settings/');
    console.log(cat);
    console.log(link);
  }).catch((errors) => {

      if(errors) {
        for (var i = 0; i < errors.length; i++) {
          var param = errors[i].param;
          var msg = errors[i].msg;
          req.flash('danger', errors[i].msg);
        }
        res.redirect('/settings/add-main-foot');
        return;
      };
  });
});

//Edit Main Category
router.get('/edit-main-category-foot/:id', function(req, res){
PhoneMainCategoryFoot.
findById(req.params.id).
populate('products','title price',Products).
exec((err,pcategory)=>{
    Products.find({is_active:1,deleted: 0},(err,products)=>{
        res.render('pages/settings/edit-main-category-foot',{
          products: products,
          pcategory:pcategory
      });
    });
});
});

//Edit Main Category
router.post('/edit-main-category-foot/:id', function(req,res){
req.checkBody('product','Product is required').notEmpty();

req.asyncValidationErrors().then(() => {
      let title = req.body.title;
      let sort = req.body.sort;
      let products = req.body.product;

      PhoneMainCategoryFoot.updateMany({ _id:req.params.id },{
        $set:{
          title: title ,
          sort: sort,
          products:products,
         }
      }, { multi: true }).exec();

    req.flash('success','Main Category Edited');
    res.redirect('/settings/');
  }).catch((errors) => {

      if(errors) {
        for (var i = 0; i < errors.length; i++) {
          var param = errors[i].param;
          var msg = errors[i].msg;
          req.flash('danger', errors[i].msg);
        }
        res.redirect('/settings/edit-main-category-foot/'+req.params.id);
        return;
      };
  });
});

//Delete Main Category Product
router.get('/delete-main-category-prod-foot/:id/:prod', function(req, res){
PhoneMainCategoryFoot.findById(req.params.id,(err,pcategory)=>{
  if(err){
    req.flash('danger','Product not deleted');
    res.redirect('/settings/edit-main-category-foot/'+req.params.id);
    console.log(err);
    return;
  }
  let products = pcategory.products;
  console.log(products);
  var i = products.indexOf(req.params.prod);
if(i != -1) {
products.splice(i, 1);
}
 PhoneMainCategoryFoot.updateMany({ _id:req.params.id },{ $set:{ products: products }}, { multi: true }).exec();
      res.redirect('/settings/edit-main-category-foot/'+req.params.id);
});
});

//Edit Main Foot
router.get('/edit-main-foot/:id', function(req, res){
  PhoneMainFoot.
  findById(req.params.id).
  exec((err,pcategory)=>{
          res.render('pages/settings/main/edit-main-foot',{
            pcategory:pcategory
        });
      });
  });
  
  //Edit Main Category
  router.post('/edit-main-foot/:id', function(req,res){
  req.checkBody('title','Title required').notEmpty();
  req.checkBody('details','Details required').notEmpty();
  
  req.asyncValidationErrors().then(() => {
        let title = req.body.title;
        let sort = req.body.sort;
        let details = req.body.details;
  
        PhoneMainFoot.updateMany({ _id:req.params.id },{
          $set:{
            title: title ,
            sort: sort,
            details: details,
           }
        }, { multi: true }).exec();
  
      req.flash('success','Main Edited');
      res.redirect('/settings/');
    }).catch((errors) => {
  
        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings/edit-main-foot/'+req.params.id);
          return;
        };
    });
  });
  
  //Delete Main Category Product
  router.get('/delete-main-foot/:id/', function(req, res){
  PhoneMainFoot.remove({ _id:req.params.id }, function (err) {
      if (err) {
        req.flash('danger','Main Footer Data not deleted');
      res.redirect('/settings/');
      console.log(err);
      return;
      } else {
        res.redirect('/settings');
      }
  });
});

//Add Main Shipping
router.post('/add-main-shipping', function(req,res){
  req.checkBody('location','Location is required').notEmpty();
  req.checkBody('amount','Amount is required').notEmpty();

  req.asyncValidationErrors().then(() => {
        let shipping= new PhoneMainShipping();
        shipping.location = req.body.location;
        shipping.amount = req.body.amount;
        shipping.save(function(err){
          if(err){
            req.flash('danger','Main Shipping not added');
            console.log(err);
            return;
          }
        });

      req.flash('success','Main Shipping added');
      res.redirect('/settings/');
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings/add-main-shipping');
          return;
        };
    });
});

//Edit Main Shipping
router.get('/edit-main-shipping/:id', function(req, res){
  PhoneMainShipping.findById(req.params.id,(err,shipping)=>{
    DeliveryLocation.find({}, (err, location) =>{
      res.render('pages/settings/edit-main-shipping',{
        shipping: shipping,
        location: location
      });
    });
  });
});

//Edit Main Shipping
router.post('/edit-main-shipping/:id', function(req,res){
  req.checkBody('location','Location is required').notEmpty();
  req.checkBody('amount','Amount is required').notEmpty();

  req.asyncValidationErrors().then(() => {
        let location = req.body.location;
        let amount = req.body.amount;

        PhoneMainShipping.updateMany({ _id:req.params.id },{
          $set:{
            location: location ,
            amount:amount
           }
        }, { multi: true }).exec();

      req.flash('success','Shipping Edited');
      res.redirect('/settings/');
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings/edit-main-shipping/'+req.params.id);
          return;
        };
    });
});

//Add Main Category
router.get('/add-main-category', function(req, res){
  Category.find({}, (err, category) =>{
    Products.find({is_active:1},(err,products)=>{
        res.render('pages/settings/main-category/add-main-category',{
          category: category,
          products: products
      });
    });
  });
});

//Add Main Category
router.post('/add-main-category', function(req,res){
  // req.checkBody('product','Product is required').notEmpty();
  // req.checkBody('main_image','Main Category Image is required').notEmpty();
  // req.checkBody('link_image','Main Category Link is required').notEmpty();
  // req.checkBody('alt_image','Main Category Text is required').notEmpty();

  // req.asyncValidationErrors().then(() => {
    cloudinary.uploader.upload_stream((cloud_img) => {
        let cat= new PhoneMainCategory();
        cat.category = req.body.category;
        cat.sort = req.body.sort;
        cat.image.img = cloud_img.secure_url;
        cat.image.link = req.body.link_image;
        cat.image.alt = req.body.alt_image;
        // cat.bottom_image.img = req.body.bottom_image;
        // cat.bottom_image.link = req.body.bottom_link_image;
        // cat.bottom_image.alt = req.body.bottom_alt_image;
        cat.products = req.body.product;
        cat.save(function(err){
          if(err){
            req.flash('danger','Main Category not added');
            console.log(err);
            return;
          } else{
            req.flash('success','Main Category added');
            res.redirect('/settings/');
          }
        });
    }).end(req.files.main_image.data);
    // }).catch((errors) => {

    //     if(errors) {
    //       for (var i = 0; i < errors.length; i++) {
    //         var param = errors[i].param;
    //         var msg = errors[i].msg;
    //         req.flash('danger', errors[i].msg);
    //       }
    //       res.redirect('/settings/add-main-category');
    //       return;
    //     };
    // });
});  

//Edit Main Category
router.get('/edit-main-category-txt/:id', function(req, res){
  PhoneMainCategory.findById(req.params.id,(err,pcategory)=>{
    Category.find({}, (err, category) =>{
      Products.find({},(err,products)=>{
        Brand.find({},(err,brand)=>{
          res.render('pages/settings/main-category/edit-main-category-txt',{
            category: category,
            products: products,
            pcategory:pcategory,
            brand: brand
          });
        });
      });
    });
  });
});

//Edit Main Category img
router.get('/edit-main-category-img/:id', function(req, res){
  PhoneMainCategory.findById(req.params.id,(err,pcategory)=>{
      res.render('pages/settings/main-category/edit-main-category-img',{
        pcategory:pcategory
    });
});
});

//Edit Main Category
router.post('/edit-main-category-txt/:id', function(req,res){
      let category = req.body.category;
        let img = req.body.main_image;
        let link = req.body.link_image;
        let alt = req.body.alt_image;
        let products = req.body.product;
        let sort = req.body.sort;
        let brands = req.body.brand;
         console.log();
         
        PhoneMainCategory.findById(req.params.id,(err,ph)=>{
          var prods = ph.products;
          var bran = ph.brands;
          if (req.body.product) {
            if (Array.isArray(req.body.product)) {
              products.forEach(element => {
                prods.push(element);
              }); 
            } else {
              prods.push(products);
            }
            
          }
          if (req.body.brand) {
            if (Array.isArray(req.body.brand)) {
              brands.forEach(element => {
                bran.push(element);
              }); 
            } else {
              bran.push(brands);
            }
            
          }
          
          PhoneMainCategory.updateMany({ _id:req.params.id },{
          $set:{
            category: category ,
            products:prods,
            image:{link:link,alt:alt},
            sort:sort,
            brands:bran
           }
        }, { multi: true }).exec();
 
      req.flash('success','Main Category Edited');
      res.redirect('/settings/');
       });
      
});

router.post('/edit-main-category-img/:id', function(req,res){
      cloudinary.uploader.upload_stream((cloud_img) => {
        //let category = req.body.category;
        let img =  cloud_img.secure_url;
        // let link = req.body.link_image;
        // let alt = req.body.alt_image;
        // let products = req.body.product;

        PhoneMainCategory.updateMany({ _id:req.params.id },{
          $set:{
            image:{img:img
            //  ,link:link,alt:alt
            }
           }
        }, { multi: true }).exec();
        if(req.body.main_img){
          var image = /[^/]*$/.exec(req.body.main_img)[0];
          var publicId = image.replace(/\..+$/, '');
          cloudinary.v2.uploader.destroy(publicId, function(error, result){console.log(result, error)});
        }

      req.flash('success','Main Category Edited');
      res.redirect('/settings/');
    }).end(req.files.main_image.data);
});

//Edit Main Category
router.get('/edit-main-category-strip-img/:id', function(req, res){
  PhoneMainCategory.findById(req.params.id,(err,pcategory)=>{
      res.render('pages/settings/main-category/bottom-strip-img',{
        pcategory:pcategory
    });
  });
});

router.get('/edit-main-category-strip-txt/:id', function(req, res){
  PhoneMainCategory.findById(req.params.id,(err,pcategory)=>{
      res.render('pages/settings/main-category/bottom-strip-txt',{
        pcategory:pcategory
    });
  });
});

router.post('/edit-main-category-strip-img/:id',(req,res)=>{
    cloudinary.uploader.upload_stream((cloud_img) => {
      let Bimg = cloud_img.secure_url;
      let Blink = req.body.bottom_link_image;
      let Balt = req.body.bottom_alt_image;     
      PhoneMainCategory.updateMany({ _id:req.params.id },{
        $set:{
          bottom_image:{img:Bimg},
         }
      }, { multi: true }).exec(function (err, middle) {
        if (err) {
          console.log(err);
          return ;
        } else{
          if(req.body.bottom_img){
            var image = /[^/]*$/.exec(req.body.bottom_img)[0];
            var publicId = image.replace(/\..+$/, '');
            cloudinary.v2.uploader.destroy(publicId, function(error, result){console.log(result, error)});
          }
          req.flash('success','Category Strip added');
          res.redirect('/settings/');
        }
  
      });
    
    }).end(req.files.bottom_image.data);  
})
router.post('/edit-main-category-strip-txt/:id',(req,res)=>{
    let Blink = req.body.bottom_link_image;
    let Balt = req.body.bottom_alt_image;     
    PhoneMainCategory.updateMany({ _id:req.params.id },{
      $set:{
        bottom_image:{link:Blink,alt:Balt},
       }
    }, { multi: true }).exec(function (err, middle) {
      if (err) {
        console.log(err);
        return ;
      } else{
        req.flash('success','Category Strip Edited');
        res.redirect('/settings/');
      }

    });
})

//Delete Main Category Product
router.get('/delete-main-category-prod/:id/:prod', function(req, res){
  PhoneMainCategory.findById(req.params.id,(err,pcategory)=>{
    if(err){
      req.flash('danger','Product not deleted');
      res.redirect('/settings/edit-main-category-txt/'+req.params.id);
      console.log(err);
      return;
    }
    let products = pcategory.products;
    console.log(products);
    var i = products.indexOf(req.params.prod);
if(i != -1) {
	products.splice(i, 1);
}
   PhoneMainCategory.updateMany({ _id:req.params.id },{ $set:{ products: products }}, { multi: true }).exec();
        res.redirect('/settings/edit-main-category-txt/'+req.params.id);
  });
});

//Delete Main Category Brand
router.get('/delete-main-category-brand/:id/:prod', function(req, res){
  PhoneMainCategory.findById(req.params.id,(err,pcategory)=>{
    if(err){
      req.flash('danger','Brand not deleted');
      res.redirect('/settings/edit-main-category-txt/'+req.params.id);
      console.log(err);
      return;
    }
    let brand = pcategory.brands;
    var i = brand.indexOf(req.params.prod);
    if(i != -1) {
      brand.splice(i, 1);
    }
   PhoneMainCategory.updateMany({ _id:req.params.id },{ $set:{ brands: brand }}, { multi: true }).exec();
        res.redirect('/settings/edit-main-category-txt/'+req.params.id);
  });
});


//Add Main Slider
router.get('/add-slider', function(req, res){
  res.render('pages/settings/slider/add-slider');
});

//Add Main Slider
// router.post('/add-slider', function(req,res){
//   req.checkBody('link','Link is required').notEmpty();
//   req.checkBody('image','Image is required').notEmpty();
//   req.checkBody('alt','Alt Text is required').notEmpty();

//   req.asyncValidationErrors().then(() => {
//         let slider= new PhoneMainSlider();
//         slider.link = req.body.link;
//         slider.image = req.body.image;
//         slider.sort = req.body.sort;
//         slider.alt = req.body.alt;
//         slider.save(function(err){
//           if(err){
//             req.flash('danger','Slider not added');
//             console.log(err);
//             return;
//           }
//         });

//       req.flash('success','Slider added');
//       res.redirect('/settings/');
//       console.log(cat);
//       console.log(link);
//     }).catch((errors) => {

//         if(errors) {
//           for (var i = 0; i < errors.length; i++) {
//             var param = errors[i].param;
//             var msg = errors[i].msg;
//             req.flash('danger', errors[i].msg);
//           }
//           res.redirect('/settings/add-slider');
//           return;
//         };
//     });
// });

router.post("/add-slider", function(req, res) {  
  //router.post("/add-slider", upload.single('image'), function(req, res) {  
   //cloudinary.v2.uploader.upload(fileGettingUploaded, function(err, result) {
    cloudinary.uploader.upload_stream((cloud_img) => {     
            let slider= new PhoneMainSlider();
            slider.link = req.body.link;
            slider.image = cloud_img.secure_url;
            slider.sort = req.body.sort;
            slider.alt = req.body.alt;
            slider.save(function(err){
              if(err){
                req.flash('danger','Slider not added');
                console.log(err);
                return;
              }
            });

          req.flash('success','Slider added');
          res.redirect('/settings/');
        }
    
  )
    .end(req.files.image.data);
});

//Edit Main Category
router.get('/edit-slider/:id', function(req, res){
  PhoneMainSlider.findById(req.params.id,(err,slider)=>{
    res.render('pages/settings/slider/edit-slider',{
      slider: slider,
    });
  });
});

//Edit Main Slider
router.post('/edit-slider/:id', function(req,res){
  req.checkBody('link','Link is required').notEmpty();
  req.checkBody('alt','Alt Text is required').notEmpty();

  req.asyncValidationErrors().then(() => {
        let sort = req.body.sort;
        let link = req.body.link;
        let alt = req.body.alt;

        PhoneMainSlider.updateMany({ _id:req.params.id },{
          $set:{
            sort: sort ,
            link: link ,
            alt:alt,
           }
        }, { multi: true }).exec();

      req.flash('success','Slider Edited');
      res.redirect('/settings/');
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings/slider/edit-slider/'+req.params.id);
          return;
        };
    });
});

//Delete Slider
router.get('/delete-slider/:id',(req, res)=>{
  PhoneMainSlider.findById(req.params.id,(err,slider)=>{
    var id= slider.id;
    
    var image = /[^/]*$/.exec(slider.image)[0];
    var publicId = image.replace(/\..+$/, '');
    cloudinary.v2.uploader.destroy(publicId, function(error, result){console.log(result, error)});
  });
  PhoneMainSlider.remove({ _id:req.params.id }, function (err) {
    console.log(err);
  });
  res.redirect('/settings');
});

//Add Main Side
router.get('/add-side-ad', function(req, res){
  res.render('pages/settings/add-side-ad');
});

router.post("/add-side-ad", function(req, res) {  
    cloudinary.uploader.upload_stream((cloud_img) => {     
            let side= new PhoneMainSide();
            side.link = req.body.link;
            side.image = cloud_img.secure_url;
            side.sort = req.body.sort;
            side.alt = req.body.alt;
            side.save(function(err){
              if(err){
                req.flash('danger','Side not added');
                console.log(err);
                return;
              }
            });

          req.flash('success','Side added');
          res.redirect('/settings/');
        }
    
  )
    .end(req.files.image.data);
});

//Edit Side
router.get('/edit-side-ad/:id', function(req, res){
  PhoneMainSide.findById(req.params.id,(err,side)=>{
    res.render('pages/settings/edit-side-ad',{
      side: side,
    });
  });
});

//Edit Side
router.post('/edit-side-ad/:id', function(req,res){
  req.checkBody('link','Link is required').notEmpty();
  req.checkBody('alt','Alt Text is required').notEmpty();

  req.asyncValidationErrors().then(() => {
        let sort = req.body.sort;
        let link = req.body.link;
        let alt = req.body.alt;

        PhoneMainSide.updateMany({ _id:req.params.id },{
          $set:{
            sort: sort ,
            link: link ,
            alt:alt,
           }
        }, { multi: true }).exec();

      req.flash('success','Side Edited');
      res.redirect('/settings/');
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings/edit-side-ad/'+req.params.id);
          return;
        };
    });
});

//Delete Side
router.get('/delete-side-ad/:id',(req, res)=>{
  PhoneMainSide.findById(req.params.id,(err,slider)=>{
    if(slider){
      var id= slider.id;
    
    var image = /[^/]*$/.exec(slider.image)[0];
    var publicId = image.replace(/\..+$/, '');
    cloudinary.v2.uploader.destroy(publicId, function(error, result){console.log(result, error)});
    }
    
  });
  PhoneMainSide.remove({ _id:req.params.id }, function (err) {
    console.log(err);
  });
  res.redirect('/settings');
});

//Add Main Side
router.get('/add-middle-ad', function(req, res){
  res.render('pages/settings/add-middle-ad');
});

router.post("/add-middle-ad", function(req, res) {  
    cloudinary.uploader.upload_stream((cloud_img) => {     
            let side= new PhoneMainMiddle();
            side.link = req.body.link;
            side.image = cloud_img.secure_url;
            side.sort = req.body.sort;
            side.alt = req.body.alt;
            side.save(function(err){
              if(err){
                req.flash('danger','Middle Ad not added');
                console.log(err);
                return;
              }
            });

          req.flash('success','Middle Ad added');
          res.redirect('/settings/');
        }
    
  )
    .end(req.files.image.data);
});

//Edit Side
router.get('/edit-middle-ad/:id', function(req, res){
  PhoneMainMiddle.findById(req.params.id,(err,side)=>{
    res.render('pages/settings/edit-middle-ad',{
      side: side,
    });
  });
});

//Edit Middle
router.post('/edit-middle-ad/:id', function(req,res){
  req.checkBody('link','Link is required').notEmpty();
  req.checkBody('alt','Alt Text is required').notEmpty();

  req.asyncValidationErrors().then(() => {
        let sort = req.body.sort;
        let link = req.body.link;
        let alt = req.body.alt;

        PhoneMainMiddle.updateMany({ _id:req.params.id },{
          $set:{
            sort: sort ,
            link: link ,
            alt:alt,
           }
        }, { multi: true }).exec();

      req.flash('success','Middle Ad Edited');
      res.redirect('/settings/');
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings/edit-middle-ad/'+req.params.id);
          return;
        };
    });
});

//Delete Side
router.get('/delete-middle-ad/:id',(req, res)=>{
  PhoneMainMiddle.findById(req.params.id,(err,slider)=>{
    var id= slider.id;
    
    var image = /[^/]*$/.exec(slider.image)[0];
    var publicId = image.replace(/\..+$/, '');
    cloudinary.v2.uploader.destroy(publicId, function(error, result){console.log(result, error)});
  });
  PhoneMainMiddle.remove({ _id:req.params.id }, function (err) {
    console.log(err);
  });
  res.redirect('/settings');
});

//Load Courier Info
router.get('/courier/:id', function(req, res){
  Courier.findById(req.params.id,function(err, courier){
    CourierLocation.find({courier:courier.id},(err,location)=>{
      DeliveryLocation.find({},(err,dLoc)=>{
        res.render('pages/settings/courier/view',{
          courier: courier,
          location: location,
          dLoc: dLoc
        });
      });
    });
  });
});

//Add Location
router.post('/add-location', function(req,res){
  req.checkBody('region','Region is required').notEmpty();
  req.checkBody('location','Location is required').notEmpty();

  req.asyncValidationErrors().then(() => {
        let loc= new DeliveryLocation();
        loc.region = req.body.region;
        loc.location = req.body.location;
        loc.save(function(err){
          if(err){
            req.flash('danger','Delivery Location not added');
            console.log(err);
            return;
          }
        });

      req.flash('success','Delivery Location added');
      res.redirect('/settings/');
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings');
          return;
        };
    });
});

//Load Location Info Edit
router.get('/get_location/:id', function(req, res){
    DeliveryLocation.findById(req.params.id,(err,loc)=>{
      res.render('pages/settings/edit-location',{
        loc: loc
      });
    });
});

//Update Location
router.post('/get_location/:id', function(req,res){
  let id = req.params.id;
  let loc= {};
  loc.region = req.body.region;
  loc.location = req.body.location;

  let query = {_id:id}

  DeliveryLocation.update(query, loc, function(err){
    if(err){
      console.log(err);
      return;
    } else{
      res.redirect('/settings/');
    }
  });
});

//Add Courier
router.post('/add-courier', function(req,res){
  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('phone','Phone is required').notEmpty();

  req.asyncValidationErrors().then(() => {
        let courier= new Courier();
        courier.name = req.body.name;
        courier.phone = req.body.phone;
        courier.email = req.body.email;
        courier.save(function(err){
          if(err){
            req.flash('danger','Courier not added');
            console.log(err);
            return;
          }
        });

      req.flash('success','Courier added');
      res.redirect('/settings/');
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings');
          return;
        };
    });
});

//Update Courier Info
router.post('/edit-courier/:id', function(req,res){
  let id = req.params.id;
  let courier= {};
  courier.name = req.body.name;
  courier.phone = req.body.phone;
  courier.email = req.body.email;


  let query = {_id:id}

  Courier.update(query, courier, function(err){
    if(err){
      console.log(err);
      return;
    } else{
      res.redirect('/settings/courier/'+id);
    }
  });
});

//Add Courier Branch
router.post('/add-courier-branch', function(req,res){
  req.checkBody('location','Branch Location is required').notEmpty();
  req.checkBody('amount','Phone is required').notEmpty();

  let id = req.body.courier;
  req.asyncValidationErrors().then(() => {
        let courier= new CourierLocation();

        courier.courier = id;
        courier.branch = req.body.location;
        courier.amount = req.body.amount;
        courier.info.phone = req.body.phone;
        courier.info.email = req.body.email;
        courier.save(function(err){
          if(err){
            req.flash('danger','Courier Branch not added');
            console.log(err);
            return;
          }
        });

      req.flash('success','Courier Branch added');
      res.redirect('/settings/courier/'+id);
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings/courier/'+id);
          return;
        };
    });
});

//Load Courier Branch Info
router.get('/courier_branch/:id', function(req, res){
    CourierLocation.findById(req.params.id,(err,location)=>{
      res.send('<div class="row"> <div class="col-md-6"><div class="form-group"><label class="control-label col-md-12">Name</label><div class="col-md-12"><input type="text" class="form-control" value="'+location.branch+'" disabled></div></div></div><div class="col-md-6"><div class="form-group"><label class="control-label col-md-12">Amount</label><div class="col-md-12"><input type="text" class="form-control" value="'+location.amount+'" disabled></div></div></div><div class="col-md-6"><div class="form-group"><label class="control-label col-md-12">Phone</label><div class="col-md-12"><input type="text" class="form-control" value="'+location.info.phone+'" disabled></div></div></div><div class="col-md-6"><div class="form-group"><label class="control-label col-md-12">Email</label><div class="col-md-12"><input type="text" class="form-control" value="'+location.info.email+'" disabled></div></div></div></div>');
    });
});

//Load Courier Branch Info Edit
router.get('/courier_edit_branch/:id', function(req, res){
    CourierLocation.findById(req.params.id,(err,location)=>{
      res.send('<form action="/settings/courier_edit_branch/'+req.params.id+'" method="post" autocomplete="off"><div class="row"><div class="col-md-6"><div class="form-group"><label class="control-label col-md-12">Branch Location</label><div class="col-md-12"><input type="text" class="form-control" value="'+location.branch+'" name="location"></div></div></div><div class="col-md-6"><div class="form-group"><label class="control-label col-md-12">Amount</label><div class="col-md-12"><input type="text" class="form-control" value="'+location.amount+'" name="amount"></div></div></div><div class="col-md-6"><div class="form-group"><label class="control-label col-md-12">Phone</label><div class="col-md-12"><input type="text" class="form-control" value="'+location.info.phone+'" name="phone"></div></div></div><div class="col-md-6"><div class="form-group"><label class="control-label col-md-12">Email</label><div class="col-md-12"><input type="text" class="form-control" value="'+location.info.email+'" name="email"></div></div></div></div><div class="form-actions padding-20"><button type="submit" class="btn btn-primary">Submit</button></div><input type="hidden" value="'+location.courier+'" name="courier"></form>');
    });
});

//Update Courier Branch Info
router.post('/courier_edit_branch/:id', function(req,res){console.log(req.body);
  let id = req.params.id;
  let c_id = req.body.courier;
  let courier= {};
  let branch = req.body.location;
  let amount = req.body.amount;
  let phone = req.body.phone;
  let email = req.body.email;

  let query = {_id:id}
CourierLocation.updateMany(query,
  { $set:{ branch:branch,amount:amount,info:{phone: phone , email: email} }}, { multi: true }).exec();
  res.redirect('/settings/courier/'+c_id);
  // CourierLocation.update(query, courier, function(err){
  //   if(err){
  //     console.log(err);
  //     return;
  //   } else{
  //
  //   }
  // });
});

//Add Featured Products
router.post('/add-featured', function(req,res){
  req.checkBody('product','Featured Product is required').notEmpty();

  req.asyncValidationErrors().then(() => {
    let product = req.body.product;
      for (var i = 0; i < product.length; i++) {
        let prod= new PhoneProductsFeatured();
        prod.product = product[i];
        prod.save(function(err){
          if(err){
            req.flash('danger','Featured Product not added');
            console.log(err);
            return;
          }
        });
      }

      req.flash('success','Featured Product added');
      res.redirect('/settings/');
    }).catch((errors) => {

        if(errors) {
          for (var i = 0; i < errors.length; i++) {
            var param = errors[i].param;
            var msg = errors[i].msg;
            req.flash('danger', errors[i].msg);
          }
          res.redirect('/settings');
          return;
        };
    });
});

//Delete Products Featured
router.get('/delete-featured/:id', function(req, res, next){
  PhoneProductsFeatured.remove({ _id:req.params.id }, function (err) {
    res.redirect('/settings');
  });
});

//Add Attribute Post Route
router.post('/add_attribute', function(req,res){
  req.checkBody('title','Title is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('pages/settings/index',{
      errors: errors
    });
  } else {
    let attrib= new Attributes();
    attrib.title = req.body.title;

    attrib.save(function(err){
      if(err){
        req.flash('danger','Attribute not added');
        console.log(err);
        return;
      } else{
        req.flash('success','Attribute added');
        res.redirect('/settings');
      }
    });
  }
});

//Load Edit Attribute
router.get('/edit-attribute/:id', function(req, res){
  Attributes.findById(req.params.id,function(err, attrib){
    res.render('pages/settings/edit-attribute',{
      attrib: attrib
    });
  });
});

//Update Edit Attribute Post Route
router.post('/edit-attribute/:id', function(req,res){
  let attrib= {};
  attrib.title = req.body.title;

  let query = {_id:req.params.id}

  Attributes.update(query, attrib, function(err){
    if(err){
      console.log(err);
      return;
    } else{
      res.redirect('/settings');
    }
  });
});

//Add Entity Form
router.get('/add-entity', function(req, res, next){
  Attributes.find({},function(err, attrib){
      res.render('pages/settings/add-entity',{
        attrib: attrib
      });
  });
});

//Add Entities Post Route
router.post('/add-entity', function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('input_type','Input Type is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('pages/settings/add-entity',{
      errors: errors
    });
  } else {
    let entity= new Entities();
    entity.identifier = req.body.identifier;
    entity.title = req.body.title;
    entity.input_type = req.body.input_type;
    entity.required = req.body.required;

    if(entity.input_type == 'select'){
      //console.log(req.body.sd);
      //return;
      entity.options = req.body.sd;//serialize.serialize(req.body.sd);
    }

    entity.save(function(err){
      if(err){
        req.flash('danger','Attribute not added');
        console.log(err);
        return;
      } else{
        req.flash('success','Attribute added');
        res.redirect('/settings');
      }
    });
  }
});

//Load Edit Entity
router.get('/edit-entity/:id', function(req, res){
  Entities.findById(req.params.id,function(err, entity){
    res.render('pages/settings/edit-entity',{
      entity: entity
    });
  });
});

//Update Edit Entity Post Route
router.post('/edit-entity/:id', function(req,res){
  let entity= {};
  entity.identifier = req.body.identifier;
  entity.title = req.body.title;
  entity.input_type = req.body.input_type;
  entity.required = req.body.required;

  if(entity.input_type == 'select'){
    entity.options = req.body.sd;//serialize.serialize(req.body.sd);
  } else{
    entity.options ='';
  }

  let query = {_id:req.params.id}

  Entities.update(query, entity, function(err){
    if(err){
      console.log(err);
      return;
    } else{
      res.redirect('/settings');
    }
  });
});

//Add Brand Post Route
router.post('/add-brand', function(req,res){
  cloudinary.uploader.upload_stream((cloud_img) => {       
    let brand= new Brand();
    brand.title = req.body.title;
    brand.url = slugify(req.body.title,{remove: /[$*_+~.()'"!:@]/g,lower: true});
    brand.logo = cloud_img.secure_url;
    brand.description = req.body.description;

    brand.save(function(err){
      if(err){
        req.flash('danger','Brand not added');
        console.log(err);
        return;
      } else{
        req.flash('success','Brand added');
        res.redirect('/settings');
      }
    });
}).end(req.files.image.data);
  // req.checkBody('title','Title is required').notEmpty();

  // //Get Errors
  // let errors = req.validationErrors();

  // if (errors) {
  //   res.render('pages/settings',{
  //     errors: errors
  //   });
  // } else {
  //   let brand= new Brand();
  //   brand.title = req.body.title;
  //   brand.url = slugify(req.body.title,{remove: /[$*_+~.()'"!:@]/g,lower: true});
  //   brand.logo = req.body.logo;
  //   brand.description = req.body.description;

  //   brand.save(function(err){
  //     if(err){
  //       req.flash('danger','Brand not added');
  //       console.log(err);
  //       return;
  //     } else{
  //       req.flash('success','Brand added');
  //       res.redirect('/settings');
  //     }
  //   });
  // }
});

//Update Product Status
router.post('/brand_front/:id', (req, res) => {

  let query = {_id: req.params.id};
  let status =req.body.front;

  Brand.update(query,{ front: status}).exec();

   if (status==0) {
     res.send('1');
   } else {
     res.send('0');
   }

});

//Load Edit Brand
router.get('/edit-brand/:id', function(req, res){
  Brand.findById(req.params.id,function(err, brand){
    res.render('pages/settings/brand/edit-brand',{
      brand: brand
    });
  });
});

//Update Edit Brand Post Route
router.post('/edit-brand/:id', function(req,res){
  let brand= {};
  title = req.body.title;
  url = slugify(req.body.title,{remove: /[$*_+~.()'"!:@]/g,lower: true});
  //brand.logo = req.body.logo;
  description = req.body.description;
  s_desc = req.body.seo_desc;
  s_title = req.body.seo_title;
  s_key = req.body.seo_key;
  s_foot = req.body.seo_foot;

  let query = {_id:req.params.id}

  Brand.updateMany(query,
    { 
      $set:{ 
        title:title,
        url:url,
        description:description,
        seo:{title:s_title,description: s_desc , keywords: s_key, footer: s_foot} 
      }
    }, { multi: true }).exec((err)=>{
      if(err){
        console.log(err);
        return;
      } else{
        res.redirect('/settings');
      }
    });
  // Brand.update(query, brand, function(err){
  //   if(err){
  //     console.log(err);
  //     return;
  //   } else{
  //     res.redirect('/settings');
  //   }
  // });
});

//Get Attribute Set Form
router.get('/attribute-set', function(req, res, next){
  Attributes.find({},function(err, attribute){
    Entities.find({}, function(err, entity){
      AttribEntities.find({}, function(err, attEnt){
        res.render('pages/settings/attribute-set',{
          attribute: attribute,
          entities: entity,
          attEnt: attEnt
        });
      });
    });
  });
});

//Get Attribute Set Form
router.get('/add-attribute-set/:id', function(req, res, next){
  Attributes.findById(req.params.id,function(err, attrib){
    Entities.find({}, function(err, entity){
      res.render('pages/settings/add-attribute-set',{
        attrib: attrib,
        entities: entity
      });
    });
  });
});

//Add Attribute Set Post Route
router.post('/add-attribute-set/:id', function(req,res){
  req.checkBody('entity','Entity is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('pages/settings/attribute-set',{
      errors: errors
    });
  } else {
      for (var i of req.body.entity) {
        let Attrib= new AttribEntities();
        Attrib.attributes = req.params.id;
        Attrib.entities = i;
        Attrib.save();
    }

      req.flash('success','Attribute Set added');
      res.redirect('/settings/');
  }
});

//Get Attribute Set Form
router.get('/edit-attribute-set/:id', function(req, res, next){
  Attributes.findById(req.params.id,function(err, attrib){
    AttribEntities.find({attributes:req.params.id},(err, attEnt)=>{
      Entities.find({}, function(err, entity){
        res.render('pages/settings/edit-attribute-set',{
          attrib: attrib,
          entities: entity,
          attEnt: attEnt
        });
      });
    });
  });
});

//Remove Attribute Set
router.get('/remove-att-set/:id', function(req, res, next){
  AttribEntities.remove({ _id:req.params.id }, function (err) {
    res.redirect('/settings/');
  });
});


//Display Categories
router.get('/category', function(req, res, next){
  Category.find({}, (err, category) =>{
    res.render('pages/settings/category_index',{
      category: category
    });
  });
});

//Add Main Category Post Route
router.post('/add-main-category-pop', function(req,res){
  req.checkBody('title','Title is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('pages/settings/category',{
      errors: errors
    });
  } else {
    let cat= new Category();
    cat.title = req.body.title;
    cat.url = slugify(req.body.title,{remove: /[$*_+~.()'"!:@]/g,lower: true});
    cat.save(function(err){
      if(err){
        req.flash('danger','Category not added');
        console.log(err);
        return;
      } else{
        req.flash('success','Category added');
        res.redirect('/settings/category');
      }
    });
  }
});

//AJax function
router.get('/getcat/:id',function(req, res){
  let query = {_id:req.params.id}

  Category.findById(req.params.id, function(err, category){
    res.send('<select name="parent" class="form-control"><option value="'+category.id+'">'+category.title+'</option></select>');
  });
});

router.get('/edit-category/:id',function(req, res){
  let query = {_id:req.params.id} 

  Category.findById(req.params.id, function(err, category){
    // res.send('<form action="/settings/edit-category" method="post"><div class="row"><div class="form-group col-md-6"><label class="control-label col-md-3 col-sm-3 col-xs-12">Name</label><div class="col-md-9 col-sm-9 col-xs-12"><input type="text" name="title" class="form-control" value="'+category.title+'"></div></div><div class="form-group col-md-6"><label class="control-label col-md-3 col-sm-3 col-xs-12">Top Image</label><div class="col-md-9 col-sm-9 col-xs-12"><input type="text" name="img" class="form-control" value="'+category.top_ad.img+'"></div></div><div class="form-group col-md-6"><label class="control-label col-md-3 col-sm-3 col-xs-12">Top Link</label><div class="col-md-9 col-sm-9 col-xs-12"><input type="text" name="link" class="form-control" value="'+category.top_ad.link+'"></div></div><div class="form-group col-md-6"><label class="control-label col-md-3 col-sm-3 col-xs-12">Keywords</label><div class="col-md-9 col-sm-9 col-xs-12"><textarea name="keywords" class="form-control tinymce">'+category.seo.keywords+'</textarea></div></div><div class="form-group col-md-6"><label class="control-label col-md-3 col-sm-3 col-xs-12">Description</label><div class="col-md-9 col-sm-9 col-xs-12"><textarea name="description" class="form-control tinymce">'+category.seo.description+'</textarea></div></div><div class="form-group col-md-6"><label class="control-label col-md-3 col-sm-3 col-xs-12">Footer Seo</label><div class="col-md-9 col-sm-9 col-xs-12"><textarea name="footer_seo" class="form-control tinymce">'+category.footer_seo+'</textarea></div></div></div><div class="row"><div class="form-actions"><button type="submit" class="btn btn-primary">Submit</button></div></div><input type="hidden" name="id" class="form-control" value="'+category.id+'"></form>');
    res.render('pages/settings/edit-category',{
      category: category
    });
  });
});

//Add Category Post Route
router.post('/add-category', function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('parent','Parent is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('pages/settings/category',{
      errors: errors
    });
  } else {
    let cat= new Category();
    cat.title = req.body.title;
    cat.parent = req.body.parent;
    cat.icon = req.body.icon;
    cat.url = slugify(req.body.title,{remove: /[$*_+~.()'"!:@]/g,lower: true});

    cat.save(function(err){
      if(err){
        req.flash('danger','Category not added');
        console.log(err);
        return;
      } else{
        req.flash('success','Category added');
        res.redirect('/settings');
      }
    });
  }
});

//Update Category Post Route
router.post('/edit-category', function(req,res){
  let cat= {};
  let title = req.body.title;
  let url = slugify(req.body.title,{remove: /[$*_+~.()'"!:@]/g,lower: true});
  let icon = req.body.icon;
  let sort = req.body.sort;
  let seo_title = req.body.seo_title;
  let keywords = req.body.keywords;
  let description = req.body.description;
  let img = req.body.img;
  let link = req.body.link;
  let footer_seo = req.body.footer_seo;

  Category.
  updateMany(
    { _id:req.body.id },
    { $set:
      { title: title , url:url,footer_seo:footer_seo,sort:sort,
        seo:{title:seo_title,keywords:keywords,description:description},
        icon:icon
       }
     },
      { multi: true }
    ).exec(function (err) {
      if (err) console.log(err);
      req.flash('success','Category Edited');
      res.redirect('/settings/category');
    });
  // Category.update({ _id:req.params.id }, {title: title , url:url}, function(err){
  //   if(err){
  //     console.log(err);
  //     return;
  //   } else{
  //     req.flash('success','Category Edited');
  //     res.redirect('/settings');
  //  }
  // });
});

router.get('/edit-category-img/:id',function(req, res){
  let query = {_id:req.params.id} 

  Category.findById(req.params.id, function(err, category){
    res.render('pages/settings/edit-category-img',{
      category: category
    });
  });
});

router.post('/edit-category-img/:id', function(req,res){
    cloudinary.uploader.upload_stream((cloud_img) => {
      let img =  cloud_img.secure_url;
  
      Category.updateMany({ _id:req.params.id },{
        $set:{
          banner:{
            img:img
          }
         }
      }, { multi: true }).exec();
      if(req.body.main_img){
        var image = /[^/]*$/.exec(req.body.main_img)[0];
        var publicId = image.replace(/\..+$/, '');
        cloudinary.v2.uploader.destroy(publicId, function(error, result){console.log(result, error)});
      }
  
    req.flash('success','Category Banner Edited');
    res.redirect('/settings/');
  }).end(req.files.main_image.data);
});

//Update Category Visible Status
router.post('/category_status/:id', (req, res) => {

  let query = {_id: req.params.id};
  let status =req.body.status;

  Category.update(query,{ visible: status}).exec();
   if (status==0) {
     res.send('1');
   } else {
     res.send('0');
   }
});

//Delete Category
router.get('/delete-cat/:id',(req, res)=>{
  Category.findById(req.params.id,(err,cat)=>{
    if(cat){
     Category.find({parent:cat.id},(err,cat1)=>{
      if(cat1){
      for (var c of cat1){
          console.log(c);
          Category.find({parent:c.id},(err,cat2)=>{
            if(cat2){
            for (var c1 of cat2){
              Category.remove({ _id:c1.id }, function (err) {
                console.log(err);
              });
              }
            }
          });
          Category.remove({ _id:c.id }, function (err) {
            console.log(err);
          });
      }
      } 
     });
    }
  });
  Category.remove({ _id:req.params.id }, function (err) {
    console.log(err);
  });
  res.redirect('/settings');
});
module.exports = router;
