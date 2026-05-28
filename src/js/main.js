// Hamburger menu
const hamburger = document.querySelector('.nav__hamburger')
const navLinksContainer = document.querySelector('.nav__links')
const navLinks = document.querySelectorAll('.nav__links-link')
const body = document.querySelector('body')
const shadow = document.querySelector('.nav__shadow')
const logo = document.querySelector('.nav__logo-img')
const hamburgerIcon = document.querySelector('.nav__hamburger-img')
const navLinksDesktop = document.querySelectorAll('.nav__links-link-desktop')

// Nav shadow
const nav = document.querySelector('.nav')

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

const hamburgerMenu = () => {
	navLinksContainer.classList.toggle('show-menu')
	body.classList.toggle('stop-scrolling')
	shadow.classList.toggle('show-shadow')
	nav.classList.add('nav-shadow')

	logo.classList.add('nav-open')
	hamburgerIcon.classList.add('nav-open')
}

const navShadow = () => {
	if (!nav.classList.contains('nav-shadow')) {
		nav.classList.toggle('nav-shadow')
		logo.classList.add('nav-open')
		hamburgerIcon.classList.add('nav-open')
		navLinksDesktop.forEach(link => link.classList.add('nav-open'))

		window.removeEventListener('scroll', navShadow)
	}
}

const changeLanguage = () => {
	chooseLanguageBox.classList.toggle('open')
	languageBox.classList.toggle('open')
}

const handleFaq = e => {
	const faqBox = e.target.closest('.faq-mini-container')
	const faqBoxText = faqBox.querySelector('.faq__box-text')
	const faqBoxIcon = faqBox.querySelector('.faq__box-icon')

	faqBoxText.classList.toggle('show')
	faqBoxIcon.setAttribute('src', '../../dist/img/minus.png')

	if (!faqBoxText.classList.contains('show')) {
		faqBoxIcon.setAttribute('src', '../../dist/img/plus-icon-faq.png')
	}
}

const foreignFaqOpen = () => {
	console.log(2)
  foreingFaqBox.forEach(el => el.classList.add('show'))
}

const currentYear = () => {
	year.textContent = new Date().getFullYear()
}

currentYear()

// Hamburger menu
hamburger.addEventListener('click', hamburgerMenu)
shadow.addEventListener('click', hamburgerMenu)
navLinks.forEach(el => el.addEventListener('click', hamburgerMenu))
// Nav
window.addEventListener('scroll', navShadow)
languageBox.addEventListener('click', changeLanguage)
faqItems.forEach(el => el.addEventListener('click', handleFaq))
foreingFaqLinks.forEach(el => el.addEventListener('click', foreignFaqOpen))


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
