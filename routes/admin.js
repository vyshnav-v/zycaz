const express = require('express');

const adminRoute = express.Router();
const path = require('path');

// adminRoute.use(express.static("public/admin"));
const multer = require('multer');

const adminController = require('../controller/adminController');

const Storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../public/productImage'));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});
const upload = multer({
  storage: Storage,
});
adminRoute.get('/', adminController.adminLanding);
// adminRoute.get("/home", adminController.adminSignin);
adminRoute.get('/addproduct', adminController.addProduct);
adminRoute.post(
  '/addproduct',
  upload.single('productimg'),
  adminController.reggProduct,
);
adminRoute.get('/editproduct', adminController.editProduct);
adminRoute.post(
  '/editproduct',
  upload.single('productimg'),
  adminController.updateProduct,
);
adminRoute.get('/adminOrder', adminController.viewOrder);
adminRoute.get('/admin-cancel-order', adminController.adminCancelOrder);
adminRoute.get('/admin-confirm-order', adminController.adminConfirmorder);
adminRoute.get('/admin-delivered-order', adminController.adminDeliveredorder);
adminRoute.get('/admin-order-view', adminController.adminOrderDetails);

adminRoute.get('/adminOffer',adminController.adminLoadOffer)
adminRoute.post('/adminOffer',adminController.adminStoreOffer)
adminRoute.get('/delete-offer',adminController.adminDeleteOffer)


adminRoute.get('/addcategory', adminController.addcategory);
adminRoute.post('/addcategory', adminController.addnewcategory);
adminRoute.get('/delete-category', adminController.deletecategory);
adminRoute.get('/softdelete', adminController.softDelete);
adminRoute.get('/backTodelete', adminController.backToDelete);

adminRoute.get('/addbanner', adminController.addBanner);
adminRoute.post(
  '/addbanner',
  upload.single('productimg'),
  adminController.getBanner,
);

adminRoute.get('/viewproduct', adminController.viewProducts);
adminRoute.post('/login', adminController.adminDash);
adminRoute.get('/users', adminController.viewUsers);
adminRoute.get('/deleteproduct', adminController.deleteProducts);
// adminRoute.post("/usersearch", adminController.userSearch);

adminRoute.get('/block-user', adminController.userBlock);
adminRoute.get('/adminLogout', adminController.adminLogOut);

module.exports = adminRoute;
