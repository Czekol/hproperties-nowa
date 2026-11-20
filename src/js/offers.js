// Strona ofert: wyszukiwarka, licznik zdjęć w galerii i powiększanie zdjęć (lightbox)

// Wyszukiwarka ofert
const searchForm = document.querySelector('#offers-search')

if (searchForm) {
	const cards = Array.from(document.querySelectorAll('#offers-grid .offer-card'))
	const emptyBox = document.querySelector('#offers-empty')
	const statusBox = document.querySelector('#offers-status')
	const statusText = document.querySelector('#offers-status-text')
	const resetBtn = document.querySelector('#offers-reset')

	const fields = {
		typ: searchForm.elements.typ,
		lokalizacja: searchForm.elements.lokalizacja,
		'cena-od': searchForm.elements['cena-od'],
		'cena-do': searchForm.elements['cena-do'],
	}

	const plural = (n, one, few, many) => {
		if (n === 1) return one
		const lastTwo = n % 100
		const last = n % 10
		return last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? few : many
	}

	const readFilters = () => ({
		type: fields.typ.value,
		city: fields.lokalizacja.value,
		from: fields['cena-od'].value ? Number(fields['cena-od'].value) : null,
		to: fields['cena-do'].value ? Number(fields['cena-do'].value) : null,
	})

	const matches = (card, f) => {
		if (f.type && card.dataset.type !== f.type) return false
		if (f.city && card.dataset.city !== f.city) return false

		if (f.from !== null || f.to !== null) {
			if (card.dataset.min === '') return false
			const min = Number(card.dataset.min)
			const max = Number(card.dataset.max)
			if (f.from !== null && max < f.from) return false
			if (f.to !== null && min > f.to) return false
		}
		return true
	}

	const syncUrl = () => {
		const params = new URLSearchParams()
		Object.keys(fields).forEach(key => {
			if (fields[key].value) params.set(key, fields[key].value)
		})
		const query = params.toString()
		history.replaceState(null, '', query ? `?${query}` : location.pathname)
	}

	const apply = () => {
		const filters = readFilters()
		const active = Boolean(filters.type || filters.city || filters.from !== null || filters.to !== null)
		let visible = 0

		cards.forEach(card => {
			const show = matches(card, filters)
			card.hidden = !show
			if (show) visible += 1
		})

		emptyBox.hidden = visible !== 0
		statusBox.hidden = !active

		if (active) {
			statusText.textContent = `Znaleziono ${visible} ${plural(visible, 'ofertę', 'oferty', 'ofert')} z ${cards.length}`
		}
		syncUrl()
	}

	const restoreFromUrl = () => {
		const params = new URLSearchParams(location.search)
		Object.keys(fields).forEach(key => {
			const value = params.get(key)
			if (value === null) return
			const exists = Array.from(fields[key].options).some(option => option.value === value)
			if (exists) fields[key].value = value
		})
	}

	Object.keys(fields).forEach(key => fields[key].addEventListener('change', apply))

	searchForm.addEventListener('submit', event => {
		event.preventDefault()
		apply()
		document.querySelector('#offers-grid').scrollIntoView({ behavior: 'smooth', block: 'start' })
	})

	resetBtn.addEventListener('click', () => {
		Object.keys(fields).forEach(key => {
			fields[key].value = ''
		})
		apply()
	})

	restoreFromUrl()
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
	box.setAttribute('aria-label', 'Powiększone zdjęcie')
	box.innerHTML = `
		<p class="lightbox__counter" aria-hidden="true"></p>
		<button type="button" class="lightbox__btn lightbox__btn--close" aria-label="Zamknij">${icon('M6 6l12 12M18 6L6 18')}</button>
		<button type="button" class="lightbox__btn lightbox__btn--prev" aria-label="Poprzednie zdjęcie">${icon('M15 5l-7 7 7 7')}</button>
		<div class="lightbox__figure"><img class="lightbox__img" alt=""></div>
		<button type="button" class="lightbox__btn lightbox__btn--next" aria-label="Następne zdjęcie">${icon('M9 5l7 7-7 7')}</button>
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
