# BookMeUp — Second-Hand Book Store

**Phase 1 (backend) and Phase 2 (client) are both done.** You now have a real MERN app: a
Vite/React frontend in `client/` that calls the Express/MongoDB backend in `server/` for
everything — no localStorage data, no dummy arrays. Your original single-file frontend is
preserved untouched in `client-legacy-reference/bookmeup.html` for comparison.

## What changed from the original frontend

The visual design, CSS, colors, and layout are all unchanged — `client/src/styles.css` is your
original stylesheet, extracted as-is. What changed:

- The single 5,300-line HTML file became a proper Vite project, split into one component per
  page/section (`client/src/pages/...`), matching the original's component boundaries almost
  1:1 (`BuyerHome`, `BuyerCategories`, `BuyerCart`, `SellerAddBook`, `AdminManageBooks`, etc.)
- Every place that used `localStorage` or hardcoded arrays now calls the real API instead
  (`client/src/api/*.js`).
- **Login/Register no longer take a role dropdown at login** — your role (buyer/seller/admin)
  is fixed on your account in the database, not chosen per session, since that's how real auth
  works. You still pick buyer or seller at registration.
- **A new OTP verification screen** was added after registration (styled to match the rest of
  the auth flow) because the backend emails a verification code on sign-up. Logging in doesn't
  require verification, so this doesn't block anyone — it's there so the OTP feature is actually
  reachable.
- **The "Switch to Seller/Admin" demo buttons are gone.** They worked in the original by rewriting
  your role in localStorage — that's not something a real account should allow. Create separate
  buyer/seller accounts (or use the seeded admin) to see each role's view.
- Checkout now has two real steps (address → payment) instead of the original's fake credit-card
  form; payment is Cash on Delivery or Razorpay (test mode) instead of a simulated card charge.

## Project structure

```
BookMeUp/
├── client/                          # Vite React app (talks to the API)
│   ├── index.html, vite.config.js, package.json
│   └── src/
│       ├── api/                     # fetch wrappers: auth, books, cart, orders, categories, misc
│       ├── context/AuthContext.jsx  # holds logged-in user + JWT
│       ├── pages/
│       │   ├── LoginView, RegisterView, VerifyOtpView
│       │   ├── buyer/               # Home, Categories, Cart, Orders, Profile, Panel (nav shell)
│       │   ├── seller/              # Dashboard, AddBook, MyBooks, Orders, Earnings, Profile, Panel
│       │   └── admin/               # Dashboard, ManageUsers, ManageBooks, ManageOrders, Payments, Panel
│       ├── components/StarRating.jsx
│       ├── App.jsx, main.jsx, styles.css
├── client-legacy-reference/
│   └── bookmeup.html                # Your original file, untouched, for comparison
├── server/
│   ├── package.json
│   ├── uploads/                     # Uploaded book/avatar images land here
│   └── src/
│       ├── server.js, config/db.js
│       ├── models/                  # User, Book, Category, Cart, Wishlist, Order, Review, Notification, Payment
│       ├── controllers/, routes/, middleware/, utils/
├── .env.example
├── .gitignore
└── README.md
```

## 1. Install prerequisites

- **Node.js** 18+ (`node -v` to check)
- **MongoDB** running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 2. MongoDB setup

**Local:**
```bash
# macOS (Homebrew)
brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb && sudo systemctl start mongod
```
Connection string: `mongodb://127.0.0.1:27017/bookmeup`

**Atlas (cloud, no local install):**
1. Create a free cluster at https://cloud.mongodb.com
2. Database Access → add a user + password
3. Network Access → allow your IP (or `0.0.0.0/0` for testing)
4. Copy the connection string, replace `<password>`, append `/bookmeup`

## 3. Environment variables

```bash
cp .env.example .env
```
Edit `.env` and fill in at minimum: `MONGO_URI`, `JWT_SECRET` (any long random string).
Email and Razorpay are optional for local testing — the server logs OTP emails to the console,
and the "Pay Online" option shows a clear error if Razorpay keys aren't set, instead of crashing.

## 4. Install & run the server

```bash
cd server
npm install
npm run seed   # creates default categories + an admin account (admin@bookmeup.com / Admin@12345)
npm run dev    # starts on http://localhost:5000
```
Check it's alive: `curl http://localhost:5000/api/health`

**⚠️ Change the seeded admin password immediately** before using this anywhere beyond your own machine.

## 5. Install & run the client

```bash
cd client
npm install
npm run dev    # starts on http://localhost:5173
```
Open http://localhost:5173. The dev server proxies `/api` and `/uploads` to `localhost:5000`
(see `vite.config.js`), so no CORS setup is needed locally.

**To try it out end-to-end:**
1. Register a **seller** account, verify the OTP (check the server console for the code if you
   haven't set up SMTP), then go to Add Book — submit a listing (it needs at least one image).
2. Log in as the seeded **admin** (`admin@bookmeup.com` / `Admin@12345`) → Manage Books → approve it.
3. Register a **buyer** account, browse Home/Categories, add the book to cart, and check out with
   Cash on Delivery (Razorpay needs real test keys in `.env` first).
4. Back in the buyer's Orders tab, download the invoice PDF.
5. As the seller, go to Orders and move it through shipped → delivered.

## API reference

| Area | Base path | Notes |
|---|---|---|
| Auth | `/api/auth` | register, verify-otp, resend-otp, login, me, forgot-password, reset-password/:token |
| Books | `/api/books` | CRUD, `?search=&category=&language=&condition=&publisher=&minPrice=&maxPrice=&sort=&page=&limit=&status=`, `/featured/list`, `/trending/list`, `/recent/list`, `/:id/approve`, `/:id/reject` |
| Categories | `/api/categories` | CRUD (admin write) |
| Cart | `/api/cart` | GET/POST/PUT/:bookId/DELETE |
| Wishlist | `/api/wishlist` | GET/POST/:bookId/DELETE |
| Orders | `/api/orders` | place (COD/Razorpay), my, seller/my, all (admin), :id, :id/status, :id/cancel, :id/return, :id/invoice (PDF) |
| Reviews | `/api/reviews` | GET/POST book/:bookId, PUT/DELETE :id |
| Payments | `/api/payments` | razorpay/create-order, razorpay/verify, my, all (admin), :id/refund |
| Notifications | `/api/notifications` | GET, :id/read, read-all, DELETE :id |
| Users | `/api/users` | profile, change-password, addresses CRUD, withdraw (seller) |
| Admin | `/api/admin` | users (list/toggle-active/verify-seller/delete), analytics, export/orders (CSV) |

All protected routes expect `Authorization: Bearer <token>` from the login/verify-otp response
(the client's `src/api/client.js` attaches this automatically from `localStorage`).

## Security included

JWT auth, bcrypt hashing, role-based route guards, Helmet, CORS locked to `CLIENT_URL`,
`express-mongo-sanitize` against NoSQL injection, and rate limiting (general + stricter on auth).

## What's left (Phase 3 — nice-to-haves, not required to run the store)

The core buy/sell/approve/pay/track loop above is fully wired. Not yet built:
Wishlist UI (API exists), reviews/ratings UI on the book detail page, notifications bell/dropdown,
dark mode, infinite scroll, coupons, wishlist sharing, and a dedicated book-detail page (the
frontend currently adds to cart straight from the grid, matching the original's flow). Tell me
which of these matters most to you and I'll build it the same way — real, tested, wired-up code.

## Deployment guide (brief)

- **Server:** Render / Railway / a VPS. Set all `.env` vars in the host's dashboard, point `MONGO_URI`
  at Atlas, set `CLIENT_URL` to your deployed frontend's origin.
- **Client:** `npm run build` produces a static `dist/` folder — deploy it to Netlify/Vercel, and
  set its API calls to point at your deployed server (swap the Vite proxy for an env-based base URL).
- **Uploads:** local disk storage (as configured) won't persist on most PaaS restarts/redeploys —
  swap to S3/Cloudinary before going to production with real users.

