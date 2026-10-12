# Natia Khitarishvili — portfolio (test version)

Static homepage built from the Figma file **Natia port - NEW › Final draft** (1440 × 6299).
Plain HTML + CSS, with no build step and no dependencies.

## View it

- Open `index.html` in a browser, **or**
- run a local server from this folder: `npx serve .` (or `python3 -m http.server`)

## Deploy

Any static host works. Upload or point it at this `portfolio/` folder:

- **Netlify**: drag the folder onto app.netlify.com/drop
- **Vercel**: import the repo and set the root directory to `portfolio`
- **GitHub Pages**: publish from a branch and serve this folder

## Structure

```
portfolio/
├── index.html          page markup
├── styles.css          all styles (desktop values = exact Figma measurements)
└── assets/
    ├── images/         project screenshots + portrait (WebP, 2× display size)
    ├── logos/          company logos (SVG; pubGENIUS is PNG, as in Figma)
    ├── icons/          contact icons (SVG)
    └── decor/          sparkle graphics (SVG)
```

All assets were extracted from the Figma SVG export. Photos are cropped to their exact Figma frames.

## Responsive

Figma only has a desktop frame. At 1440px the page matches Figma to within 1px.
Below that it scales down: card headers stack under 1100px, and screenshots stack into one column under 760px.

## Open items (copy/design kept exactly as in Figma until confirmed)

- Card 01 (Elva) uses the same description as card 02 (Theneo).
- The "Instagram" link points to a Facebook URL.
- SF Pro Display (contact row) can't be served as a web font. It is used where the system provides it (Apple devices); Inter is used everywhere else.
- The Feedc screenshot is 1.4× resolution, so it may look slightly soft on retina screens. A larger export would fix this.
- The pubGENIUS logo is a small PNG; an SVG would be sharper.
