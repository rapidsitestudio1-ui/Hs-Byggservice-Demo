# HS Byggservice — webbplats

Statisk ensidig webbplats byggd i ren HTML, CSS och JavaScript. Inga ramverk, inga
körtidsberoenden och inget byggsteg — mappen kan publiceras som den är.

## Innehåll

```
index.html              All markup (en sida, ankarnavigering)
css/style.css           Designsystem + all styling
js/main.js              Meny, flikar, dragspel, karuseller, före/efter-reglage
assets/img/             Optimerade bilder (AVIF + WebP + JPEG)
assets/fonts/           Poppins 300/600/700, latinsk delmängd (woff2)
favicon.svg             Ikon
apple-touch-icon.png    Ikon för iOS
robots.txt              Indexering
sitemap.xml             Webbplatskarta
netlify.toml            Publiceringsinställningar och cache-headers
scripts/optimize-images.mjs   Bildpipeline (körs bara vid behov, se nedan)
scripts/serve.mjs             Minimal lokal server för granskning
```

## Kör lokalt

```bash
npm run serve        # http://localhost:4173
```

Alla sökvägar är relativa, så du kan också bara dubbelklicka på `index.html` och
öppna den direkt i webbläsaren — den renderas fullständigt utan server.
`npm install` behövs bara om du ska generera om bilderna.

## Publicera

Netlify (eller motsvarande statisk hosting):

- **Publish directory:** `.`
- **Build command:** tomt

`netlify.toml` sätter cache-headers (bilder och typsnitt ett år, CSS/JS en vecka)
och grundläggande säkerhetsheaders. Slå gärna på Netlifys *Asset optimization*
för automatisk minifiering av CSS och JS — koden ligger avsiktligt ominifierad
i repot för att vara läsbar.

`design/` och `node_modules/` är undantagna via `.gitignore` och följer inte med
i en Git-baserad publicering.

## Bildpipeline

Originalbilderna ligger utanför repot (i `design/assets/`, ej versionshanterade).
För att generera om bilderna:

```bash
npm install
npm run images
```

Skriptet skriver AVIF, WebP och JPEG i alla nödvändiga bredder till `assets/img/`.
Justera listan `JOBS` i `scripts/optimize-images.mjs` när bilder byts ut.

## Designsystem

Färger, typografi och mått är hämtade från Figma-underlaget och ligger som
CSS-variabler överst i `css/style.css`.

Accentfärgen är orange. Den bär CTA:er, ikoner, länkar, hovringar, dekorlinjer
och små grafiska detaljer — allt annat är neutralt (vitt, off-white, grått,
koltonat mörkt). Vill du byta accent räcker det att ändra `--accent` och de
fyra nyanserna under den; ingen komponent har hårdkodad orange.

| Token | Värde | Används till |
|---|---|---|
| `--accent` | `#f5641e` | Primär accent: ikoner, dekorlinjer, ifyllda märken, fokusring på mörkt |
| `--accent-strong` | `#cb4909` | Knappytor, FAQ-flikar, löptextens list, fokusring på ljust (vit text 4,67:1) |
| `--accent-deep` | `#a63b07` | Knapphovring + accent som text: etiketter, aktiv meny (6,46:1 mot vitt, 4,63:1 mot `--mist`) |
| `--accent-light` | `#ff8a4c` | Accent som text på mörk botten (6,57:1 mot `--dark`) |
| `--accent-soft` | `#fde8dc` | Svag orange yta: ikoncirklar i arbetsgång och "varför oss" |
| `--accent-tint` | `#fdf7f3` | Mycket svag orange bakgrund: öppet dragspel |
| `--dark` | `#23252a` | Hero, omdömen, kontakt, sidfot |
| `--dark-panel` | `#2c2f35` | Formulärpanelen inuti den mörka sektionen |
| `--ink` | `#242422` | Rubriker |
| `--body` | `#505050` | Brödtext |
| `--mist` | `#dddad5` | Bakgrund i före/efter-sektionen |
| `--pill` | `#e7e4df` | Neutral platshållaryta bakom tjänstekortens bilder |

Innehållsbredd 1280 px, kolumnavstånd 28,8 px, hörnradie 30 px, sektionsavstånd
100 px — samtliga direkt från Figma.

**Avvikelser från Figma, med anledning:**

- **Accenten är orange, inte Figmas salvia/sand.** `#f5641e` ger bara 3,12:1
  mot vitt och duger därför till ikoner och dekor (kravet är 3:1) men inte till
  text eller knapptext. Därför finns `--accent-strong` för knappytor och
  `--accent-deep` för accent som text — samma uppdelning som underlaget hade
  för salvia. Grundvärdet `#f5641e` används oförändrat där kontrastkravet är 3:1.
- **Mörka ytor är koltonade, inte gröna.** Hero, omdömen, kontakt och sidfot
  använder `--dark` `#23252a` så att orange blir webbplatsens enda varumärkesfärg.
  `--mist` och `--pill` är av samma skäl varmt neutrala i stället för olivtonade.
- Löptextens list använder `--accent-strong` och växlar mellan vit och mörk
  text i stället för vit och genomskinlig vit. Den ursprungliga tonningen gav
  1,7:1 och var oläsbar. Den djupare orangen valdes framför `--accent` så att
  bandet läser premium snarare än skrikigt över full bredd.
- Menypunkten "Pages" är ersatt med "Om oss" och rullgardinspilarna är borttagna,
  eftersom webbplatsen är en sida med ankarnavigering.
- Nyckeltalsraden i hero visar tjänstelöften i stället för siffror. Se nedan.
- Accenten finns i en ljusare nyans för mörk botten. `--accent-light`
  `#ff8a4c` ger 6,57:1 mot `--dark`, så etiketter på mörk botten använder den.
- **Kantiga hörn:** alla knappar och knappliknande ytor (huvud-CTA, FAQ-flikar,
  dragspel, karusellknappar, formulärfält och skicka-knapp) samt projektkorten
  har raka hörn, enligt önskemål om att följa hero-knappens form. Bildkort,
  om-oss-bilderna och före/efter-rutan behåller Figmas 30 px radie. Vill du att
  även de blir kantiga är det en rad i `css/style.css` (`--radius: 0`).
- **Projektkorten** är ca 6 % mindre än en full tredjedel (`* .94` i
  `.projects`), vilket också gör att nästa kort tittar fram i kanten och visar
  att karusellen går att bläddra i.
- **Nyckeltalen i hero döljs under 768 px.** Hero blir kortare och mer fokuserad
  på mobil; från surfplatta och uppåt visas raden som i Figma.

## Företagsuppgifter på sidan

| Uppgift | Värde |
|---|---|
| Företag | HS Byggservice |
| Ort / område | Malmö, arbetar i hela Skåne |
| Telefon | 072 861 61 87 (`tel:+46728616187`) |
| E-post | HSbyggservice@hotmail.com |

Uppgifterna finns på fem ställen i `index.html`: kontaktsektionen, texten under
offertformuläret, sidfotens kontaktkolumn, sidfotens nedre rad och JSON-LD-
blocket längst ned. Telefonnumret och e-postadressen upprepas dessutom i
felmeddelandet i `js/main.js`. Ändras något ska alla uppdateras.

## Förtroenderaden

Ligger direkt under hero (`<section class="trust">`) och visar:

| Värde | Etikett |
|---|---|
| 4,4 / 5 | i betyg på ServiceFinder |
| 61 | kundomdömen |
| 130+ | slutförda jobb |

Källan anges i klartext under raden: *"Betyg, omdömen och antal slutförda jobb
kommer från vår profil på ServiceFinder."* Siffrorna får **inte** presenteras som
Google-omdömen. Faktiskt antal jobb är 131 — "130+" används för att siffran ska
hålla över tid.

Betyget ligger medvetet **inte** i JSON-LD som `aggregateRating`. Google vill att
sådan markup avser recensioner sajtägaren själv samlat in, och ett tredjeparts-
betyg i egen markup riskerar att räknas som otillåtet. Betyget visas därför bara
visuellt, med tydlig källa.

## Att göra före lansering

### 1. Domän (obligatoriskt)

`https://www.hsbyggservice.se/` används som platshållare i `canonical`,
Open Graph, `robots.txt`, `sitemap.xml` och JSON-LD. Byt till den riktiga
domänen innan publicering.

### 2. Projektbilder och före/efter

Bilderna kommer från designunderlaget och föreställer **inte** HS Byggservices
egna arbeten. Texten är formulerad därefter ("Exempel på vad vi utför") och gör
inga anspråk på att bilderna är egna projekt. Byt gärna mot egna foton när de
finns — texten behöver då inte ändras.

Före/efter-reglaget visar dessutom två olika byggnader. Ersätt helst med ett
fotopar från samma objekt.

### 3. Sociala medier

Sidfotens ikoner för Facebook, Instagram och LinkedIn är **borttagna**, eftersom
inga profiler har verifierats. Skicka riktiga länkar så läggs de tillbaka.

### 4. Juridiska sidor

Formuläret samlar in personuppgifter. En kort integritetspolicy bör publiceras
och länkas i sidfoten. Under formuläret står i dag: *"Vi använder dina uppgifter
enbart för att besvara din förfrågan."*

### 5. Uppgifter som medvetet inte påhittats

Följande finns inte på sidan eftersom underlag saknas: antal år i branschen,
antal anställda, kundantal, exakt gatuadress, organisationsnummer, öppettider,
certifieringar, garantier, priser och grundningsår. Skicka uppgifterna så läggs
de in.

Bekräfta också formuleringarna "Kostnadsfri och utan bindning" samt ROT-svaret i
FAQ:n, så att de stämmer med hur företaget faktiskt arbetar.

## Kontaktformuläret

Sektionen `#kontakt` bygger på Figma-komponenten `244:3605`. Layouten är
densamma — rubrik och kontaktuppgifter till vänster, formulärpanel till höger —
men **textfärgerna är omgjorda**: i underlaget var etiketterna mörkgrå på mörk
botten och i praktiken osynliga. Nu är etiketter vita, värden ljusa och
etikettraden använder `--accent-light`. Alla kombinationer klarar WCAG AA.

Formuläret är också målet för alla "Begär offert"-knappar (`#kontakt` pekar nu
på formuläret i stället för på sidfoten).

### Så kopplas det in

Formuläret är förberett för **Netlify Forms** och kräver ingen backend:

```html
<form name="kontakt" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="kontakt">
```

1. Publicera på Netlify.
2. Aktivera **Forms** för sajten (Site configuration → Forms).
3. Inlämningarna hamnar under Forms i Netlify-panelen. Lägg till en
   e-postavisering så att förfrågningarna kommer direkt till inkorgen.

Fram tills Forms är aktiverat svarar Netlify `405` på inlämningen, och
formuläret visar då ett ärligt felmeddelande med telefonnummer och e-post i
stället för en falsk kvittens. Samma sak lokalt — `scripts/serve.mjs` svarar
medvetet `405` på POST så att felhanteringen går att testa.

Ska ett annat verktyg användas (Formspree, egen endpoint) räcker det att sätta
`action` på formuläret; JavaScriptet postar dit i stället.

### Validering

Klientvalidering på svenska i `js/main.js`: namn, e-post och meddelande är
obligatoriska, telefon frivilligt men formatkontrolleras. Fel visas under
respektive fält, markeras med `aria-invalid`, kopplas via `aria-describedby`
och rensas så fort användaren rättar sig. Fokus flyttas till första felet.
Knappen låses under utskick, vilket förhindrar dubbla inlämningar.

## Testat

- Chromium 1440/1920/1280/1024/768/430/390/375/320 px — ingen horisontell scroll,
  inga trasiga bilder, inga konsolfel
- Tangentbordsnavigering: hopplänk, mobilmeny med fokusfälla och Escape,
  FAQ-flikar med piltangenter, dragspel, karuseller
- Formulär: tomt utskick, felaktig e-post, felaktigt telefonnummer, för kort
  meddelande, rättning rensar fel, dubbelklick på skicka, felläge utan Netlify
- Lighthouse (Chrome, simulerad strypning):
  - Desktop 100 / 100 / 100 / 100
  - Mobil 95 / 100 / 100 / 100 (CLS 0, TBT 0 ms)
