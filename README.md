## ![logo](http://i.imgur.com/DAUBdg7.png) Static Contact Form

Lightweight, responsive contact form that allows users to send up to 45 emails per week from static websites.

### Instructions

Generate a key for your form at the companion site below. Don't worry about anything else there; support is built-in.

[https://emailrelay.henrygd.me](https://emailrelay.henrygd.me)

##### Load style & script

```html
<link rel="stylesheet" href="static-contact-form.css">
<script src="static-contact-form.js"></script>
```

##### Add an empty form element with an id of `static_contact_form`

```html
<form id="static_contact_form"></form>
```

##### Initiate the form

```javascript
StaticContactForm.initiate({
  key: "YOUR_KEY",
  email: "you@example.com"
});
```

---

License: MIT