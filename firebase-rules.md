# Firebase Firestore Security Rules

Copy and paste these rules into your Firebase Console -> Firestore Database -> Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents for students
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow admin write access (you can implement proper admin auth later)
    match /batches/{batchId} {
      allow write: if true;
    }
    
    match /liveClasses/{classId} {
      allow write: if true;
    }
    
    match /students/{studentId} {
      allow write: if true;
    }
    
    match /quizzes/{quizId} {
      allow write: if true;
    }
    
    match /assignments/{assignmentId} {
      allow write: if true;
    }
  }
}
```

# Firebase Storage Security Rules

Copy and paste these rules into your Firebase Console -> Storage -> Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Important Notes:

1. These rules are for development purposes and allow broad access
2. For production, implement proper authentication and authorization
3. Consider adding user authentication and role-based access control
4. Monitor usage and adjust rules based on your security requirements

## To apply these rules:

1. Go to Firebase Console (https://console.firebase.google.com/)
2. Select your project: nexttoppers-ab24d
3. Navigate to Firestore Database -> Rules
4. Replace the existing rules with the Firestore rules above
5. Navigate to Storage -> Rules  
6. Replace the existing rules with the Storage rules above
7. Click "Publish" for both rule sets

Your platform will now be able to read and write data to Firebase!
