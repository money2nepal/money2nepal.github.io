(function ($) {
  "use strict"; // Start of use strict

  var currencyAPI = "http://free.currencyconverterapi.com/api/v5/convert?q=AUD_NPR&compact=ultra";
  var rate;
  var ratePromotion = 1.5;
  var total = 0;

  // $("#amount").val("1212");
  // $("#name").val("Sender User");
  // $("#email").val("sender.email@gmail.com");
  // $("#mobile").val("0412 345 678");
  // $("#recipientName").val("Recieving User");
  // $("#recipientMobile").val("9812 345 678");
  // $("#instructions").val("Account: 1024 0001 Bank: Recieving Bank Name");
  // $("#declaration").prop("checked", true);

  //#region ThemeCode
  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 70)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function () {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 100
  });

  // Collapse Navbar
  var navbarCollapse = function () {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);
  //#endregion

  //#region CurrencyConversion
  // $.ajax({
  //   url: currencyAPI
  // }).done(function (data) {
  //   if (data !== undefined && data != null) {
  //     var retrievedRate = data.AUD_NPR;
  //     if (isNumber(retrievedRate)) {
  //       retrievedRate = retrievedRate + ratePromotion;
  //       rate = Math.round(retrievedRate * 100) / 100
  //       updateAmountText();
  //     }
  //   }
  // });

  $("#amount").change(function () {
    updateAmountText();
  });

  function updateAmountText() {
    if (isNumber(rate)) {
      var amount = $("#amount").val();
      if (isNumber(amount)) {
        total = Math.round(amount * rate);
        $("#amountHelp").text("$" + numberWithCommas(amount) + " @ Rs." + rate + " will be Rs. " + nepaleseCurrencyCommas(total) + ".");
      } else {
        $("#amountHelp").text("Today's exchange rate is Rs. " + rate + " for one aussie dollar.");
      }
    }
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function nepaleseCurrencyCommas(x) {
    var numberWithCommas = "";
    var parts = x.toString().split(".");
    // To add commas, if we go backwards,
    // we can simply add a comma when the length of the output is divisible by 3
    // 123 => ,123
    // 12,345 => ,12,345
    // 12,34,567 => ,12,34,567
    for (var i = parts[0].length - 1; i >= 0; i--) {
      if (numberWithCommas.length > 0 && (numberWithCommas.length % 3 == 0)) {
        numberWithCommas = "," + numberWithCommas;
      }
      // now add the digit
      numberWithCommas = parts[0][i] + numberWithCommas;
    }
    // add the part after decimal
    if (parts.length > 1) {
      numberWithCommas = numberWithCommas + "." + parts[1];
    }
    return numberWithCommas;
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0)
  }
  //#endregion

  $("#transferForm").submit(function (event) {
    event.preventDefault();
    
    var amount = $("#amount").val();
    if (!isNumber(amount)) {
      return;
    }
    var email = $("#email").val();
    var requestData = {
      Amount: amount,
      Reference: email,
      Key: "1ef33243-96c8-44f9-abf7-8dfac14c3226"
    };
    showSpinner();
    $.ajax({
      contentType: 'application/json',
      url: "https://money2nepal.azurewebsites.net/api/5ee2f588-8970-452c-9403-bf2b1af58cf4",
      data: JSON.stringify(requestData),
      type: "POST"
    }).done(function (data) {
      if (data.errorCode != 0) {
        alert("Sorry, something went wrong.");
      } else {
        // save
        var customerData = {
          Amount: amount,
          Email: email,
          Name: $("#name").val(),
          Mobile: $("#mobile").val(),
          RecipientName: $("#recipientName").val(),
          RecipientMobile: $("#recipientMobile").val(),
          Instructions: $("#instructions").val(),
          Declaration: $('#declaration').is(":checked"),
          //Rate:
          //Total:
        };
        var customerDataJSON = JSON.stringify(customerData);
        var transactionId = data.transactionRefNo;
        localStorage.setItem(transactionId, customerDataJSON);
        window.location.href = data.navigateURL;
      }
    }).fail(function() {
      alert("Sorry, something went wrong processing your request.")
      hideSpinner();
    });
  });

  function showSpinner() {
    $("#buttonPay").addClass("d-none");
    $("#spinner").removeClass("d-none");
  }

  function hideSpinner() {
    $("#spinner").addClass("d-none");
    $("#buttonPay").removeClass("d-none");
  }

})(jQuery); // End of use strict
