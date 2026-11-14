// Nawigacja
const nav = document.querySelector('.nav')
const hamburger = document.querySelector('.nav__hamburger')
const navLinksContainer = document.querySelector('.nav__links')
const shadow = document.querySelector('.nav__shadow')
const body = document.querySelector('body')
const hasHero = Boolean(document.querySelector('.header'))

// Menu "Usługi" (mobile / tablet – akordeon w panelu)
const accordionToggle = document.querySelector('.nav__accordion-toggle')
const accordionMenu = document.querySelector('.nav__submenu')

// Menu "Usługi" (desktop – lista rozwijana)
const dropdown = document.querySelector('.nav__dropdown')
const dropdownToggle = document.querySelector('.nav__dropdown-toggle')

// Change language
const languageBox = document.querySelector('.nav__language')
const chooseLanguageBox = document.querySelector('.other-language')

// Faq open foreign languages
const foreingFaqLinks = document.querySelectorAll('.foreign-link')
const foreingFaqBox = document.querySelectorAll('.foreign-faq')

// Faq
const faqItems = document.querySelectorAll('.faq__container')

// Year
const year = document.querySelector('.footer-bottom__box-year')

const isMenuOpen = () => navLinksContainer.classList.contains('show-menu')

// Tło nawigacji pojawia się dopiero po przewinięciu strony (lub przy otwartym menu).
// Strony bez hero (np. wycena, polityka prywatności) mają je od razu.
const updateNavBackground = () => {
	const solid = !hasHero || window.scrollY > 10 || isMenuOpen()
	nav.classList.toggle('nav-shadow', solid)
}

const setAccordionOpen = open => {
	if (!accordionToggle || !accordionMenu) return
	accordionToggle.setAttribute('aria-expanded', open)
	accordionMenu.classList.toggle('open', open)
}

const setMenuOpen = open => {
	navLinksContainer.classList.toggle('show-menu', open)
	shadow.classList.toggle('show-shadow', open)
	body.classList.toggle('stop-scrolling', open)
	hamburger.setAttribute('aria-expanded', open)
	if (!open) setAccordionOpen(false)
	updateNavBackground()
}

const setDropdownOpen = open => {
	if (!dropdown || !dropdownToggle) return
	dropdown.classList.toggle('open', open)
	dropdownToggle.setAttribute('aria-expanded', open)
}

const changeLanguage = () => {
	chooseLanguageBox.classList.toggle('open')
	languageBox.classList.toggle('open')
}

// Faq: otwieranie / zamykanie pojedynczego pytania
const setFaqOpen = (faqBox, open) => {
	const faqBoxText = faqBox.querySelector('.faq__box-text')
	const faqBoxIcon = faqBox.querySelector('.faq__box-icon')

	faqBoxText.classList.toggle('show', open)
	faqBoxIcon.setAttribute('src', open ? '../../dist/img/minus.png' : '../../dist/img/plus-icon-faq.png')
}

const handleFaq = e => {
	const faqBox = e.target.closest('.faq-mini-container')
	setFaqOpen(faqBox, !faqBox.querySelector('.faq__box-text').classList.contains('show'))
}

// Link z menu typu index.html#faq-spadek otwiera od razu odpowiednie pytanie
const openFaqFromHash = () => {
	const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
	if (!target || !target.classList.contains('faq-mini-container')) return

	setFaqOpen(target, true)
	target.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const foreignFaqOpen = () => {
	foreingFaqBox.forEach(el => el.classList.add('show'))
}

const currentYear = () => {
	if (year) year.textContent = new Date().getFullYear()
}

currentYear()

// Nawigacja – tło po przewinięciu
updateNavBackground()
window.addEventListener('scroll', updateNavBackground, { passive: true })

// Hamburger menu
hamburger?.addEventListener('click', () => setMenuOpen(!isMenuOpen()))
shadow?.addEventListener('click', () => setMenuOpen(false))
// Kliknięcie w link zamyka panel (przycisk "Usługi" nie jest linkiem, więc go nie zamyka)
document.querySelectorAll('.nav__links a').forEach(el => el.addEventListener('click', () => setMenuOpen(false)))
accordionToggle?.addEventListener('click', () => setAccordionOpen(accordionToggle.getAttribute('aria-expanded') !== 'true'))

// Menu "Usługi" na desktopie
dropdownToggle?.addEventListener('click', () => setDropdownOpen(!dropdown.classList.contains('open')))
document.querySelectorAll('.nav__dropdown-link').forEach(el => el.addEventListener('click', () => setDropdownOpen(false)))
document.addEventListener('click', e => {
	if (!e.target.closest('.nav__dropdown')) setDropdownOpen(false)
})
document.addEventListener('keydown', e => {
	if (e.key !== 'Escape') return
	setDropdownOpen(false)
	if (isMenuOpen()) setMenuOpen(false)
})
window.addEventListener('resize', () => {
	if (window.innerWidth >= 1440 && isMenuOpen()) setMenuOpen(false)
})

languageBox?.addEventListener('click', changeLanguage)
faqItems.forEach(el => el.addEventListener('click', handleFaq))
foreingFaqLinks.forEach(el => el.addEventListener('click', foreignFaqOpen))

openFaqFromHash()
window.addEventListener('hashchange', openFaqFromHash)
// Kliknięcie w ten sam link drugi raz nie zmienia hasha, więc obsługujemy je osobno
document.addEventListener('click', e => {
	if (e.target.closest('a[href*="#faq-"]')) setTimeout(openFaqFromHash, 0)
})

// Poznaj H.Properties – po kliknięciu w kartę wysuwa się spod niej panel z opisem
const aboutCards = document.querySelectorAll('.about__card')

aboutCards.forEach(card => {
	const media = card.querySelector('.about__card-media')

	const toggleCard = () => {
		const open = card.classList.contains('is-open')

		aboutCards.forEach(other => {
			other.classList.remove('is-open')
			other.querySelector('.about__card-media').setAttribute('aria-expanded', 'false')
		})

		if (!open) {
			card.classList.add('is-open')
			media.setAttribute('aria-expanded', 'true')
		}
	}

	media.addEventListener('click', toggleCard)
	media.addEventListener('keydown', e => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			toggleCard()
		}
	})
})

// Hero – film w tle dobierany do szerokości ekranu (mobile / tablet / desktop)
const heroVideo = document.querySelector('.header__video')

if (heroVideo) {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
	let resizeTimer = null

	const loadHeroVideo = () => {
		// Przy ograniczonej animacji zostaje samo zdjęcie (poster / tło)
		if (reducedMotion.matches) return

		const width = window.innerWidth
		const key = width >= 1440 ? 'desktop' : width >= 744 ? 'tablet' : 'mobile'
		const src = heroVideo.dataset[key]

		if (heroVideo.getAttribute('src') === src) return

		heroVideo.muted = true
		heroVideo.setAttribute('src', src)
		heroVideo.play().catch(() => {})
	}

	loadHeroVideo()
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer)
		resizeTimer = setTimeout(loadHeroVideo, 200)
	})
}

document.addEventListener('DOMContentLoaded', () => {
	const container = document.querySelector('.reviews__container')
	if (!container) return

	const wrapper = container.querySelector('.reviews__wrapper')
	const dots = Array.from(container.querySelectorAll('.reviews__dot-box-dot'))

	// Strzałki – są poza .reviews__container (w .test-section)
	const btnPrev = document.querySelector('.reviews__nav--prev')
	const btnNext = document.querySelector('.reviews__nav--next')

	// Zachowujemy ORYGINALNE slajdy (bez klonów)
	const ORIGINAL_SLIDES = Array.from(wrapper.children).map(n => n.cloneNode(true))

	// Ile kart na ekranie
	function getVisibleCount() {
		return window.innerWidth >= 1440 ? 2 : 1 // desktop 2, mobile/tablet 1
	}

	// Źródło slajdów: mobile/tablet → 3 pierwsze; desktop → wszystkie
	function getSourceSlides() {
		const V = getVisibleCount()
		if (V === 1) return ORIGINAL_SLIDES.slice(0, 3)
		return ORIGINAL_SLIDES.slice()
	}

	// Zmienne stanu
	let SRC_SLIDES = []
	let REAL_COUNT = 0
	let slides = []
	let index = 1 // 1..p = realne strony; 0 i p+1 = klony
	let isDragging = false
	let startX = 0,
		currentX = 0
	let isAnimating = false

	// Pozycjonowanie
	function stepPx() {
		const styles = getComputedStyle(wrapper)
		const gap = parseInt(styles.gap, 10) || 0
		return container.offsetWidth + gap
	}
	function setTranslateInstant() {
		wrapper.style.transition = 'none'
		wrapper.style.transform = `translateX(${-index * stepPx()}px)`
		wrapper.offsetHeight // reflow
	}
	function _snap() {
		wrapper.style.transition = 'transform 0.4s ease'
		wrapper.style.transform = `translateX(${-index * stepPx()}px)`
	}
	function snap() {
		isAnimating = true
		_snap()
	}

	// Odblokowanie animacji, gdyby transitionend nie zadziałał (np. po kliknięciu „Pokaż więcej”)
	function forceUnlockAnimation() {
		if (!isAnimating) return
		wrapper.style.transition = 'none'
		wrapper.style.transform = `translateX(${-index * stepPx()}px)`
		wrapper.offsetHeight // reflow
		isAnimating = false
	}

	// Strony i kropki
	function pages() {
		const V = getVisibleCount()
		return Math.ceil(REAL_COUNT / V)
	}
	function updateDots() {
		const p = pages()
		const page = (index - 1 + p) % p // zmapuj na 0..p-1
		dots.forEach((d, i) => d.classList.toggle('active', i === page))
	}

	// Przebudowa (klony na końcach dla pętli)
	function rebuild() {
		const V = getVisibleCount()
		SRC_SLIDES = getSourceSlides()
		REAL_COUNT = SRC_SLIDES.length

		if (REAL_COUNT > 0 && REAL_COUNT < V) {
			const need = V - REAL_COUNT
			for (let i = 0; i < need; i++) {
				SRC_SLIDES.push(SRC_SLIDES[i % REAL_COUNT].cloneNode(true))
			}
			REAL_COUNT = SRC_SLIDES.length
		}

		wrapper.innerHTML = ''

		// realne
		SRC_SLIDES.forEach(n => wrapper.appendChild(n.cloneNode(true)))

		// V klonów z końca → na początek
		for (let i = 0; i < V; i++) {
			const src = SRC_SLIDES[REAL_COUNT - V + i].cloneNode(true)
			wrapper.insertBefore(src, wrapper.firstChild)
		}

		// V klonów z początku → na koniec
		for (let i = 0; i < V; i++) {
			const src = SRC_SLIDES[i].cloneNode(true)
			wrapper.appendChild(src)
		}

		slides = Array.from(wrapper.children)
		index = 1 // pierwsza realna strona
		setTranslateInstant()
		updateDots()
	}

	// Przejścia o stronę
	function nextPage() {
		index += 1
		snap()
	}
	function prevPage() {
		index -= 1
		snap()
	}

	// Swipe
	function getX(e) {
		return e.touches ? e.touches[0].clientX : e.clientX
	}
	function onStart(e) {
		if (isAnyExpanded()) pauseAutoplay()
		isDragging = true
		startX = currentX = getX(e)
		wrapper.style.transition = 'none'
	}
	function onMove(e) {
		if (!isDragging) return
		currentX = getX(e)
		const dx = currentX - startX
		wrapper.style.transform = `translateX(${-index * stepPx() + dx}px)`
	}
	function onEnd() {
		if (!isDragging) return
		isDragging = false

		const dx = currentX - startX
		const moved = Math.abs(dx) / stepPx()
		if (moved > 0.5) index += dx < 0 ? 1 : -1

		snap()
		if (!isAnyExpanded()) resumeAutoplay()
	}

	wrapper.addEventListener('touchstart', onStart, { passive: true })
	wrapper.addEventListener('touchmove', onMove, { passive: true })
	wrapper.addEventListener('touchend', onEnd)

	wrapper.addEventListener('mousedown', onStart)
	window.addEventListener('mousemove', onMove)
	window.addEventListener('mouseup', onEnd)

	// Pętla nieskończona (po stronie)
	wrapper.addEventListener('transitionend', () => {
		isAnimating = false
		const p = pages()
		if (index >= p + 1) {
			index -= p // skok wstecz o liczbę realnych stron
			setTranslateInstant()
		}
		if (index <= 0) {
			index += p // skok naprzód o liczbę realnych stron
			setTranslateInstant()
		}
		updateDots()
	})

	// Autoplay
	let autoplayTimer = null
	const AUTO_MS = 100000 // Twój timing
	function startAutoplay() {
		if (autoplayTimer || isAnyExpanded()) return
		autoplayTimer = setInterval(nextPage, AUTO_MS)
	}
	function pauseAutoplay() {
		if (autoplayTimer) {
			clearInterval(autoplayTimer)
			autoplayTimer = null
		}
	}
	function resumeAutoplay() {
		startAutoplay()
	}

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) pauseAutoplay()
		else resumeAutoplay()
	})

	// Kropki
	dots.forEach((dot, i) => {
		dot.addEventListener('click', () => {
			pauseAutoplay()
			index = 1 + i // strona 1 = pierwsza realna
			snap()
			if (!isAnyExpanded()) resumeAutoplay()
		})
	})

	// Złóż wszystkie rozwinięte opinie (używane przez strzałki)
	function collapseAllExpanded() {
		const expanded = document.querySelectorAll('.reviews__box.is-expanded')
		expanded.forEach(box => {
			box.classList.remove('is-expanded')
			const btn = box.querySelector('.reviews__box-show-more')
			if (btn) btn.textContent = 'Pokaż więcej'
		})
	}

	// Strzałki — force unlock + collapse → przewiń
	btnNext?.addEventListener('click', e => {
		e.preventDefault()
		e.stopPropagation()
		forceUnlockAnimation()
		collapseAllExpanded()
		pauseAutoplay()
		nextPage()
		if (!isAnyExpanded()) resumeAutoplay()
	})

	btnPrev?.addEventListener('click', e => {
		e.preventDefault()
		e.stopPropagation()
		forceUnlockAnimation()
		collapseAllExpanded()
		pauseAutoplay()
		prevPage()
		if (!isAnyExpanded()) resumeAutoplay()
	})

	// Inicjalizacja i responsywna przebudowa
	let lastV = getVisibleCount()
	rebuild()
	startAutoplay()

	window.addEventListener('resize', () => {
		const nowV = getVisibleCount()
		if (nowV !== lastV) {
			lastV = nowV
			rebuild()
		} else {
			setTranslateInstant()
			updateDots()
		}
	})

	// „Pokaż więcej”
	const boxes = Array.from(document.querySelectorAll('.reviews__box'))
	boxes.forEach(box => {
		const btn = box.querySelector('.reviews__box-show-more')
		const text = box.querySelector('.reviews__box-text')
		if (!btn || !text) return

		btn.addEventListener('click', e => {
			e.preventDefault()
			const expanded = box.classList.toggle('is-expanded')
			btn.textContent = expanded ? 'Pokaż mniej' : 'Pokaż więcej'
			if (expanded) pauseAutoplay()
			else if (!isAnyExpanded()) resumeAutoplay()
		})
	})

	function isAnyExpanded() {
		return document.querySelector('.reviews__box.is-expanded') !== null
	}
})
