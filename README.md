# G.I. Endoscopy Clinic — Ado-Ekiti

A responsive, single-page clinic website focused on patient information and appointment enquiries. It is built with semantic HTML, custom CSS and dependency-free JavaScript; there is no build step or server-side form handler.

## Run locally

From this directory, start any static web server. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Structure

- `index.html` — page content, SEO metadata, structured data and SVG icon sprite
- `assets/css/styles.css` — design system, layouts, responsive rules and reduced-motion/print styles
- `assets/js/main.js` — mobile navigation, scrollspy, FAQ accordion and appointment-request flow
- `assets/images/` — locally stored, compressed stock-photo placeholders

## Appointment form behavior

The form validates required fields in the browser and prepares an appointment message containing the submitted details. On submit, it opens WhatsApp addressed to the clinic; the confirmation panel also offers a retry link, call link and a prefilled email option. The form does **not** send data to this site, store it, or confirm an appointment. Patients must send the WhatsApp/email message and wait for the clinic to confirm availability. The clinic should review the wording and privacy notice before launch.

## Before publishing

- Replace `https://giendoscopyclinicadoekiti.com/` in the JSON-LD with the clinic's confirmed canonical website URL. Set `og:url`/canonical metadata when the final domain is known.
- Create a social-sharing image with an absolute URL and update the Open Graph and Twitter image metadata. The current relative image path is intended as a local placeholder.
- Replace stock photography with approved clinic, equipment and clinician photography. In particular, the endoscopy equipment placeholder shows PUSEN branding and must not be presented as the clinic's own equipment.
- Confirm the exact clinic address, contact details, services, procedure/preparation language, credentials and privacy wording with the clinic team.
- The embedded map currently searches for State Housing Estate, Off Afao Road, Ado-Ekiti. Verify that this pin and the directions link lead to the clinic entrance before launch.
- Test the booking handoff on supported mobile devices, where WhatsApp may open as an app, and check the email fallback in a configured mail client.

## Image credits

The current images are stock-photo placeholders sourced from the free-use libraries below. The relevant license terms should be reviewed at the time of publication; clinic-identifying use and implied endorsements should be avoided.

- `hero-doctor.jpg` — Pexels, photo ID `31842729` (<https://www.pexels.com/>; Pexels License: <https://www.pexels.com/license/>).
- `consultation.jpg` — Pexels, photo ID `7578803` (<https://www.pexels.com/>; Pexels License: <https://www.pexels.com/license/>).
- `endoscopy-suite.jpg` — Unsplash, photo ID `82GMjgM7qjA` (<https://unsplash.com/>; Unsplash License: <https://unsplash.com/license>).
