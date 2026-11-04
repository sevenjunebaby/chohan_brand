# Chohan Brand Commercial Website

A frontend-only React and Vite catalog site. It supports browsing/searching/filtering catalog data when verified products are added, and directs customers to call the business manager. It has no cart, checkout, payment collection, or order submission.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; preview it with `npm run preview`.

## Catalog data and image import

The product media directory contains **4,692 images** across 15 top-level categories, matching the catalog entries. Byte-identical duplicate copies, five category mismatches, and the product videos were removed from `public/images/products`. No categories are empty.

| Category folder | Image entries |
| --- | ---: |
| Backpacks | 41 |
| Bags | 2,476 |
| Belt Bags | 19 |
| Belts | 178 |
| Caps | 50 |
| Coats | 160 |
| Footwear | 928 |
| Hats | 87 |
| Jewelry | 164 |
| Scarfs | 91 |
| Summer Wearing | 8 |
| Sunglasses | 84 |
| T-Shirts | 103 |
| Wallets | 132 |
| Watches | 171 |

`src/data/products.json` and `src/data/categories.js` are generated catalog files. Product IDs are deterministic for a sorted set of paths within each category; adding a file may shift the numbered IDs later in the sort order. Product names use neutral category/item labels because filenames contain unverified luxury brand and model claims. The generator does not infer brands from nested folder names, and every price is `null` so the site displays “Contact for pricing”. No specifications or inventory quantities are added. The original files remain the image source; the UI uses URL-encoded local paths and fetches catalog JSON as a separate static asset. Product images use lazy loading and an artwork fallback. The catalog shows 48 items per page to keep the large collection manageable.

### Add products later

1. Add supported image files (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`, `.bmp`, `.tif`, or `.tiff`) inside a top-level category folder under `public/images/products/`. Create a new top-level folder for a new category. Nested folders are allowed but are not interpreted as brands.
2. Run `npm run catalog:generate` to rebuild the product and category data from the files on disk.
3. Run `npm run catalog:verify` to confirm IDs are unique, prices remain unverified, names contain no brand claims, and every local image path resolves.
4. Review `src/data/products.json` and run `npm run build`.

The generator excludes videos and other non-image files, deduplicates exact file-content copies, and skips the five reviewed mismatched source paths listed above. It sets prices to `null` and doesn’t infer product brands, specs, or stock from filenames or nested folder names. To add a real price or source-supported details, edit the generated product record after verifying that information. Do not edit generated names manually; change the generator only when a name can be supported by verified data.

The supplied Linktree was not accessible during the earlier remote import attempt (HTTP 403), so its live Google Drive folders and any additional categories were not verified. The local images provided in this workspace are the catalog source of truth for this import.

## Deployment

The production command is `npm run build`; the static output is `dist/`. It prunes unreferenced duplicates, category mismatches, and videos from the generated output without altering source files. No server or environment variables are required. The current source collection is about **1.95 GB**; the latest build output is about **650 MB** and contains only the 4,692 catalog images plus the app and data (0 files over 10 MiB). This is a substantial static asset deployment: Vercel's documented CLI static source upload limit is 100 MB on Hobby and 1 GB on Pro, so deploying this full source directory directly with Vercel CLI will exceed those limits. The Vercel CLI archive option does not materially shrink photographic assets. Netlify documents that individual files over 10 MB are not well supported by its CDN; no files in the current pruned output exceed that size, though the overall transfer can still take a long time. Review [Vercel limits](https://vercel.com/docs/limits) and [Netlify large-file guidance](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/#large-files-or-sites) before publishing. Optimize images further or host them separately if transfer time, storage, or CDN cost is unsuitable.

### Vercel CLI

From the project directory, install dependencies and link the project once:

```sh
npm install
npm run build
npx vercel link
```

For a preview deployment and then a production deployment:

```sh
npx vercel deploy --archive=tgz
npx vercel deploy --prod --archive=tgz
```

Vercel will prompt for account/project setup as needed. The archive option is useful for deployments with many files, but does not shrink the source repository enough to meet the current Vercel CLI upload limits.

### Netlify CLI

From the project directory, authenticate and create or link a Netlify site once:

```sh
npm install
npm run build
npx netlify-cli login
npx netlify-cli init
```

Upload the existing static build as a draft, then promote a reviewed build to production:

```sh
npx netlify-cli deploy --dir=dist --no-build
npx netlify-cli deploy --dir=dist --no-build --prod
```

These commands publish the existing `dist` output; the production command changes the live site. No deployment has been run as part of this audit. After choosing a production domain, set `og:url` and make the Open Graph image URL absolute in `index.html`.

## Business information shown

- Customer contact: **+92 371 6711308** (click-to-call).
- Advertised delivery inquiry destinations: Europe, Australia, United States, United Kingdom. The specific country, shipping eligibility, customs, cost, and estimated timing require confirmation.
- Payment arrangements are confirmed with the manager. Bank transfer or an agreed online method may be available. PayPal is not represented as integrated or confirmed; its official site is a reference link only.
- No email, street address, social account, certification, partnership, testimonial, inventory promise, or guaranteed delivery claim is invented.
