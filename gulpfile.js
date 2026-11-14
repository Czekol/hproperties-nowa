const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const kit = require('gulp-kit');
const browserSync = require('browser-sync').create();

const paths = {
	// Części wspólne (używane przez @include) nie są budowane osobno,
	// bo korzystają ze zmiennych ustawianych w kitach podstron.
	html: ['./html/**/*.kit', '!./html/about.kit', '!./html/contact.kit', '!./html/reviews.kit'],
	htmlWatch: './html/**/*.kit',
	sass: './src/sass/**/*.scss',
	js: './src/js/**/*.js',
	img: './src/img/*',
	video: './src/video/*',
	dist: './dist',
	sassDest: './dist/css',
	jsDest: './dist/js',
	imgDest: './dist/img',
	videoDest: './dist/video',
};

// Kompilacja SCSS
function sassCompailer() {
	return src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDest))
		.pipe(browserSync.stream());
}

// Kompilacja JS
function javaScript() {
	return src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDest))
		.pipe(browserSync.stream());
}

// Optymalizacja obrazów
function convertImages() {
	return src(paths.img)
		.pipe(imagemin())
		.pipe(dest(paths.imgDest));
}

// Kopiowanie filmów (bez dodatkowej kompresji)
function copyVideos() {
	return src(paths.video)
		.pipe(dest(paths.videoDest));
}

// Kompilacja .kit do .html
function handleKits() {
	return src(paths.html)
		.pipe(kit())
		.pipe(dest('./'))
		.pipe(browserSync.stream());
}

// Czyszczenie folderu dist
function cleanStuff() {
	return src(paths.dist, { read: false, allowEmpty: true })
		.pipe(clean());
}

// Uruchomienie BrowserSync
function startBrowserSync(done) {
	browserSync.init({
		server: {
			baseDir: './',
		},
		notify: false,
		injectChanges: true,
	});
	done();
}

// Watchery
function watchForChanges(done) {
	watch(paths.htmlWatch, handleKits);
	watch(paths.sass, sassCompailer);
	watch(paths.js, javaScript);
	watch(paths.img, convertImages);
	watch(paths.video, copyVideos);
	done();
}

// Główne zadania
const mainFunctions = parallel(handleKits, sassCompailer, javaScript, convertImages, copyVideos);

exports.cleanStuff = cleanStuff;
exports.default = series(mainFunctions, startBrowserSync, watchForChanges);
