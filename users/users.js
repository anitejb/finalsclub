// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyDfmZwF-cz2WSVRSiJeobKCFFs_WFPp6Ng',
    authDomain: 'beta-7da49.firebaseapp.com',
    projectId: 'beta-7da49'
});

firebase.auth().signInWithEmailAndPassword("REDACTED_EMAIL", "REDACTED_PASSWORD")
// firebase.auth().signInAnonymously()

var REDACTED_USER_1_uid = "REDACTED_USER_1_uid";
var REDACTED_USER_2_uid = "REDACTED_USER_2_uid";
var REDACTED_USER_3_uid = "REDACTED_USER_3_uid";

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var db = firebase.firestore();
        console.log(getAllUsers(db));
    }
});

//////////////////// GET USERS ////////////////////

function getAllUsers(db) {
    db.collection("Users").get().then((querySnapshot) => {
        var users = {};
        var uids = [];
        querySnapshot.forEach((doc) => {
            var jsonData = {};
            uids.push(doc.id);
            for (key in doc.data()) {
                jsonData[key] = doc.data()[key];
            }
            users[doc.id] = jsonData;
        });
        // Resolve circular dependency error
        var cache = [];
        var usersToString = JSON.stringify(users, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Duplicate reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null; // Enable garbage collection
        saveData(usersToString, `users_${Date.now()}.json`)
        console.log(usersToString);
        return true;
    });
}

function getUserByUid(db, uid) {
    var docRef = db.collection("Users").doc(uid);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            return doc.data();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            return;
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

//////////////////// END OF GET USERS ////////////////////

//////////////////// CREATE NEW USER ////////////////////

function createNewUser(db, email, password, displayName) {
    var xhttp = new XMLHttpRequest();
    var body = {"email":email,"password":password,"returnSecureToken":true};
    var url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyDfmZwF-cz2WSVRSiJeobKCFFs_WFPp6Ng";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            verifyEmail(xhttp.responseText, db, email, displayName);
        }
    };
    xhttp.open("POST", url)
    xhttp.send(body);
}

function verifyEmail(resp, db, email, displayName) {
    var idToken = JSON.parse(resp)['idToken'];
    var uid = JSON.parse(resp)['localId'];
    var xhttp = new XMLHttpRequest();
    var body = {"requestType":"VERIFY_EMAIL","idToken":idToken}
    var url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=AIzaSyDfmZwF-cz2WSVRSiJeobKCFFs_WFPp6Ng";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setNewUser(db, uid, displayName, email);
        }
    };
    xhttp.open("POST", url)
    xhttp.send(body);
}

function setNewUser(db, uid, displayName, netid) {
    var userRef = db.collection("Users").doc(uid);
    var general = db.collection('Courses').doc('general');

    userRef.set({
        "bio": null,
        "courses": [{"code": general}],
        "credits": 0,
        "displayName": displayName,
        "firstLogin": false,
        "friends": [],
        "gradYear": null,
        "hall": {},
        "interests": [],
        "major": null,
        "minor": null,
        "netid": netid,
        "orgs": [],
        "privacySettings": []
    }).then(function () {
        return;
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });

    userRef.update({"friends": [{
        "displayName": "REDACTED_NAME",
        "lastVisited": Date.now(),
        "userId": REDACTED_USER_3_uid
    }]});
}

//////////////////// END OF CREATE NEW USER ////////////////////

//////////////////// EDIT USERS ////////////////////

function updateUserBio(db, uid, bio) {
    var userRef = db.collection("Users").doc(uid);
    userRef.update({"bio": bio}).then(function () {
        return;
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function updateUserDisplayName(db, uid, name) {
    var userRef = db.collection("Users").doc(uid);
    userRef.update({"displayName": name}).then(function () {
        return;
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function updateUserFounder(db, uid, founder) {
    var userRef = db.collection("Users").doc(uid);
    userRef.update({"founder": founder}).then(function () {
        return;
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function updateUserMajor(db, uid, major) {
    var userRef = db.collection("Users").doc(uid);
    userRef.update({"major": major}).then(function () {
        return;
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function updateUserMinor(db, uid, minor) {
    var userRef = db.collection("Users").doc(uid);
    userRef.update({"minor": minor}).then(function () {
        return;
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

function updateUserPic(db, uid, picUrl) {
    var userRef = db.collection("Users").doc(uid);
    userRef.update({"profilePicURL": picUrl}).then(function () {
        return;
    }).catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
}

//////////////////// END OF EDIT USERS ////////////////////

//////////////////// UTILS ////////////////////

function saveData(data, fileName) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var url = window.URL.createObjectURL(new Blob([data], {type: "text/json"}));
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

//////////////////// END OF UTILS ////////////////////

/*
SAMPLE USERS OBJECT

"REDACTED_UID_STRING": {
    "bio": null,
    "courses": [
        {
            "code": {},
            "enrollment": "student",
            "lastVisited": 1577836800,
            "section": "root",
            "shortTitle": "General"
        },
        {
            "code": {},
            "enrollment": "student",
            "lastVisited": 1577836800,
            "section": "root",
            "shortTitle": "REDACTED_CLASS_NAME"
        },
        {
            "code": {},
            "enrollment": "student",
            "lastVisited": 1577836800,
            "section": "root",
            "shortTitle": "REDACTED_CLASS_NAME"
        },
        {
            "code": {},
            "enrollment": "student",
            "lastVisited": 1577836800,
            "section": "root",
            "shortTitle": "REDACTED_CLASS_NAME"
        },
        {
            "code": {},
            "enrollment": "student",
            "lastVisited": 1577836800,
            "section": "root",
            "shortTitle": "REDACTED_CLASS_NAME"
        },
        {
            "code": {},
            "enrollment": "student",
            "lastVisited": 1577836800,
            "section": "root",
            "shortTitle": "REDACTED_CLASS_NAME"
        },
        {
            "code": {},
            "enrollment": "student",
            "lastVisited": 1577836800,
            "section": "root",
            "shortTitle": "REDACTED_CLASS_NAME"
        }
    ],
    "credits": 0,
    "displayName": "REDACTED_DISPLAY_NAME",
    "firstLogin": false,
    "friends": [],
    "gradYear": "REDACTED_GRAD_YEAR",
    "hall": {
        "floor": "root",
        "hall": "REDACTED_RESIDENCE_HALL",
        "id": {}
    },
    "interests": [
        ""
    ],
    "major": "REDACTED_MAJOR",
    "minor": "",
    "netid": "REDACTED_NETID",
    "orgs": [],
    "privacySettings": []
}

*/