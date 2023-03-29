/**
 * choicesLength should be 3, e.g. машина | машины | машин
 * @param {number} num
 * @param {number} choicesLength
 * @return {number}
 */
export function pluralizationRule(num, choicesLength) {
    // 0 машин - third options
    if (num === 0) {
        return 2;
    }

    const teen = num > 10 && num < 20;
    const endsWithOne = num % 10 === 1;
    // 1 машина, 101 машина
    if (!teen && endsWithOne) {
        return 0;
    }
    // 2-4 машины, 22-24 машины, 132-134 машины
    if (!teen && num % 10 >= 2 && num % 10 <= 4) {
        return 1;
    }

    // 5-10 машин, 11-20 машин, 135-140 машин
    return 2;
}


export default {
    common: {
        'logout': 'Выйти',
        'copy': 'Копировать',
        'clipboard': 'Скопировано в буфер обмена',
        'close': 'Закрыть',
        'search': 'Поиск…',
        'continue': 'Продолжить',
        'finish': 'Завершить',
        'retry': 'Попробовать снова',
        'apr': 'Годовых',
        'apy': 'Годовых',
        'in': 'в',
        'from': 'от',
        'to': 'до',
        'upto': 'до',
        'or': 'или',
        'terms': 'Условия',
        'learn-more': 'Подробнее',
        'buy': 'Купить',
    },
    error: {
        'title-error': 'Ошибка',
        'message-network': 'Сетевая ошибка',
        'message-404': 'К сожалению, здесь ничего нет. Проверьте правильность адреса или просто перейдите на главную страницу.',
        'message-504': 'Ответ от сервера не был получен за отведенное время.',
        'message-503': 'Страница временно недоступна. Она перегружена или производится техническое обслуживание.',
        'refresh-link': 'Обновить страницу',
        'return-link': 'Перейти на главную',
        'not-synchronized-with-network': 'Не синхронизировано с сетью',
        'no-internet-connection': 'Отсутствует соединение с Интернетом',
    },
    index: {
        'title': 'Крипто-кошелек, помогающий зарабатывать',
        'description': 'Honee — это простейший крипто-кошелек, помогающий тебе делать деньги в один клик благодаря удобным карточкам заработка.',


        'hello-title': 'Простейший крипто-кошелек помогающий зарабатывать',
        'hello-description': 'Honee помогает зарабатывать криптовалюту. Присоединяйтесь сегодня!',
        'hello-button': 'Начать зарабатывать',
        'hello-coming': 'Альфа запуск 28 Сентября 2021',

        'input-email-error-required': 'Укажите e-mail',
        'input-email-error-invalid': 'Некорректный e-mail',
        'subscribe-button': 'Отправить',
        'subscribe-success': 'Отлично, мы сообщим вам!',

        'video-title': 'Что такое Honee?',
        'video-description': 'Посмотрите 30-секундное видео',
        'video-url': 'https://www.youtube.com/embed/dqi1569ICTQ',


        'features-title': 'Крипто-кошелек, каким он должен быть',
        'features-description': 'Узнайте, почему Honee — это {0} крипто-кошелек',
        'features-description-highlight': 'тот самый',

        'features-item1-title': 'Отличный для заработка',
        'features-item1-description': 'Криптовалюты и децентрализованные финансы — это непросто, но мы сделали всю сложную работу за вас. Наслаждайтесь нашими решениями «в один клик» и применяйте лучшие инструменты для заработка к своему балансу.',
        'features-item2-title': 'Простой в использовании',
        'features-item2-description': 'Наша цель — не только помочь вам зарабатывать, но и делать это удобно. Honee прост и дружествен к пользователю на каждом шагу.',
        'features-item3-title': 'Лучший для трейдинга',
        'features-item3-description': 'Покупайте, продавайте и обменивайте Bitcoin, Ether, USDT и другую популярную криптовалюту мгновенно и по самым низким комиссиям в индустрии.',
        'features-item4-title': 'Приватный & безопасный',
        'features-item4-description': 'Вы — единственный, у кого есть доступ к вашему кошельку. Мы не храним вашу сид-фразу.',
        'features-item5-title': 'Полностью децентрализованный',
        'features-item5-description': 'Это значит, что вы и только вы — хозяин своих денег. Не биржа, не кошелек, а вы. Никто не может остановить или ограничить ваши действия.',
        'features-item6-title': 'Вознаграждающий',
        'features-item6-description': 'В Honee есть широкие программы по наградам для пользователей за выполнение различных действий. Это лучший способ выиграть крипту или получить ее бесплатно.',

        'steps-title': 'Два простых шага, чтобы начать',
        'steps-description': 'Всего пару минут — и готово!',
        'steps-step1': 'Создайте кошелек',
        'steps-step2': 'Пополните его',
        'steps-button': 'Начать',

        'follow-title': 'Подписывайтесь',

        'footer-disclaimer-title': 'Отказ от ответственности',
        'footer-disclaimer-p1': 'Операции с виртуальными активами сопряжены с внутренними рисками, включая денежные потери. Мы настоятельно рекомендуем обратиться за профессиональной консультацией, прежде чем совершать какие-либо операции с виртуальными активами.',
        'footer-disclaimer-p2': 'Мы не даем никаких гарантий, явных или подразумеваемых, в отношении пригодности или удобства использования сервиса, его программного обеспечения или любого его содержимого. Мы не несем ответственности за любые убытки, — прямые, косвенные, особые или вытекающие, — понесенные любой стороной в результате использования сервиса Honee, его функций и содержимого.',
        'footer-disclaimer-p3': 'Комиссии внутри блокчейна, которые взимаются за проведение транзакций, не являются платой за использование сервиса Honee.',
        'footer-disclaimer-p4': 'Если вы столкнулись с какими-либо ошибками, сбоями, отсутствием функциональности или другими проблемами во время использования сервиса Honee, свяжитесь с нами:',

        'footer-menu-useful': 'Полезная информация',
        'footer-menu-about': 'О Honee',
        'footer-menu-contacts': 'Контакты',

        'footer-link-box-buy-bitcoin': 'Купить Биткоин',
        'footer-link-box-earn-bitcoin': 'Заработать Биткоин',
        'footer-link-box-wallet-bitcoin': 'Биткоин кошелек',

        'total-balance': 'Мой баланс',
        'balance': 'Баланс',
        'wallet-balance-links': 'Купить BIP, HUB & BEE',
        'topup': '&#43; Пополнить',
        'topup-instant': '&#43; Мгновенно пополнить',
        'withdraw': '&#8599; Вывести',
        'swap': 'Купить',
        'swap-wallet-button': 'Обменять',
        'send': 'Отправить',
        'receive': 'Получить',

        'assets-coins': 'Монеты',
        'assets-coins-sell-all': 'Продать все монеты',
        'assets-coins-view-all': 'Показать все монеты',
        'assets-coins-view-less': 'Показать меньше монет',
        'assets-stakes': 'Стейки',
        'assets-stakes-table-token': 'Токен',
        'assets-stakes-table-unlock': 'Разблокировка',
        'assets-stakes-table-unlock-on': 'Разблокировка',
        'assets-stakes-table-amount': 'Количество',
        'assets-transactions': 'Транзакции',
        'nostakes': 'Еще нет стейков',
        'error-stake-list': 'Не удается загрузить список стейков',

        'card-twitter-description': 'Зарабатывайте BEE за ретвиты и лайки в Twitter! Перейдите в Telegram-бот для получения дальнейшей инструкции.',
        'card-twitter-button': 'Подключиться',

        'card-button-deposit': 'Купить за BNB или ETH',
        'add-liquidity': 'Добавить',
        'delegate': 'Делегировать',
        'participate': 'Участвовать',
        'withdraw-unbond': 'Отозвать',
        'stake': 'Застейкать',
        'portfolio-list-empty': 'Портфелей еще нет',

        'investments-title': 'Мои инвестиции',
        'investments-tabs-label-0': 'Всё',
        'investments-tabs-label-portfolio': 'Портфели',
        'investments-tabs-label-stake': 'Стейки',
        'investments-list-empty': 'У вас еще нет инвестиций',
        'stake-more': 'Застейкать еще',
        'total-delegated': 'Делегировано',
        'delegate-more': 'Делегировать',

        'sign-up-subtitle': 'Крипто-кошелек для заработка',
        'sign-up': 'Регистрация',
        'or': 'или',
        'sign-in': 'Вход',
        'already-have-wallet': 'У меня уже есть кошелёк',

        'sign-up-2': 'Регистрация',
        'save-phrase-warning': 'Сохраните эту сид-фразу, чтобы получать доступ к своим средствам в будущем.',
        'save-phrase-checkbox': 'Я сохранил(-а) фразу!',
        'launch-honee': 'Запустить Honee',
        'save-phrase-error': 'Сперва нужно подтвердить, что вы сохранили фразу',
        'back': 'Назад',
        'back-index': 'Назад в кошелек',
        'create-wallet-disclaimer': 'Мы не предоставляем услуги по хранению виртуальных активов. Вы несете единоличную ответственность за хранение сид-фразы в безопасном месте. Вы должны сделать резервную копию сид-фразы сразу после ее создания. Если вы потеряете сид-фразу, то не сможете ее восстановить и потеряете все свои средства, хранящиеся в соответствующем кошельке.',

        'enter-seed': 'Введите свою сид-фразу',
        'seed-not-entered': 'Сид-фраза не введена',
        'invalid-seed': 'Неверная сид-фраза',

        'loading': 'Загрузка…',
        'keep-page-active': 'Не закрывайте и не обновляйте страницу, в противном случае прогресс может быть утерян.',

        'receive-coins': 'Получить монеты',
        'my-address': 'Мой адрес',
        'your-address': 'Ваш адрес',
        'share-address': 'Поделиться',
        'top-up-with-eth': 'Пополнить через BNB или ETH',

        'support-banner-link': 'Задавайте ваши вопросы в чате',

        'delegation': 'Делегирование',
        'delegation-desc': 'Привязка ваших BIP или кастомных монет к валидатору сети для получения вознаграждений (часть наград за блоки + комиссий за транзакции). Распределяются между всеми делегаторами пропорционально их стейку за вычетом комиссии валидатора.',
        'validators': 'Валидаторы',
        'providing-liquidity': 'Предоставление ликвидности',
        'provide-liquidity': 'Предоставить ликвидность',
        'withdraw-liquidity': 'Отозвать ликвидность',
        'liquidity-pools': 'Пулы ликвидности',
        'farming-programs': 'Фарминг-программы',
        'giveaway-programs': 'Лотереи',

        'cam-allow': 'Разрешите доступ к камере',
    },
    topup: {
        'title': 'Пополнить баланс',
        'description': 'Выберите способ ниже',
        'top-up-with-network': 'Через {network}',
        'top-up-with-card2card': 'С карты на карту',
        'waiting-topup': 'Ожидаем транзакцию пополнения',
        'cancel': 'Отмена',
        'back': 'Назад',
        'confirm-deposit-title': 'Депозит',
        'deposit-sw-balance-description': 'На вашем смарт-кошельке есть доступные средства. Хотите зачислить?',
        'deposit-evm-balance-description': 'На вашем {network} адресе доступные средства. Хотите зачислить?',
        'deposit-evm-balance-button': 'Зачислить',
    },
    deposit: {
        'title': 'Мгновенное пополнение',
        'description': 'Пополните баланс любым из следующих способов.',
        'title-evm': 'Ethereum & BNB Smart Chain',
        'description-evm': 'Переведите любой токен (ERC20 или BEP20) из сети Ethereum или BNB Smart Chain на этот адрес.',
        'smart-wallet-address': 'Адрес смарт-кошелька',
        'title-card': 'Банковские карты',
        'description-card': 'Пополнить с помощью банковской карты.',
        'button-card': 'Пополнить с карты',
        'title-minter': 'Minter Network',
        'description-minter': 'Переведите любой токен из Minter на этот адрес.',
        'minter-address': 'Адрес Minter кошелька',
    },
    'topup-network': {
        'title': 'Пополнить через',
        'description': 'Отправьте любое кол-во {coin} на адрес ниже',
        'description-minter': 'Отправьте любое количество {coin}, BEE или другого Minter-токена на адрес ниже',
        'copy': 'Копировать',
        'share': 'Поделиться',
        'show-qr': 'Показать QR',
        'hide-qr': 'Скрыть QR',
    },
    referral: {
        'header-button': 'Реф. ссылка',
        'invite-friend': 'Реферальная ссылка',
        'title': 'Зарабатывай с Honee',
        'activate-button': 'Активировать реферальную ссылку',
        'deactivate-button': 'Деактивировать реферальную ссылку',
        'success-title': 'Реферальная ссылка активирована',
        'success-description': 'Скопируйте ссылку из адресной строки вашего браузера на любой странице Honee и поделитесь ею с друзьями.',
        'success-deactivate-title': 'Реферальная ссылка деактивирована',
        'success-deactivate-description': 'Реферальная ссылка в адресной строке отключена. Вы можете активировать её вновь в любой момент.',
    },
    receive: {
        'title': 'Адрес вашего кошелька',
    },
    'stake-by-lock': {
        'form-amount-error-limit': 'Превышен лимит программы (макс: {max} {coin})',
        'estimation-unlock': 'Срок разблокировки стейка',
        'estimation-unlock-preposition': ' ',
        'estimation-buy': 'Вы купите и застейкуете примерно',
        'estimation-earn': 'Вы заработаете',
        'confirm-lock': 'Вы стейкуете',
        'error-program-not-found': 'Не удаётся загрузить программу стейкинга',
        'error-program-disabled': 'Текущая программа стейкинга отключена',
        'error-program-timeout': 'Истекло время действия программы стейкинга',
        'submit-button': 'Застейкать',
    },
    onboarding: {
        'skip': 'Пропустить',
        'welcome': 'Добро пожаловать в Honee!',
        'text-added': 'Вы пополнили свой баланс на',
        'text-earning': '. Начните зарабатывать всего в пару кликов!',
        'text-choose': 'Для этого выберите одну из наших программ:',
    },
    premium: {
        'activate-title': 'Стань премиум пользователем',
        'activate-title-short': 'Премиум',
        'activate-description': 'Для активации премиум аккаунта отправьте в блокировку от 1000 BEE. Срок блокировки 5 лет. После окончания этого срока ваши монеты будут снова доступны для использования.',
        'card-update-button': 'Повысить уровень',
        'levels-title': 'Уровни премиума',
        'levels-more': 'подробнее',
        'levels-more-url': 'https://honee.app/ru/bee',
    },
    portfolio: {
        'manage-create-title': 'Создание портфеля',
        'manage-edit-title': 'Редактирование портфеля',
        'manage-token-list-title': 'Токены',
        'manage-coin-label': 'Токен #{index}',
        'manage-coin-remove': 'Удалить',
        'manage-coin-add': 'Добавить другой токен',
        'manage-tokens-error-min': 'Минимум {count} монет',
        'manage-tokens-error-max': 'Максимум {count} монет',
        'warning-price-impact': 'Высокое влияние на цену',
        'warning-price-impact-description': 'Вы потеряете ≈{impact}% монет из-за комиссий или низколиквидных пулов, участвующих в обменах. Попробуйте изменить сумму.',
        'warning-price-impact-unavailable-description': 'Проверьте рассчитанные суммы до подтверждения',
        'allocation-sum': 'Текущая суммарная доля',
        'allocation-sum-error': 'Сумма долей активов должна быть равна 100%. Внесите дополнительные токены или измените соотношение.',
        'manage-title-label': 'Название',
        'manage-title-error-required': 'Введите название',
        'manage-description-label': 'Короткое описание (не обязательно)',
        'manage-create-button': 'Создать',
        'manage-edit-button': 'Редактировать',
        'manage-save-button': 'Сохранить',
        'manage-confirm-create-title': 'Подтверждение создания портфеля',
        'manage-confirm-edit-title': 'Подтверждение редактирования портфеля',
        'manage-confirm-description': 'Короткое описание',
        'manage-success-created': 'Портфель успешно создан!',
        'manage-success-edited': 'Портфель успешно обновлен!',
        'manage-success-view': 'Смотреть портфель',
        'create-requirements-description': 'Вам нужно быть Премиум пользователем или быть залогиненным через Telegram, чтобы создать портфель.',
        'head-copy-of': 'Копия',
        'head-profit-7d': '7 дней',
        'head-profit-awp': 'Средняя прибыль в неделю',
        'head-profit-last-update': 'Последнее обновление',
        'head-balance': 'Баланс',
        'view-button': 'Перейти',
        'buy-title': 'Купить портфель',
        'buy-button': 'Купить',
        'buy-more-button': 'Купить ещё',
        'sell-title': 'Продать портфель',
        'sell-button': 'Продать',
        'tokens-buy-label': 'Токены для покупки',
        'tokens-sell-label': 'Токены на продажу',
        'tokens-buy-disabled-label': 'Не доступно для покупки',
        'tokens-sell-disabled-label': 'Не доступно для продажи',
        'list-title': 'Портфели',
        'list-recommend-title': 'Рекомендованные портфели',
        'list-recommend-empty': 'Здесь будут показаны прибыльные портфели, которые были недавно обновлены управляющими.',
        'list-top-title': 'Топ портфели',
        'list-all-title': 'Все портфели',
        'list-managed-title': 'Управление портфелями',
        'list-managed-empty': 'У вас пока нет созданных портфелей',
        'list-my-title': 'Мои портфели',
        'tabs-label-apy': 'Годовая доходность',
        'tabs-label-awp': 'Средний доход',
        'tabs-label-7d': 'Последние 7 дней',
        'tabs-label-weekly': 'Последняя неделя',
        'tabs-label-live': 'Лайв',

        'subscribe-notification-title': 'Не пропускайте сигналы',
        'subscribe-notification-description': 'Получайте мгновенные уведомления через Telegram-бота каждый раз, когда этот портфель обновляется.',
        'subscribe-notification-button': 'Активировать Honee Bot',
        'subscribe-notification-сancel': 'Отменить',

        'legend-title': 'Описание метрик',
        'legend-apy': 'APY - прогнозируемая годовая доходность на основе последних 10 обновлений',
        'legend-awp': 'AWP - средненедельная доходность за последние 5 календарных недель',
        'legend-live': 'LIVE - прибыль с начала недели',
        'legend-1w': '1W - прибыль за последнюю календарную неделю',
        'legend-7d': '7D - прибыль за последние 7 дней',

        'view-all': 'Смотреть все портфели',
        'create-new-link': 'Создать свой портфель',

        'leaderboard-title': 'Прибыль пользователей',
        'leaderboard-column-address': 'Адрес',
        'leaderboard-column-portfolio': 'Портфель',
        'leaderboard-column-rank': 'Ранг',
        'leaderboard-column-address-and-portfolio': 'Адрес и портфель',
        'leaderboard-column-profit': 'Профит',
        'leaderboard-view-all': 'Посмотреть все',

        'tabs-label-battle-current': 'Текущая неделя',
        'tabs-label-battle-previous': 'Победители',
        'battle-title': 'Битва портфелей',
        'battle-column-portfolio': 'Портфель',
        'battle-column-tokens': 'Токены',
        'battle-column-balance': 'Баланс, $',
        'battle-column-profit': 'Профит',
    },
    action: {
        'title-buy': 'Купите BIP, HUB и BEE',
        'title-buy-coin': 'Купить {coin}',
        'title-swap': 'Обменяйте монеты',
        'title-swap-combined': '@:action.title-swap {coin0} {conjunction} {coin1}',
        'title-swap-coin0-empty': '',
        'title-swap-conjunction': 'на',
        'title-swap-bsc': 'Обмен через BSC',
        'title-send': 'Отправьте монеты',
        'title-win': 'Выигрывайте',
        'title-farm': 'Участвуйте в фарминге',
        'title-add-liquidity': 'Предоставьте ликвидность в пул',
        'title-remove-liquidity': 'Отзыв ликвидности из пула',
        'title-delegate': 'Делегируйте',
        'title-unbond': 'Отзыв монет из делегирования',
        'title-stake': 'Стейкинг',
        'title-sell-balance': 'Продажа всех монет',
        'title-not-found': 'Действие не найдено',
        'tag-exchange': 'Обмен',
        'tag-staking': 'Стейкинг',
        'tag-farming': 'Фарминг',
        'tag-lottery': 'Лотерея',
        'category-swap': 'Обмен',
        'category-earn': 'Заработок',
        'category-win': 'Розыгрыш',
    },
    form: {
        'toggle-simple-mode': 'Убрать сообщение',
        'toggle-advanced-mode': 'Добавить сообщение',

        'generate-button': 'Сгенерировать',
        'generate-nonce-error-min': 'Минимум 1',
        'generate-nonce-help': 'Уникальный номер транзакции: кол‑во транзакций пользователя + 1',
        'generate-result-tx': 'Подписанная транзакция',

        'confirm-title': 'Отправить транзакцию',
        'submit-confirm-button': 'Подтвердить',
        'submit-cancel-button': 'Отменить',
        'success-title': 'Успех',
        'swap-success-desc': 'Монеты были успешно обменяны',
        'success-view-button': 'Смотреть транзакцию',
        'success-close-button': 'Закрыть',

        'coin': 'Монета',
        'coins-2': 'монет(-ы)',
        'coin-error-required': 'Укажите монету',
        'coin-error-min': 'Минимум 3 символа',
        'coin-error-max': 'Максимум 10 символов',
        'coin-error-name': 'Некорректный символ монеты',
        'amount': 'Количество',
        'amount-error-required': 'Укажите количество',
        'amount-error-min': 'Минимум',
        'number-invalid': 'Укажите положительное целое число',
        'fee': 'Монета для оплаты комиссии',
        'fee-help': 'В эквиваленте {coin} {value}',
        'fee-error-insufficient': 'Не хватает на оплату комиссии',
        'gas-price': 'Цена газа',
        'gas-price-error-min': 'Минимум 1',
        'message': 'Сообщение',
        'message-error-max': 'Максимум 10000 байт',
        'message-error-contains-seed': 'Сообщение содержит seed-фразу',
        'message-help': 'Сообщение к транзакции. Произвольный набор символов. Обратите внимание, что информация, находящаяся здесь, будет видна всем участникам&nbsp;сети.',
        'help-default': 'По-умолчанию:',
        'tx-sent': 'Транзакция отправлена:',
        'to-address': 'На адрес',

        'unfinished-purchase': 'У вас имеется неоконченная покупка, желаете продолжить?',
        'current-balance': 'Текущий баланс',
        'required-balance': 'Необходимый баланс',


        'checks-issue-nonce': 'Nonce',
        'checks-issue-nonce-error-required': 'Укажите nonce',
        'checks-issue-nonce-help': 'Уникальный ID чека. Используется&nbsp;для выдачи нескольких одинаковых&nbsp;чеков.',
        'checks-issue-due': 'Действителен до блока',
        'checks-issue-due-error-required': 'Укажите номер блока',
        'checks-issue-amount': 'Количество',
        'checks-issue-pass': 'Пароль',
        'checks-issue-pass-error-required': 'Введите пароль',
        'checks-issue-result-check': 'Чек:',
        'checks-issue-result-pass': 'Пароль:',
        'checks-issue-result-link': 'Ссылка на обналичивание:',
        'checks-issue-result-link-warning': 'Внимание! Пароль содержится в ссылке. Отправляйте ссылку только непосредственно получателю.',
        'checks-issue-button': 'Создать',

        'wallet-send-description': 'Отправляйте монеты кому пожелаете — друзьям, семье, бизнес-партнерам.',
        'wallet-send-address': 'Адрес',
        'wallet-send-address-error-required': 'Укажите адрес',
        'wallet-send-address-error-invalid': 'Некорректный адрес',
        'wallet-send-amount': 'Количество',
        'wallet-send-fee-same': 'та же, которую отправляем',
        'wallet-send-button': 'Отправить',
        'wallet-send-error': 'Нет монет для отправки',
        'wallet-send-confirm-amount': 'Вы отправляете',
        'wallet-send-confirm-address': 'На адрес',


        'checks-redeem-check': 'Чек',
        'checks-redeem-check-error-required': 'Введите чек',
        'checks-redeem-check-error-invalid': 'Некорректный чек',
        'checks-redeem-check-help': 'Должен начинаться&nbsp;с',
        'checks-redeem-password': 'Пароль',
        'checks-redeem-password-error-required': 'Введите пароль',
        'checks-redeem-button': 'Обналичить',

        'swap-type': 'Тип обмена',
        'swap-sell-amount': 'Сколько продаем',
        'swap-sell-coin': 'Что продаем',
        'swap-sell-coin-error': 'Нет монет для продажи',
        'swap-sell-coin-confirm': 'Вы отправляете',
        'swap-buy-amount': 'Сколько покупаем',
        'swap-buy-coin': 'Что покупаем',
        'swap-buy-coin-error': 'Нет монет для траты',
        'swap-buy-coin-confirm': 'Вы получите',
        'swap-button': 'Продать',
        'buy-button': 'Купить',
        'swap-confirm': 'Подтвердить обмен',
        'swap-confirm-spend-estimation': 'Вы потратите примерно',
        'swap-confirm-receive-estimation': 'Вы получите примерно',
        'swap-confirm-pay-estimation': 'Вы заплатите примерно',
        'swap-add-description': 'Выберите пару из монет, которые у вас есть, и укажите объемы, которые вы хотели бы добавить.',
        'not-enough-coins': 'Недостаточно монет',
        'estimation-error': 'Ошибка оценки',
        'estimation-error-limit-required': 'Невозможно просчитать лимит затрат',
        'estimation-error-limit-invalid': 'Неверный лимит затрат',
        'you-will-spend': 'Вы потратите',
        'you-spend': 'Вы тратите',
        'you-will-get': 'Вы получите',
        'you-receive': 'Чтобы получить',
        'rate': 'Курс',
        'reserves': 'Резерв',
        'tx-fee': 'Комиссия',
        'tx-fee-high': 'Транзакция потребует высокой комиссии.',
        'read-understood': 'Нажатием этой кнопки вы подтверждаете, что прочитали положения отказа от ответственности, расположенного в футере и поняли их.',
        'eth-waiting': 'Ожидание депозита {symbol}',
        'eth-purchase-waiting': 'Ожидание покупки {symbol}',

        'stage-wait-evm': 'Пополнение {network}',
        'stage-wrap': 'Оборачивание',
        'stage-swap': 'Обмен',
        'stage-approve': 'Одобрение',
        'stage-send': 'Отправка',
        'stage-for': 'на',
        'stage-to-relay': 'из смарт-кошелька',
        'stage-to-bridge': 'мосту',
        'stage-from-bridge': 'из моста',
        'stage-waiting': 'Ожидание',
        'stage-received': 'Получено',

        'pool-coin0': 'Первая монета',
        'pool-coin1': 'Вторая монета',
        'pool-remove-liquidity-percent': 'Количество к возврату',
        'pool-remove-liquidity-error-required': 'Укажите объем',
        'range-error-min': 'Минимум',
        'range-error-max': 'Максимум',
        'pool-remove-liquidity-error-pool': 'В указанной паре ликвидность провайдера не обнаружена',
        'you-return': 'Вы возвращаете',
        'lp-tokens': 'LP-токенов',
        'pool-remove-button': 'Отозвать',
        'pool-remove-title': 'Отозвать ликвидность из пула обменов',
        'pool-remove-amount-help': 'Объем второй монеты рассчитывается и зависит от курса в пуле на момент транзакции.',
        'pool-add-title': 'Добавить ликвидность в пул',
        'pool-add-button': 'Добавить',

        'select-validator': 'Выберите валидатора',
        'select-coin': 'Выбор монеты',
        'select-value': 'Выберите значение',
        'select-network': 'Выберите сеть',


        'enter-amount': 'Введите сумму',
        'invalid-amount': 'Некорректная сумма',
        'not-enough-to-pay-fee': 'Недостаточно для оплаты комиссии',
        'not-enough': 'Недостаточно',
        'max': 'макс.',
        'enter-coin-symbol': 'Введите символ монеты',
        'min-3-chars': 'Мин. 3 символа',
        'not-supported-to-buy': 'Покупка не поддерживается',

        'swap-confirm-note': 'Итоговая сумма зависит от курса в момент обмена и может отличаться от представленной выше.',

        'bridge-output': 'К зачислению через мост',
        'bridge-fee': 'Комиссия, удерживаемая мостом',
        'ethereum-fee': 'Комиссия в сети {network}',

        'delegate-description': 'Делегируйте свои токены, чтобы получать выплаты в соответствии с условиями участия.',

        'masternode-address': 'Адрес',
        'masternode-address-help': 'Адрес владельца мастерноды, куда будет приходить&nbsp;награда',
        'masternode-address-error-required': 'Укажите адрес',
        'masternode-address-error-invalid': 'Некорректный адрес',
        'masternode-reward-address': 'Адрес для начислений',
        'masternode-reward-address-help': 'Адрес, куда будет приходить&nbsp;награда',
        'masternode-owner-address': 'Адрес владельца',
        'masternode-owner-address-help': 'Адрес нового владельца мастерноды',
        'masternode-control-address': 'Контролирующий адрес',
        'masternode-control-address-help': 'Адрес который может включить/отключить мастерноду',
        'masternode-public': 'Публичный ключ',
        'masternode-public-error-required': 'Укажите публичный ключ',
        'masternode-public-error-invalid': 'Некорректный публичный ключ',
        'masternode-stake': 'Стейк',
        'masternode-stake-error-required': 'Укажите количество',
        'masternode-fee-same': 'та же, что и в стэйке',
        'masternode-commission': 'Комиссия',
        'masternode-commission-error-required': 'Укажите комиссию',
        'masternode-commission-error-between': 'Должна быть от 0 до 100',
        'masternode-declare-button': 'Декларировать мастерноду',
        'masternode-edit-button': 'Редактировать мастерноду',
        'masternode-error': 'Нет монет для оплаты комиссии',
        'masternode-on-button': '«Включить» мастерноду',
        'masternode-off-button': '«Выключить» мастерноду',

        'delegation-delegate-button': 'Делегировать',
        'delegation-delegate-confirm-amount': 'Вы делегируете',
        'delegation-delegate-confirm-address': 'В мастерноду',
        'delegation-delegate-confirm-note': 'В случае отзыва монет, они вернутся на ваш кошелек примерно через <strong>30&nbsp;дней</strong> (518&#x202F;400&nbsp;блоков) и не&nbsp;будут приносить награды в&nbsp;течение этого&nbsp;времени.',
        'delegation-unbond-button': 'Отозвать',
        'delegation-unbond-confirm-description': 'Отозванные&nbsp;монеты вернутся на ваш кошелек примерно через <strong>30&nbsp;дней</strong> (518&#x202F;400&nbsp;блоков) и не&nbsp;будут приносить награды в&nbsp;течение этого&nbsp;времени.',
        'delegation-unbond-confirm-amount': 'Вы отзываете',
        'delegation-unbond-confirm-address': 'Из мастерноды',
        'delegation-move-confirm-description': 'Вы уверены, что хотите перенести монеты? Отозванные&nbsp;монеты перейдут к новой мастерноде примерно через <strong>30&nbsp;дней</strong> (518&#x202F;400&nbsp;блоков) и не&nbsp;будут приносить награды в течение этого времени.',
        'delegation-reinvest-tx-count': 'Количество транзакций',
        'delegation-reinvest-tx-count-error-required': 'Укажите количество',
        'delegation-reinvest-tx-count-help': undefined,
        'delegation-reinvest-result': 'Список подписанных транзакций',
        'delegation-reinvest-start-list': 'Список подписанных транзакций',
        'delegation-reinvest-start-list-error-required': 'Введите список транзакций',
        'delegation-reinvest-start-button': 'Запуск автоделегирования',
        'delegation-reinvest-start-success': 'Автоделегирование запущено',
        'stake-update-eta': 'Ваш стейк будет обновлен через',
        'stake-update-eta-blocks': 'блока(-ов)',
        'stake-update-eta-minutes': 'минут(-ы)',

        'unbond-description': 'В случае если вы больше не хотите, чтобы валидатор управлял вашими сбережениями, просто отправьте заявку на отвязку. Процесс будет завершен через 30 дней с момента подачи.',
        'coins-will-return': 'Монеты вернутся на ваш адрес через 518 400 блоков (около 30 дней).',
        'nothing-to-unbond': 'Нечего отзывать.',

        'coiner-create-name': 'Название монеты',
        'coiner-create-name-error-required': 'Укажите название',
        'coiner-create-name-error-max': 'Максимум 64 символа',
        'coiner-create-name-help': 'Название монеты (например, Bitcoin). До&nbsp;64&nbsp;символов.',
        'coiner-create-symbol': 'Тикер монеты',
        'coiner-create-symbol-error-required': 'Укажите тикер',
        'coiner-create-symbol-help': 'Должен быть уникален и состоять лишь из букв латинского алфавита и цифр. Верхний&nbsp;регистр, от 3 до&nbsp;10&nbsp;символов.',
        'coiner-create-amount': 'Количество выпуска',
        'coiner-create-amount-error-min': 'Минимальное количество — 1',
        'coiner-create-amount-error-max': 'Не должно быть больше Максимальной эмиссии',
        'coiner-create-crr': undefined,
        'coiner-create-crr-error-required': 'Укажите CRR',
        'coiner-create-crr-error-between': 'CRR должен быть от 10 до 100',
        'coiner-create-crr-help': 'CRR отвечает за коэффициент постоянного резервирования монетами BIP в составе выпущенной новой. Чем выше коэффициент, тем больше обеспечение, а значит, меньше волатильность. И&nbsp;наоборот. Устанавливается&nbsp;в&nbsp;%, допустимое значение: от&nbsp;10&nbsp;до&nbsp;100.',
        'coiner-create-reserve': 'Количество резервируемых BIP',
        'coiner-create-reserve-error-required': 'Укажите объем резерва',
        'coiner-create-reserve-error-min': 'Минимальный резерв — {coin} {min}',
        'coiner-create-max-supply': 'Максимальная эмиссия',
        'coiner-create-max-supply-help': 'Покупка монеты будет невозможна при превышении лимита.',
        'coiner-create-max-supply-error-min': 'Минимум: {value}',
        'coiner-create-max-supply-error-max': 'Максимум: {value}',
        'coiner-create-form-price-error-min': 'Минимальная цена: {min}, текущая цена: {price}',
        'coiner-create-button': 'Создать',
        'coiner-create-price': 'Начальная цена',
        'coiner-create-price-error-min': 'Минимальная цена: {min}',
        'coiner-create-confirm-warning': 'Внимание!',
        'coiner-create-confirm-amount': 'Вы выпускаете',
        'coiner-create-confirm-crr': 'Монету с CRR',
        'coiner-create-confirm-reserve': 'Резервируя',

        'broadcast-nonce-button': 'Получить nonce',
        'broadcast-nonce-got': 'Nonce для новой транзакции:',
        'broadcast-tx': 'Подписанная транзакция',
        'broadcast-tx-error-required': 'Укажите подписанную транзакцию',
        'broadcast-tx-button': 'Отправить',

        'hub-withdraw-cex-warning': 'Внимание! НЕ делайте вывод на биржи, так как многие не зачисляют средства из смарт-контрактов. Вы потеряете свои токены. Выводите на кошелек, которым владеете (от которого у вас есть сид-фраза).',

        'stake-lock-duration-label': 'Период блокировки',
        'stake-lock-duration-error-required': 'Укажите период',

        'hub-reduce-fee': 'Как уменьшить комиссию до',
        'hub-reduce-fee-url': 'https://www.minter.network/ru/howto/cross-chain-discounts',
        'amount-error-not-enough': 'Недостаточно',

        'swap-error': 'Невозможно обменять',
        'spots-error-balance': 'Недостаточно монет на балансе для покупки майнеров',
    },
    hub: {
        'withdraw-title': 'Вывод',
        'withdraw-description': 'Отправка монет в другую сеть',
        'withdraw-description-network': 'Отправка монет в {network}',
        'withdraw-address': 'Вывод на адрес',
        'withdraw-address-required': 'Укажите',
        'withdraw-address-title': 'адрес',
        'withdraw-address-invalid': 'Неверный',
        'withdraw-button-title': 'Вывести',
        'fee-updated': 'комиссия обновлена',
        'withdraw-estimate': 'Вы получите',
        'withdraw-eth-fee': 'комиссия',
        'withdraw-hub-fee': 'Комиссия моста',
        'withdraw-minter-fee': 'Комиссия Minter',
        'max': 'макс.',
        'last-withdraw': 'История выводов',

        'warning-fee-impact': 'Высокая комиссия в {network}',
        'warning-fee-impact-description': 'Комиссии за перевод поглотят ≈{impact}% ваших {symbol}',
    },
    battle: {
        'begin-title': 'Да начнется битва!',
        'begin-description': 'Вы зарегистрировались на турнир. Теперь вам нужно авторизоваться через Telegram и создать свой портфель.',
        'begin-description-already-created': 'Вы зарегистрировались на турнир. У вас уже есть портфель.',
        'telegram-login-button': 'Войти через Telegram',
        'telegram-login-description': 'Нажмите "Запустить" в HoneePremiumBot',
        'create-description-1': 'Выберите от 2х до 10ти токенов и укажите их долю в процентах.',
        'create-remember': 'Помните:',
        'create-description-2': 'вы можете создать только один портфель и редактировать его раз в день.',

        'week-results-title': 'Победители недели #{week}',
        'week-results-button': 'Результаты',
        'week-profit-caption': 'Неделя #{week}',
    },
    garden: {
        'airdrop-title': 'Аирдроп токенов GARDEN',
        'airdrop-description': 'Каждый держатель монет BIP имеет право на раздачу токенов GARDEN, которая состоится 12 декабря 2022 года. Зарегистрируйтесь для участия в раздаче с помощью своего Telegram-аккаунта.',
        'airdrop-description-2': 'Держатели BIP могут зарегистрировать только один адрес с монетами BIP для этой раздачи.',
        'airdrop-telegram-button': 'Зарегистрироваться',
        'airdrop-registered-title': 'Вы зарегистрированы на раздачу токенов GARDEN',
        'airdrop-registered-description': 'Проверьте, чтобы на вашем адресе были монеты BIP. Аирдроп состоится 12 декабря 2022 года.',
    },
    metagarden: {
        'title': 'Майнеры Metagarden',
        'description': 'Вы можете купить от 0.1 майнера. Стоимость 0.1 майнера составляет $16 или 100 токенов METAGARDEN.',
        'spot-amount-label': 'Количество майнеров',
        'confirm-title': 'Подтвердите покупку',
        'mining-spots': 'Майнеры',
        'you-own': 'Количество',
        'available-to-claim': 'Доступно для сбора',
        'claim-rewards-button': 'Собрать награды',
        'start-mining-button': 'Начать майнинг',
        'buy-more-button': 'Купить майнеры',
        'daily-yield': 'Ежедневные награды:',
        'back-to-honee': 'Перейти в Honee',
        'smart-hold-title': 'Хранилище',
        'smart-hold-description': 'Храни токены METAGARDEN на своем смарт-кошельке и получай доход 0.1% в день (36% годовых).',
        'transfer-smart-wallet': 'Перевести на Smart-кошелек',
        'available-for-transfer': 'Доступно для перевода',
        'balance-smart-wallet': 'METAGARDEN на Smart-кошельке',
    },
    'mg-lootbox': {
        'title-inactive': 'Лутбокс еще не готов',
        'title-ready': 'Вы выиграли лутбокс!',
        'button-ready': 'Открыть',
        'title-opened': 'Вы получили',
        'error-opened': 'Ошибка!',
        'description-redeem-failed': 'Не получилось открыть лутбокс, обратитесь в поддержку для получения вознаграждения',
        'terms-title': 'Что такое лутбокс?',
        'terms-description': 'Лутбокс — это виртуальный призовой сундук, в котором находится случайная награда. Монеты, NFT или прочие игровые элементы.',
        'new-lootbox-button': 'У вас',
        'new-lootbox-button-plural': 'новый лутбокс | {n} лутбокса | {n} лутбоксов',
    },
    'mg-games': {
        'title-recent': 'Недавние игры',
        'title-all': 'Все игры',
        'title-coming': 'Скоро',
        'label-coming': 'Скоро',
        'button-learn': 'Подробнее',
        'button-play': 'Играть',
        'game-token': 'Игровой токен',
        'balance': 'Ваш баланс',
        'find-more': 'Больше игр',
        'join-channel': 'Подписаться на канал',
        'join-conversation': 'Вступить в группу',
        'game-community': 'Сообщество игры',
    },
};
