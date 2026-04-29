const { auth } = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendWelcomeEmail = auth.user().onCreate((user) => {
  const email = user.email;
  return admin.firestore().collection('mail').add({
    to: email,
    from: 'noreply@dashboardmodule.com',
    message: {
      subject: 'Welcome to Dashboard Module',
      text: 'Welcome to dashboardmodule.com! Start creating your first module now!!',
      html: 'Welcome to <a href="http://dashboardmodule.com">dashboardmodule.com</a>! Start creating your first module now!!'
    }
  });
});