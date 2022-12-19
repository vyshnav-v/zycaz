



const updateQuantity = async (req, res) => {
    Id = req.query.id;
    // userSession = req.session;
    qty = req.body.quantity;
    console.log(qty);
    productData = await Cart.findOne({ userID: req.session.userId }).populate('product.productID');
    indexNum = await productData.product.findIndex(index => index._id == Id);
    productData.product[indexNum].quantity = qty;
    await productData.save();
    const forTotal = await Cart.findOne({ userID:req.session.userId })
    forTotal.totalPrice = 0;
    res.redirect('/cart');
}







