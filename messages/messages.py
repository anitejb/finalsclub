import pyrebase
import json
import time
import requests

config = {
  "apiKey": "AIzaSyDfmZwF-cz2WSVRSiJeobKCFFs_WFPp6Ng", # Web API Key
  "authDomain": "beta-7da49.firebaseapp.com",
  "databaseURL": "https://beta-7da49.firebaseio.com",
  "storageBucket": "beta-7da49.appspot.com"
}

firebase = pyrebase.initialize_app(config)
db = firebase.database()
storage = firebase.storage()
auth = firebase.auth()
with open("auth.json") as a:
    creds = json.load(a)
user = auth.sign_in_with_email_and_password(creds.username, creds.password)
# user = auth.sign_in_anonymous()

now = lambda: int(round(time.time() * 1000))
REDACTED_USER_1_uid = "REDACTED_USER_1_uid"
REDACTED_USER_2_uid = "REDACTED_USER_2_uid"
REDACTED_GROUP_id = "REDACTED_GROUP_id"
REDACTED_MESSAGE_id = "REDACTED_MESSAGE_id"

#################### MESSAGES (NO LOGIN REQUIRED) ####################

def update_message_user(group_id, message_id, display_name, uid):
    db.child(group_id).child(message_id).child("author").update({"displayName" : display_name})
    db.child(group_id).child(message_id).child("author").update({"uid" : uid})

def update_message_content(group_id, message_id, content):
    db.child(group_id).child(message_id).update({"content" : content})

def update_message_timestamp(group_id, message_id, timestamp):
    db.child(group_id).child(message_id).update({"timestamp" : timestamp})

def update_message_voted(group_id, message_id, voteCount):
    voted = []
    for i in range(voteCount):
        voted.append(f"tester{i}")
    db.child(group_id).child(message_id).update({"voted" : voted})

def update_message_founder(group_id, message_id):
    db.child(group_id).child(message_id).child("author").update({"founder" : "true"})

def delete_message(group_id, message_id):
    db.child(group_id).child(message_id).remove()

def delete_messages(group_id, message_ids):
    for id in message_ids:
        db.child(group_id).child(id).remove()

def get_message(group_id, message_id):
    return db.child(group_id).child(message_id).get().val()

def get_all_messages():
    with open(f'messages_{now()}.json', 'w') as f:
        json.dump(db.get().val(), f)
    return db.get().val()

def reset_test_message():
    db.child(dm_group_id).child(dm_message_id).set({
        "author": {
            "displayName": "REDACTED_NAME",
            "uid": "REDACTED_USER_1_uid"
        },
        "content": "Test Message",
        "timestamp": 1577836800
    })

#################### END OF MESSAGES ####################

#################### FILES (REQUIRES LOGIN) ####################

def get_download_token(group_id, file_id):
    base_url = "https://firebasestorage.googleapis.com/v0/b/beta-7da49.appspot.com/o/"
    headers = {
        "authorization": f"Firebase {user['idToken']}"
    }
    resp = requests.get(f"{base_url}{group_id}%2F{file_id}", headers=headers)
    return json.loads(resp.content)['downloadTokens']

def get_file(group_id, file_id):
    return storage.child(f"{group_id}/{file_id}").get_url(get_download_token(group_id, file_id))

def get_file_ids(group_id):
    url = f"https://firebasestorage.googleapis.com/v0/b/beta-7da49.appspot.com/o?prefix={group_id}%2F&delimiter=%2F"
    headers = {
        "authorization": f"Firebase {user['idToken']}"
    }
    resp = requests.get(url, headers=headers)
    return [item['name'].split("/")[1] for item in json.loads(resp.content)['items']]

def get_files(group_id):
    output = []
    file_ids = get_file_ids(group_id)
    for file_id in file_ids:
        output.append(get_file(group_id, file_id))
    return output

def get_all_files():
    messages = get_all_messages()
    output = []
    for id in messages.keys():
        output += get_files(id)
    return output

#################### END OF FILES ####################

def main():
    # reset_test_message()
    # print(get_files("REDACTED_GROUP_id/REDACTED_MESSAGE_id"))
    # print(get_file(REDACTED_GROUP_id, REDACTED_FILE_id))
    # print(get_id_token())
    # auth.send_email_verification(get_id_token())
    # update_message_founder(REDACTED_GROUP_id, REDACTED_FILE_id)
    print(get_all_messages())
    # print("\n".join(get_all_files()))

if __name__ == "__main__":
    main()

"""
SAMPLE MESSAGE OBJECT

"REDACTED_GROUP_id": {
    "REDACTED_MESSAGE_id": {
        "author": {
            "displayName": "REDACTED_MESSAGE_NAME",
            "profilePicURL": "https://firebasestorage.googleapis.com/v0/b/beta-7da49.appspot.com/o/REDACTED%2FREDACTED?alt=media&token=REDACTED",
            "uid": "REDACTED_USER_1_uid"
        },
        "content": "REDACTED_MESSAGE_CONTENT",
        "founder": "true",
        "timestamp": 1577836800,
        "voted": [
            "REDACTED_USER_2_uid"
        ]
    }
}
"""