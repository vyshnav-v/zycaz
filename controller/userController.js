const fast2sms = require('fast-two-sms');
const bcrypt = require('bcrypt');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Banner = require('../model/bannerModel');
const Orders = require('../model/ordersModel');
const Address = require('../model/addressModel');
const Offer = require('../model/offerModel');
const Category = require('../model/categoryModel');

const { ObjectId } = require('mongodb');

let isLoggedin;
// let session = false || {};
let session;
let newOtp;
let newUser;
let offer = {
  name: 'None',
  type: 'None',
  discount: 0,
  usedBy: false,
};
let couponTotal = 0;
let nocoupon;

// landing page
const landingpage = async (req, res) => {
  try {
    session = req.session;
    session.offer = offer;
    session.couponTotal = couponTotal;
    session.nocoupon = nocoupon;
    const bannerData = await Banner.find();
    const productData = await Product.find({ isDelete: 1 });
    console.log(bannerData);
    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });
      // const completeUser = await userData.populate('cart.item.productId');
      res.render('user/landingpage', {
        product: productData,
        banner: bannerData,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        isLoggedin: true,
      });
    } else {
      res.render('user/landingpage', {
        product: productData,
        banner: bannerData,
        count: 0,
        wcount: 0,
        isLoggedin: false,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// login and signup form
const userreg = (req, res) => {
  session = req.session;
  if (session.userId) {
    res.redirect('/');
  } else {
    console.log('register page');
    res.render('user/userRegister', { count: 0, wcount: 0 });
  }
};

const userlogin = (req, res) => {
  session = req.session;
  if (session.userId) {
    res.redirect('/');
  } else if (session.incorrect) {
    console.log('incorrect id and pswd');
    res.render('user/userlogin', {
      message: 'Username And Password is incorrect',
    });
  } else {
    console.log('login page');
    res.render('user/userlogin');
  }
};

// registration form post methode
// eslint-disable-next-line consistent-return
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// send message
const sendMessage = function (number) {
  const randomOTP = Math.floor(1000 + Math.random() * 9000);
  const options = {
    authorization:
      'MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq',
    message: `your verification code is ${randomOTP}`,
    numbers: [number],
  };
  // send this message

  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log('otp sent succcessfully');
    })
    .catch((error) => {
      console.log(error);
    });
  return randomOTP;
};

const userRegister = async (req, res) => {
  try {
    const alreadyExistingusername = await User.findOne({
      username: req.body.username,
    });
    const alreadyExistingmobile = await User.findOne({
      mobile: req.body.mobile,
    });
    if (req.body.password == req.body.cpassword) {
      if (!alreadyExistingusername && !alreadyExistingmobile) {
        const spassword = await securePassword(req.body.password);
        const user = User({
          name: req.body.name,
          lname: req.body.lname,
          username: req.body.username,
          mobile: req.body.mobile,
          password: spassword,
          isAdmin: 0,
        });
        // console.log(user);

        const userData = await user.save();
        console.log(userData);

        if (userData) {
          newUser = userData._id;
          const otp = sendMessage(userData.mobile);
          newOtp = otp;
          res.render('user/otp', {
            // message: "Your registration was successfull.",
          });
        } else {
          res.render('user/userRegister', {
            message: 'Your registration was a failure',
            count: 0,
            wcount: 0,
          });
        }
      } else if (alreadyExistingusername) {
        res.render('user/userRegister', {
          message: 'Username Already Exist',
          count: 0,
          wcount: 0,
        });
      } else {
        res.render('user/userRegister', {
          message: 'Mobile Number Already Exist',
          count: 0,
          wcount: 0,
        });
      }
    } else {
      res.render('user/userRegister', {
        message: 'Password Mismatch',
        count: 0,
        wcount: 0,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// confirm oTP
const ConfirmOTP = async (req, res) => {
  const userData = await User.findOne({ _id: newUser });
  if (userData) {
    if (req.body.otp == newOtp) {
      await User.findByIdAndUpdate(
        { _id: newUser },
        { $set: { isVerified: 1 } }
      );

      res.redirect('/login');
      // window.alert("Verification is successfull")
    } else {
      res.render('otp', {
        isLoggedin,
        count: 0,
        wcount: 0,
        message: 'Invalid OTP . Please Check Your OTP',
      });
    }
  }
};

// loging post method
const userSignin = async (req, res) => {
  try {
    const { username } = req.body;
    const { password } = req.body;

    const userData = await User.findOne({ username });
    session = req.session;

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.isVerified === 0) {
          res.render('user/userlogin', {
            message: 'please verify your mail',
            count: 0,
            wcount: 0,
          });
        } else {
          session.userId = userData._id;
          isLoggedin = true;
          res.redirect('/');
          console.log('logged in');
        }
      } else {
        session = req.session;
        session.incorrect = true;
        res.redirect('/login');
      }
    } else {
      session = req.session;
      session.incorrect = true;
      res.redirect('/login');
    }
  } catch {
    console.log('error.message');
  }
};

// view shop
const shopView = async (req, res) => {
  try {
    session = req.session;
    // session.offer = offer;
    // session.couponTotal = couponTotal;
    const category = await Category.find();
    let search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 8;

    const productData = await Product.find({
      isDelete: 1,
      $or: [
        { name: { $regex: `.*${search}.*`, $options: 'i' } },
        { brand: { $regex: `.*${search}.*`, $options: 'i' } },
        { category: { $regex: `.*${search}.*`, $options: 'i' } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const countpage = await Product.find({
      isDelete: 1,
      $or: [
        { name: { $regex: `.*${search}.*`, $options: 'i' } },
        { brand: { $regex: `.*${search}.*`, $options: 'i' } },
        { category: { $regex: `.*${search}.*`, $options: 'i' } },
      ],
    }).countDocuments();

    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });
      res.render('user/shop', {
        isLoggedin: true,
        product: productData,
        category: category,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        icon: userData.wishlist.item.icon,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    } else {
      res.render('user/shop', {
        isLoggedin: false,
        product: productData,
        category: category,
        count: 0,
        wcount: 0,
        icon: 0,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//shop catagory
const shopCatagory = async (req, res) => {
  try {
    session = req.session;
    const id = req.query.id;
    console.log(id);
    const category = await Category.find();
    // const productData = await Product.find({ category: id,isDelete:1 });
    let search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 8;

    const productData = await Product.find({
      category: id,
      isDelete: 1,
      $or: [
        { name: { $regex: `.*${search}.*`, $options: 'i' } },
        { brand: { $regex: `.*${search}.*`, $options: 'i' } },
        { category: { $regex: `.*${search}.*`, $options: 'i' } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const countpage = await Product.find({
      category: id,
      isDelete: 1,
      $or: [
        { name: { $regex: `.*${search}.*`, $options: 'i' } },
        { brand: { $regex: `.*${search}.*`, $options: 'i' } },
        { category: { $regex: `.*${search}.*`, $options: 'i' } },
      ],
    }).countDocuments();

    console.log(productData);
    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });

      res.render('user/shop', {
        isLoggedin: true,
        product: productData,
        category: category,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    } else {
      res.render('user/shop', {
        isLoggedin: false,
        product: productData,
        category: category,
        count: 0,
        wcount: 0,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//women category
const womenshop = async (req, res) => {
  try {
    session = req.session;

    const category = await Category.find();
    // const productData = await Product.find({ gender: 'Female' });
    let search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 8;

    const productData = await Product.find({
      gender: 'Female',
      isDelete: 1,
      $or: [
        { name: { $regex: `.*${search}.*`, $options: 'i' } },
        { brand: { $regex: `.*${search}.*`, $options: 'i' } },
        { category: { $regex: `.*${search}.*`, $options: 'i' } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const countpage = await Product.find({
      gender: 'Female',
      isDelete: 1,
      $or: [
        { name: { $regex: `.*${search}.*`, $options: 'i' } },
        { brand: { $regex: `.*${search}.*`, $options: 'i' } },
        { category: { $regex: `.*${search}.*`, $options: 'i' } },
      ],
    }).countDocuments();
    console.log(productData);
    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });

      res.render('user/shop', {
        isLoggedin: true,
        product: productData,
        category: category,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    } else {
      res.render('user/shop', {
        isLoggedin: false,
        product: productData,
        category: category,
        count: 0,
        wcount: 0,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//men category
const menshop = async (req, res) => {
  try {
    session = req.session;

    const category = await Category.find();
    // const productData = await Product.find({ gender: 'Male' });
    let search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 8;

    const productData = await Product.find({
      gender: 'Male',
      isDelete: 1,
      $or: [
        { name: { $regex: `.*${search}.*`, $options: 'i' } },
        { brand: { $regex: `.*${search}.*`, $options: 'i' } },
        { category: { $regex: `.*${search}.*`, $options: 'i' } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const countpage = await Product.find({
      gender: 'Male',
      isDelete: 1,
      $or: [
        { name: { $regex: `.*${search}.*`, $options: 'i' } },
        { brand: { $regex: `.*${search}.*`, $options: 'i' } },
        { category: { $regex: `.*${search}.*`, $options: 'i' } },
      ],
    }).countDocuments();
    console.log(productData);
    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });

      res.render('user/shop', {
        isLoggedin: true,
        product: productData,
        category: category,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    } else {
      res.render('user/shop', {
        isLoggedin: false,
        product: productData,
        category: category,
        count: 0,
        wcount: 0,
        totalPages: Math.ceil(countpage / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// user profile
const userProfile = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const id = session.userId;
      const addressData = await Address.find({ userId: id });
      const orderData = await Orders.find({ userId: id });
      const userData = await User.findById({ _id: id });
      

      res.render('user/userprofile', {
        user: userData,
        userOrders: orderData,
        userAddress: addressData,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
      });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// edit user
const editUser = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      await User.findByIdAndUpdate(
        { _id: session.userId },
        {
          $set: {
            name: req.body.name,
            lname: req.body.lname,
            username: req.body.username,
            mobile: req.body.mobile,
          },
        }
      );
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Add Address
const addAddress = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const addressData = Address({
        userId: session.userId,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        country: req.body.country,
        address: req.body.streetAddress,
        address2: req.body.streetAddress2,
        city: req.body.city,
        state: req.body.state,
        pin: req.body.pin,
        email: req.body.email,
        mobileno: req.body.mobileno,
      });
      console.log(addressData);
      await addressData.save();
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// delete address
const deleteAddress = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      id = req.query.id;
      await Address.findByIdAndDelete({ _id: id });
      res.redirect('/dashboard');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// product view
const productDetails = async (req, res) => {
  try {
    session = req.session;
    // session.offer = offer;
    // session.couponTotal = couponTotal;

    const { id } = req.query;
    const productView = await Product.findById({ _id: id });
    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });

      res.render('user/productDetails', {
        isLoggedin: true,
        details: productView,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
      });
    } else {
      res.render('user/productDetails', {
        isLoggedin: false,
        details: productView,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const quickview = async (req, res) => {
  try {
    session = req.session;
    // session.offer = offer;
    // session.couponTotal = couponTotal;

    const { id } = req.query;
    const productView = await Product.findById({ _id: id });
    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });

      res.render('user/quickview', {
        details: productView,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
      });
    } else {
      res.render('user/quickview', { details: productView });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// add to cart

const addToCart = async (req, res, next) => {
  try {
    const productId = req.query.id;
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const productData = await Product.findById({ _id: productId });
      userData.addToCart(productData);
      // res.redirect('/');
      res.json({ status: true });
    } else {
      console.log('hiiiihooi');
      res.redirect('/viewcart');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// view Cart

const viewCart = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const userData = await User.findOne({ _id: session.userId });
      const completeUser = await userData.populate('cart.item.productId');
      if (userData.cart.item.length === 0) {
        res.render('user/viewCart', {
          isLoggedin: true,
          id: session.userId,
          cartProducts: completeUser.cart,
          count: userData.cart.totalqty,
          wcount: userData.wishlist.totalqty,
          empty: true,
        });
      } else {
        res.render('user/viewCart', {
          isLoggedin: true,
          id: session.userId,
          cartProducts: completeUser.cart,
          count: userData.cart.totalqty,
          wcount: userData.wishlist.totalqty,
          empty: false,
        });
      }
    } else {
      res.render('user/viewCart', {
        isLoggedin: false,
        id: session.userId,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// delete cart
const deleteCart = async (req, res, next) => {
  try {
    const productId = req.query.id;
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      userData.removefromCart(productId);
      res.redirect('/viewcart');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Edit quantity
const editQnty = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id, ' : ', req.body.qty);
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const foundProduct = userData.cart.item.findIndex(
        (objInItems) =>
          new String(objInItems._id).trim() === new String(id).trim()
      );
      console.log('product found at: ', foundProduct);

      userData.cart.item[foundProduct].qty = req.body.qty;
      console.log(userData.cart.item[foundProduct]);
      userData.cart.totalPrice = 0;

      const totalPrice = userData.cart.item.reduce(
        (acc, curr) => acc + curr.price * curr.qty,
        0
      );
      const totalqty = userData.cart.item.reduce(
        (acc, curr) => acc + curr.qty,
        0
      );
      //update coupon
      session.couponTotal = totalPrice - (totalPrice * offer.discount) / 100;
      userData.cart.totalPrice = totalPrice;
      userData.cart.totalqty = totalqty;

      await userData.save();

      res.redirect('/viewcart');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};
//Add coupon
const addCoupon = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const offerData = await Offer.findOne({ name: req.body.offer });

      if (offerData) {
        if (offerData.usedBy.includes(session.userId)) {
          nocoupon = true;
          res.redirect('/checkout');
        } else {
          session.offer.name = offerData.name;
          session.offer.type = offerData.type;
          session.offer.discount = offerData.discount;
          let updatedTotal =
            userData.cart.totalPrice -
            (userData.cart.totalPrice * session.offer.discount) / 100;
          session.couponTotal = updatedTotal;
          res.redirect('/checkout');
        }
      } else {
        res.redirect('/checkout');
      }
    } else {
      res.redirect('/checkout');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// checkout page
const checkout = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const id = req.query.addressid;
      const userData = await User.findById({ _id: session.userId });
      const completeUser = await userData.populate('cart.item.productId');
      const addressData = await Address.find({ userId: session.userId });
      const selectAddress = await Address.findOne({ _id: id });
      console.log(selectAddress);
      if (session.couponTotal == 0) {
        //update coupon
        session.couponTotal = userData.cart.totalPrice;
      }
      // session.nocoupon=false;

      res.render('user/checkOut', {
        id: session.userId,
        cartProducts: completeUser.cart,
        offer: session.offer,
        couponTotal: session.couponTotal,
        nocoupon,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
        userAddress: addressData,
        addSelect: selectAddress,
      });
      nocoupon = false;
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// store order data
const storeOrder = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const completeUser = await userData.populate('cart.item.productId');

      // console.log('CompleteUser: ', completeUser);
      userData.cart.totalPrice = session.couponTotal;
      const updatedTotal = await userData.save();

      if (completeUser.cart.totalPrice > 0) {
        const order = Orders({
          userId: session.userId,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.streetAddress,
          address2: req.body.streetAddress2,
          city: req.body.city,
          state: req.body.state,
          pin: req.body.pin,
          email: req.body.email,
          mobileno: req.body.mobileno,
          payment: req.body.payment,
          products: completeUser.cart,
          offer: session.offer.name,
          discount:session.offer.discount
        });
        let orderProductStatus = [];
        for (let key of order.products.item) {
          orderProductStatus.push(0);
        }
        // console.log('orderProductStatus',orderProductStatus);
        order.productReturned = orderProductStatus;

        const orderData = await order.save();
        console.log(orderData);
        session.currentOrder = orderData._id;
        // console.log('userSession.currentOrder',userSession.currentOrder);

        const offerUpdate = await Offer.updateOne(
          { name: session.offer.name },
          { $push: { usedBy: session.userId } }
        );

        // console.log(req.body.payment);
        // await orderData.save();
        if (req.body.payment === 'COD') {
          res.redirect('/order-success');
        } else if (req.body.payment === 'PayPal') {
          const usTotal=(completeUser.cart.totalPrice)/80;
          console.log(usTotal);
          res.render('user/paypal', {
            userId: session.userId,
            total: usTotal.toFixed(2),
            count: userData.cart.totalqty,
            wcount: userData.wishlist.totalqty,
          });
        } else {
          res.redirect('/');
        }
      } else {
        res.redirect('/checkout');
      }
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// payment success
const paymentSuccess = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const productData = await Product.find();
      for (let key of userData.cart.item) {
        console.log(key.productId, ' + ', key.qty);
        for (let prod of productData) {
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.stock = prod.stock - key.qty;
            await prod.save();
          }
        }
      }
      await Orders.find({
        userId: session.userId,
      });
      await Orders.updateOne(
        { userId: session.userId, _id: session.currentOrder },
        { $set: { status: 'Waiting for confirmation' } }
      );
      console.log(session.currentOrder);
      await User.updateOne(
        { _id: session.userId },
        {
          $set: {
            'cart.item': [],
            'cart.totalPrice': '0',
            'cart.totalqty': '0',
          },
        },
        { multi: true }
      );
      console.log('Order Built and Cart is Empty.');
      session.couponTotal = 0;
      res.render('user/orderSuccess', {
        count: 0,
        wcount: userData.wishlist.totalqty,
        orderId: session.currentOrder,
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};
// view orders
const viewOrder = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const id = req.query.id;
      session.currentOrder = id;
      const orderData = await Orders.findById({ _id: id });
      const userData = await User.findById({ _id: session.userId });
      await orderData.populate('products.item.productId');
      // console.log(orderData.products.item);
      res.render('user/viewOrder', {
        order: orderData,
        user: userData,
        count: userData.cart.totalqty,
        wcount: userData.wishlist.totalqty,
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};
// cancel order
const cancelOrder = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const { id } = req.query;
      console.log(id);
      await Orders.deleteOne({ _id: id });
      res.redirect('/dashboard');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const returnProduct = async (req, res) => {
  try {
    session = req.session;
    if ((session = req.session)) {
      const id = req.query.id;
      // console.log('id',new String(id));
      const productOrderData = await Orders.findById({
        _id: ObjectId(session.currentOrder),
      });
      // console.log('productOrderData.products.item[i].productId',new String(productOrderData.products.item[0].productId));
      const productData = await Product.findById({ _id: id });
      if (productOrderData) {
        for (let i = 0; i < productOrderData.products.item.length; i++) {
          if (
            new String(productOrderData.products.item[i].productId).trim() ===
            new String(id).trim()
          ) {
            productData.stock += productOrderData.products.item[i].qty;
            productOrderData.productReturned[i] = 1;
            console.log('found!!!');
            console.log('productData.stock', productData.stock);
            await productData.save().then(() => {
              console.log('productData saved');
            });
            console.log(
              'productOrderData.productReturned[i]',
              productOrderData.productReturned[i]
            );
            await productOrderData.save().then(() => {
              console.log('productOrderData saved');
            });
          } else {
            // console.log('Not at position: ',i);
          }
        }
        res.redirect('/dashboard');
      }
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error);
  }
};

// view wishlist
const WishlistView = async (req, res) => {
  try {
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const completeUser = await userData.populate('wishlist.item.productId');
      if (userData.wishlist.item.length === 0) {
        res.render('user/wishlist', {
          isLoggedin: true,
          id: session.userId,
          wishlistProducts: completeUser.wishlist,
          count: userData.cart.totalqty,
          wcount: userData.wishlist.totalqty,
          wempty: true,
        });
      } else {
        res.render('user/wishlist', {
          isLoggedin: true,
          id: session.userId,
          wishlistProducts: completeUser.wishlist,
          count: userData.cart.totalqty,
          wcount: userData.wishlist.totalqty,
          wempty: false,
        });
      }
    } else {
      res.render('user/wishlist', { isLoggedin: false, id: session.userId });

      // res.redirect('/')
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    session = req.session;
    if (session.userId) {
      const userData = await User.findById({ _id: session.userId });
      const productData = await Product.findById({ _id: productId });
      userData.addToWishlist(productData);
      // res.redirect('/')
      res.json({ status: true });
    } else {
      res.redirect('/wishlist');
    }
  } catch (error) {}
};
const addCartdelWishlsit = async (req, res) => {
  const productId = req.query.id;
  console.log(productId);
  session = req.session;
  const userData = await User.findById({ _id: session.userId });
  const productData = await Product.findById({ _id: productId });
  const add = await userData.addToCart(productData);
  if (add) {
    userData.removefromWishlist(productId);
  }
  // res.redirect('/viewcart');
  res.json({status:true})
};
const deleteWishlist = async (req, res) => {
  const productId = req.query.id;
  session = req.session;
  const userData = await User.findById({ _id: session.userId });
  userData.removefromWishlist(productId);
  res.redirect('/wishlist');
};

// logout
const userlogout = async (req, res) => {
  session = req.session;
  session.userId = false;
  // isLoggedin = false;
  // session.destroy();
  res.redirect('/');
};

module.exports = {
  landingpage,
  userlogin,
  userRegister,
  ConfirmOTP,
  userSignin,
  shopView,
  shopCatagory,
  menshop,
  womenshop,
  userreg,
  userProfile,
  userlogout,
  productDetails,
  quickview,
  addToCart,
  viewCart,
  deleteCart,
  editQnty,
  checkout,
  storeOrder,
  paymentSuccess,
  viewOrder,
  cancelOrder,
  returnProduct,
  editUser,
  addAddress,
  deleteAddress,
  addCoupon,
  WishlistView,
  addToWishlist,
  addCartdelWishlsit,
  deleteWishlist,
};
