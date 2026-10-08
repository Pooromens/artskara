"""Build the language versions and SEO tags of the site.

index.html is the English source. Running this script:
  - rewrites the SEO block in index.html (description, preview tags,
    hreflang links, structured data), and
  - generates ru/index.html and ro/index.html with the text already
    translated, so search engines can read every language.

Translations come from script.js. Run after any change to index.html or
to the translations:   python build.py
"""

import html
import io
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent
SITE = "https://www.artskara.com"
LANGS = {"en": "/", "ru": "/ru/", "ro": "/ro/"}
LOCALES = {"en": "en_US", "ru": "ru_RU", "ro": "ro_RO"}

META = {
    "en": {
        "title": "Irina Kara — Original Paintings for Sale, Chișinău, Moldova",
        "description": "Buy original oil and acrylic paintings by Irina Kara, "
        "a contemporary painter from Chișinău, Moldova. Buy directly from the "
        "artist, order a commission, or get worldwide delivery.",
    },
    "ru": {
        "title": "Купить картины в Кишинёве — Ирина Кара, современная живопись",
        "description": "Купить оригинальные картины маслом и акрилом в Кишинёве: "
        "работы современной художницы Ирины Кара. Покупка напрямую у художницы, "
        "картины на заказ, доставка по Молдове и всему миру.",
    },
    "ro": {
        "title": "Tablouri de vânzare în Chișinău — Irina Kara, pictură contemporană",
        "description": "Cumpără tablouri originale în ulei și acrilic în Chișinău: "
        "lucrări ale pictoriței contemporane Irina Kara. Direct de la artistă, "
        "tablouri la comandă, livrare în Moldova și în toată lumea.",
    },
}

SAME_AS = [
    "https://www.instagram.com/artskara/",
    "https://www.facebook.com/ArtsKara",
    "https://www.saatchiart.com/account/profile/97227",
]


def load_translations():
    """Evaluate the translations object from script.js with node."""
    code = (ROOT / "script.js").read_text(encoding="utf-8")
    start = code.index("const translations")
    end = code.index("const SUPPORTED_LANGS")
    js = code[start:end] + "\nprocess.stdout.write(JSON.stringify(translations));"
    out = subprocess.run(["node", "-e", js], capture_output=True, check=True)
    return json.loads(out.stdout.decode("utf-8"))


def artworks(source):
    """Paintings from the carousel: title, image, medium, size."""
    works = []
    cards = re.findall(r'<img class="zoomable" src="([^"]+)" alt="([^"]+)"', source)
    for src, alt in cards:
        # alt reads "Title, medium, 85 × 110 cm"
        m = re.match(r"(.+?), ((?:oil|acrylic)[^,]*(?:, diptych)?), (\d+) × (\d+) cm$", html.unescape(alt))
        if not m:
            continue
        title, medium, w, h = m.groups()
        works.append(
            {
                "@type": "VisualArtwork",
                "name": title,
                "image": f"{SITE}/{src}",
                "artform": "Painting",
                "artMedium": medium.capitalize(),
                "width": {"@type": "Distance", "name": f"{w} cm"},
                "height": {"@type": "Distance", "name": f"{h} cm"},
                "creator": {"@id": f"{SITE}/#irina"},
            }
        )
    return works


def seo_block(lang, works):
    meta = META[lang]
    url = SITE + LANGS[lang]
    tags = [
        f'<meta name="description" content="{html.escape(meta["description"])}">',
        f'<link rel="canonical" href="{url}">',
    ]
    for code, path in LANGS.items():
        tags.append(f'<link rel="alternate" hreflang="{code}" href="{SITE}{path}">')
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{SITE}/">')
    tags += [
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Irina Kara">',
        f'<meta property="og:title" content="{html.escape(meta["title"])}">',
        f'<meta property="og:description" content="{html.escape(meta["description"])}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{SITE}/og-image.jpg">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:locale" content="{LOCALES[lang]}">',
    ]
    for code in LANGS:
        if code != lang:
            tags.append(f'<meta property="og:locale:alternate" content="{LOCALES[code]}">')
    tags.append('<meta name="twitter:card" content="summary_large_image">')

    data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": f"{SITE}/#irina",
                "name": "Irina Kara",
                "alternateName": ["Ирина Кара"],
                "jobTitle": "Painter",
                "description": META["en"]["description"],
                "image": f"{SITE}/images/artist-avatar.jpg",
                "url": f"{SITE}/",
                "email": "mailto:artskara@gmail.com",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Chișinău",
                    "addressCountry": "MD",
                },
                "sameAs": SAME_AS,
            },
            {
                "@type": "WebSite",
                "@id": f"{SITE}/#website",
                "url": f"{SITE}/",
                "name": "Irina Kara",
                "inLanguage": list(LANGS),
                "about": {"@id": f"{SITE}/#irina"},
            },
            *works,
        ],
    }
    tags.append(
        '<script type="application/ld+json">\n'
        + json.dumps(data, ensure_ascii=False, indent=2)
        + "\n</script>"
    )
    return "<!-- seo:start (generated by build.py) -->\n" + "\n".join(tags) + "\n<!-- seo:end -->"


def with_seo(page, lang, works):
    page = re.sub(r"<title>.*?</title>", f"<title>{html.escape(META[lang]['title'])}</title>", page, count=1)
    block = seo_block(lang, works)
    if "<!-- seo:start" in page:
        return re.sub(r"<!-- seo:start.*?<!-- seo:end -->", lambda _: block, page, count=1, flags=re.S)
    return page.replace("</title>\n", "</title>\n" + block + "\n", 1)


def translate(page, strings):
    def swap(m):
        key = m.group(2)
        if key not in strings:
            return m.group(0)
        return m.group(1) + html.escape(strings[key], quote=False) + "<"

    return re.sub(r'(data-i18n="([^"]+)"[^>]*>)[^<]*<', swap, page)


def nested(page):
    """Point relative asset paths one level up, for pages in /ru/ and /ro/."""
    return re.sub(
        r'(\s(?:src|href)=")(?!https?:|/|#|mailto:|data:|")',
        r"\1../",
        page,
    )


def main():
    source = (ROOT / "index.html").read_text(encoding="utf-8")
    strings = load_translations()
    works = artworks(source)

    en = with_seo(source, "en", works)
    io.open(ROOT / "index.html", "w", encoding="utf-8", newline="").write(en)

    for lang in ("ru", "ro"):
        page = with_seo(en, lang, works)
        page = page.replace('<html lang="en" data-page-lang="en">', f'<html lang="{lang}" data-page-lang="{lang}">', 1)
        page = translate(page, strings[lang])
        page = nested(page)
        out = ROOT / lang / "index.html"
        out.parent.mkdir(exist_ok=True)
        page = page.replace(
            "<!DOCTYPE html>\n",
            "<!DOCTYPE html>\n<!-- Generated by build.py from index.html. Do not edit by hand. -->\n",
            1,
        )
        io.open(out, "w", encoding="utf-8", newline="").write(page)

    print(f"built en, ru, ro with {len(works)} artworks in structured data")


if __name__ == "__main__":
    main()
