// henrygd.me/static-contact-form
(function() {
  var SCF = window.StaticContactForm = {},
      email,
      inputName,
      inputEmail,
      inputMessage,
      loadingBar,
      button,
      key,
      loaderInterval,
      fufilledPromise,
      emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      doc = document,
      getID = 'getElementById',
      errorAlert = 'Please email directly to ' + email;

  // create form, store elements, add event listeners
  SCF.initiate = function(opts) {
    doc[getID]('static_contact_form').insertAdjacentHTML('beforeend', '<span class="cf-input"><input class="cf-input-field" type="text" id="cf_name" maxlength="255"><label class="cf-label" for="cf_name"><span class="cf-label-content">Your Name</span></label></span><span class="cf-input"><input class="cf-input-field" type="email" id="cf_email" maxlength="255"><label class="cf-label" for="cf_email"><span class="cf-label-content">Your email address</span></label></span><span class="cf-input cf-textarea"><textarea class="cf-input-field" id="cf_message" maxlength="10000"></textarea><label class="cf-label" for="cf_message"><span class="cf-label-content">Message</span></label></span><button class="cf-button"><span>SEND</span><span id="cf_loader" class="loading-bar"></span></button>');
    inputName = doc[getID]('cf_name');
    inputEmail = doc[getID]('cf_email');
    inputMessage = doc[getID]('cf_message');
    loadingBar = doc[getID]('cf_loader');
    button = loadingBar.parentElement;
    email = opts.email;
    key = opts.key;
    // on click handler for form button - pass to validate method
    button.addEventListener('click', validateForm, false);
    // on blur validation for input fields
    [inputName, inputEmail, inputMessage].forEach(function(input) {
      input.addEventListener('blur', validateField, false);
    });
  };

  // basic js form validation
  function validateForm() {
    var errors = [];
    // check if all fields are filled
    [inputName, inputEmail, inputMessage].forEach(function(el) {
      if (el.value.length < 1) {
        errors = ['All fields must be filled in.'];
        updateFieldError(el, true);
      }
    });
    // check email format to eliminate obvious errors
    if (!emailValid(inputEmail.value)) {
      errors.push('Make sure email is valid.');
      updateFieldError(inputEmail, true);
    }
    if (errors.length > 0)
      alertErrors(errors);
    else
      sendEmail(inputEmail.value, inputName.value, inputMessage.value);
  }

  // returns true if supplied with properly formatted email (basic check)
  function emailValid(email) {
    return emailRegex.test(email);
  }

  // validates field on blur
  function validateField() {
    var error = false;
    var input = this.value;
    if (input.length === 0)
      error = true;
    else if (this.id === 'cf_email' && !emailValid(input))
      error = true;
    updateFieldError(this, error);

  }

  function updateFieldError(el, error) {
    var elementClass = el.className;
    var errorInClass = elementClass.indexOf('error') > -1;
    // if error
    if (error && !errorInClass)
        el.className += ' cf-input-error';
    // no error
    else if (!error && errorInClass)
      el.className = elementClass.replace(' cf-input-error', '');
  }

  function alertErrors(errors) {
    var errorMessage = 'Please correct the following errors:\n';
    errors.forEach(function(error, index) {
      errorMessage += (index + 1) + '. ' + error + '\n';
    });
    alert(errorMessage);
  }

  // use JSONP to send params & load callback in script tag
  function sendEmail(fromEmail, name, message) {
    showButtonLoader();
    var url = 'https://emailrelay.henrygd.me/sendmail' +
                '?key=' + key +
                '&email=' + encodeParam(email) +
                '&fromEmail=' + encodeParam(fromEmail) + 
                '&name=' + encodeParam(name) +
                '&message=' + encodeParam(message) +
                '&callback=' + 'StaticContactForm.showResponse';
    var script = doc.createElement('script');
    script.onerror = function() {
      SCF.showResponse({sent: false});
    };
    script.src = url;
    doc.body.appendChild(script);
  }
  
  function encodeParam(param) {
    return encodeURIComponent(param);
  }

  SCF.showResponse = function(data) {
    var sent = data.sent;
    fufilledPromise = 1;
    webkitTransform(loadingBar, 'none');
    setTimeout(function(){
      webkitTransform(button, 'scaleY(0)');
      setTimeout(function() {
        var message;
        if (sent)
          message = 'Message sent. Thank you!';
        else {
          message = 'Failed to send - ' + errorAlert;
        }
        button.innerHTML = '<span>' + message + '</span>';
        button.className += ' cf-but-sent cf-but-' + sent;
      }, 350);
    }, 800);
  };

  function showButtonLoader() {
    var percent = 25;
    var warning = 0;
    button.removeEventListener('click', validateForm, false);
    (function loadIndicator() {
      if (fufilledPromise)
        return;
      if (percent > 92) {
        alert('Server may be down.' + errorAlert);
        return;
      }
      else if (percent > 70 && !warning) {
        warning = 1;
        loadingBar.className += ' cf-warn';
      }
      updateProgress(percent);
      percent += Math.floor(180 / percent);
      setTimeout(loadIndicator, percent * 15);
    })();
  }

  function updateProgress(percent) {
    webkitTransform(loadingBar, 'scaleX(0.' + percent + ')');
  }

  function webkitTransform(el, val) {
    el.style.cssText = '-webkit-transform:' + val + ';transform:' + val;
  }
})();
