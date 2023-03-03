const functions = require("firebase-functions");
const cors = require('cors')({origin: true});
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

let mailTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: 'rozhkow.dimasek@gmail.com',
        pass: 'wrawwerpkdvqvwje'
    }
});

admin.initializeApp();

exports.signUp = functions.auth.user().onCreate((user) => {
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
    }).then(() => {
        return user.uid
    })
})

exports.setUserData = functions.https.onCall((data, context) => {
    try {
        return admin
            .firestore()
            .collection('users')
            .doc(data.uid)
            .update({
                username: data.username || null,
                country: data.country || null,
                city: data.city || null,
                postalCode: data.postalCode || null
            }).then(() => {
                return 'Successfully added';
            })
    } catch (error) {
        throw new functions.https.HttpsError(error);
    }
});

exports.isUsernameTaken = functions.https.onCall((data, context) => {
    try {
        return new Promise((resolve, reject) => {
            return admin
                .firestore()
                .collection('users')
                .where("username", "==", data.username)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if (doc.id) {
                            resolve(true)
                        }
                    });
                    resolve(false)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    } catch (error) {
        throw new functions.https.HttpsError(error);
    }
});

exports.sendMail = functions.https.onCall((data, context) => {
    const { recipientEmail, message, sender } = data;

    const mailOptions = {
        from: 'Mermapp Support <Mermapp>',
        to: recipientEmail,
        html: message ? `<p>${message}</p>` : "<p>Come and join me in MerMapp - it's an app that works as the one-stop-shop for mermaids & mermen all over the world.</p>"
    };

    mailOptions.subject = `${sender} invites you to explore MerMapp`;

    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('email sent to:', recipientEmail);
        return new Promise(((resolve, reject) => {
       
            return resolve({
                result: 'email sent to: ' + recipientEmail
            });
        }));
    });
});