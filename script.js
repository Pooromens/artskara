// ---------- Translations ----------
const translations = {
  en: {
    'nav.work': 'Work',
    'nav.about': 'About',
    'nav.exhibitions': 'Exhibitions',
    'nav.contact': 'Contact',
    'hero.eyebrow': 'Painter, based in Chișinău',
    'hero.sub': 'Paintings built on the expressive power of color, light, and texture.',
    'hero.cta': 'View the work',
    'work.title': 'Selected Work',
    'work.hint': 'Drag, swipe or use the arrow keys',
    'meta.medium': 'Medium',
    'meta.size': 'Size',
    'medium.oil': 'Oil on canvas',
    'medium.acrylic': 'Acrylic on canvas',
    'medium.oilDiptych': 'Oil on canvas, diptych',
    'about.title': 'About',
    'about.p1': 'Irina Kara is a contemporary painter from Chișinău whose work is built on the expressive power of color, light, and texture. Trained as an architect, she brings a structural way of thinking together with an intuitive, emotional approach to painting.',
    'about.p2': 'In her work, color becomes the primary means of conveying mood, energy, and impression. A rich palette, dynamic brushwork, and a blend of abstract and semi-figurative forms create a recognizable visual language of her own.',
    'about.p3': 'Irina Kara has taken part in solo and international group exhibitions in Moldova and abroad, including projects in London. Her works are held in private collections in several countries.',
    'exhibitions.title': 'Exhibitions',
    'exhibitions.placeholderYear': 'Add year',
    'exhibitions.placeholderYear2': 'Add year',
    'exhibitions.placeholderItem': 'Exhibition title',
    'exhibitions.placeholderVenue': 'City, venue',
    'exhibitions.note': '— Replace with the actual exhibition history.',
    'contact.title': 'Contact',
    'contact.sub': 'For inquiries about available work, commissions, or studio visits.',
    'contact.cta': 'Email the studio',
  },
  ru: {
    'nav.work': 'Работы',
    'nav.about': 'Об авторе',
    'nav.exhibitions': 'Выставки',
    'nav.contact': 'Контакты',
    'hero.eyebrow': 'Художница из Кишинёва',
    'hero.sub': 'Живопись, построенная на выразительной силе цвета, света и фактуры.',
    'hero.cta': 'Смотреть работы',
    'work.title': 'Избранные работы',
    'work.hint': 'Листайте мышью, свайпом или стрелками',
    'meta.medium': 'Техника',
    'meta.size': 'Размер',
    'medium.oil': 'Холст, масло',
    'medium.acrylic': 'Холст, акрил',
    'medium.oilDiptych': 'Холст, масло, диптих',
    'about.title': 'Об авторе',
    'about.p1': 'Ирина Кара — современная художница из Кишинёва, чья живопись строится на выразительной силе цвета, света и фактуры. Архитектор по образованию, она соединяет структурное мышление с интуитивным и эмоциональным процессом живописи.',
    'about.p2': 'В её работах цвет становится главным средством передачи состояния, энергии и впечатления. Насыщенная палитра, динамичный мазок и сочетание абстрактных и полуфигуративных форм создают узнаваемый авторский язык.',
    'about.p3': 'Ирина Кара участвовала в персональных и международных групповых выставках в Молдове и за рубежом, включая проекты в Лондоне. Её работы находятся в частных коллекциях в разных странах.',
    'exhibitions.title': 'Выставки',
    'exhibitions.placeholderYear': 'Добавьте год',
    'exhibitions.placeholderYear2': 'Добавьте год',
    'exhibitions.placeholderItem': 'Название выставки',
    'exhibitions.placeholderVenue': 'Город, площадка',
    'exhibitions.note': '— Замените на реальную историю выставок.',
    'contact.title': 'Контакты',
    'contact.sub': 'По вопросам приобретения работ, заказов и визитов в студию.',
    'contact.cta': 'Написать',
  },
  ro: {
    'nav.work': 'Lucrări',
    'nav.about': 'Despre',
    'nav.exhibitions': 'Expoziții',
    'nav.contact': 'Contact',
    'hero.eyebrow': 'Pictoriță din Chișinău',
    'hero.sub': 'Pictură construită pe forța expresivă a culorii, luminii și texturii.',
    'hero.cta': 'Vezi lucrările',
    'work.title': 'Lucrări selectate',
    'work.hint': 'Trage, glisează sau folosește săgețile',
    'meta.medium': 'Tehnică',
    'meta.size': 'Dimensiuni',
    'medium.oil': 'Ulei pe pânză',
    'medium.acrylic': 'Acrilic pe pânză',
    'medium.oilDiptych': 'Ulei pe pânză, diptic',
    'about.title': 'Despre',
    'about.p1': 'Irina Kara este o pictoriță contemporană din Chișinău, a cărei pictură se construiește pe forța expresivă a culorii, luminii și texturii. Arhitectă de formație, ea îmbină gândirea structurată cu un proces de creație intuitiv și emoțional.',
    'about.p2': 'În lucrările sale, culoarea devine principalul mijloc de transmitere a stării, energiei și impresiei. O paletă intensă, tușa dinamică și îmbinarea formelor abstracte cu cele semi-figurative creează un limbaj artistic ușor de recunoscut.',
    'about.p3': 'Irina Kara a participat la expoziții personale și expoziții internaționale de grup în Moldova și peste hotare, inclusiv proiecte la Londra. Lucrările sale se află în colecții private din mai multe țări.',
    'exhibitions.title': 'Expoziții',
    'exhibitions.placeholderYear': 'Adaugă anul',
    'exhibitions.placeholderYear2': 'Adaugă anul',
    'exhibitions.placeholderItem': 'Titlul expoziției',
    'exhibitions.placeholderVenue': 'Oraș, locație',
    'exhibitions.note': '— Înlocuiește cu istoricul real al expozițiilor.',
    'contact.title': 'Contact',
    'contact.sub': 'Pentru întrebări despre lucrări disponibile, comenzi sau vizite la atelier.',
    'contact.cta': 'Scrie la atelier',
  },
};

const SUPPORTED_LANGS = Object.keys(translations);
const STORAGE_KEY = 'irinakara-lang';

function getStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch (e) {
    /* localStorage unavailable — ignore */
  }
  return 'en';
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = translations[lang][key];
    if (value !== undefined) el.textContent = value;
  });

  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-lang-btn') === lang);
  });

  document.documentElement.setAttribute('lang', lang);

  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    /* localStorage unavailable — ignore */
  }
}

document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
  btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang-btn')));
});

setLang(getStoredLang());

// ---------- Mobile menu toggle ----------
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('mobileMenu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Lightbox ----------
const zoomables = Array.from(document.querySelectorAll('.zoomable'));
const lightbox = document.getElementById('lightbox');

if (lightbox && zoomables.length) {
  const lightboxImg = lightbox.querySelector('.lightbox__img');
  const lightboxCaption = lightbox.querySelector('.lightbox__caption');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
  const nextBtn = lightbox.querySelector('.lightbox__nav--next');

  let currentIndex = -1;
  let lastFocused = null;

  function captionFor(img) {
    const figcaption = img.closest('figure')?.querySelector('figcaption');
    if (figcaption) return figcaption.textContent.replace(/\s+/g, ' ').trim();
    return img.alt || '';
  }

  function render(index) {
    const img = zoomables[index];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = captionFor(img);
  }

  function openLightbox(index) {
    currentIndex = index;
    lastFocused = document.activeElement;
    render(currentIndex);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastFocused) lastFocused.focus();
  }

  function step(delta) {
    currentIndex = (currentIndex + delta + zoomables.length) % zoomables.length;
    render(currentIndex);
  }

  zoomables.forEach((img, index) => {
    img.addEventListener('click', () => openLightbox(index));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

// ---------- Scroll-reveal via IntersectionObserver ----------
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}
