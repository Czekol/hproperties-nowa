// Strona ofert: wyszukiwarka, licznik zdjęć w galerii i powiększanie zdjęć (lightbox)

const isUa = document.documentElement.lang === 'uk'
const TEXT = isUa
	? {
			found: (visible, total, word) => `Знайдено ${visible} ${word} з ${total}`,
			words: ['пропозицію', 'пропозиції', 'пропозицій'],
			priceMonth: 'Ціна (zł/міс.)',
			price: 'Ціна (zł)',
			lightbox: 'Збільшене фото',
			close: 'Закрити',
			prev: 'Попереднє фото',
			next: 'Наступне фото',
		}
	: {
			found: (visible, total, word) => `Znaleziono ${visible} ${word} z ${total}`,
			words: ['ofertę', 'oferty', 'ofert'],
			priceMonth: 'Cena (zł/mies.)',
			price: 'Cena (zł)',
			lightbox: 'Powiększone zdjęcie',
			close: 'Zamknij',
			prev: 'Poprzednie zdjęcie',
			next: 'Następne zdjęcie',
		}

// Wyszukiwarka ofert
const searchForm = document.querySelector('#offers-search')

if (searchForm) {
	const cards = Array.from(document.querySelectorAll('#offers-grid .offer-card'))
	const emptyBox = document.querySelector('#offers-empty')
	const statusBox = document.querySelector('#offers-status')
	const statusText = document.querySelector('#offers-status-text')
	const resetBtn = document.querySelector('#offers-reset')
	const clearBtn = document.querySelector('#offers-clear')
	const moreBox = document.querySelector('#offers-more')
	const countBadge = document.querySelector('#offers-filter-count')
	const priceLabel = document.querySelector('#filter-price-label')
	const priceHint = document.querySelector('#offers-price-hint')
	const chips = Array.from(searchForm.querySelectorAll('.offers-search__chip'))
	const checks = Array.from(searchForm.querySelectorAll('input[name="udogodnienia"]'))
	const el = searchForm.elements

	const textFields = ['cena-od', 'cena-do', 'pow-od', 'pow-do', 'pokoje-od', 'pokoje-do', 'rok']
	const selectFields = ['typ', 'transakcja', 'lokalizacja', 'stan']
	const advanced = ['cena-od', 'cena-do', 'pow-od', 'pow-do', 'pokoje-od', 'pokoje-do', 'rok', 'stan']

	const plural = (n, [one, few, many]) => {
		const lastTwo = n % 100
		const last = n % 10
		if (isUa && last === 1 && lastTwo !== 11) return one
		if (!isUa && n === 1) return one
		return last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? few : many
	}

	const num = value => {
		const parsed = parseFloat(String(value).replace(/\s/g, '').replace(',', '.'))
		return Number.isFinite(parsed) ? parsed : null
	}

	const pressedMarkets = () => chips.filter(chip => chip.getAttribute('aria-pressed') === 'true').map(chip => chip.dataset.market)
	const checkedAmenities = () => checks.filter(box => box.checked).map(box => box.value)

	const readFilters = () => ({
		type: el.typ.value,
		transaction: el.transakcja.value,
		city: el.lokalizacja.value,
		condition: el.stan.value,
		priceFrom: num(el['cena-od'].value),
		priceTo: num(el['cena-do'].value),
		areaFrom: num(el['pow-od'].value),
		areaTo: num(el['pow-do'].value),
		roomsFrom: num(el['pokoje-od'].value),
		roomsTo: num(el['pokoje-do'].value),
		year: num(el.rok.value),
		markets: pressedMarkets(),
		amenities: checkedAmenities(),
	})

	const inRange = (value, from, to) => {
		if (from === null && to === null) return true
		if (value === null) return false
		if (from !== null && value < from) return false
		if (to !== null && value > to) return false
		return true
	}

	const matches = (card, f) => {
		const d = card.dataset
		if (f.type && d.type !== f.type) return false
		if (f.transaction && d.transaction !== f.transaction) return false
		if (f.city && d.city !== f.city) return false
		if (f.condition && d.condition !== f.condition) return false
		if (f.markets.length && !f.markets.includes(d.market)) return false
		if (f.amenities.length) {
			const have = d.amenities.split(' ')
			if (!f.amenities.every(item => have.includes(item))) return false
		}

		const priceActive = f.priceFrom !== null || f.priceTo !== null
		if (priceActive) {
			if (!f.transaction && d.transaction === 'wynajem') return false
			if (d.min === '') return false
			const min = Number(d.min)
			const max = Number(d.max)
			if (f.priceFrom !== null && max < f.priceFrom) return false
			if (f.priceTo !== null && min > f.priceTo) return false
		}

		if (!inRange(d.area === '' ? null : Number(d.area), f.areaFrom, f.areaTo)) return false
		if (!inRange(d.rooms === '' ? null : Number(d.rooms), f.roomsFrom, f.roomsTo)) return false
		if (f.year !== null && (d.year === '' || Number(d.year) < f.year)) return false
		return true
	}

	const syncUrl = () => {
		const params = new URLSearchParams()
		textFields.concat(selectFields).forEach(key => {
			if (el[key].value) params.set(key, el[key].value)
		})
		if (pressedMarkets().length) params.set('rynek', pressedMarkets().join(','))
		if (checkedAmenities().length) params.set('udogodnienia', checkedAmenities().join(','))
		const query = params.toString()
		history.replaceState(null, '', query ? `?${query}` : location.pathname)
	}

	const countAdvanced = () => {
		let total = advanced.filter(key => el[key].value.trim() !== '').length
		if (pressedMarkets().length) total += 1
		total += checkedAmenities().length
		return total
	}

	const apply = () => {
		const filters = readFilters()
		let visible = 0

		cards.forEach(card => {
			const show = matches(card, filters)
			card.hidden = !show
			if (show) visible += 1
		})

		const advancedCount = countAdvanced()
		const active = Boolean(filters.type || filters.transaction || filters.city) || advancedCount > 0

		countBadge.hidden = advancedCount === 0
		countBadge.textContent = advancedCount

		emptyBox.hidden = visible !== 0
		statusBox.hidden = !active
		if (active) {
			statusText.textContent = TEXT.found(visible, cards.length, plural(visible, TEXT.words))
		}

		priceLabel.textContent = filters.transaction === 'wynajem' ? TEXT.priceMonth : TEXT.price
		const priceActive = filters.priceFrom !== null || filters.priceTo !== null
		priceHint.hidden = !(priceActive && !filters.transaction)
		syncUrl()
	}

	const restoreFromUrl = () => {
		const params = new URLSearchParams(location.search)
		textFields.forEach(key => {
			const value = params.get(key)
			if (value !== null) el[key].value = value
		})
		selectFields.forEach(key => {
			const value = params.get(key)
			if (value !== null && Array.from(el[key].options).some(option => option.value === value)) el[key].value = value
		})
		const markets = (params.get('rynek') || '').split(',')
		chips.forEach(chip => chip.setAttribute('aria-pressed', String(markets.includes(chip.dataset.market))))
		const amenities = (params.get('udogodnienia') || '').split(',')
		checks.forEach(box => {
			box.checked = amenities.includes(box.value)
		})
	}

	const clearAll = () => {
		textFields.concat(selectFields).forEach(key => {
			el[key].value = ''
		})
		chips.forEach(chip => chip.setAttribute('aria-pressed', 'false'))
		checks.forEach(box => {
			box.checked = false
		})
		apply()
	}

	selectFields.forEach(key => el[key].addEventListener('change', apply))
	textFields.forEach(key => el[key].addEventListener('input', apply))
	checks.forEach(box => box.addEventListener('change', apply))
	chips.forEach(chip =>
		chip.addEventListener('click', () => {
			chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'))
			apply()
		}),
	)

	searchForm.addEventListener('submit', event => {
		event.preventDefault()
		apply()
		document.querySelector('#offers-grid').scrollIntoView({ behavior: 'smooth', block: 'start' })
	})

	resetBtn.addEventListener('click', clearAll)
	clearBtn.addEventListener('click', clearAll)

	restoreFromUrl()
	if (window.matchMedia('(width < 744px)').matches && countAdvanced() === 0) moreBox.open = false
	apply()
}

// Licznik zdjęć w przewijanej galerii (telefon)
const galleryTrack = document.querySelector('.offer-gallery__track')
const galleryCounter = document.querySelector('[data-gallery-current]')

if (galleryTrack && galleryCounter) {
	const items = Array.from(galleryTrack.children)
	let ticking = false

	galleryTrack.addEventListener(
		'scroll',
		() => {
			if (ticking) return
			ticking = true
			requestAnimationFrame(() => {
				const step = items[0].offsetWidth + 8
				const index = Math.round(galleryTrack.scrollLeft / step)
				galleryCounter.textContent = Math.min(items.length, Math.max(1, index + 1))
				ticking = false
			})
		},
		{ passive: true },
	)
}

// Powiększanie zdjęć
const lightboxTriggers = Array.from(document.querySelectorAll('[data-full]'))

if (lightboxTriggers.length) {
	const slides = []
	const indexByUrl = {}

	lightboxTriggers.forEach(trigger => {
		const url = trigger.dataset.full
		if (!(url in indexByUrl)) {
			indexByUrl[url] = slides.length
			slides.push({ url, alt: trigger.dataset.alt || '' })
		}
	})

	const icon = path =>
		`<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="${path}"/></svg>`

	const box = document.createElement('div')
	box.className = 'lightbox'
	box.setAttribute('role', 'dialog')
	box.setAttribute('aria-modal', 'true')
	box.setAttribute('aria-label', TEXT.lightbox)
	box.innerHTML = `
		<p class="lightbox__counter" aria-hidden="true"></p>
		<button type="button" class="lightbox__btn lightbox__btn--close" aria-label="${TEXT.close}">${icon('M6 6l12 12M18 6L6 18')}</button>
		<button type="button" class="lightbox__btn lightbox__btn--prev" aria-label="${TEXT.prev}">${icon('M15 5l-7 7 7 7')}</button>
		<div class="lightbox__figure"><img class="lightbox__img" alt=""></div>
		<button type="button" class="lightbox__btn lightbox__btn--next" aria-label="${TEXT.next}">${icon('M9 5l7 7-7 7')}</button>
		<p class="lightbox__caption"></p>
	`
	document.body.appendChild(box)

	const image = box.querySelector('.lightbox__img')
	const caption = box.querySelector('.lightbox__caption')
	const counter = box.querySelector('.lightbox__counter')
	const closeBtn = box.querySelector('.lightbox__btn--close')
	const prevBtn = box.querySelector('.lightbox__btn--prev')
	const nextBtn = box.querySelector('.lightbox__btn--next')
	const figure = box.querySelector('.lightbox__figure')

	let current = 0
	let lastFocused = null

	const show = index => {
		current = (index + slides.length) % slides.length
		const slide = slides[current]
		image.src = slide.url
		image.alt = slide.alt
		caption.textContent = slide.alt
		counter.textContent = `${current + 1} / ${slides.length}`

		const preload = slides[(current + 1) % slides.length]
		new Image().src = preload.url
	}

	const open = index => {
		lastFocused = document.activeElement
		show(index)
		box.classList.add('is-open')
		document.body.classList.add('stop-scrolling')
		closeBtn.focus()
	}

	const close = () => {
		box.classList.remove('is-open')
		document.body.classList.remove('stop-scrolling')
		image.removeAttribute('src')
		if (lastFocused) lastFocused.focus()
	}

	lightboxTriggers.forEach(trigger => {
		trigger.addEventListener('click', () => open(indexByUrl[trigger.dataset.full]))
	})

	closeBtn.addEventListener('click', close)
	prevBtn.addEventListener('click', () => show(current - 1))
	nextBtn.addEventListener('click', () => show(current + 1))

	box.addEventListener('click', event => {
		if (event.target === box || event.target === figure) close()
	})

	document.addEventListener('keydown', event => {
		if (!box.classList.contains('is-open')) return
		if (event.key === 'Escape') close()
		if (event.key === 'ArrowLeft') show(current - 1)
		if (event.key === 'ArrowRight') show(current + 1)
		if (event.key === 'Tab') {
			const focusable = [closeBtn, prevBtn, nextBtn]
			const first = focusable[0]
			const last = focusable[focusable.length - 1]
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first.focus()
			}
		}
	})

	let touchStartX = 0
	figure.addEventListener(
		'touchstart',
		event => {
			touchStartX = event.changedTouches[0].clientX
		},
		{ passive: true },
	)
	figure.addEventListener(
		'touchend',
		event => {
			const dx = event.changedTouches[0].clientX - touchStartX
			if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1))
		},
		{ passive: true },
	)
}
