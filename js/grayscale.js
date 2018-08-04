(function ($) {
  "use strict"; // Start of use strict

  var CurrencyAPI = "https://free.currencyconverterapi.com/api/v5/convert?q=AUD_NPR&compact=ultra";
  var POLiLinkAPI = "https://money2nepal.azurewebsites.net/api/5ee2f588-8970-452c-9403-bf2b1af58cf4";
  var ServiceCharge = 5;
  var RatePromotion = 2;
  var currentConversionRate;
  var convertedTotal = 0;

  // $("#amount").val("1212");
  // $("#name").val("Sender User");
  // $("#email").val("sender.email@gmail.com");
  // $("#mobile").val("0412 345 678");
  // $("#recipientName").val("Recieving User");
  // $("#recipientMobile").val("9812 345 678");
  // $("#instructions").val("Account: 1024 0001 Bank: Recieving Bank Name");
  // $("#declaration").prop("checked", true);

  var currentUrl = location.href;
  if (currentUrl.indexOf("#success") != -1) {
    $('#modalSuccess').modal('show');
  } else if (currentUrl.indexOf("#failure") != -1) {
    $('#modalFailure').modal('show');
  } else if (currentUrl.indexOf("#cancelled") != -1) {
    $('#modalCancelled').modal('show');
  }

  $("#serviceCharge").text(ServiceCharge);

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
    url: CurrencyAPI
  }).done(function (data) {
    if (data !== undefined && data != null) {
      var retrievedRate = data.AUD_NPR;
      if (isNumber(retrievedRate)) {
        retrievedRate = retrievedRate + RatePromotion;
        currentConversionRate = Math.round(retrievedRate * 100) / 100
        updateAmountText();
      }
    }
  });

  $("#amount").change(function () {
    updateAmountText();
  });

  function updateAmountText() {
    if (isNumber(currentConversionRate)) {
      var amount = $("#amount").val();
      if (isNumber(amount) && (amount - ServiceCharge) > 0) {
        convertedTotal = Math.round((amount - ServiceCharge) * currentConversionRate);
        $("#amountHelp").text("After $" + ServiceCharge + " service charge, $" + numberWithCommas(amount - ServiceCharge) + " @ Rs." + currentConversionRate + " will be Rs. " + nepaleseCurrencyCommas(convertedTotal) + ".");
      } else {
        $("#amountHelp").text("Today's exchange rate is Rs. " + currentConversionRate + " for one aussie dollar.");
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

    var transactionData = getTransactionData();
    if (!transactionData.Amount) {
      return;
    }

    // Update review information in the modal and open modal
    $("#reviewAmount").text("$" + numberWithCommas(transactionData.Amount));
    $("#reviewServiceCharge").text("$" + transactionData.ServiceCharge);
    $("#reviewRate").text("Rs. " + nepaleseCurrencyCommas(transactionData.Rate));
    $("#reviewTotal").text("Rs. " + nepaleseCurrencyCommas(transactionData.Total));
    $("#reviewName").text(transactionData.Name);
    $("#reviewMobile").text(transactionData.Mobile);
    $("#reviewRecipientName").text(transactionData.RecipientName);
    $("#reviewRecipientMobile").text(transactionData.RecipientMobile);
    $("#reviewInstructions").text(transactionData.Instructions);
    $('#modalConfirmPayment').modal('show');
  });

  $("#buttonCancelPay").click(function (event) {
    hideSpinner();
  });

  $("#buttonPay").click(function (event) {
    showSpinner();
    var transactionData = getTransactionData();
    var requestData = {
      Amount: transactionData.Amount,
      Reference: transactionData.Mobile,
      Key: "1ef33243-96c8-44f9-abf7-8dfac14c3226"
    };
    $.ajax({
      contentType: 'application/json',
      url: POLiLinkAPI,
      data: JSON.stringify(requestData),
      type: "POST"
    }).done(function (data) {
      if (data.errorCode != 0) {
        alert("Sorry, something went wrong.");
        hideSpinner();
      } else {
        // save
        var transactionDataJSON = JSON.stringify(transactionData);
        var transactionId = data.transactionRefNo;
        localStorage.setItem(transactionId, transactionDataJSON);
        window.location.href = data.navigateURL;
      }
    }).fail(function () {
      alert("Sorry, something went wrong processing your request.")
      hideSpinner();
    });
  })

  function getTransactionData() {
    return {
      Amount: $("#amount").val(),
      Email: $("#email").val(),
      Name: $("#name").val(),
      Mobile: $("#mobile").val(),
      RecipientName: $("#recipientName").val(),
      RecipientMobile: $("#recipientMobile").val(),
      Instructions: $("#instructions").val(),
      Declaration: $('#declaration').is(":checked"),
      Rate: currentConversionRate,
      Total: convertedTotal,
      ServiceCharge: ServiceCharge,
    };
  }

  function showSpinner() {
    $("#buttonPOLi").addClass("d-none");
    $("#spinner").removeClass("d-none");
  }

  function hideSpinner() {
    $("#spinner").addClass("d-none");
    $("#buttonPOLi").removeClass("d-none");
  }

})(jQuery); // End of use strict
