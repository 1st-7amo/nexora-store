# NEXORA — GitHub Pages Edition

A static HTML, CSS, and JavaScript version of the NEXORA Tibia scripts marketplace. No Python, Flask, server, or build step is required.

## Publish on GitHub Pages

1. Create a new GitHub repository (for example `nexora-store`).
2. Upload **all files and folders from this ZIP** to the repository's root. `index.html` must be in the root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for GitHub Pages to publish the site. The Pages settings screen will show the public URL.

For a custom domain such as `nexora.io`, buy/register the domain with a registrar, add it in **Settings → Pages → Custom domain**, then configure the DNS records requested by GitHub. Enable **Enforce HTTPS** after DNS verification.

## Features

- Responsive NEXORA storefront.
- Owner dashboard to add, edit, delete, and sort scripts.
- GIF preview URL, price, and display order fields.
- Single-step WhatsApp ordering with the selected script name and price prefilled.
- NEXORA value-proposition section with a direct link back to the script collection.
- NEXORA artwork included in `assets/`.

## Important limitations of a static GitHub Pages site

GitHub Pages only hosts static files. This version stores products in the current browser's `localStorage`.

**Products added in the owner dashboard are visible only in that same browser on that same device.** They do not sync to other visitors, browsers, or devices. Clearing browser storage also removes the locally saved products.

The dashboard PIN is only a convenience lock for the local interface. It is not secure authentication: the website's JavaScript is public, and a visitor can inspect or change browser storage. Do not store secrets, payment details, or private customer data here.

To make owner-added products sync to every visitor while keeping GitHub Pages, connect a hosted database/backend service (for example Supabase) and enforce owner permissions there. Do not put private API service-role keys in frontend JavaScript.

## Contact settings

Edit the constants at the top of `app.js`:

- `WHATSAPP_NUMBER`

## Files

- `index.html` — storefront and owner dashboard markup
- `styles.css` — responsive visual design
- `app.js` — storefront, local product storage, dashboard, and order actions
- `assets/nexora-banner.png` — generated NEXORA banner artwork
- `assets/nexora-logo.png` — cropped NEXORA wordmark artwork
