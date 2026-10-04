// Interface strings (menus, buttons, labels). Page content lives in src/content/.
// To add a language: add it to `locales`, add a block to `ui`, and add content folders.

export const locales = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uz';

export const localeNames: Record<Locale, { short: string; long: string; hreflang: string; og: string }> = {
  uz: { short: 'UZ', long: 'Oʻzbekcha', hreflang: 'uz', og: 'uz_UZ' },
  ru: { short: 'RU', long: 'Русский', hreflang: 'ru', og: 'ru_RU' },
  en: { short: 'EN', long: 'English', hreflang: 'en', og: 'en_US' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

const en = {
  'skip': 'Skip to content',
  'menu.open': 'Open menu',
  'menu.close': 'Close menu',
  'lang.label': 'Language',

  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.about.overview': 'About the school',
  'nav.about.welcome': 'Director’s welcome',
  'nav.about.community': 'Statement of community',
  'nav.about.staff': 'Staff & leadership',
  'nav.about.employment': 'Employment',
  'nav.admissions': 'Admissions',
  'nav.academics': 'Academics',
  'nav.life': 'News & events',
  'nav.news': 'News',
  'nav.events': 'Events',
  'nav.gallery': 'Gallery',
  'nav.contact': 'Contact',
  'nav.childProtection': 'Child protection',
  'nav.privacy': 'Privacy policy',

  'common.readMore': 'Read more',
  'common.viewAll': 'View all',
  'common.back': 'Back',
  'common.photoSoon': 'Photo coming soon',
  'common.updated': 'Last updated',
  'common.breadcrumbs': 'Breadcrumbs',

  'home.news': 'Latest news',
  'home.events': 'Upcoming events',
  'home.gallery': 'Life at school',
  'home.welcome': 'Welcome',
  'home.explore': 'Explore',

  'news.title': 'News',
  'news.description': 'Stories, announcements and achievements from our school community.',
  'news.empty': 'No news yet.',

  'events.title': 'Events',
  'events.description': 'Upcoming and past events at our school.',
  'events.upcoming': 'Upcoming',
  'events.past': 'Past events',
  'events.empty': 'No upcoming events right now.',
  'events.location': 'Location',
  'events.when': 'When',

  'gallery.title': 'Gallery',
  'gallery.description': 'Moments from everyday school life.',
  'gallery.photos': 'photos',
  'gallery.close': 'Close',
  'gallery.prev': 'Previous photo',
  'gallery.next': 'Next photo',

  'staff.leadership': 'Leadership',
  'staff.teachers': 'Teachers',
  'staff.support': 'Support staff',
  'staff.all': 'All',

  'contact.details': 'Contact details',
  'contact.address': 'Address',
  'contact.phone': 'Phone',
  'contact.email': 'Email',
  'contact.hours': 'Opening hours',
  'contact.map': 'Open in maps',
  'contact.form.title': 'Send us a message',
  'contact.form.name': 'Full name',
  'contact.form.email': 'Email',
  'contact.form.phone': 'Phone (optional)',
  'contact.form.subject': 'Subject',
  'contact.form.subject.general': 'General question',
  'contact.form.subject.admissions': 'Admissions',
  'contact.form.subject.employment': 'Employment',
  'contact.form.subject.other': 'Other',
  'contact.form.message': 'Message',
  'contact.form.consent': 'I agree that my data will be processed to answer my request, as described in the privacy policy.',
  'contact.form.send': 'Send message',
  'contact.form.sending': 'Sending…',
  'contact.form.success': 'Thank you! Your message has been sent. We will get back to you soon.',
  'contact.form.error': 'Sorry, the message could not be sent. Please check the form or try again later.',
  'contact.thanks.title': 'Message sent',
  'contact.thanks.text': 'Thank you for contacting us. We will reply as soon as possible.',
  'contact.thanks.back': 'Back to the home page',

  'footer.quickLinks': 'Quick links',
  'footer.policies': 'Policies',
  'footer.follow': 'Follow us',
  'footer.rights': 'All rights reserved.',

  '404.title': 'Page not found',
  '404.text': 'The page you are looking for does not exist or has been moved.',
  '404.home': 'Go to the home page',
};

export type UIKey = keyof typeof en;

export const ui: Record<Locale, Record<UIKey, string>> = {
  en,
  uz: {
    'skip': 'Asosiy mazmunga oʻtish',
    'menu.open': 'Menyuni ochish',
    'menu.close': 'Menyuni yopish',
    'lang.label': 'Til',

    'nav.home': 'Bosh sahifa',
    'nav.about': 'Maktab haqida',
    'nav.about.overview': 'Maktab haqida',
    'nav.about.welcome': 'Direktor murojaati',
    'nav.about.community': 'Jamoa qadriyatlari',
    'nav.about.staff': 'Rahbariyat va xodimlar',
    'nav.about.employment': 'Boʻsh ish oʻrinlari',
    'nav.admissions': 'Qabul',
    'nav.academics': 'Taʼlim',
    'nav.life': 'Yangiliklar va tadbirlar',
    'nav.news': 'Yangiliklar',
    'nav.events': 'Tadbirlar',
    'nav.gallery': 'Galereya',
    'nav.contact': 'Aloqa',
    'nav.childProtection': 'Bolalar himoyasi',
    'nav.privacy': 'Maxfiylik siyosati',

    'common.readMore': 'Batafsil',
    'common.viewAll': 'Barchasi',
    'common.back': 'Orqaga',
    'common.photoSoon': 'Rasm tez orada',
    'common.updated': 'Yangilangan sana',
    'common.breadcrumbs': 'Navigatsiya yoʻli',

    'home.news': 'Soʻnggi yangiliklar',
    'home.events': 'Yaqinlashayotgan tadbirlar',
    'home.gallery': 'Maktab hayoti',
    'home.welcome': 'Xush kelibsiz',
    'home.explore': 'Koʻproq bilish',

    'news.title': 'Yangiliklar',
    'news.description': 'Maktab jamoamiz hayotidan xabarlar, eʼlonlar va yutuqlar.',
    'news.empty': 'Hozircha yangiliklar yoʻq.',

    'events.title': 'Tadbirlar',
    'events.description': 'Maktabimizdagi yaqinlashayotgan va oʻtgan tadbirlar.',
    'events.upcoming': 'Yaqinlashayotgan',
    'events.past': 'Oʻtgan tadbirlar',
    'events.empty': 'Hozircha rejalashtirilgan tadbirlar yoʻq.',
    'events.location': 'Manzil',
    'events.when': 'Sana',

    'gallery.title': 'Galereya',
    'gallery.description': 'Kundalik maktab hayotidan lavhalar.',
    'gallery.photos': 'ta rasm',
    'gallery.close': 'Yopish',
    'gallery.prev': 'Oldingi rasm',
    'gallery.next': 'Keyingi rasm',

    'staff.leadership': 'Rahbariyat',
    'staff.teachers': 'Oʻqituvchilar',
    'staff.support': 'Yordamchi xodimlar',
    'staff.all': 'Barchasi',

    'contact.details': 'Aloqa maʼlumotlari',
    'contact.address': 'Manzil',
    'contact.phone': 'Telefon',
    'contact.email': 'Elektron pochta',
    'contact.hours': 'Ish vaqti',
    'contact.map': 'Xaritada ochish',
    'contact.form.title': 'Bizga xabar yuboring',
    'contact.form.name': 'Ism-familiya',
    'contact.form.email': 'Elektron pochta',
    'contact.form.phone': 'Telefon (ixtiyoriy)',
    'contact.form.subject': 'Mavzu',
    'contact.form.subject.general': 'Umumiy savol',
    'contact.form.subject.admissions': 'Qabul',
    'contact.form.subject.employment': 'Ishga joylashish',
    'contact.form.subject.other': 'Boshqa',
    'contact.form.message': 'Xabar',
    'contact.form.consent': 'Maxfiylik siyosatiga muvofiq soʻrovimga javob berish uchun maʼlumotlarim qayta ishlanishiga roziman.',
    'contact.form.send': 'Yuborish',
    'contact.form.sending': 'Yuborilmoqda…',
    'contact.form.success': 'Rahmat! Xabaringiz yuborildi. Tez orada siz bilan bogʻlanamiz.',
    'contact.form.error': 'Kechirasiz, xabar yuborilmadi. Shaklni tekshiring yoki keyinroq urinib koʻring.',
    'contact.thanks.title': 'Xabar yuborildi',
    'contact.thanks.text': 'Biz bilan bogʻlanganingiz uchun rahmat. Imkon qadar tezroq javob beramiz.',
    'contact.thanks.back': 'Bosh sahifaga qaytish',

    'footer.quickLinks': 'Tezkor havolalar',
    'footer.policies': 'Hujjatlar',
    'footer.follow': 'Bizni kuzating',
    'footer.rights': 'Barcha huquqlar himoyalangan.',

    '404.title': 'Sahifa topilmadi',
    '404.text': 'Siz qidirayotgan sahifa mavjud emas yoki koʻchirilgan.',
    '404.home': 'Bosh sahifaga oʻtish',
  },
  ru: {
    'skip': 'Перейти к содержимому',
    'menu.open': 'Открыть меню',
    'menu.close': 'Закрыть меню',
    'lang.label': 'Язык',

    'nav.home': 'Главная',
    'nav.about': 'О школе',
    'nav.about.overview': 'О школе',
    'nav.about.welcome': 'Обращение директора',
    'nav.about.community': 'Ценности сообщества',
    'nav.about.staff': 'Руководство и коллектив',
    'nav.about.employment': 'Вакансии',
    'nav.admissions': 'Поступление',
    'nav.academics': 'Обучение',
    'nav.life': 'Новости и события',
    'nav.news': 'Новости',
    'nav.events': 'События',
    'nav.gallery': 'Галерея',
    'nav.contact': 'Контакты',
    'nav.childProtection': 'Защита детей',
    'nav.privacy': 'Политика конфиденциальности',

    'common.readMore': 'Подробнее',
    'common.viewAll': 'Смотреть все',
    'common.back': 'Назад',
    'common.photoSoon': 'Фото скоро появится',
    'common.updated': 'Обновлено',
    'common.breadcrumbs': 'Навигационная цепочка',

    'home.news': 'Последние новости',
    'home.events': 'Ближайшие события',
    'home.gallery': 'Жизнь школы',
    'home.welcome': 'Добро пожаловать',
    'home.explore': 'Узнать больше',

    'news.title': 'Новости',
    'news.description': 'Истории, объявления и достижения нашего школьного сообщества.',
    'news.empty': 'Новостей пока нет.',

    'events.title': 'События',
    'events.description': 'Предстоящие и прошедшие события нашей школы.',
    'events.upcoming': 'Предстоящие',
    'events.past': 'Прошедшие события',
    'events.empty': 'Сейчас нет запланированных событий.',
    'events.location': 'Место',
    'events.when': 'Когда',

    'gallery.title': 'Галерея',
    'gallery.description': 'Моменты повседневной школьной жизни.',
    'gallery.photos': 'фото',
    'gallery.close': 'Закрыть',
    'gallery.prev': 'Предыдущее фото',
    'gallery.next': 'Следующее фото',

    'staff.leadership': 'Руководство',
    'staff.teachers': 'Учителя',
    'staff.support': 'Сотрудники',
    'staff.all': 'Все',

    'contact.details': 'Контактная информация',
    'contact.address': 'Адрес',
    'contact.phone': 'Телефон',
    'contact.email': 'Эл. почта',
    'contact.hours': 'Часы работы',
    'contact.map': 'Открыть на карте',
    'contact.form.title': 'Напишите нам',
    'contact.form.name': 'Имя и фамилия',
    'contact.form.email': 'Эл. почта',
    'contact.form.phone': 'Телефон (необязательно)',
    'contact.form.subject': 'Тема',
    'contact.form.subject.general': 'Общий вопрос',
    'contact.form.subject.admissions': 'Поступление',
    'contact.form.subject.employment': 'Трудоустройство',
    'contact.form.subject.other': 'Другое',
    'contact.form.message': 'Сообщение',
    'contact.form.consent': 'Я согласен(на) на обработку моих данных для ответа на запрос в соответствии с политикой конфиденциальности.',
    'contact.form.send': 'Отправить',
    'contact.form.sending': 'Отправка…',
    'contact.form.success': 'Спасибо! Ваше сообщение отправлено. Мы скоро свяжемся с вами.',
    'contact.form.error': 'К сожалению, сообщение не отправлено. Проверьте форму или попробуйте позже.',
    'contact.thanks.title': 'Сообщение отправлено',
    'contact.thanks.text': 'Спасибо, что связались с нами. Мы ответим как можно скорее.',
    'contact.thanks.back': 'Вернуться на главную',

    'footer.quickLinks': 'Быстрые ссылки',
    'footer.policies': 'Документы',
    'footer.follow': 'Мы в соцсетях',
    'footer.rights': 'Все права защищены.',

    '404.title': 'Страница не найдена',
    '404.text': 'Страница, которую вы ищете, не существует или была перемещена.',
    '404.home': 'На главную',
  },
};

export function useTranslations(lang: Locale) {
  return (key: UIKey) => ui[lang][key] ?? ui[defaultLocale][key];
}

const dateLocales: Record<Locale, string> = { uz: 'uz-Latn-UZ', ru: 'ru-RU', en: 'en-GB' };

export function formatDate(date: Date, lang: Locale, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat(dateLocales[lang], { timeZone: 'Asia/Tashkent', ...opts }).format(date);
}
