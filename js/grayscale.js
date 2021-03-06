(function ($) {
  "use strict"; // Start of use strict

  var CurrencyAPI = "https://free.currencyconverterapi.com/api/v5/convert?q=AUD_NPR&compact=ultra";
  var POLiLinkAPI = "https://money2nepal.azurewebsites.net/api/5ee2f588-8970-452c-9403-bf2b1af58cf4";
  var EmailAPI = "https://money2nepal-email.azurewebsites.net/api/05969234-399b-4800-96f8-3f26ca716fb8";
  var ServiceCharge = 5;
  var RatePromotion = 2;
  var currentConversionRate;
  var convertedTotal;

  // $("#amount").val("1212");
  // $("#name").val("Sender User");
  // $("#email").val("sender.email@gmail.com");
  // $("#mobile").val("0412345678");
  // $("#recipientName").val("Recieving User");
  // $("#recipientMobile").val("9812345678");
  // $("#instructions").val("Account: 1024 0001 Bank: Recieving Bank Name");
  // $("#declaration").prop("checked", true);

  var currentUrl = location.href;
  if (currentUrl.indexOf("#success") != -1) {
    finaliseTransaction();
  } else if (currentUrl.indexOf("#failure") != -1) {
    $('#modalFailure').modal('show');
  } else if (currentUrl.indexOf("#cancelled") != -1) {
    $('#modalCancelled').modal('show');
  } else if (currentUrl.indexOf("#sankalpa") != -1) {
    $("#amount").attr("min", "250");
    $("#amount").attr("placeholder", "Enter amount (from $250 to $10,000)");
    $("#name").attr("disabled", true);
    $("#name").val("Sankalpa Pokhrel");
  } else if (currentUrl.indexOf("#bidur") != -1) {
    $("#amount").attr("min", "350");
    $("#amount").attr("placeholder", "Enter amount (from $350 to $10,000)");
    $("#name").attr("disabled", true);
    $("#name").val("Bidur Sharma Gautam");
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
        if (currentConversionRate > 85) {
          currentConversionRate = 85;
        }
        updateAmountText();
      }
    }
  }).fail(function () {
    alert("Sorry, we couldn't load today's exchange rate. As such we will not be able to process your request this time. Please try again later.")
  });

  $("#amount").change(function () {
    updateAmountText();
  });

  function updateAmountText() {
    if (isNumber(currentConversionRate)) {
      var amount = $("#amount").val();
      if (isNumber(amount) && (amount - ServiceCharge) > 0) {
        convertedTotal = Math.round((amount - ServiceCharge) * currentConversionRate);
        $("#amountHelp").text("After $" + ServiceCharge + " service charge, $" + numberWithCommas(amount - ServiceCharge) + " @ Rs." + currentConversionRate + " will be Rs." + nepaleseCurrencyCommas(convertedTotal) + ".");
      } else {
        $("#amountHelp").text("Today's exchange rate is Rs. " + currentConversionRate + " for one aussie dollar.");
      }
    }
  }

  function numberWithCommas(x) {
    if (!isNumber(x)) {
      return null;
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function nepaleseCurrencyCommas(x) {
    if (!isNumber(x)) {
      return null;
    }
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

  //#region Submission
  $("#transferForm").submit(function (event) {
    event.preventDefault();

    if (!recaptchaLoaded) {
      alert("Sorry, we weren't able to load all the components. Please try refreshing the page.");
      return;
    }

    var transactionData = getTransactionData();
    if (!isNumber(transactionData.Amount) || !isNumber(transactionData.Rate)
      || !isNumber(transactionData.Total) || !isNumber(transactionData.ServiceCharge)) {
      alert("Sorry, unexpected error occurred.");
      return;
    }

    // Update review information in the modal and open modal
    loadConfirmPaymentAndOrderCompleteDetails(transactionData);
    $('#modalConfirmPayment').modal('show');
  });

  function loadConfirmPaymentAndOrderCompleteDetails(transactionData) {
    $(".reviewAmount").text("$" + numberWithCommas(transactionData.Amount));
    $(".reviewServiceCharge").text("$" + transactionData.ServiceCharge);
    $(".reviewRate").text("Rs. " + transactionData.Rate);
    $(".reviewTotal").text("Rs. " + nepaleseCurrencyCommas(transactionData.Total));
    $(".reviewName").text(transactionData.Name);
    $(".reviewEmail").text(transactionData.Email);
    $(".reviewMobile").text(phoneNumberWithSpaces(transactionData.Mobile));
    $(".reviewRecipientName").text(transactionData.RecipientName);
    $(".reviewRecipientMobile").text(phoneNumberWithSpaces(transactionData.RecipientMobile));
    $(".reviewInstructions").text(transactionData.Instructions);
    $(".reviewReceiptNumber").text(transactionData.TransactionRefNo);
  }

  $("#buttonCancelPay").click(function (event) {
    hideSpinner();
  });

  $("#buttonPay").click(function (event) {
    showSpinner();
    var transactionData = getTransactionData();
    var requestData = {
      Amount: transactionData.Amount,
      Reference: phoneNumberWithSpaces(transactionData.Mobile),
      Key: "1ef33243-96c8-44f9-abf7-8dfac14c3226",
      RecaptchaResponse: $("#g-recaptcha-response").val()
    };
    $.ajax({
      contentType: 'application/json',
      url: POLiLinkAPI,
      data: JSON.stringify(requestData),
      type: "POST"
    }).done(function (data) {
      if (data.errorCode != 0) {
        hideSpinner();
        if (data.errorCode == -1010) {
          alert("Sorry, we couldn't verify that you are a human.");
        } else {
          alert("Sorry, we couldn't take you to POLi for the payments. Error code: " + data.errorCode);
        }
      } else {
        // save
        transactionData.TransactionRefNo = data.transactionRefNo;
        var transactionDataJSON = JSON.stringify(transactionData);
        var parts = data.navigateURL.split("=");
        if (parts.length !== 2) {
          alert("Unexpected error occurred. Please contact support.");
        }
        var token = parts[1];
        sessionStorage.setItem(token, transactionDataJSON);
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
    $('#modalPleaseWait').modal('show');
  }

  function hideSpinner() {
    $('#modalPleaseWait').modal('hide');
  }

  function phoneNumberWithSpaces(x) {
    if (!isNumber(x)) {
      return null;
    }
    var phoneNumberWithSpaces = "";
    for (var i = x.length - 1; i >= 0; i--) {
      if (phoneNumberWithSpaces.length == 3 || phoneNumberWithSpaces.length == 7) {
        phoneNumberWithSpaces = " " + phoneNumberWithSpaces;
      }
      // now add the digit
      phoneNumberWithSpaces = x[i] + phoneNumberWithSpaces;
    }
    return phoneNumberWithSpaces;
  };
  //#endregion

  function finaliseTransaction() {
    showSpinner();
    var token = getParameterByName("token");
    var data = sessionStorage.getItem(token);
    if (data != undefined && data != null && data.length > 0) {
      var transactionData = JSON.parse(data);
      sendEmail(transactionData, token);
    } else {
      hideSpinner();
      $('#modalSessionExpired').modal('show');
    }
  };

  function sendEmail(transactionData, token) {
    if (transactionData.EmailAlreadySent) {
      loadConfirmPaymentAndOrderCompleteDetails(transactionData);
      hideSpinner();
      $('#modalOrderComplete').modal('show');
      return;
    }

    var requestData = {
      CustomerEmail: transactionData.Email,
      Subject: "Order Confirmation - " + transactionData.TransactionRefNo,
      Body: "G'day " + transactionData.Name + "<br><br>"

        + "Thank you for your transaction with money2nepal. We look forward to delivering your money soon. "
        + "We will contact you on your mobile shortly to verify your transaction.<br><br>"

        + "Your order details are below:<br><br>"

        + "<strong>Order Receipt Number:</strong> " + transactionData.TransactionRefNo + "<br>"
        + "<strong>Amount:</strong> $" + numberWithCommas(transactionData.Amount) + "<br>"
        + "<strong>Service Charge:</strong> $" + transactionData.ServiceCharge + "<br>"
        + "<strong>Rate:</strong> Rs. " + transactionData.Rate + "<br>"
        + "<strong>Total:</strong> Rs. " + nepaleseCurrencyCommas(transactionData.Total) + "<br>"
        + "<strong>Sender:</strong> " + transactionData.Name + "<br>"
        + "<strong>Sender Email:</strong> " + transactionData.Email + "<br>"
        + "<strong>Sender Mobile:</strong> " + phoneNumberWithSpaces(transactionData.Mobile) + "<br>"
        + "<strong>Recipient:</strong> " + transactionData.RecipientName + "<br>"
        + "<strong>Recipient Mobile:</strong> " + phoneNumberWithSpaces(transactionData.RecipientMobile) + "<br>"
        + "<strong>Instructions:</strong> " + transactionData.Instructions + "<br>"

        + "<br>Best regards,"
        + "<br>money2nepal"
      ,
      Key: "4B97C939-C37B-4CE1-9AD7-94DA349046FA"
    };
    $.ajax({
      contentType: 'application/json',
      url: EmailAPI,
      data: JSON.stringify(requestData),
      type: "POST"
    }).done(function (data) {
      if (data == true) {
        transactionData.EmailAlreadySent = true;
        sessionStorage.setItem(token, JSON.stringify(transactionData));
        loadConfirmPaymentAndOrderCompleteDetails(transactionData);
        hideSpinner();
        $('#modalOrderComplete').modal('show');
      } else {
        alert("Something went wrong finalising your order. Please contact us and provide this receipt number: " + transactionData.TransactionRefNo);
      }
    }).fail(function () {
      alert("Something went wrong finalising your order. Please contact us and provide this receipt number: " + transactionData.TransactionRefNo);
    });

  }

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return results[2];
  }

})(jQuery); // End of use strict

var recaptchaLoaded = false;
var onRecaptchaLoad = function () {
  recaptchaLoaded = true;
};