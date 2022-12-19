const bcrypt = require('bcrypt');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Banner = require('../model/bannerModel');
const Category = require('../model/categoryModel');
const Order = require('../model/ordersModel');
const Offer = require('../model/offerModel');
let adminSession = false || {};
let orderType = 'all';

// "/" get method

const adminLanding = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const productData = await Product.find();
      const userData = await User.find({ isAdmin: 0 });
      const categoryData = await Category.find();
      const categoryArray = [];
      const orderCount = [];

      for (let key of categoryData) {
        categoryArray.push(key.categoryname);
        orderCount.push(0);
      }
      const completeorder = [];
      const orderData = await Order.find();

      for (let key of orderData) {
        const uppend = await key.populate('products.item.productId');
        completeorder.push(uppend);
      }
      console.log(completeorder.length);
      for (let i = 0; i < completeorder.length; i++) {
        for (let j = 0; j < completeorder[i].products.item.length; j++) {
          const catadata = completeorder[i].products.item[j].productId.category;
          const issExisting = categoryArray.findIndex((category) => {
            return category === catadata;
          });
          orderCount[issExisting]++;
        }
      }
      // console.log(catadata);
      console.log(orderCount);
      console.log(categoryArray);
      res.render('admin/adminHome', {
        users: userData,
        product: productData,
        category: categoryArray,
        count: orderCount,
        layout: '../views/layout/adminLayout.ejs',
      });
    } else {
      res.render('admin/adminLogin', {
        layout: '../views/layout/adminLayout.ejs',
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// loging post method
const adminDash = async (req, res) => {
  try {
    const { username } = req.body;
    const { password } = req.body;
    const userData = await User.findOne({ username });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.isAdmin === 0) {
          res.render('admin/adminLogin', {
            layout: '../views/layout/adminLayout.ejs',
            message: 'Invalid Login Data',
          });
        } else {
          adminSession = req.session;
          adminSession.adminid = true;
          res.redirect('/admin');
          console.log('Admin logged in');
        }
      } else {
        // adminSession = req.session;
        res.render('admin/adminLogin', {
          layout: '../views/layout/adminLayout.ejs',
          message: 'Incorrect password',
        });
      }
    } else {
      res.render('admin/adminLogin', {
        layout: '../views/layout/adminLayout.ejs',
        message: 'Incorrect username',
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//admin order
const viewOrder = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const productData = await Product.find();
      const userData = await User.find({ isAdmin: 0 });
      const orderData = await Order.find().sort({ createdAt: -1 });
      for(let key of orderData){
        
        await key.populate('products.item.productId');
        await key.populate('userId');
      }
      if (orderType == undefined) {
        res.render('admin/adminOrder', {
          users: userData,
          product: productData,
          order: orderData,
          layout: '../views/layout/adminLayout.ejs',
        });
      } else {
        id = req.query.id;

        res.render('admin/adminOrder', {
          users: userData,
          product: productData,
          order: orderData,
          id: id,
          layout: '../views/layout/adminLayout.ejs',
        });
      }
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};
const adminOrderDetails= async(req,res)=>{
  try {
    adminSession= req.session
    if(adminSession.adminid){
      const id = req.query.id
      const orderData = await Order.findById({_id:id});
      await orderData.populate('products.item.productId');
      await orderData.populate('userId')
 res.render('admin/adminViewOrder',{
  order:orderData,
  layout: '../views/layout/adminLayout.ejs',
 })

    }
  } catch (error) {
    console.log(error.message);
  }
}

const adminCancelOrder = async (req, res) => {
  const id = req.query.id;
  await Order.deleteOne({ _id: id });
  res.redirect('/admin/adminOrder');
};
const adminConfirmorder = async (req, res) => {
  const id = req.query.id;
  await Order.updateOne({ _id: id }, { $set: { status: 'Comfirmed' } });
  res.redirect('/admin/adminOrder');
};
const adminDeliveredorder = async (req, res) => {
  const id = req.query.id;
  await Order.updateOne({ _id: id }, { $set: { status: 'Delivered' } });
  res.redirect('/admin/adminOrder');
};

// add product
const addProduct = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const productData = await Product.find();
      const userData = await User.find({ isAdmin: 0 });
      const categoryData = await Category.find();
      // res.render('admin/addProduct',{users:userData});
      res.render('admin/addProduct', {
        users: userData,
        product: productData,
        category: categoryData,
        layout: '../views/layout/adminLayout.ejs',
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
  }
};

// view users
const viewUsers = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const userData = await User.find({
        isAdmin: 0,
      });

      res.render('admin/viewUsers', {
        users: userData,
        layout: '../views/layout/adminLayout.ejs',
      });
    } else {
      res.redirect('/admin/users');
    }
  } catch (error) {
    console.log(error.message);
  }
};
// view product
const viewProducts = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const productData = await Product.find({});
      res.render('admin/viewProduct', {
        product: productData,
        layout: '../views/layout/adminLayout.ejs',
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
  }
};
// delete product
const deleteProducts = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const { id } = req.query;
      await Product.deleteOne({ _id: id });
      res.redirect('/admin/viewproduct');
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
  }
};
//soft delete
const softDelete = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const id = req.query.id;
      await Product.findByIdAndUpdate({ _id: id }, { $set: { isDelete: 0 } });
      res.redirect('/admin/viewproduct');
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};
//back to delete
const backToDelete = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const id = req.query.id;
      await Product.findByIdAndUpdate({ _id: id }, { $set: { isDelete: 1 } });
      res.redirect('/admin/viewproduct');
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// edit product get method
const editProduct = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const { id } = req.query;
      const userData = await User.find({ isAdmin: 0 });
      const categoryData = await Category.find();
      const productData = await Product.findById({ _id: id });
      console.log(productData);
      res.render('admin/editProduct', {
        product: productData,
        users: userData,
        category: categoryData,
        layout: '../views/layout/adminLayout.ejs',
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
  }
};

// edit product post method

const updateProduct = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      await Product.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock,
            brand: req.body.brand,
            category: req.body.category,
            description: req.body.description,
            size: req.body.size,
            gender: req.body.gender,
            rating: req.body.rating,
            image: req.file.filename,
          },
        }
      );

      res.redirect('/admin/viewproduct');
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
  }
};

// Block user
const userBlock = async (req, res) => {
  adminSession = req.session;
  if (adminSession.adminid) {
    const { id } = req.query;
    const userData = await User.findById({ _id: id });
    if (userData.isVerified) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 0 } });
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 1 } });
    }
    res.redirect('/admin/users');
  } else {
    res.redirect('/admin');
  }
};

// add product post
const reggProduct = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const product = Product({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        description: req.body.description,
        size: req.body.size,
        gender: req.body.gender,
        rating: req.body.rating,
        image: req.file.filename,
        brand: req.body.brand,
        gender: req.body.gender,
        category: req.body.category,
      });

      console.log(product);
      const productData = await product.save();
      if (productData) {
        // res.render('admin/addProduct',{message:"Your registration was successfull."})
        res.redirect('/admin/addproduct');
      } else {
        res.redirect('/admin/addproduct');

        // res.render('admin/addProduct',{message:"Your registration was a failure"})
      }
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// add category
const addcategory = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const categoryData = await Category.find();
      const userData = await User.find({ isAdmin: 0 });
      const productData = await Product.find();
      res.render('admin/adminCategory', {
        product: productData,
        users: userData,
        category: categoryData,
        layout: '../views/layout/adminLayout.ejs',
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};
// add category post method
const addnewcategory = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const category = Category({
        categoryname: req.body.type,
      });
      await category.save();

      res.redirect('/admin/addcategory');
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// delete category
const deletecategory = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const { id } = req.query;
      console.log(id);
      await Category.deleteOne({ _id: id });
      res.redirect('/admin/addcategory');
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
  }
};

//offer management
const adminLoadOffer = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const offerData = await Offer.find();
      const userData = await User.find({ isAdmin: 0 });
      const productData = await Product.find();
      res.render('admin/adminOffer', {
        users: userData,
        product: productData,
        layout: '../views/layout/adminLayout.ejs',
        offer: offerData,
      });
    } else {
      res.redirect('/admin/adminOffer');
    }
  } catch (error) {
    console.log(error.message);
  }
};
const adminStoreOffer = async (req, res) => {
  const offer = Offer({
    name: req.body.name,
    type: req.body.type,
    discount: req.body.discount,
  });
  await offer.save();
  res.redirect('/admin/adminOffer');
};

//delet offer
const adminDeleteOffer = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const { id } = req.query;
      console.log(id);
      await Offer.deleteOne({ _id: id });
      res.redirect('/admin/adminOffer');
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
  }
};

// add banner
const addBanner = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const userData = await User.find({ isAdmin: 0 });
      const productData = await Product.find();
      const bannerlist = await Banner.find();
      console.log(bannerlist);
      res.render('admin/addBanner', {
        banner: bannerlist,
        users: userData,
        product: productData,
        layout: '../views/layout/adminLayout.ejs',
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};
// post banner
const getBanner = async (req, res) => {
  try {
    adminSession = req.session;
    if (adminSession.adminid) {
      const bannerlist = await Banner.find();
      if (bannerlist != null) {
        await Banner.updateOne({
          btitle: req.body.title,
          bimage: req.file.filename,
        });
        res.redirect('/admin/addbanner');
      } else {
        const banner = Banner({
          btitle: req.body.title,
          bimage: req.file.filename,
        });
        console.log(banner);
        const bannerData = await banner.save();

        const userData = await User.find({ isAdmin: 0 });
        const productData = await Product.find();
        if (bannerData) {
          res.redirect('/admin/addbanner');
        } else {
          res.render('admin/addBanner', {
            message: 'Your registration was a failure',
            banner: bannerlist,
            users: userData,
            product: productData,
            layout: '../views/layout/adminLayout.ejs',
          });
        }
      }
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
  }
};

// log out
const adminLogOut = function (req, res) {
  adminSession = req.session;
  adminSession.adminid = false;

  res.redirect('/admin');
};

module.exports = {
  adminDash,
  adminLanding,
  adminLogOut,
  addProduct,
  userBlock,
  viewUsers,
  reggProduct,
  viewProducts,
  deleteProducts,
  softDelete,
  backToDelete,
  updateProduct,
  editProduct,
  addcategory,
  addnewcategory,
  addBanner,
  getBanner,
  deletecategory,
  viewOrder,
  adminOrderDetails,
  adminCancelOrder,
  adminConfirmorder,
  adminDeliveredorder,
  adminLoadOffer,
  adminStoreOffer,
  adminDeleteOffer,
};
