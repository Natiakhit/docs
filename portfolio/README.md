# Natia Khitarishvili — portfolio (test version)

Static homepage built from the Figma file **Natia port - NEW › Final draft** (1440 × 6299).
Plain HTML, CSS and a small vanilla JS file, with no build step and no dependencies.

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
├── main.js             animations and interactions
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

## Motion & interactions (`main.js`)

- **Hero word** rolls vertically through *obvious → intuitive → natural → human → familiar*. The word sits in a fixed-width slot, so the rest of the sentence never moves. Edit the list in the `data-words` attribute in `index.html`, and keep new words about as wide as "obvious." so the line stays balanced.
- **Project cards** stack while scrolling: each card sticks near the top and the next one slides over it, while the one behind shrinks slightly and dims. Cards taller than the screen scroll fully into view first.
- **Sparkles** float or twinkle, spin on hover, and burst into small stars on click or tap.
- **Portrait** tilts slightly toward the mouse cursor, and its outline rotates on hover.
- **Page load and scroll**: the hero fades in in sequence; section titles and blocks fade up as they enter the screen.
- **Small hovers** on nav links (underline), screenshots (gentle zoom), and contact icons and arrows.

All motion is turned off for visitors who have "reduce motion" enabled. Without JavaScript, the page shows the static design.

## Open items

- The "Instagram" link points to a Facebook URL.
- SF Pro Display (contact row) can't be served as a web font. It is used where the system provides it (Apple devices); Inter is used everywhere else.
- The Feedc screenshot is 1.4× resolution, so it may look slightly soft on retina screens. A larger export would fix this.
- The pubGENIUS logo is a small PNG; an SVG would be sharper.
