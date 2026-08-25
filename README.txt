# Surprizzy — Secure Admin Starter

Admin login:
- Mobile number: 8369860594
- Password: set this in Firebase Authentication (do NOT put it in this file)

This version uses Firebase Authentication + Firestore, so the password is not hard-coded in the website.

## One-time Firebase setup
1. Create a Firebase project.
2. Add a Web App and copy its config into `index.html` where the PASTE_* values are.
3. In Firebase Authentication → Sign-in method, enable Email/Password.
4. Create ONE admin user:
   - Email: `8369860594@surprizzy-admin.local`
   - Password: `vinayak03`
5. In Firestore Database, create the database.
6. Publish the included `firestore.rules`.
7. Open `index.html` through a local server or deploy it to Vercel/Netlify/GitHub Pages.

The site displays the mobile number as the admin identifier, while Firebase uses a private internal email identity for authentication. The password is handled by Firebase Authentication.

## Important
The included rules protect the admin writes, but this is still a starter store. Before accepting real payments, add a server-side payment/order flow (Razorpay/Cashfree) and customer authentication/order security.
