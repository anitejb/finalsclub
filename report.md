# vulnerabilities in finalsclub.io

## table of contents
- [preface](#preface)
- [process](#process)
- [capabilities](#capabilities)
- [additional findings](#additional-findings)
- [solutions](#solutions)
- [additions](#additions-based-on-app)
- [conclusion](#conclusion)
- [responsible disclosure](#responsible-disclosure)

## preface

We first heard about the platform via a [reddit post](https://www.reddit.com/r/rutgers/comments/erzexx/rutgers_groupchat/) titled "Rutgers Groupchat!" (dated 01/21/2020 at 2:13pm EST) in the community `r/rutgers` by user `u/Vedant99` that publicized the platform. When we created accounts and accessed the platform, there were approximately 80\* users. As of 01/23/2020 at 7:55pm EST, there were 337\* users. Just before the platform went down on 02/03/2020 at approximately 8:00pm EST, there were over 500\* users. We understood the need for the platform, and appreciated the features that it provides to users. The unique aspects of the platform that distinguish it from other messaging platforms is the fact that users need a Rutgers NetID to login, and Rutgers classes & clubs have their own chatrooms. Based on the conversations that took place in `general`, we found that although certain users were hesitant to provide their NetID to a non-Rutgers application, a large majority of users had extremely positive feedback about the concept of the platform. Out of curiosity, we attempted to reverse engineer as much as we could, and understand its capabilities and weaknesses. Our findings are extensive, and we have determined that the platform has several vulnerabilities that, if left unattended, could potentially compromise personal information and imitate actions of hundreds of Rutgers students.

\*As determined by the number of members in the `general` channel.

## process

**Messages**

We first began by inspecting HTTP requests sent by the website when a user logged in. We found that the platform uses Firebase to store messages, with which we were familiar. Via the numerous HTTP requests being made to `https://www.googleapis.com/identitytoolkit/v3/relyingparty/<action>` during the login process, we identified their API key to be `AIzaSyDfmZwF-cz2WSVRSiJeobKCFFs_WFPp6Ng`. We later found that the API key was also in the site's `client.js`. In addition, we also identified their Firebase Project ID to be `beta-7da49`, also from `client.js`. Using prior knowledge of Firebase formatting, we identified their `authDomain` to be `beta-7da49.firebaseapp.com`, `databaseURL` to be `https://beta-7da49.firebaseio.com`, and `storageBucket` to be `beta-7da49.appspot.com`. Using Python and the `pyrebase` library, we were able to use `apiKey`, `authDomain`, `databaseURL`, and `storageBucket` to initialize the database. With this, we had access to the entire messages database, including private conversations.

**Users**

The messages were stored in their Firebase database, but users were stored in Firestore, a separate database. Since `pyrebase` does not support Firestore, in order to gain access to users we had to use JS. We followed the guidelines for Web from [official documentation](https://firebase.google.com/docs/firestore/quickstart), and we were able to initialize Firestore using `apiKey`, `authDomain`, and Project ID (`beta-7da49`). With this, we had access to the entire users database, including bio, major, minor, residence hall, classes, clubs, interests, and more. A notable difference for access to users, however, was that we were required to sign in with a valid user account, whereas we had access to messages without a platform login.

**Files**

All the files uploaded to the site were stored in the `storageBucket` (`beta-7da49.appspot.com`). Files were stored by channel, and each channel and each file had a unique ID. We found that we could get all the file IDs for a specified channel by making a GET request to `https://firebasestorage.googleapis.com/v0/b/beta-7da49.appspot.com/o?prefix=<channel_id>%2F&delimiter=%2F`. Similar to users, this required a valid user login to get an `idToken`, which was a required part of the headers of the GET request. Once we had all the file IDs for a channel, we made a GET request to `https://firebasestorage.googleapis.com/v0/b/beta-7da49.appspot.com/o/<channel_id>%2F<file_id>` to receive a download token. We were then able to get the file URLs using `pyrebase`.

**Creating Users Without Rutgers Credentials**

In order to create new users, we looked at the `client.js` file on the platform, and also looked at network requests being made. When a new user signed up, a POST request was made to `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyDfmZwF-cz2WSVRSiJeobKCFFs_WFPp6Ng"` with the username and password. Then, an email verification link is sent by making a POST request to `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=AIzaSyDfmZwF-cz2WSVRSiJeobKCFFs_WFPp6Ng`. Then, a new user is created by setting all of their fields (bio, major, minor, etc.) to `null`. When someone tries to create a new account using the platform, it appends `@rutgers.edu` to the user-provided NetID, therefore preventing anybody from making an account that does not have a Rutgers email address. However, we were able to create a new user account with a non-Rutgers email address by making POST requests to the aforementioned two URLs, and setting user values in Firestore. We found in the `client.js` that unlike the sign up page, the sign in page only appended `@rutgers.edu` to the username (NetID) field if the user does not have an `@` symbol in the field already. Due to this, we were able to just sign in with our non-Rutgers email address in the NetID field and the associated password, and access the platform. Front end input validation prevented us from actually clicking the "Login" button, but we bypassed this by simply inspecting the page and editing the `<button>` element to remove the `disabled` attribute.

## capabilities

**Messages**
- Read messages from private conversations
- Send messages in private conversations
- Edit messages from any user
- Edit usernames on messages
- Edit timestamps on messages
- Add a founder tag to messages
- Add votes to a message
    - Add anonymous votes
    - Add votes from specific users

**Users**
- Edit any user's bio, display name, major, minor, hall, interests, grad year\*
- Set a user's friends (this allows them to receive private messages from any user)\*
- Set a user's profile picture\*
- Make any user a developer (previously founder)\*
- Create users with non-Rutgers accounts

**Files**
- Get all files from every channel\*
- Get all files from private conversations\*

\*Requires a platform login

## additional findings

1. User accounts are created when someone puts in a username/password on the sign in page, regardless of whether or not the email address `<user_value>@rutgers.edu` actually exists. This can lead to several spam users being created that will never be verified.
1. User accounts can be created with non-Rutgers email addresses using the process explained above.
1. Rutgers users can create multiple accounts because of email aliases (example, a Rutgers student has `netid@scarletmail.rutgers.edu`, `netid@rutgers.edu`, `firstname.lastname@rutgers.edu`, and possibly more).
1. No maximum upload size on files per user. This can incur unwanted database fees.
1. If a user A sends a private message to user B, then user B cannot see the message until they add user A as a friend. User B also does not get a notification of the message.
1. Add Direct Message button in DMs increments the user count in the private message, but does not actually add anybody and when the page is refreshed, it resets to the actual number.
1. User input for display name can include whitespace at the ends.

## solutions

1. **Firebase/Firestore Database Access**

    [API Keys can be exposed to the public](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public/37484053#37484053), as they are only identifiers, and do not pose a security risk. However, the fact that the database security rules were not up to standard led to major data breach possibilities. Although this is a drastic problem, it has a simple solution: update your [Database Security Rules](https://firebase.google.com/docs/reference/security/database/). This will prevent unauthorized users from gaining access to read/write messages, user data, and files.

2. **Additional Findings**

    1. Either
        - verify that NetIDs are valid before actually creating a user profile (this will also fix the problem of creating accounts with non-Rutgers emails) or 
        - remove users that have not been email verified after a predetermined time period.

        In addition, look into adding Captcha or a similar human verification system for sign ups.
    1. Handle email validation before making a POST request to the `signupNewUser` endpoint.
    1. Append NetID to `@scarletmail.rutgers.edu` to avoid multiple accounts by the same student.
    1. Set a maximum upload size on files per user, as well as a cumulative storage limit per user.
    1. Set up some sort of notification system where user B can see user A's attempt to DM them, and after this notification, B can decide whether or not to add A as a friend.
    1. Bug, just needs to be fixed.
    1. Trim user input for display name to avoid trailing/preceding whitespace.

## additions (based on app)

The app displays a list of users when it gives you the option to edit Friends. This is all users (including unverified users), but it should be limited to just verified users. In addition, sanitizing unverified users after a predetermined time interval should also be implemented.

## conclusion

A large majority of the capabilities we had can be resolved by updating Firebase security rules. This will make the platform immensely more secure and restrict users from editing messages and other user profiles. The other issues we mentioned will need to be resolved with backend changes. In addition, it is worth looking into end-to-end message encryption for the platform in some way, shape or form, to ensure the privacy of users' conversations.

## responsible disclosure

This report was prepared in good faith to ensure that the administrators of the platform take the required actions to patch their security vulnerabilities. We have provided details of the vulnerabilities, including information needed to reproduce and validate the vulnerabilities. We have made a good faith effort to avoid privacy violations, destruction of data and interruption or degradation of the platform's services. We have not modified any data that does not belong to us, and all data we accessed was either publicly accessible or accessible to all Rutgers students with platform accounts. This report was completed and delivered to `admin@finalsclub.io` on 02/05/2020 at 3:00am EST, and we are providing the administrators with a reasonable time period of 30 (thirty) days to resolve the security vulnerabilities. Before 03/06/2020 at 3:00am EST, we agree not to disclose any of our findings to anyone apart from the administrators of the platform. On or after 03/06/2020 at 3:00am EST, for transparency as well as for the security of the platform's user base, we will make this report publicly available, as well as answer any questions that anyone may have about the details of this report. We do not necessarily intend to actively distribute this report. To reiterate, our goal is to ensure in good faith the transparency of the vulnerabilities and the steps required to reproduce them, and to protect the security of future users of the platform.
