# Taran Hari – Backend & Admin (setup guide)

Admin panel: `https://YOUR-SITE/admin`  ·  Local password: `admin123`

## Put it live on Vercel
1. Replace the contents of your repo's `my-react-app` folder with this ZIP's files, then commit and push to GitHub.
2. Vercel -> your project -> Settings -> General -> **Root Directory = `my-react-app`**.
3. Vercel -> Storage -> Create **Upstash Redis (free)** -> connect it to the project (all environments).
4. Settings -> Environment Variables (Production + Preview):
   - `ADMIN_PASSWORD` = your admin password
   - `ADMIN_SECRET` = any long random text (32+ characters)
5. Redeploy. Open `/api/health` – it must say `"storage":"redis"`. Then open `/admin` and sign in.

## Run on your computer
```
npm install
npm run dev:all      # website + backend together
```
Website http://localhost:5173 · Admin http://localhost:5173/admin · password `admin123`

## What the admin can do
Dashboard · Orders (status, print 80 mm slip / A4 invoice) · Billing (counter POS) · Customers · Products (sizes, price, MRP, stock, photo by URL or upload)
Stock (quick +/- and history) · Categories · Coupons · Offers & sales · Home / Shop / Contact page editors · Settings (delivery, GST, invoice, password, backup/restore)

Product photos: either upload in the admin, or put files in `public/images/products/`.
