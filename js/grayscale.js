(function ($) {
  "use strict"; // Start of use strict

  var currencyAPI = "http://free.currencyconverterapi.com/api/v5/convert?q=AUD_NPR&compact=ultra";
  var rate;
  var ratePromotion = 1.5;
  var total = 0;

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
  $.ajax({
    url: currencyAPI
  }).done(function (data) {
    if (data !== undefined && data != null) {
      var retrievedRate = data.AUD_NPR;
      if (isNumber(retrievedRate)) {
        retrievedRate = retrievedRate + ratePromotion;
        rate = Math.round(retrievedRate * 100) / 100
        updateAmountText();
      }
    }
  });

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
    alert("Sorry, we are experience some issues today. Please try again tomorrow.")
  });

})(jQuery); // End of use strict
