const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

let Category = require('../models/product_category');
let Brand = require('../models/product_brand');
let User = require('../models/user');
let Client = require('../models/client');
let Sale = require('../models/sale');
let Products = require('../models/products');
let SaleProducts = require('../models/sale_products');
let SaleStatus = require('../models/sale_status');
let PaymentClient = require('../models/payment_client');
let Courier = require('../models/courier');
let CourierLocation = require('../models/courier_location');
let DeliveryLocation = require('../models/delivery_locations');
let SaleCourier = require('../models/sale_courier');
let SaleWeb = require('../models/sale_web');
let SaleWebConn = require('../models/sale_web_conn');
let SaleWebContactSeller = require('../models/sale_web_contact_seller');
let PhoneMainShipping = require('../models/phone_main_shipping');

router.get('/', function(req, res, next){
  Sale.find({}).
  populate('client','first_name last_name',Client).
  exec((err, sale)=>{
    SaleProducts.find({},function(err, sale_products){
      Products.find({},function(err, products){
        PaymentClient.find({},(err,payment)=>{
          Client.find({},(err,client)=>{
              //SaleWeb.find({},(err,saleWeb)=>{
              SaleWeb
              .find({status:'raw'})
              .populate('shipping','location amount',PhoneMainShipping)
              .exec((err,saleWeb)=>{
                SaleWebContactSeller.find({},(err,saleCont)=>{
                  res.render('pages/sale/index',{
                    sale: sale,
                    saleProd:sale_products,
                    products: products,
                    payment: payment,
                    client: client,
                    saleWeb: saleWeb,
                    saleCont: saleCont
                  });
                });
              });
          });
        });
      });
    });
  });
});

router.get('/sale_web', function(req, res, next){
  SaleWeb
  .find({})
  .populate('shipping','location amount',PhoneMainShipping)
  .exec((err,saleWeb)=>{   
      res.render('pages/sale/sale_web',{
        saleWeb: saleWeb
      });
    });
});

//Update Sale Status
router.post('/sale_status/:id', (req, res) => {

     let query = {_id: req.params.id};
     let new_status =req.body.status;

      Sale.update(query,{ status: new_status}).exec();
      let status = new SaleStatus();
      status.sale = req.params.id;
      status.status = new_status;
      status.save(function(err){});

      SaleProducts.find({sale:req.params.id},(err, sale)=>{
      });
        res.send(new_status);
});

router.get('/sale_web_view/:id', function(req, res, next){
  Client.find({},(err,client)=>{
    SaleWeb
    .findById(req.params.id)
    .populate('shipping','location amount',PhoneMainShipping)
    .exec((err,saleWeb)=>{
      let ProdArr=[];
      saleWeb.cart.forEach(ct => {
        ProdArr.push(ct.productId);
      });
      Products
        .find()
        .select('title')
        .where('_id')
        .in(ProdArr)
        .exec(function (err, prod) {
          
            res.render('pages/sale/sale_web_view',{
              client: client,
              saleWeb: saleWeb,
              prod: prod
            });
          
        });
    });
  });
});

router.get('/sale_web_contact', function(req, res, next){
  SaleWebContactSeller.find({},(err,saleWeb)=>{
    res.render('pages/sale/sale_web_contact',{
      saleWeb: saleWeb
    });
  });
});

router.get('/sale_web_contact_view/:id', function(req, res, next){
  SaleWebContactSeller.
  findById(req.params.id).
  populate('product','title price special_price images',Products).
  exec((err,saleWeb)=>{
        res.render('pages/sale/sale_web_contact_view',{
          saleWeb: saleWeb
        });
  });
});

//SAVE NEW Client
router.post('/add_client',(req, res)=>{
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let phone = req.body.phone;
  let email = req.body.email;

  // Validation
  req.checkBody('first_name', 'Firstname is required').notEmpty();
  req.checkBody('last_name', 'Last Name is Required').notEmpty();
  req.checkBody('phone', 'Phone is required').notEmpty();

  req.asyncValidationErrors().then(() => {
    //no errors, create user
    let client= new Client();
    client.first_name = first_name;
    client.last_name = last_name;
    client.phone = phone;
    client.email = email;

    client.save(function(err){
      if(err){
        req.flash('danger','Client not Create');
        res.redirect('/sale/add');
        console.log(err);
        return;
      }
        req.flash('success','Client Created');
        res.redirect('/sale/add');
    });

  }).catch((errors) => {

      if(errors) {
        for (var i = 0; i < errors.length; i++) {
          var param = errors[i].param;
          var msg = errors[i].msg;
          req.flash('danger', errors[i].msg);
        }
        res.redirect('/sale/add');
        return;
      };
  });

  //
  //
  //
});

//SAVE NEW SALE
router.post('/add', function(req, res){
  // Validation
  // req.checkBody('first_name', 'Firstname is required').notEmpty();
  // req.checkBody('last_name', 'Last Name is Required').notEmpty();
  // req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('prod', 'Products Not Selected').notEmpty();

  req.asyncValidationErrors().then(() => {

    let sale= new Sale();
    // let client = new Client();

    // client.first_name = req.body.first_name;
    // client.last_name = req.body.last_name;
    // client.phone = req.body.phone;
    // client.email = req.body.email;
    sale.status = "Open";
    sale.user = req.user.id;
    //if(req.body.id){
      sale.client = req.body.id;
      sale.save(function(err, new_sale){
        let saleId = new_sale._id;
        if(err){
          req.flash('danger','Sale not Create');
          console.log(err);
          return;
        } else{
          let status = new SaleStatus();
          status.sale = saleId;
          status.status = "Open";
          status.save(function(err){});

          let product =req.body.prod;
          let price =req.body.price;
          let cost =req.body.cost;
          let prod='a';
          for (var i = 0; i < product.length; i++) {
            let sale_prod= new SaleProducts();
    //        Products.findById(product[i],function(err, prod){
               //prod = prod;
               sale_prod.sale= saleId;
               sale_prod.product = product[i];
               sale_prod.qty = 1;
               sale_prod.price = price[i];
               sale_prod.cost = cost[i];
               sale_prod.save(function(err){
                 if(err){
                   console.log(err);
                 }
               });
            // });
          }

          req.flash('success','Sale Created');
          res.redirect('/sale/view/'+saleId);
        }
      });
    // }else{
    //   client.save(function(err, new_client){
    //     sale.client = new_client._id;
    //     sale.save(function(err, new_sale){
    //       let saleId = new_sale._id;
    //       if(err){
    //         req.flash('danger','Sale not Create');
    //         console.log(err);
    //         return;
    //       } else{

    //         let status = new SaleStatus();
    //         status.sale = saleId;
    //         status.status = "Open";
    //         status.save(function(err){});

    //         let product =req.body.prod;
    //         let prod='a';
    //         for (var i = 0; i < product.length; i++) {
    //           let sale_prod= new SaleProducts();
    //           Products.findById(product[i],function(err, prod){
    //              //prod = prod;
    //              sale_prod.sale= saleId;
    //              sale_prod.product = prod.id;
    //              sale_prod.qty = 1;
    //              sale_prod.price = prod.price;
    //              sale_prod.cost = prod.cost;
    //              sale_prod.save(function(err){
    //                if(err){
    //                  console.log(err);
    //                }
    //              });
    //           });
    //         }

    //         req.flash('success','Sale Created');
    //         res.redirect('/sale/view/'+saleId);
    //       }
    //     });
    //   });
    // }
  }).catch((errors) => {

      if(errors) {
        for (var i = 0; i < errors.length; i++) {
          var param = errors[i].param;
          var msg = errors[i].msg;
          req.flash('danger', errors[i].msg);
        }
        res.redirect('/sale/add');
        return;
      };
  });
});

//SAVE NEW WEB SALE
router.post('/add_web', function(req, res){
    let sale= new Sale();
    let client = new Client();
    

    client.first_name = req.body.first_name;
    client.last_name = req.body.last_name;
    client.phone = req.body.phone;
    client.email = req.body.email;
    sale.status = "Open";
    sale.user = req.user.id;
    if(req.body.client_id){
      sale.client = req.body.client_id;
      sale.save(function(err, new_sale){
        let saleId = new_sale._id;
        if(err){
          req.flash('danger','Sale not Create');
          console.log(err);
          return;
        } else{
          SaleWeb.update({_id:req.body.web_id},{ status: "Confirmed"}).exec();

          let status = new SaleStatus();
          status.sale = saleId;
          status.status = "Open";
          status.save(function(err){});

          let saleWebConn = new SaleWebConn();
          saleWebConn.sale = saleId;
          saleWebConn.web = req.body.web_id;
          saleWebConn.save(function(err){});

          let product =req.body.prod;
          let price =req.body.price;
          let cost =req.body.cost;
          let qty =req.body.qty;
          let prod='a';
          for (var i = 0; i < product.length; i++) {
            let sale_prod= new SaleProducts();
               sale_prod.sale= saleId;
               sale_prod.product = product[i];
               sale_prod.qty = qty[i];
               sale_prod.price = price[i];
               sale_prod.cost = cost[i];
               sale_prod.save(function(err){
                 if(err){
                   console.log(err);
                 }
               });
          }

          req.flash('success','Sale Created');
          res.redirect('/sale/view/'+saleId);
        }
      });
    }else{
      client.save(function(err, new_client){
        sale.client = new_client._id;
        sale.save(function(err, new_sale){
          let saleId = new_sale._id;
          if(err){
            req.flash('danger','Sale not Create');
            console.log(err);
            return;
          } else{
            SaleWeb.update({_id:req.body.web_id},{ status: "Confirmed"}).exec();

            let status = new SaleStatus();
            status.sale = saleId;
            status.status = "Open";
            status.save(function(err){});

            let saleWebConn = new SaleWebConn();
            saleWebConn.sale = saleId;
            saleWebConn.web = req.body.web_id;
            saleWebConn.save(function(err){});

            let product =req.body.prod;
            let price =req.body.price;
            let cost =req.body.cost;
            let qty =req.body.qty;
            let prod='a';
            for (var i = 0; i < product.length; i++) {
              let sale_prod= new SaleProducts();
                 sale_prod.sale= saleId;
                 sale_prod.product = product[i];
                 sale_prod.qty = qty[i];
                 sale_prod.price = price[i];
                 sale_prod.cost = cost[i];
                 sale_prod.save(function(err){
                   if(err){
                     console.log(err);
                   }
                 });
            }

            req.flash('success','Sale Created');
            res.redirect('/sale/view/'+saleId);
          }
        });
      });
    }
});

//Sale View FROM ID
router.get('/view/:id', function(req, res, next){
  Sale.  findById(req.params.id).
  populate('client','first_name last_name email phone',Client).
  exec((err, sale)=>{
    SaleStatus.find({sale:req.params.id},function(err, status){
      SaleProducts.find({sale:req.params.id}).
      populate('product','title',Products).
      exec((err, sale_products)=>{
              PaymentClient.find({}, (err, payment)=>{
                    Courier.find({},function(err, courier){
                      CourierLocation.find({},(err,location)=>{
                        DeliveryLocation.find({},(err,dLoc)=>{
                          SaleCourier.find({},(err,sCourier)=>{
                            SaleWebConn.findOne({sale:req.params.id},(err,saleConn)=>{
                              SaleWeb
                              .find({})
                              .populate('shipping','location amount',PhoneMainShipping)
                              .exec((err,saleWeb)=>{
                                Products
                                .find()
                                .exec((err,products)=>{
                                res.render('pages/sale/view',{ 
                                  saleProd: sale_products,
                                  sale: sale,
                                  payment: payment,
                                  status: status,
                                  courier: courier,
                                  location: location,
                                  dLoc: dLoc,
                                  sCourier: sCourier,
                                  saleWeb: saleWeb,
                                  saleConn: saleConn,
                                  user: req.user,
                                  products: products
                              });
                            });
                            });
                          });
                        });
                      });
                    });
                  })
            });
      });
    });
  });
});

//Get Courier Fields
router.get('/sale-courier/:id/:location', function(req, res, next){
  Courier.find({},function(err, courier){
    CourierLocation.find({},(err,loc)=>{
      DeliveryLocation.find({},(err,dLoc)=>{
        res.render('pages/sale/sale-courier',{
          courier: courier,
          location: req.params.location,
          id: req.params.id,
          loc: loc,
          dLoc: dLoc
        });
      })
    });
  });
});

//Update Product
router.post('/add-shipped/:id', (req, res) => {
  let sale = req.params.id;
  let location = req.body.courier;
  let waybill = req.body.waybill;
  let payment = req.body.payment;

    CourierLocation.findById(location,(err,loc)=>{
        let ship = new SaleCourier();
        ship.sale = sale;
        ship.courier = location;
        ship.waybill = waybill;
        ship.payment_status = payment;
        ship.payment_amount = loc.amount;
        ship.save(function(err){
          if(err){
            req.flash('danger','SHip not Create');
            res.redirect('/sale/view'+sale);
            console.log(err);
            return;
          }
        });
    });

  res.redirect('/sale/view/'+sale);
  req.flash('success','Ship Info Added');
});

//Add Product 
router.post('/add-product/:id', (req, res) => {
  let sale = req.params.id;
  let product =req.body.prod;
  let price = Number(req.body.price);
  let cost = Number(req.body.cost);

   for (var i = 0; i < product.length; i++) {
      let sale_prod= new SaleProducts();
          sale_prod.sale= sale;
          sale_prod.product = product[i];
          sale_prod.qty = 1;
          sale_prod.price = price;
          sale_prod.cost = cost;
          sale_prod.save(function(err){
            if(err){
              console.log(err);
            }
          });
   }

  req.flash('success','Product Added On Sale');
  res.redirect('/sale/view/'+sale);
});

//Sale View FROM ID PDF Report
router.get('/view/:id/pdf', function(req, res, next){
  Sale.findById(req.params.id,function(err, sale){
    SaleStatus.find({sale:req.params.id},function(err, status){
    Client.find({},function(err, client){
      SaleProducts.find({sale:req.params.id},function(err, sale_products){
        Products.find({}, function(err, products){
              PaymentClient.find({}, (err, payment)=>{
                    res.render('pages/sale/pdf',{
                      products: products,
                      client:client,
                      saleProd: sale_products,
                      sale: sale,
                      payment: payment,
                      status: status,
                  })
          });
        });
      });
    });
  });
  });
});

//Update Product info Sale
router.post('/edit_prod_sale/:id', (req, res) => {

     let edit = {};
     let query = {_id: req.params.id};
     qty =req.body.qty;
     price =req.body.price;
     cost =req.body.cost;
    // console.log(req.params.id);
     let prod= new SaleProducts();
      // prod.update( query,{$set:edit},       function(err, results){
      //   if(err){
      //     console.log(err);return;
      //   } else{
      //     console.log(results);
      //   }
      // });

      SaleProducts.updateMany({ _id:req.params.id },{ $set:{ qty: qty , price: price , cost: cost }}, { multi: true }).exec();
         res.redirect('/sale/view/'+req.body.id);
});

//Save Sale Payment
router.post('/sale_payment/:id', (req, res) => {
   
    let cash = Number(req.body.cash);
    let mpesa = Number(req.body.mpesa);
    let mpesa_id = req.body.mpesa_id;
    let cheque = Number(req.body.cheque);
    let cheque_id = req.body.cheque_id;
    let card = Number(req.body.card);
    let amount = Number(card + cash + mpesa + cheque);
    let balance = Number(req.body.balance - amount);

    let arrAmount=[];
    arrAmount ={
      cash: cash,
      mpesa: {
        amount: mpesa,
        transaction: mpesa_id
      },
      cheque: {
        amount: cheque,
        transaction: cheque_id
      },
      card: card
    }

       let payment= new PaymentClient();
       payment.sale = req.body.id;
       payment.mode_of_pay = arrAmount;
       payment.amount = amount;
       payment.balance = Number(balance);
       payment.user =req.user.id;

      payment.save(function(err){
        if(err){console.log(err);return;}
        else{
          req.flash('success','Payment added');
          res.redirect('/sale/view/'+req.body.id);
        }
      });
});

//Update Sale Status
router.post('/sale_status/:id', (req, res) => {

     let query = {_id: req.params.id};
     let new_status =req.body.status;

      Sale.update(query,{ status: new_status}).exec();
      let status = new SaleStatus();
      status.sale = req.params.id;
      status.status = new_status;
      status.save(function(err){});

      SaleProducts.find({sale:req.params.id},(err, sale)=>{
      });

      //req.flash('success','Sale Status Updated');
        //  res.redirect('/sale/view/'+req.body.id);
        res.send(new_status);
});

//Get Sale Status Info
router.get('/status_edit/:id',(req, res, next)=>{
  SaleStatus.findById({_id:req.params.id},(err,status)=>{
    res.render('pages/sale/status',{
      status: status
    });
  })
});

//Update Sale Status
router.post('/status_edit/:id', (req, res, next) => {

     let query = {_id: req.params.id};
     let reason =req.body.reason;

      SaleStatus.update(query,{ reason: reason}).exec();
         res.redirect('/sale/view/'+req.body.id);
});

router.get('/view/:id/invoice', function(req, res, next){
  Sale.findById(req.params.id,function(err, sale){
    Client.find({},function(err, client){
      SaleProducts.find({sale:req.params.id}).
      populate({path:'product',select:'title', model: Products}).
      exec((err, sale_products)=>{
              PaymentClient.find({}, (err, payment)=>{
                    res.render('pages/sale/sale_invoice',{
                      client:client,
                      saleProd: sale_products,
                      sale: sale,
                      payment: payment
                  })
          
      });
    });
  });
  });
});
////////////////////////////////
////////AJax Functions/////////
///////////////////////////////

//Search Clients From Sale Records
router.get('/client_search/:id',function(req, res,next){
  //var regex = new RegExp(req.query["term"], 'i');
  var reg=new RegExp(req.params.id, 'i');
  Sale.distinct('first_name',{phone: reg},function(err, fname){
    Sale.distinct('last_name',{phone: reg},function(err,lname){
      Sale.distinct('phone',{phone: reg},function(err, phone){
        Sale.distinct('email',{phone: reg},function(err, email){
          if(err){console.log(err);return err;}
          res.render('pages/ajax/client_search',{
            fname: fname,
            lname: lname,
            phone: phone,
            email: email
          });
        });
      });
    });
  });
});

//Add Selected Product To Sale
router.get('/add_prod/:id',function(req, res,next){
    Products.find({},(err, products)=>{
      if(err){console.log(err);return err;}
      res.render('pages/ajax/add_prod',{
        products: products
      });
    })
}); 

//Add Selected Product To Sale Total
router.get('/add_prod_top/:id/:total',function(req, res,next){
    Products.find({},function(err, products){
    if(err){console.log(err);return err;}
    res.render('pages/ajax/add_prod_top',{
      products: products,
      total: req.params.total
    });
  });
});

//Minus Selected Product To Sale Total
router.get('/add_prod_down/:id/:total',function(req, res,next){
  Products.find({},function(err, products){
    if(err){console.log(err);return err;}
    res.render('pages/ajax/add_prod_down',{
      products: products,
      total: req.params.total
    });
  });
});

//Edit Product Sale Info
router.get('/edit_prod_sale/:id', function(req, res, next){
    Sale.findById(req.params.id,function(err, sale){
      SaleProducts.findById(req.params.id,function(err, saleProd){
        Products.find({}, function(err, products){
              res.render('pages/ajax/edit_prod_sale',{
              products: products,
              saleProd: saleProd,
              sale: sale
              });
            });
          });
        });
      });

//Sale Payment
router.get('/sale_payment/:id', function(req, res, next){
    Sale.findById(req.params.id,function(err, sale){
      SaleProducts.find({},function(err, saleProd){
        PaymentClient.find({sale:req.params.id}, function(err, payment){
          res.render('pages/ajax/sale_payment',{
          payment: payment,
          saleProd: saleProd,
          sale: sale
          });
        });
      });
    });
});

//Sale PDF
router.get('/sale_pdf/:id',(req, res, next)=>{
  Sale.findById(req.params.id ,(err,sale)=> {
    res.render('pages/sale/sale_pdf',{
      sale: sale
      });
    });
  });


module.exports = router;
