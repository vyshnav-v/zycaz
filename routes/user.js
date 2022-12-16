const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
//static files
// router.use("/",express.static( "public/user"));

router.get('/', userController.landingpage);
// router.get('/homepage',userController.landingpage1);
router.get('/login', userController.userlogin);
router.post('/login', userController.userSignin);

router.get('/register', userController.userreg);
router.post('/signup', userController.userRegister);
router.post('/otp', userController.ConfirmOTP);

router.get('/checkout', userController.checkout);
router.post('/payment', userController.storeOrder);
router.get('/order-success', userController.paymentSuccess);
router.post('/add-coupon',userController.addCoupon)


router.get('/dashboard', userController.userProfile);
router.get('/view-order', userController.viewOrder);
router.get('/cancel-order', userController.cancelOrder);
router.get('/return-product',userController.returnProduct)

router.post('/edit-user', userController.editUser);
router.post('/add-address', userController.addAddress);
router.get('/deleteaddress',userController.deleteAddress)
router.get('/shop', userController.shopView);
router.get('/shop-category', userController.shopCatagory);
router.get('/women-shop', userController.womenshop);
router.get('/men-shop', userController.menshop);


router.get('/productDetails', userController.productDetails);
router.get('/quickview', userController.quickview);

router.get('/viewcart', userController.viewCart);
router.get('/addtocart', userController.addToCart);
router.post('/editqnty', userController.editQnty);
router.get('/deletecart', userController.deleteCart);

router.get('/wishlist', userController.WishlistView);
router.get('/add-to-wishlist',userController.addToWishlist)
router.get('/delete-wishlist',userController.deleteWishlist)
router.get('/add-to-cart-delete-wishlist',userController.addCartdelWishlsit)

router.get('/logout', userController.userlogout);

module.exports = router;
