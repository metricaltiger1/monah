import os

# Define the folder structure for the "monah" project
folders = [
    "monah/index.html",
    "monah/auth/login.html",
    "monah/auth/signup.html",
    "monah/app/chat.html",
    "monah/app/history.html",
    "monah/css/main.css",
    "monah/css/auth.css",
    "monah/css/chat.css",
    "monah/css/animations.css",
    "monah/js/main.js",
    "monah/js/auth.js",
    "monah/js/chat.js",
    "monah/js/history.js",
    "monah/js/animations.js",
    "monah/js/sentiment.js",
    "monah/js/firebase.js",
    "monah/assets/illustrations/",
    "monah/assets/animations/"
]

# Create the directories and files
for folder in folders:
    if folder.endswith("/"):
        # Create the directory
        os.makedirs(folder, exist_ok=True)
    else:
        # Create the file
        os.makedirs(os.path.dirname(folder), exist_ok=True)
        open(folder, 'w').close()

print("Folder structure and files created successfully!")
