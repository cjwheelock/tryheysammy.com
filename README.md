# Hey Sammy Landing Page

Standalone static marketing site for Hey Sammy. This is intentionally separate from the mobile app repository.

## View locally

```bash
cd /Users/cjwheelock/hey-sammy-landing
python3 -m http.server 4174
```

Then open:

```text
http://localhost:4174
```

## Files

- `index.html` - page structure and copy
- `styles.css` - responsive landing page design
- `script.js` - lightweight reveal animations
- `assets/` - local Sammy images, generated lifestyle image, App Store badge SVG
- `admin/index.html` - static bridge login for `/admin`
- `blog/` - published static blog pages

## Source and deployment

The editable source folder on CJ's machine is:

```text
/Users/cjwheelock/hey-sammy-landing
```

The source folder contains a helper script that syncs the landing page, admin
bridge, assets, and published blog pages into this GitHub Pages repo:

```bash
cd /Users/cjwheelock/hey-sammy-landing
./scripts/deploy-to-tryheysammy-repo.sh
```

Publish from the source folder:

```bash
cd /Users/cjwheelock/hey-sammy-landing
./scripts/deploy-to-tryheysammy-repo.sh --push "Update landing page"
```

Draft markdown files under `blog/drafts/` are intentionally excluded from deploy.
