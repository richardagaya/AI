# Drop your images & videos here

This folder is the home for all site media.

## How to replace any image or video on the site

1. Copy your file into this folder (e.g. `my-clip.mp4` or `my-art.jpg`)
2. Open **`src/lib/media.ts`** — the only file you ever need to edit
3. Find the slot you want to replace and change its `src` to
   `"/media/my-clip.mp4"` (the path always starts with `/media/`)
4. Save. The site updates instantly.

## Tips

- Videos: use `.mp4` (720p is plenty — they play as backgrounds/tiles).
  Add a `poster: "/media/my-clip-poster.jpg"` for the loading frame.
- Images: `.jpg`, `.png` or `.webp` all work.
- You can also paste any `https://` URL instead of a local file.
- Each slot in `media.ts` is commented with where it appears on the site.
