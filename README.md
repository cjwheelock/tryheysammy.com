# Hey Sammy Website

Single-page marketing site for [tryheysammy.com](https://tryheysammy.com), built as a dependency-free static site for GitHub Pages.

## Local Preview

Open `index.html` in a browser, or run a tiny static server:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## GitHub Pages

1. Create a new GitHub repository for this site.
2. Push this project to the repository.
3. In GitHub, open `Settings` -> `Pages`.
4. Set the source to the default branch and root folder.
5. Keep the included `CNAME` file so GitHub Pages uses `tryheysammy.com`.

## Domain DNS

Point `tryheysammy.com` to GitHub Pages with the DNS records GitHub recommends for apex domains. Add a `www` CNAME if you also want `www.tryheysammy.com` to work.
