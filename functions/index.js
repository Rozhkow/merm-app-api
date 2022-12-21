const functions = require("firebase-functions");
const cors = require('cors')({origin: true});
const admin = require('firebase-admin');
const fetch = require('node-fetch');

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
