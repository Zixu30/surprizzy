SURPRIZZY — GITHUB-ONLY VERSION

What changed
- Firebase removed completely.
- Product catalog is stored in products.json in your GitHub repository.
- Admin can add/edit/delete products from the website and commit changes directly to GitHub.
- Product images are uploaded to the GitHub repository under /products/.
- Product prices, categories and descriptions are stored in products.json.
- UPI ID: 9326567293@omni
- UPI QR: upi-scanner.jpg
- WhatsApp ordering: +58 426-7084400 (wa.me/584267084400)
- COD and UPI checkout prepare an order message and open WhatsApp.
- COD status is shown as Order Confirmed; UPI status is shown as Order is under process.

IMPORTANT GITHUB ADMIN SETUP
1. Create a public GitHub repository and upload ALL files from this ZIP.
2. Keep index.html at the repository root.
3. Keep products.json at the repository root.
4. Keep upi-scanner.jpg at the repository root.
5. Turn on GitHub Pages: Settings > Pages > Deploy from a branch > main > /(root).
6. Create a GitHub fine-grained Personal Access Token for ONLY this repository.
   Required repository permission: Contents = Read and write.
   Metadata is automatically read-only.
7. Open your live site > Admin.
8. Admin number: 8369860594 (local gate only).
9. Enter any local admin password you choose; this password is only a browser gate and is NOT GitHub security.
10. In Admin > Products, enter GitHub Owner, Repository, Branch (main) and your token.
11. Tap Connect & refresh.
12. Add a product: name, price, category, image and description. The website commits the image and products.json directly to GitHub.

SECURITY NOTE
GitHub Pages is static. A browser cannot safely hold a server-side secret. The GitHub token is stored only in the browser localStorage and is used to call the GitHub Contents API. Never put the token into HTML/JS files or share it publicly. If the device is shared, log out and revoke the token when no longer needed.

ORDERS
Because this version has no backend/database, customer orders are sent directly to WhatsApp. This is intentional. GitHub-only cannot securely provide a shared live order database for anonymous customers.
