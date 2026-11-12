# Wei Yi Wong · Industrial Design Portfolio

A playful portfolio site in plain HTML, CSS and JavaScript. It has no frameworks and no build step.

## What's in here

| File / folder | What it is |
|---|---|
| `index.html` | **Home**: a tree made of flat green shapes (`js/tree.js`, `css/tree.css`). The 4 leaves with eyes are projects: hover or tap one to peek, click to open. Plain leaves fall off when clicked and grow back. |
| `index-worms.html` | The old worm home page, kept in case you want it back (rename it to `index.html`). |
| `projects.html` | **Projects** tab: a card for every project |
| `about.html` | **About me** tab: your photo, bio, education, experience, skills and contact, from your About me screenshots. Edit the text right in this file |
| `project.html` | One page that shows **any** project, e.g. `project.html?p=whiddi` |
| `whiddi.html` | Whiddi has its own hand-made page too, copied from your "Whiddi i want" screenshots. Edit its text and pictures right in this file |
| `fifi.html` | FIFI (the tooth fairy project) has its own hand-made page: your Squarespace layout in the dark, wormy style. Edit its text and pictures right in this file |
| `js/worm-deco.js` | The little googly-eyed worms beside the text. Add one anywhere with `<span class="deco-worm w-right"></span>` |
| `js/editor.js` and `js/layout.js` | Edit mode (see below) and your saved picture positions |
| `js/case.js` | Click-to-enlarge pictures and the "Next project" link on hand-made pages like `fifi.html` |
| `js/projects.js` | **All your project content**: titles, text, stages, photos and captions. Edit this file. |
| `js/nav.js` | The drop-down under **Projects** in the top bar. It lists every project in `js/projects.js` automatically. |
| `js/blobs.js` | The worms on the home page. Near the top, `THICK` sets how fat the worms are (1 = no gaps) |
| `js/project.js` | Process page: the path, stage panels, lightbox and before/after slider |
| `css/style.css` | Colours (dark page, grey blobs, one orange accent), fonts and wobbles. The colours are at the top under `:root` |
| `images-web/` | Web-sized copies of your photos (the site uses these) |
| `images/` | The apple cursor: `apple.svg`, `apple-bite.svg` over anything clickable, and `apple-bite2.svg` / `apple-core.svg` while a coloured worm is eating it |

Your original photo folders (`Whiddi Project 1`, etc.) and `reference photo/` are **not** used by the site. Don't upload them; they're large and the site doesn't need them.

## Preview on your computer

Double-clicking `index.html` works in most browsers. For the most accurate preview, open Terminal in this folder and run:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Edit text or photos

Open `js/projects.js` in any text editor (TextEdit in plain-text mode, or VS Code).

- **Change a sentence:** edit the text between the quotes. Any text starting with `Draft:` is a placeholder I wrote from your photos, so replace it with your own words.
- **Change a caption:** edit `caption: "..."` next to the photo.
- **Change the order of photos:** move whole `{ src: ..., caption: ... }` lines up or down.
- **Change the thumbnail crop:** `thumbFocus: "50% 30%"`. The first number moves left/right and the second moves up/down. The original photo is never cropped.

### Add a stage

Inside a project's `stages: [ ... ]`, add:

```js
{
  name: "Testing",
  notes: "What I did and what I learned.",
  images: [
    { src: "my-photo.jpg", caption: "What this photo shows." }
  ]
},
```

If a stage has no notes and no images, it shows as a dashed **"coming soon"** bubble.

Optional extras for a stage:
- `versions: true` labels the photos v1, v2, v3 and adds a version row.
- `compare: { before: "a.jpg", after: "b.jpg", beforeLabel: "foam", afterLabel: "wood" }` adds a before/after slider.

### Add a project

1. Make a folder such as `images-web/my-project/` and put web-sized photos in it. Aim for about 1600px wide and JPG. On a Mac you can resize with Preview → Tools → Adjust Size.
2. In `js/projects.js`, copy a whole project block (from `{ id:` to its closing `},`), paste it at the end of the list and change the details.
3. Use `status: "growing"` for something still in progress. It shows a sprout badge.

The new project automatically gets its own sparkly blob, a card in the project grid and its own page.

## Move and resize pictures yourself (edit mode)

Works on `fifi.html`, `about.html` and the project pages.

1. Open the page with `?edit` added to the end of the address:
   - `fifi.html?edit`
   - `about.html?edit`
   - `project.html?p=whiddi&edit` (or `p=vessel`, `p=dugong`)
2. Make the window wide (at least 900px). Edit mode only changes the laptop/desktop layout; phones keep the simple stacked layout.
3. Every picture has a **frame** (the box) and the **picture inside it**, like InDesign:
   - **Click** a picture to select its frame (orange outline). Drag it to move it. Drag any **corner** to make the box bigger or smaller; this crops or shows more of the picture. Hold **Shift** while dragging a corner to scale the box and picture together.
   - **Double-click** a picture (or press **Adjust picture inside**) to work on the picture inside the frame (white outline). Drag to slide it, and drag a corner or **scroll** to zoom in or out. **Fit picture** puts it back. Double-click again or press **Esc** to go back to the frame.
   - Arrow keys nudge whatever is selected (hold Shift for bigger steps). `+` and `-` make it bigger or smaller.
   - **Bring to front** puts it on top of anything it overlaps. **Reset picture** / **Reset all** undo your changes.
4. Click **Save layout**. A file called `layout.js` downloads. Put it in the `js` folder, replacing the old one (or ask Claude to), then upload `js/layout.js` to GitHub.
5. Click **Done** to leave edit mode.

Your moves are remembered in that browser while you work, even if you reload. They only show up for visitors once the new `js/layout.js` is uploaded.

## Publish for free with GitHub Pages

1. Make a free account at github.com.
2. Click **New repository**. Name it `yourusername.github.io` to get the address `https://yourusername.github.io`, or use any name such as `portfolio`. Make it **Public** and create it.
3. Click **uploading an existing file**. Drag these in:
   `index.html`, `index-worms.html`, `projects.html`, `about.html`, `project.html`, `fifi.html`, `whiddi.html`, `vessel.html`, `dugong.html`, `contact.html`, `README.md`, `css`, `js`, `images`, `images-web` (and `resume.pdf` once you add it)
   (Not the original photo folders.)
4. Click **Commit changes**.
5. Go to **Settings → Pages**. Under "Branch" choose `main` and `/ (root)`, then **Save**.
6. Wait a minute or two. Your site appears at the address shown on that page.

To update the site later, upload the changed file again, e.g. a new `js/projects.js`.

**Netlify alternative:** go to app.netlify.com/drop and drag a folder that contains only the files listed in step 3.

## Things still to fill in

- Your own text for every `Draft:` line in `js/projects.js`
- In `fifi.html`: your top-down hero render (look for the HERO IMAGE comment)
