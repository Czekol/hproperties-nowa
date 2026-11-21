// Generuje stronę z ofertami i podstrony każdej oferty w dwóch wersjach językowych:
//   PL: oferty/index.html, oferty/<slug>.html          (dane: src/data/offers.js)
//   UA: ua/oferty/index.html, ua/oferty/<slug>.html    (teksty: src/data/offers.ua.js, alty: src/data/gallery.ua.json)
// Uruchomienie: `node scripts/build-offers.js` lub zadanie gulpa.

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const SITE = 'https://hproperties.pl'

const AGENTS = {
	dima: { name: 'Dima Hrycyszyn', photo: 'dima-profile.png', phone: '572 910 341', phoneHref: 'tel:+48572910341', mail: 'dima@hproperties.pl' },
	olha: { name: 'Olha Makohin', photo: 'olha-profile.png', phone: '511 535 417', phoneHref: 'tel:+48511535417', mail: 'olha@hproperties.pl' },
	mateusz: { name: 'Mateusz Grala', photo: 'mateusz-profile.png', phone: '511 473 416', phoneHref: 'tel:+48511473416', mail: 'mateusz@hproperties.pl' },
}

const PHONE = '572 910 341'
const PHONE_HREF = 'tel:+48572910341'

const LANGS = {
	pl: {
		code: 'pl',
		htmlLang: 'pl',
		ogLocale: 'pl_PL',
		dir: 'oferty',
		depth: '../',
		urlBase: '/oferty/',
		typeLabels: { dom: 'Dom', mieszkanie: 'Mieszkanie', lokal: 'Lokal użytkowy', dzialka: 'Działka' },
		transactionLabels: { sprzedaz: 'Sprzedaż', wynajem: 'Wynajem' },
		marketLabels: { pierwotny: 'Pierwotny', wtorny: 'Wtórny' },
		conditionLabels: { deweloperski: 'Deweloperski', 'do-zamieszkania': 'Do zamieszkania', 'do-remontu': 'Do remontu' },
		amenityLabels: { parking: 'Parking / garaż', balcony: 'Balkon / taras', elevator: 'Winda' },
		prefix: { od: 'od' },
		onRequest: 'Cena na zapytanie',
		perM2: 'zł/m²',
		listTitle: 'Oferty nieruchomości Kraków i okolice | H.Properties',
		listDescription:
			'Aktualne oferty H.Properties: mieszkania, domy, działki i lokale usługowe na sprzedaż i wynajem w Krakowie i okolicach. Sprawdź szczegóły i umów prezentację.',
		heroTitle: 'Oferty nieruchomości',
		heroLead: 'Mieszkania, domy, działki i lokale usługowe na sprzedaż i wynajem w Krakowie i okolicach. Wybierz ofertę i sprawdź wszystkie szczegóły.',
		searchAria: 'Wyszukiwarka ofert',
		fType: 'Rodzaj',
		fTransaction: 'Transakcja',
		fCity: 'Lokalizacja',
		fAll: 'Wszystkie',
		fAny: 'Dowolny',
		fSearch: 'Szukaj',
		fMore: 'Więcej filtrów',
		fPrice: 'Cena (zł)',
		fArea: 'Powierzchnia (m²)',
		fRooms: 'Liczba pokoi',
		fFrom: 'od',
		fTo: 'do',
		fMarket: 'Rynek',
		fCondition: 'Stan',
		fYear: 'Rok budowy (od)',
		fYearPlaceholder: 'np. 2010',
		fAmenities: 'Udogodnienia',
		fHint: 'Przy wyborze „Wszystkie” filtr ceny obejmuje tylko oferty sprzedaży. Aby filtrować wynajem, wybierz transakcję „Wynajem”.',
		fClear: 'Wyczyść',
		fClearAll: 'Wyczyść filtry',
		emptyTitle: 'Brak ofert spełniających kryteria',
		emptyText:
			'Zmień filtry lub zadzwoń do nas. Część ofert mamy poza ogłoszeniami i chętnie dopasujemy nieruchomość do Twoich oczekiwań.',
		call: 'Zadzwoń: ',
		promoHeading: 'Nie widzisz oferty dla siebie?',
		promoText:
			'Opisz, czego szukasz. Sprawdzimy rynek i wrócimy z ofertami dopasowanymi do Twojego budżetu, także z tych, których nie ma jeszcze w ogłoszeniach.',
		promoBtn: 'Napisz do nas',
		listPlaceholder: 'Opisz, jakiej nieruchomości szukasz (rodzaj, lokalizacja, budżet)',
		detailPlaceholder: 'Napisz, kiedy możemy zadzwonić i co Cię interesuje',
		back: 'Wszystkie oferty',
		breadcrumbsAria: 'Ścieżka nawigacji',
		factsTitle: 'Najważniejsze informacje',
		descriptionTitle: 'Opis oferty',
		plansTitle: 'Rzuty',
		unitsHead: ['Dom', 'Działka', 'Cena'],
		featuresDefault: 'Atuty',
		locationDefault: 'Lokalizacja',
		asideAria: 'Kontakt w sprawie oferty',
		agentRole: 'Opiekun oferty, H.Properties',
		agentText: 'Chcesz zobaczyć nieruchomość lub poznać szczegóły? Zadzwoń albo napisz, a umówimy prezentację.',
		agentWrite: 'Napisz wiadomość',
		moreTitle: 'Zobacz także',
		zoomPhoto: 'Powiększ zdjęcie: ',
		zoom: 'Powiększ: ',
		allPhotos: n => `Wszystkie zdjęcia (${n})`,
		message: (title, location) => `Dzień dobry, jestem zainteresowany/a ofertą: ${title} (${location}). Proszę o kontakt.`,
		detailTitle: (title, location) => `${title} | ${location} | H.Properties`,
	},
	ua: {
		code: 'ua',
		htmlLang: 'uk',
		ogLocale: 'uk_UA',
		dir: 'ua/oferty',
		depth: '../../',
		urlBase: '/ua/oferty/',
		typeLabels: { dom: 'Будинок', mieszkanie: 'Квартира', lokal: 'Комерційне приміщення', dzialka: 'Ділянка' },
		transactionLabels: { sprzedaz: 'Продаж', wynajem: 'Оренда' },
		marketLabels: { pierwotny: 'Первинний', wtorny: 'Вторинний' },
		conditionLabels: { deweloperski: 'Під оздоблення', 'do-zamieszkania': 'Готове до проживання', 'do-remontu': 'Під ремонт' },
		amenityLabels: { parking: 'Паркінг / гараж', balcony: 'Балкон / тераса', elevator: 'Ліфт' },
		prefix: { od: 'від' },
		onRequest: 'Ціна за запитом',
		perM2: 'zł/м²',
		listTitle: 'Пропозиції нерухомості Краків і околиці | H.Properties',
		listDescription:
			'Актуальні пропозиції H.Properties: квартири, будинки, ділянки та комерційні приміщення на продаж і в оренду в Кракові та околицях. Перегляньте подробиці та домовтеся про показ.',
		heroTitle: 'Пропозиції нерухомості',
		heroLead:
			'Квартири, будинки, ділянки та комерційні приміщення на продаж і в оренду в Кракові та околицях. Оберіть пропозицію та дізнайтеся всі подробиці.',
		searchAria: 'Пошук пропозицій',
		fType: 'Тип',
		fTransaction: 'Угода',
		fCity: 'Розташування',
		fAll: 'Усі',
		fAny: 'Будь-який',
		fSearch: 'Шукати',
		fMore: 'Більше фільтрів',
		fPrice: 'Ціна (zł)',
		fArea: 'Площа (м²)',
		fRooms: 'Кількість кімнат',
		fFrom: 'від',
		fTo: 'до',
		fMarket: 'Ринок',
		fCondition: 'Стан',
		fYear: 'Рік побудови (від)',
		fYearPlaceholder: 'напр. 2010',
		fAmenities: 'Зручності',
		fHint: 'Якщо вибрано «Усі», фільтр ціни охоплює лише пропозиції продажу. Щоб фільтрувати оренду, оберіть угоду «Оренда».',
		fClear: 'Очистити',
		fClearAll: 'Очистити фільтри',
		emptyTitle: 'Немає пропозицій, що відповідають критеріям',
		emptyText:
			'Змініть фільтри або зателефонуйте нам. Частину пропозицій ми маємо поза оголошеннями й охоче підберемо нерухомість під ваші очікування.',
		call: 'Зателефонувати: ',
		promoHeading: 'Не знайшли пропозицію для себе?',
		promoText:
			'Опишіть, що ви шукаєте. Ми перевіримо ринок і повернемося з пропозиціями, підібраними під ваш бюджет, зокрема й з тих, яких ще немає в оголошеннях.',
		promoBtn: 'Напишіть нам',
		listPlaceholder: 'Опишіть, яку нерухомість ви шукаєте (тип, розташування, бюджет)',
		detailPlaceholder: 'Напишіть, коли нам можна зателефонувати і що вас цікавить',
		back: 'Усі пропозиції',
		breadcrumbsAria: 'Навігація сторінкою',
		factsTitle: 'Найважливіша інформація',
		descriptionTitle: 'Опис пропозиції',
		plansTitle: 'Плани',
		unitsHead: ['Будинок', 'Ділянка', 'Ціна'],
		featuresDefault: 'Переваги',
		locationDefault: 'Розташування',
		asideAria: 'Контакт щодо пропозиції',
		agentRole: 'Куратор пропозиції, H.Properties',
		agentText: 'Хочете побачити нерухомість або дізнатися подробиці? Зателефонуйте або напишіть, і ми домовимося про показ.',
		agentWrite: 'Написати повідомлення',
		moreTitle: 'Дивіться також',
		zoomPhoto: 'Збільшити фото: ',
		zoom: 'Збільшити: ',
		allPhotos: n => `Усі фото (${n})`,
		message: (title, location) => `Добрий день, мене цікавить пропозиція: ${title} (${location}). Прошу зв’язатися зі мною.`,
		detailTitle: (title, location) => `${title} | ${location} | H.Properties`,
	},
}

// Kontekst aktualnie generowanej wersji językowej
let L = LANGS.pl

const esc = value =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')

const readPartial = file => fs.readFileSync(path.join(root, 'html', file), 'utf8')

const NBSP = '\u00a0'
const money = value => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)

const dist = () => `${L.depth}dist`
const img = (slug, name) => `${dist()}/offers/${slug}/${name}.jpg`

function priceLabel(offer) {
	if (offer.price == null) return L.onRequest
	const prefix = offer.pricePrefix ? `${L.prefix[offer.pricePrefix] || offer.pricePrefix} ` : ''
	const suffix = offer.priceSuffix ? ` ${offer.priceSuffix}` : ''
	return `${prefix}${money(offer.price)} zł${suffix}`.replace(/ /g, NBSP)
}

function pricePerM2(offer) {
	if (offer.price == null || !offer.area || offer.pricePrefix || offer.units || offer.transaction === 'wynajem') return ''
	const suffix = offer.priceSuffix ? ` ${offer.priceSuffix}` : ''
	return `${money(offer.price / offer.area)} ${L.perM2}${suffix}`.replace(/ /g, NBSP)
}

function priceRange(offer) {
	if (offer.price == null) return { min: '', max: '' }
	const prices = offer.units ? offer.units.map(unit => unit[2]) : [offer.price]
	return { min: Math.min(...prices), max: Math.max(...prices) }
}

const pinIcon =
	'<svg class="offer-card__pin" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>'

// Ikony takie same jak w sekcji Kontakt (dist/img/phone-icon.png i mail-icon.png), kolorowane przez CSS
const phoneIcon = '<span class="offer-agent__icon offer-agent__icon--phone" aria-hidden="true"></span>'
const mailIcon = '<span class="offer-agent__icon offer-agent__icon--mail" aria-hidden="true"></span>'

const arrowLeft =
	'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M15 5l-7 7 7 7"/></svg>'

// Części wspólne wersji UA leżą w ua/, a strony ofert piętro niżej (ua/oferty/)
function deepen(html) {
	return html
		.replace(/(href|src|action)="\.\.\//g, '$1="../../')
		.replace(/href="(?!https?:|#|mailto:|tel:|\.\.\/|<!--)/g, 'href="../')
}

function head({ title, description, canonical, alternates, ogImage }) {
	return `<!DOCTYPE html>
<html lang="${L.htmlLang}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <link rel="canonical" href="${canonical}">
    <link rel="alternate" href="${alternates.pl}" hreflang="pl">
    <link rel="alternate" href="${alternates.ua}" hreflang="uk">
    <link rel="alternate" href="${alternates.pl}" hreflang="x-default">
    <meta name="description" content="${esc(description)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="H.Properties">
    <meta property="og:locale" content="${L.ogLocale}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">${ogImage ? `\n    <meta property="og:image" content="${ogImage}">` : ''}

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Onest:wght@700&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="${dist()}/css/main.min.css">
    <link rel="icon" type="image/png" sizes="192x192" href="${dist()}/img/black-favicon.png"
        media="(prefers-color-scheme: light)">
    <link rel="icon" type="image/png" sizes="192x192" href="${dist()}/img/favicon.png"
        media="(prefers-color-scheme: dark)">
    <link rel="icon" type="image/svg+xml" href="${dist()}/img/favicon.svg">
</head>
`
}

function nav(langHref) {
	if (L.code === 'ua') return deepen(readPartial('ua/partials/nav.kit')).replace('<!-- $langLink -->', langHref)
	return readPartial('nav.kit').replace('<!-- $langLink -->', langHref)
}

function footer() {
	return L.code === 'ua' ? deepen(readPartial('ua/partials/footer.kit')) : readPartial('footer.kit')
}

function contact({ placeholder, message, offerTitle }) {
	let html = L.code === 'ua' ? deepen(readPartial('ua/partials/contact.kit')) : readPartial('contact.kit')
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
	return `    <script src="${dist()}/js/main.min.js"></script>
    <script src="${dist()}/js/${extra}.min.js"></script>
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
                                <input type="text" inputmode="decimal" id="${idBase}-from" name="${name}-od" class="offers-search__input" placeholder="${L.fFrom}" aria-label="${label}, ${L.fFrom}" autocomplete="off">
                                <input type="text" inputmode="decimal" id="${idBase}-to" name="${name}-do" class="offers-search__input" placeholder="${L.fTo}" aria-label="${label}, ${L.fTo}" autocomplete="off">
                            </div>
                        </div>`
}

function listPage(offers, cityLabels) {
	const types = Object.keys(L.typeLabels).filter(type => offers.some(o => o.type === type))
	const transactions = Object.keys(L.transactionLabels).filter(t => offers.some(o => o.transaction === t))
	const markets = Object.keys(L.marketLabels).filter(m => offers.some(o => o.market === m))
	const conditions = Object.keys(L.conditionLabels).filter(c => offers.some(o => o.condition === c))
	const amenities = Object.keys(L.amenityLabels).filter(a => offers.some(o => (o.amenities || []).includes(a)))
	const cities = [...new Set(offers.map(o => o.city))].sort((a, b) =>
		a === 'Kraków' ? -1 : b === 'Kraków' ? 1 : a.localeCompare(b, 'pl'),
	)

	const alternates = { pl: `${SITE}/oferty/`, ua: `${SITE}/ua/oferty/` }
	const langHref = L.code === 'ua' ? '../../oferty/' : '../ua/oferty/'

	return (
		head({
			title: L.listTitle,
			description: L.listDescription,
			canonical: alternates[L.code],
			alternates,
			ogImage: `${SITE}/dist/offers/${offers[0].slug}/${offers[0].gallery[0].file}.jpg`,
		}) +
		`
<body class="offers-body">
    ${nav(langHref)}

    <main class="main">

        <section class="offers-hero">
            <div class="offers-hero__inner">
                <h1 class="offers-hero__title">${L.heroTitle}</h1>
                <p class="offers-hero__lead">${L.heroLead}</p>
            </div>
        </section>

        <section class="offers" id="oferty">
            <div class="offers__container">

                <form class="offers-search" id="offers-search" role="search" aria-label="${L.searchAria}" novalidate>
                    <div class="offers-search__main">
                        ${select('filter-type', 'typ', L.fType, [['', L.fAll], ...types.map(t => [t, L.typeLabels[t]])])}
                        ${select('filter-transaction', 'transakcja', L.fTransaction, [['', L.fAll], ...transactions.map(t => [t, L.transactionLabels[t]])])}
                        ${select('filter-city', 'lokalizacja', L.fCity, [['', L.fAll], ...cities.map(c => [c, cityLabels[c] || c])])}
                        <button type="submit" class="offers-search__submit">${L.fSearch}</button>
                    </div>

                    <details class="offers-search__more" id="offers-more" open>
                        <summary class="offers-search__toggle">${L.fMore} <span class="offers-search__count" id="offers-filter-count" hidden></span></summary>
                        <div class="offers-search__advanced">
                            ${range('filter-price', 'cena', L.fPrice, 'filter-price-label')}
                            ${range('filter-area', 'pow', L.fArea)}
                            ${range('filter-rooms', 'pokoje', L.fRooms)}

                            <div class="offers-search__field">
                                <span class="offers-search__label" id="filter-market-label">${L.fMarket}</span>
                                <div class="offers-search__chips" role="group" aria-labelledby="filter-market-label">
                                    ${markets.map(m => `<button type="button" class="offers-search__chip" data-market="${m}" aria-pressed="false">${L.marketLabels[m]}</button>`).join('\n                                    ')}
                                </div>
                            </div>
                            ${select('filter-condition', 'stan', L.fCondition, [['', L.fAny], ...conditions.map(c => [c, L.conditionLabels[c]])])}
                            <div class="offers-search__field">
                                <label for="filter-year" class="offers-search__label">${L.fYear}</label>
                                <input type="text" inputmode="numeric" id="filter-year" name="rok" class="offers-search__input" placeholder="${L.fYearPlaceholder}" autocomplete="off">
                            </div>

                            <fieldset class="offers-search__amenities">
                                <legend class="offers-search__label">${L.fAmenities}</legend>
                                ${amenities.map(a => `<label class="offers-search__check"><input type="checkbox" name="udogodnienia" value="${a}"><span>${L.amenityLabels[a]}</span></label>`).join('\n                                ')}
                            </fieldset>

                            <p class="offers-search__hint" id="offers-price-hint" hidden>${L.fHint}</p>

                            <div class="offers-search__footer">
                                <button type="button" class="offers-search__clear" id="offers-clear">${L.fClear}</button>
                            </div>
                        </div>
                    </details>
                </form>

                <div class="offers__status" id="offers-status" hidden>
                    <p class="offers__status-text" id="offers-status-text" role="status" aria-live="polite"></p>
                    <button type="button" class="offers__reset" id="offers-reset">${L.fClearAll}</button>
                </div>

                <ul class="offers__grid" id="offers-grid">
                    ${offers.map((offer, index) => card(offer, { eager: index < 3 })).join('\n                    ')}
                </ul>

                <div class="offers__empty" id="offers-empty" hidden>
                    <h2 class="offers__empty-title">${L.emptyTitle}</h2>
                    <p class="offers__empty-text">${L.emptyText}</p>
                    <a href="${PHONE_HREF}" class="offers__empty-btn">${L.call}${PHONE}</a>
                </div>
            </div>
        </section>

        <section class="promo offers-promo">
            <div class="promo__inner">
                <div class="promo__copy">
                    <h2 class="promo__heading">${L.promoHeading}</h2>
                    <p class="promo__text">${L.promoText}</p>
                </div>
                <a href="#contact" class="promo__btn">${L.promoBtn}</a>
            </div>
        </section>

        ${contact({ placeholder: L.listPlaceholder })}
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

// Duże zdjęcie (pierwszy kafel) jest kadrowane przez object-fit: cover, więc na ekranach retina
// potrzebuje większego pliku niż wynikałoby z szerokości kafla. Stąd dodatkowy wariant -l (do 2400 px).
function lbItem(offer, item, className, { large = false, eager = false, extra = '' } = {}) {
	const src = img(offer.slug, large ? item.file : item.file + '-s')
	const candidates = [`${img(offer.slug, item.file + '-s')} 640w`, `${img(offer.slug, item.file)} 1600w`]
	if (item.largeWidth) candidates.push(`${img(offer.slug, item.file + '-l')} ${item.largeWidth}w`)
	const sizes = large ? '(min-width: 744px) 924px, 100vw' : '(min-width: 744px) 455px, 100vw'
	return `<button type="button" class="${className}" data-full="${img(offer.slug, item.file)}" data-alt="${esc(item.alt)}" aria-label="${L.zoomPhoto}${esc(item.alt)}">
                            <img src="${src}" srcset="${candidates.join(', ')}" sizes="${sizes}" alt="${esc(item.alt)}"${eager ? '' : ' loading="lazy"'} decoding="async">${extra}
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
					? `\n                            <span class="offer-gallery__more">${L.allPhotos(total)}</span>`
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
                        <h2 class="offer-section__title">${L.plansTitle}</h2>
                        <div class="offer-plans">
                            ${offer.plans
								.map(
									plan => `<button type="button" class="offer-plans__item" data-full="${img(offer.slug, plan.file)}" data-alt="${esc(plan.alt)}" aria-label="${L.zoom}${esc(plan.alt)}">
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
                            <thead><tr>${L.unitsHead.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
                            <tbody>
                                ${offer.units.map(([name, plot, price]) => `<tr><th scope="row">${esc(name)}</th><td>${esc(plot)}</td><td>${money(price)}${NBSP}zł</td></tr>`).join('\n                                ')}
                            </tbody>
                        </table>
                    </section>`
		: ''

	const featuresHtml = offer.features
		? `<section class="offer-section">
                        <h2 class="offer-section__title">${esc(offer.featuresTitle || L.featuresDefault)}</h2>
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
                        <h2 class="offer-section__title">${esc(offer.surroundingsTitle || L.locationDefault)}</h2>
                        ${offer.surroundingsText ? `<p class="offer-section__text">${esc(offer.surroundingsText)}</p>` : ''}
                        ${offer.surroundings ? factsList(offer.surroundings) : ''}
                        ${offer.surroundingsNote ? `<p class="offer-section__text">${esc(offer.surroundingsNote)}</p>` : ''}
                        ${
							offer.mapImages.length
								? `<div class="offer-plans offer-plans--map">${offer.mapImages
										.map(
											m => `<button type="button" class="offer-plans__item" data-full="${img(offer.slug, m.file)}" data-alt="${esc(m.alt)}" aria-label="${L.zoom}${esc(m.alt)}">
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
	const message = L.message(offer.title, offer.location)

	const priceBlock = `<p class="offer-head__price">${priceLabel(offer)}</p>${perM2 ? `\n                        <p class="offer-head__m2">${perM2}</p>` : ''}${offer.priceNote ? `\n                        <p class="offer-head__note">${esc(offer.priceNote)}</p>` : ''}`

	const alternates = { pl: `${SITE}/oferty/${offer.slug}`, ua: `${SITE}/ua/oferty/${offer.slug}` }
	const langHref = L.code === 'ua' ? `../../oferty/${offer.slug}.html` : `../ua/oferty/${offer.slug}.html`

	return (
		head({
			title: L.detailTitle(offer.title, offer.location),
			description: offer.lead,
			canonical: alternates[L.code],
			alternates,
			ogImage: `${SITE}/dist/offers/${offer.slug}/${offer.gallery[0].file}.jpg`,
		}) +
		`
<body class="offers-body offer-body">
    ${nav(langHref)}

    <main class="main">

        <div class="offer-top">
            <nav class="offer-breadcrumbs" aria-label="${L.breadcrumbsAria}">
                <a href="./" class="offer-breadcrumbs__back">${arrowLeft}${L.back}</a>
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
                    <h2 class="offer-section__title">${L.factsTitle}</h2>
                    ${factsList(offer.facts)}
                </section>

                <section class="offer-section">
                    <h2 class="offer-section__title">${L.descriptionTitle}</h2>
                    ${offer.intro.map(p => `<p class="offer-section__text">${esc(p)}</p>`).join('\n                    ')}
                </section>

                ${unitsHtml}
                ${featuresHtml}
                ${extrasHtml}
                ${plansHtml}
                ${surroundingsHtml}
                ${offer.note ? `<p class="offer-note">${esc(offer.note)}</p>` : ''}
            </div>

            <aside class="offer-aside" aria-label="${L.asideAria}">
                <div class="offer-agent">
                    <div class="offer-agent__person">
                        <img src="${dist()}/img/${agent.photo}" alt="${agent.name}" class="offer-agent__photo" width="72" height="72" loading="lazy">
                        <div>
                            <p class="offer-agent__name">${agent.name}</p>
                            <p class="offer-agent__role">${L.agentRole}</p>
                        </div>
                    </div>
                    <p class="offer-agent__text">${L.agentText}</p>
                    <a href="${agent.phoneHref}" class="offer-agent__btn offer-agent__btn--primary">${phoneIcon}${agent.phone}</a>
                    <a href="#contact" class="offer-agent__btn offer-agent__btn--ghost">${mailIcon}${L.agentWrite}</a>
                    <a href="mailto:${agent.mail}" class="offer-agent__mail">${agent.mail}</a>
                </div>
            </aside>
        </div>

        <section class="offer-more">
            <h2 class="section-heading">${L.moreTitle}</h2>
            <div class="offers__container">
                <ul class="offers__grid">
                    ${others.map(o => card(o)).join('\n                    ')}
                </ul>
            </div>
        </section>

        ${contact({
			placeholder: L.detailPlaceholder,
			message,
			offerTitle: `${offer.titlePl || offer.title} (${offer.locationPl || offer.location})`,
		})}
    </main>

    ${footer()}

` +
		scripts('offers')
	)
}

// Wersja UA: teksty z offers.ua.js, pola liczbowe i filtry z oferty bazowej
function localizeUa(offer, ua, uaGallery) {
	const texts = ua.texts[offer.slug]
	const g = uaGallery[offer.slug]
	if (!texts || !g) throw new Error(`Brak tłumaczenia UA dla oferty: ${offer.slug}`)

	const merged = { ...offer, ...texts, titlePl: offer.title, locationPl: offer.location }
	if (offer.units) {
		merged.units = offer.units.map(([, , price], index) => [texts.units[index][0], texts.units[index][1], price])
	}
	const withAlt = (items, translated, label) =>
		items.map((item, index) => {
			const t = translated[index]
			if (!t) throw new Error(`Brak tłumaczenia UA opisu zdjęcia ${index + 1} w ofercie ${offer.slug}`)
			return label ? { ...item, alt: t.alt, label: t.label } : { ...item, alt: t.alt }
		})
	merged.gallery = withAlt(offer.gallery, g.gallery, false)
	merged.plans = withAlt(offer.plans, g.plans, true)
	merged.mapImages = withAlt(offer.mapImages, g.extra, true)
	return merged
}

function writePages(lang, offers, cityLabels) {
	L = LANGS[lang]
	const outDir = path.join(root, L.dir)
	fs.mkdirSync(outDir, { recursive: true })

	const expected = new Set(['index.html', ...offers.map(o => `${o.slug}.html`)])
	for (const file of fs.readdirSync(outDir)) {
		if (file.endsWith('.html') && !expected.has(file)) fs.unlinkSync(path.join(outDir, file))
	}

	fs.writeFileSync(path.join(outDir, 'index.html'), listPage(offers, cityLabels))
	for (const offer of offers) {
		fs.writeFileSync(path.join(outDir, `${offer.slug}.html`), detailPage(offer, offers))
	}
}

function build() {
	for (const file of ['../src/data/offers.js', '../src/data/gallery.json', '../src/data/offers.ua.js', '../src/data/gallery.ua.json']) {
		delete require.cache[require.resolve(file)]
	}
	const offers = require('../src/data/offers.js')
	const ua = require('../src/data/offers.ua.js')
	const uaGallery = require('../src/data/gallery.ua.json')

	writePages('pl', offers, {})
	writePages(
		'ua',
		offers.map(offer => localizeUa(offer, ua, uaGallery)),
		ua.cities,
	)
	L = LANGS.pl
	return offers.length
}

module.exports = build

if (require.main === module) {
	console.log(`Wygenerowano ${build()} ofert w katalogach oferty/ i ua/oferty/`)
}
