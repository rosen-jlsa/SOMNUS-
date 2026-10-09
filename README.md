# SOMNUS — Shopify Product Page Concept

A calm, responsive Shopify product-page concept for a fictional wellness brand. This is a **portfolio project**, not a live supplement or a claim about sleep or health outcomes.

![SOMNUS editorial hero](assets/somnus-hero.png)

## What I built

- An Online Store 2.0 product section in Liquid, with editable copy and image settings.
- A JSON product template that can be assigned to a test product.
- An atmospheric, mobile-friendly page with original concept imagery and a Shopify product form for real product data, variants and cart actions.
- A static [browser preview](preview/index.html) for visual review without a Shopify store.

The work is aligned with clean landing pages, responsive design and Shopify theme customization. AI-assisted tools helped with image creation and implementation; the concept, layout, editing and integration were reviewed as a portfolio exercise.

## Preview locally

From the repository root, run `python -m http.server 8765` and open `http://localhost:8765/preview/`. The preview is visual only; pricing, inventory and cart actions work through Shopify after the template is assigned to a product.

## Add to an unpublished Shopify theme

1. Copy `assets/concept-page.css`, the three `assets/somnus-*.png` images, `sections/somnus-concept-product.liquid`, and `templates/product.somnus-concept.json` to the same paths in the theme.
2. Assign the `somnus-concept` template to a **test product** in Shopify Admin.
3. Use the unpublished theme editor to adjust copy and optionally select new images.
4. Preview desktop and mobile. Check product details, variants, price, cart behavior and any regulatory claims before commercial use.

The concept imagery uses generic packaging. Replace it with approved product photography for a real product. The Liquid page does not include fabricated reviews, certificates, ingredient effects or health claims.

## Files

| Path | Purpose |
| --- | --- |
| `sections/somnus-concept-product.liquid` | Shopify section and product form |
| `templates/product.somnus-concept.json` | Online Store 2.0 product template |
| `assets/concept-page.css` | Responsive visual system |
| `assets/somnus-hero.png`, `assets/somnus-detail.png`, `assets/somnus-product.png` | AI-generated concept imagery |
| `preview/index.html` | Standalone visual preview |
| `src/` | Earlier React/Vite prototype, retained as project history |

## Concept image prompts

- Hero: generic amber bottle beside linen and travertine at dusk, warm, minimal, no text or logo.
- Detail: quiet bedroom at blue hour with soft linen and warm lamp light, no people or product claims.
- Product: generic dark amber bottle on travertine, muted sage studio setting, no label or claims.

The images were created with the built-in image generation tool and saved in `assets/` for this project.
