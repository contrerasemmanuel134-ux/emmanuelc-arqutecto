import admin from 'firebase-admin';
import serviceAccount from '../functions/service-account.json' assert { type: 'json' };

const BUCKET_NAME = 'expanded-system-469904-v9.appspot.com';

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: BUCKET_NAME
  });
}

const bucket = admin.storage().bucket();

async function listFiles() {
  try {
    console.log(`Files in bucket "${BUCKET_NAME}":`);
    const [files] = await bucket.getFiles();
    
    if (files.length === 0) {
        console.log("No files found.");
        return;
    }

    files.forEach(file => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(file.name)}?alt=media`;
      console.log(`${file.name} -> ${publicUrl}`);
    });
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

listFiles();
