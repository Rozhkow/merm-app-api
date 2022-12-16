const functions = require("firebase-functions");
const cors = require('cors')({origin: true});
const admin = require('firebase-admin');

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
            .doc(context.auth.uid)
            .update({
                country: data.country || null,
                city: data.city || null,
                address: data.address || null
            }).then(() => {
                return 'Successfully added';
            })
    } catch (error) {
        throw new functions.https.HttpsError(error);
    }
});
