# Naše Dete — Dashboard Aplikacija

Mobilna PWA aplikacija za praćenje Shopify prodaje, AI preporuke igračaka i Facebook reklame.

---

## Instalacija (10 minuta)

### Korak 1 — Shopify API ključ

1. Idi na: https://nasedete.myshopify.com/admin/settings/apps
2. Klikni **"Develop apps"** → **"Create an app"**
3. Naziv: `Nase Dete Dashboard`
4. Klikni **"Configure Admin API scopes"** i uključi:
   - `read_orders`
   - `read_products`  
   - `read_analytics`
5. Klikni **"Install app"**
6. Kopiraj **Admin API access token** (počinje sa `shpat_...`)

### Korak 2 — Anthropic API ključ (za AI preporuke)

1. Idi na: https://console.anthropic.com/settings/keys
2. Klikni **"Create Key"**
3. Kopiraj ključ (počinje sa `sk-ant-...`)

### Korak 3 — Postavljanje na Vercel

1. Idi na https://github.com i napravi nalog (ako nemaš)
2. Napravi novi repozitorij: **"New repository"** → naziv: `nase-dete-dashboard`
3. Upload sve fajlove iz ovog foldera
4. Idi na https://vercel.com → **"Add New Project"** → poveži GitHub repozitorij
5. Pre deploy-a, dodaj **Environment Variables**:

```
SHOPIFY_SHOP_DOMAIN = qxavn0-ca.myshopify.com
SHOPIFY_ACCESS_TOKEN = shpat_TVOJ_TOKEN_OVDE
ANTHROPIC_API_KEY = sk-ant-TVOJ_KLJUC_OVDE
```

6. Klikni **Deploy** → za 2 minuta dobiješ link

### Korak 4 — Instalacija na telefon

**Android (Chrome):**
1. Otvori Vercel link u Chrome-u
2. Klikni tri tačke (meni) → **"Dodaj na početni ekran"**
3. Imenuj "Naše Dete" → Dodaj

**iPhone (Safari):**
1. Otvori Vercel link u Safari-ju
2. Klikni ikonicu deljenja (kvadrat sa strelicom) 
3. **"Dodaj na početni ekran"** → Dodaj

---

## Funkcionalnosti

- **Prodaja** — pravi Shopify podaci, periodi: danas/7d/30d/6m/godina
- **Igračke** — AI preporuke 3 igračke dnevno dostupne u Srbiji
- **Facebook** — AI sugestije za reklame bazirane na tvojim prodajama
- **Ad Library** — praćenje konkurentskih oglasa 30+ dana

---

## Struktura projekta

```
pages/
  index.js          — glavna aplikacija
  api/
    sales.js        — Shopify prodajni podaci
    toys.js         — AI preporuke igračaka
    fb-suggestions.js — AI Facebook sugestije
styles/
  globals.css       — svi stilovi
public/
  manifest.json     — PWA konfiguracija
```
