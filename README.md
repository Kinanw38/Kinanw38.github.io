# Ron Keinan: portfolio

Live: https://kinanw38.github.io/

Plain HTML, CSS and JS. No build step, no dependencies, no external requests (fonts are included).

## Update a project

All content (both Hebrew and English) is in `js/data.js`.

- Edit a text, link or tag: open `js/data.js` on GitHub, click the pencil, change it, Commit.
- Add a project: copy one of the smaller entries in `window.PROJECTS` (the ones without `featured: true`) and edit it.
- Images: put compressed `.webp` files in `img/` and point to them from `data.js`.

## Preview locally

    python3 -m http.server 8000

Then open http://localhost:8000
