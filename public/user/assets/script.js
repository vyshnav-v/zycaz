function addToCart(productId) {
  $.ajax({
    url: '/addtocart?id=' + productId,
    method: 'GET',
    success: function (response) {
      if (response.status) {
        Swal.fire({
          position: 'centre',
          icon: 'success',
          title: 'Product is added to the cart',
          showConfirmButton: false,
          timer: 1500,
        });
        let count = $('#cart-count').html();
        count = parseInt(count) + 1;
        $('#cart-count').html(count);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Please LOGIN',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    },
  });
}

function addToWishlist(productId) {
  $.ajax({
    url: '/add-to-wishlist?id=' + productId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        Swal.fire({
          position: 'centre',
          icon: 'success',
          title: 'Success',
          showConfirmButton: false,
          timer: 1500,
        });
        let count = $('#wish-count').html();
        count = parseInt(count);
        $('#wish-count').html(count);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Please LOGIN',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    },
  });
}

function addToCartDeleteWish(productId) {
  $.ajax({
    url: '/add-to-cart-delete-wishlist?id=' + productId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        Swal.fire({
          position: 'centre',
          icon: 'success',
          title: 'Success',
          showConfirmButton: false,
          timer: 1500,
        });
        let count = $('#wish-count').html();
        count = parseInt(count);
        $('#wish-count').html(count);
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Please LOGIN',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    },
  });
}

$(document).ready(function() {

  // function RefreshTable() {
  //     $( "#mytable" ).load( "your-current-page.html #mytable" );
  // }

  // $("#refresh-btn").on("click", RefreshTable);

  // OR CAN THIS WAY
  //
  $("#refresh-btn").on("click", function() {
     $( "#mytable" ).load( location.href +" #mytable" );
  },200);


});




//btn




// Product Quantity
$('.quantitty button').on('click', function () {
  var button = $(this);
  var oldValue = button.parent().parent().find('input').val();
  if (button.hasClass('btn-plus')) {
      var newVal = parseFloat(oldValue) + 1;
  } else {
      if (oldValue > 0) {
          var newVal = parseFloat(oldValue) - 1;
      } else {
          newVal = 0;
      }
  }
  button.parent().parent().find('input').val(newVal);
});