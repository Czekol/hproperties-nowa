// Generuje stronę z ofertami (oferty/index.html) oraz podstrony każdej oferty (oferty/<slug>.html)
// na podstawie src/data/offers.js. Uruchomienie: `node scripts/build-offers.js` lub zadanie gulpa.

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'oferty')
const SITE = 'https://hproperties.pl'
const PHONE = '572 910 341'
const PHONE_HREF = 'tel:+48572910341'

const AGENTS = {
	dima: { name: 'Dima Hrycyszyn', photo: '../dist/img/dima.jpg', phone: '572 910 341', phoneHref: 'tel:+48572910341', mail: 'dima@hproperties.pl' },
	olha: { name: 'Olha Nosal', photo: '../dist/offers/agents/olha.jpg', phone: '511 535 417', phoneHref: 'tel:+48511535417', mail: 'olha@hproperties.pl' },
	mateusz: { name: 'Mateusz Grala', photo: '../dist/offers/agents/mateusz.jpg', phone: '511 473 416', phoneHref: 'tel:+48511473416', mail: 'mateusz@hproperties.pl' },
}

const TYPE_LABELS = { dom: 'Dom', mieszkanie: 'Mieszkanie', lokal: 'Lokal użytkowy', dzialka: 'Działka' }
const TRANSACTION_LABELS = { sprzedaz: 'Sprzedaż', wynajem: 'Wynajem' }
const MARKET_LABELS = { pierwotny: 'Pierwotny', wtorny: 'Wtórny' }
const CONDITION_LABELS = { deweloperski: 'Deweloperski', 'do-zamieszkania': 'Do zamieszkania', 'do-remontu': 'Do remontu' }
const AMENITY_LABELS = { parking: 'Parking / garaż', balcony: 'Balkon / taras', elevator: 'Winda' }

const esc = value =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')

const readPartial = file => fs.readFileSync(path.join(root, 'html', file), 'utf8')

const NBSP = '\u00a0'
const money = value => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
const decimal = value => String(value).replace('.', ',')

function priceLabel(offer) {
	if (offer.price == null) return 'Cena na zapytanie'
	const prefix = offer.pricePrefix ? `${offer.pricePrefix} ` : ''
	const suffix = offer.priceSuffix ? ` ${offer.priceSuffix}` : ''
	return `${prefix}${money(offer.price)} zł${suffix}`.replace(/ /g, NBSP)
}

function pricePerM2(offer) {
	if (offer.price == null || !offer.area || offer.pricePrefix || offer.units || offer.transaction === 'wynajem') return ''
	const suffix = offer.priceSuffix ? ` ${offer.priceSuffix}` : ''
	return `${money(offer.price / offer.area)} zł/m²${suffix}`.replace(/ /g, NBSP)
}

function priceRange(offer) {
	if (offer.price == null) return { min: '', max: '' }
	const prices = offer.units ? offer.units.map(unit => unit[2]) : [offer.price]
	return { min: Math.min(...prices), max: Math.max(...prices) }
}

const img = (slug, name) => `../dist/offers/${slug}/${name}.jpg`

const pinIcon =
	'<svg class="offer-card__pin" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>'

const phoneIcon =
	'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1l-2.2 2.2Z"/></svg>'

const mailIcon =
	'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 6.6L4.5 7v.2l7.5 4.6 7.5-4.6V7L12 11.6Z"/></svg>'

const arrowLeft =
	'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M15 5l-7 7 7 7"/></svg>'

function head({ title, description, canonical, ogImage }) {
	return `<!DOCTYPE html>
<html lang="pl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <link rel="canonical" href="${canonical}">
    <meta name="description" content="${esc(description)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="H.Properties">
    <meta property="og:locale" content="pl_PL">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">${ogImage ? `\n    <meta property="og:image" content="${ogImage}">` : ''}

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Onest:wght@700&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="../dist/css/main.min.css">
    <link rel="icon" type="image/png" sizes="192x192" href="../dist/img/black-favicon.png"
        media="(prefers-color-scheme: light)">
    <link rel="icon" type="image/png" sizes="192x192" href="../dist/img/favicon.png"
        media="(prefers-color-scheme: dark)">
    <link rel="icon" type="image/svg+xml" href="../dist/img/favicon.svg">
</head>
`
}

function nav() {
	return readPartial('nav.kit').replace('<!-- $langLink -->', '../ua/index.html')
}

function footer() {
	return readPartial('footer.kit')
}

function contact({ placeholder, message, offerTitle }) {
	let html = readPartial('contact.kit')
	html = html.replace('<!-- $messagePlaceholder -->', esc(placeholder))
	html = html.replace('action="send.php"', 'action="../send.php"')
	if (message) {
		html = html.replace('required></textarea>', `required>${esc(message)}</textarea>`)
	}
	if (offerTitle) {
		const start = html.indexOf('<div>\n                        <label class="checkbox-label">')
		const end = html.indexOf('<button type="submit"')
		if (start === -1 || end === -1) throw new Error('Nie udało się zmodyfikować formularza kontaktowego')
		html =
			html.slice(0, start) +
			`<input type="hidden" name="property_types[]" value="${esc(`Zapytanie o ofertę: ${offerTitle}`)}">\n\n                    ` +
			html.slice(end)
	}
	return html
}

function scripts(extra) {
	return `    <script src="../dist/js/main.min.js"></script>
    <script src="../dist/js/${extra}.min.js"></script>
</body>

</html>
`
}

function card(offer, { eager = false } = {}) {
	const href = `${offer.slug}.html`
	const cover = offer.gallery[0]
	const { min, max } = priceRange(offer)
	const specs = offer.cardSpecs
		.map(([label, value]) => `<li><span>${esc(label)}</span><strong>${esc(value)}</strong></li>`)
		.join('')
	const attrs = [
		`data-type="${offer.type}"`,
		`data-transaction="${offer.transaction}"`,
		`data-city="${esc(offer.city)}"`,
		`data-min="${min}"`,
		`data-max="${max}"`,
		`data-area="${offer.area ?? ''}"`,
		`data-rooms="${offer.rooms ?? ''}"`,
		`data-market="${offer.market ?? ''}"`,
		`data-condition="${offer.condition ?? ''}"`,
		`data-year="${offer.year ?? ''}"`,
		`data-amenities="${(offer.amenities || []).join(' ')}"`,
	].join(' ')
	return `<li class="offer-card" ${attrs}>
                        <a href="${href}" class="offer-card__media" tabindex="-1" aria-hidden="true">
                            <img src="${img(offer.slug, cover.file + '-s')}" alt="${esc(cover.alt)}" class="offer-card__img" width="640" height="480"${eager ? '' : ' loading="lazy"'} decoding="async">
                            <span class="offer-card__badge">${esc(offer.typeLabel)}</span>${offer.tag ? `\n                            <span class="offer-card__tag">${esc(offer.tag)}</span>` : ''}
                        </a>
                        <div class="offer-card__body">
                            <p class="offer-card__price">${priceLabel(offer)}</p>
                            <h2 class="offer-card__title"><a href="${href}" class="offer-card__link">${esc(offer.title)}</a></h2>
                            <p class="offer-card__location">${pinIcon}${esc(offer.location)}</p>
                            <ul class="offer-card__specs">${specs}</ul>
                        </div>
                    </li>`
}

function select(id, name, label, options) {
	const items = options.map(([value, text]) => `<option value="${esc(value)}">${esc(text)}</option>`).join('')
	return `<div class="offers-search__field">
                        <label for="${id}" class="offers-search__label">${label}</label>
                        <select id="${id}" name="${name}" class="offers-search__select">${items}</select>
                    </div>`
}

function range(idBase, name, label, labelId = '') {
	return `<div class="offers-search__field">
                            <span class="offers-search__label"${labelId ? ` id="${labelId}"` : ''}>${label}</span>
                            <div class="offers-search__range">
                                <input type="text" inputmode="decimal" id="${idBase}-from" name="${name}-od" class="offers-search__input" placeholder="od" aria-label="${label}, od" autocomplete="off">
                                <input type="text" inputmode="decimal" id="${idBase}-to" name="${name}-do" class="offers-search__input" placeholder="do" aria-label="${label}, do" autocomplete="off">
                            </div>
                        </div>`
}

function listPage(offers) {
	const types = Object.keys(TYPE_LABELS).filter(type => offers.some(o => o.type === type))
	const transactions = Object.keys(TRANSACTION_LABELS).filter(t => offers.some(o => o.transaction === t))
	const markets = Object.keys(MARKET_LABELS).filter(m => offers.some(o => o.market === m))
	const conditions = Object.keys(CONDITION_LABELS).filter(c => offers.some(o => o.condition === c))
	const amenities = Object.keys(AMENITY_LABELS).filter(a => offers.some(o => (o.amenities || []).includes(a)))
	const cities = [...new Set(offers.map(o => o.city))].sort((a, b) =>
		a === 'Kraków' ? -1 : b === 'Kraków' ? 1 : a.localeCompare(b, 'pl'),
	)
	const description =
		'Aktualne oferty H.Properties: mieszkania, domy, działki i lokale usługowe na sprzedaż i wynajem w Krakowie i okolicach. Sprawdź szczegóły i umów prezentację.'

	return (
		head({
			title: 'Oferty nieruchomości Kraków i okolice | H.Properties',
			description,
			canonical: `${SITE}/oferty/`,
			ogImage: `${SITE}/dist/offers/${offers[0].slug}/${offers[0].gallery[0].file}.jpg`,
		}) +
		`
<body class="offers-body">
    ${nav()}

    <main class="main">

        <section class="offers-hero">
            <div class="offers-hero__inner">
                <h1 class="offers-hero__title">Oferty nieruchomości</h1>
                <p class="offers-hero__lead">Mieszkania, domy, działki i lokale usługowe na sprzedaż i wynajem w Krakowie
                    i okolicach. Wybierz ofertę i sprawdź wszystkie szczegóły.</p>
            </div>
        </section>

        <section class="offers" id="oferty">
            <div class="offers__container">

                <form class="offers-search" id="offers-search" role="search" aria-label="Wyszukiwarka ofert" novalidate>
                    <div class="offers-search__main">
                        ${select('filter-type', 'typ', 'Rodzaj', [['', 'Wszystkie'], ...types.map(t => [t, TYPE_LABELS[t]])])}
                        ${select('filter-transaction', 'transakcja', 'Transakcja', [['', 'Wszystkie'], ...transactions.map(t => [t, TRANSACTION_LABELS[t]])])}
                        ${select('filter-city', 'lokalizacja', 'Lokalizacja', [['', 'Wszystkie'], ...cities.map(c => [c, c])])}
                        <button type="submit" class="offers-search__submit">Szukaj</button>
                    </div>

                    <details class="offers-search__more" id="offers-more" open>
                        <summary class="offers-search__toggle">Więcej filtrów <span class="offers-search__count" id="offers-filter-count" hidden></span></summary>
                        <div class="offers-search__advanced">
                            ${range('filter-price', 'cena', 'Cena (zł)', 'filter-price-label')}
                            ${range('filter-area', 'pow', 'Powierzchnia (m²)')}
                            ${range('filter-rooms', 'pokoje', 'Liczba pokoi')}

                            <div class="offers-search__field">
                                <span class="offers-search__label" id="filter-market-label">Rynek</span>
                                <div class="offers-search__chips" role="group" aria-labelledby="filter-market-label">
                                    ${markets.map(m => `<button type="button" class="offers-search__chip" data-market="${m}" aria-pressed="false">${MARKET_LABELS[m]}</button>`).join('\n                                    ')}
                                </div>
                            </div>
                            ${select('filter-condition', 'stan', 'Stan', [['', 'Dowolny'], ...conditions.map(c => [c, CONDITION_LABELS[c]])])}
                            <div class="offers-search__field">
                                <label for="filter-year" class="offers-search__label">Rok budowy (od)</label>
                                <input type="text" inputmode="numeric" id="filter-year" name="rok" class="offers-search__input" placeholder="np. 2010" autocomplete="off">
                            </div>

                            <fieldset class="offers-search__amenities">
                                <legend class="offers-search__label">Udogodnienia</legend>
                                ${amenities.map(a => `<label class="offers-search__check"><input type="checkbox" name="udogodnienia" value="${a}"><span>${AMENITY_LABELS[a]}</span></label>`).join('\n                                ')}
                            </fieldset>

                            <p class="offers-search__hint" id="offers-price-hint" hidden>Przy wyborze „Wszystkie” filtr ceny obejmuje tylko oferty sprzedaży. Aby filtrować wynajem, wybierz transakcję „Wynajem”.</p>

                            <div class="offers-search__footer">
                                <button type="button" class="offers-search__clear" id="offers-clear">Wyczyść</button>
                            </div>
                        </div>
                    </details>
                </form>

                <div class="offers__status" id="offers-status" hidden>
                    <p class="offers__status-text" id="offers-status-text" role="status" aria-live="polite"></p>
                    <button type="button" class="offers__reset" id="offers-reset">Wyczyść filtry</button>
                </div>

                <ul class="offers__grid" id="offers-grid">
                    ${offers.map((offer, index) => card(offer, { eager: index < 3 })).join('\n                    ')}
                </ul>

                <div class="offers__empty" id="offers-empty" hidden>
                    <h2 class="offers__empty-title">Brak ofert spełniających kryteria</h2>
                    <p class="offers__empty-text">Zmień filtry lub zadzwoń do nas. Część ofert mamy poza ogłoszeniami i chętnie
                        dopasujemy nieruchomość do Twoich oczekiwań.</p>
                    <a href="${PHONE_HREF}" class="offers__empty-btn">Zadzwoń: ${PHONE}</a>
                </div>
            </div>
        </section>

        <section class="promo offers-promo">
            <div class="promo__inner">
                <div class="promo__copy">
                    <h2 class="promo__heading">Nie widzisz oferty dla siebie?</h2>
                    <p class="promo__text">Opisz, czego szukasz. Sprawdzimy rynek i wrócimy z ofertami dopasowanymi do
                        Twojego budżetu, także z tych, których nie ma jeszcze w ogłoszeniach.</p>
                </div>
                <a href="#contact" class="promo__btn">Napisz do nas</a>
            </div>
        </section>

        ${contact({ placeholder: 'Opisz, jakiej nieruchomości szukasz (rodzaj, lokalizacja, budżet)' })}
    </main>

    ${footer()}

` +
		scripts('offers')
	)
}

function factsList(facts) {
	return `<dl class="offer-facts">
                        ${facts.map(([label, value]) => `<div class="offer-facts__item"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('\n                        ')}
                    </dl>`
}

function bulletList(items) {
	return `<ul class="offer-list">
                        ${items.map(item => `<li>${esc(item)}</li>`).join('\n                        ')}
                    </ul>`
}

function lbItem(offer, item, className, { large = false, eager = false, extra = '' } = {}) {
	const src = img(offer.slug, large ? item.file : item.file + '-s')
	const srcset = `${img(offer.slug, item.file + '-s')} 640w, ${img(offer.slug, item.file)} 1600w`
	const sizes = large ? '(min-width: 1440px) 600px, (min-width: 744px) 50vw, 100vw' : '(min-width: 1440px) 300px, (min-width: 744px) 25vw, 100vw'
	return `<button type="button" class="${className}" data-full="${img(offer.slug, item.file)}" data-alt="${esc(item.alt)}" aria-label="Powiększ zdjęcie: ${esc(item.alt)}">
                            <img src="${src}" srcset="${srcset}" sizes="${sizes}" alt="${esc(item.alt)}"${eager ? '' : ' loading="lazy"'} decoding="async">${extra}
                        </button>`
}

function detailPage(offer, offers) {
	const tiles = [...offer.gallery]
	if (tiles.length < 3) tiles.push(...offer.plans)
	const shown = Math.min(tiles.length, 5)
	const total = tiles.length

	const galleryHtml = tiles
		.map((item, index) => {
			const hidden = index >= 5
			const more =
				index === 4 && total > 5
					? `\n                            <span class="offer-gallery__more">Wszystkie zdjęcia (${total})</span>`
					: ''
			return lbItem(offer, item, `offer-gallery__item${hidden ? ' is-hidden' : ''}`, {
				large: index === 0,
				eager: index === 0,
				extra: more,
			})
		})
		.join('\n                        ')

	const agent = AGENTS[offer.agent || 'dima']
	const perM2 = pricePerM2(offer)
	const plansHtml = offer.plans.length
		? `<section class="offer-section">
                        <h2 class="offer-section__title">Rzuty</h2>
                        <div class="offer-plans">
                            ${offer.plans
								.map(
									plan => `<button type="button" class="offer-plans__item" data-full="${img(offer.slug, plan.file)}" data-alt="${esc(plan.alt)}" aria-label="Powiększ: ${esc(plan.alt)}">
                                <img src="${img(offer.slug, plan.file + '-s')}" alt="${esc(plan.alt)}" loading="lazy" decoding="async">
                                <span>${esc(plan.label)}</span>
                            </button>`,
								)
								.join('\n                            ')}
                        </div>
                    </section>`
		: ''

	const unitsHtml = offer.units
		? `<section class="offer-section">
                        <h2 class="offer-section__title">${esc(offer.unitsTitle)}</h2>
                        ${offer.unitsNote ? `<p class="offer-section__text">${esc(offer.unitsNote)}</p>` : ''}
                        <table class="offer-units">
                            <thead><tr><th scope="col">Dom</th><th scope="col">Działka</th><th scope="col">Cena</th></tr></thead>
                            <tbody>
                                ${offer.units.map(([name, plot, price]) => `<tr><th scope="row">${esc(name)}</th><td>${esc(plot)}</td><td>${money(price)}${NBSP}zł</td></tr>`).join('\n                                ')}
                            </tbody>
                        </table>
                    </section>`
		: ''

	const featuresHtml = offer.features
		? `<section class="offer-section">
                        <h2 class="offer-section__title">${esc(offer.featuresTitle || 'Atuty')}</h2>
                        ${bulletList(offer.features)}
                    </section>`
		: ''

	const extrasHtml = offer.extras
		? `<section class="offer-section">
                        <h2 class="offer-section__title">${esc(offer.extrasTitle)}</h2>
                        ${factsList(offer.extras)}
                    </section>`
		: offer.extrasList
			? `<section class="offer-section">
                        <h2 class="offer-section__title">${esc(offer.extrasTitle)}</h2>
                        ${bulletList(offer.extrasList)}
                    </section>`
			: ''

	let surroundingsHtml = ''
	if (offer.surroundings || offer.surroundingsText) {
		surroundingsHtml = `<section class="offer-section">
                        <h2 class="offer-section__title">${esc(offer.surroundingsTitle || 'Lokalizacja')}</h2>
                        ${offer.surroundingsText ? `<p class="offer-section__text">${esc(offer.surroundingsText)}</p>` : ''}
                        ${offer.surroundings ? factsList(offer.surroundings) : ''}
                        ${offer.surroundingsNote ? `<p class="offer-section__text">${esc(offer.surroundingsNote)}</p>` : ''}
                        ${
							offer.mapImages.length
								? `<div class="offer-plans offer-plans--map">${offer.mapImages
										.map(
											m => `<button type="button" class="offer-plans__item" data-full="${img(offer.slug, m.file)}" data-alt="${esc(m.alt)}" aria-label="Powiększ: ${esc(m.alt)}">
                                <img src="${img(offer.slug, m.file + '-s')}" alt="${esc(m.alt)}" loading="lazy" decoding="async">
                                <span>${esc(m.label)}</span>
                            </button>`,
										)
										.join('')}</div>`
								: ''
						}
                    </section>`
	}

	const others = offers.filter(o => o.slug !== offer.slug).slice(0, 3)
	const message = `Dzień dobry, jestem zainteresowany/a ofertą: ${offer.title} (${offer.location}). Proszę o kontakt.`

	const priceBlock = `<p class="offer-head__price">${priceLabel(offer)}</p>${perM2 ? `\n                        <p class="offer-head__m2">${perM2}</p>` : ''}${offer.priceNote ? `\n                        <p class="offer-head__note">${esc(offer.priceNote)}</p>` : ''}`

	return (
		head({
			title: `${offer.title} | ${offer.location} | H.Properties`,
			description: offer.lead,
			canonical: `${SITE}/oferty/${offer.slug}`,
			ogImage: `${SITE}/dist/offers/${offer.slug}/${offer.gallery[0].file}.jpg`,
		}) +
		`
<body class="offers-body offer-body">
    ${nav()}

    <main class="main">

        <div class="offer-top">
            <nav class="offer-breadcrumbs" aria-label="Ścieżka nawigacji">
                <a href="./" class="offer-breadcrumbs__back">${arrowLeft}Wszystkie oferty</a>
            </nav>

            <header class="offer-head">
                <div class="offer-head__main">
                    <p class="offer-head__badges">
                        <span class="offer-head__badge">${esc(offer.typeLabel)}</span>${offer.tag ? `\n                        <span class="offer-head__badge offer-head__badge--tag">${esc(offer.tag)}</span>` : ''}
                    </p>
                    <h1 class="offer-head__title">${esc(offer.title)}</h1>
                    <p class="offer-head__location">${pinIcon}${esc(offer.location)}</p>
                </div>
                <div class="offer-head__side">
                    ${priceBlock}
                </div>
            </header>

            <div class="offer-gallery" data-count="${shown}" data-total="${total}">
                <div class="offer-gallery__track">
                    ${galleryHtml}
                </div>
                <p class="offer-gallery__counter" aria-hidden="true"><span data-gallery-current>1</span> / ${total}</p>
            </div>
        </div>

        <div class="offer-layout">
            <div class="offer-content">

                <section class="offer-section">
                    <h2 class="offer-section__title">Najważniejsze informacje</h2>
                    ${factsList(offer.facts)}
                </section>

                <section class="offer-section">
                    <h2 class="offer-section__title">Opis oferty</h2>
                    ${offer.intro.map(p => `<p class="offer-section__text">${esc(p)}</p>`).join('\n                    ')}
                </section>

                ${unitsHtml}
                ${featuresHtml}
                ${extrasHtml}
                ${plansHtml}
                ${surroundingsHtml}
                ${offer.note ? `<p class="offer-note">${esc(offer.note)}</p>` : ''}
            </div>

            <aside class="offer-aside" aria-label="Kontakt w sprawie oferty">
                <div class="offer-agent">
                    <div class="offer-agent__person">
                        <img src="${agent.photo}" alt="${agent.name}" class="offer-agent__photo" width="72" height="72" loading="lazy">
                        <div>
                            <p class="offer-agent__name">${agent.name}</p>
                            <p class="offer-agent__role">Opiekun oferty, H.Properties</p>
                        </div>
                    </div>
                    <p class="offer-agent__text">Chcesz zobaczyć nieruchomość lub poznać szczegóły? Zadzwoń albo napisz, a umówimy prezentację.</p>
                    <a href="${agent.phoneHref}" class="offer-agent__btn offer-agent__btn--primary">${phoneIcon}${agent.phone}</a>
                    <a href="#contact" class="offer-agent__btn offer-agent__btn--ghost">${mailIcon}Napisz wiadomość</a>
                    <a href="mailto:${agent.mail}" class="offer-agent__mail">${agent.mail}</a>
                </div>
            </aside>
        </div>

        <section class="offer-more">
            <h2 class="section-heading">Zobacz także</h2>
            <div class="offers__container">
                <ul class="offers__grid">
                    ${others.map(o => card(o)).join('\n                    ')}
                </ul>
            </div>
        </section>

        ${contact({
			placeholder: 'Napisz, kiedy możemy zadzwonić i co Cię interesuje',
			message,
			offerTitle: `${offer.title} (${offer.location})`,
		})}
    </main>

    ${footer()}

` +
		scripts('offers')
	)
}

function build() {
	delete require.cache[require.resolve('../src/data/offers.js')]
	delete require.cache[require.resolve('../src/data/gallery.json')]
	const offers = require('../src/data/offers.js')

	fs.mkdirSync(outDir, { recursive: true })
	const expected = new Set(['index.html', ...offers.map(o => `${o.slug}.html`)])
	for (const file of fs.readdirSync(outDir)) {
		if (file.endsWith('.html') && !expected.has(file)) fs.unlinkSync(path.join(outDir, file))
	}

	fs.writeFileSync(path.join(outDir, 'index.html'), listPage(offers))
	for (const offer of offers) {
		fs.writeFileSync(path.join(outDir, `${offer.slug}.html`), detailPage(offer, offers))
	}
	return offers.length
}

module.exports = build

if (require.main === module) {
	console.log(`Wygenerowano ${build()} ofert w katalogu oferty/`)
}
