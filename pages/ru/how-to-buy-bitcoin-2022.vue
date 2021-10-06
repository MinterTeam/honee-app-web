<script>
import getTitle from '~/assets/get-title.js';

export default {
    layout: 'landing',
    nuxtI18n: {
        paths: {
            ru: '/kak-kupit-bitkoin-2022',
        },
        locales: ['ru'],
    },
    head() {
        const title = getTitle('Как купить Биткоин 2022');
        const description = 'Один из способов, как купить биткоин в 2022 году — это используя карточки заработка в Honee.';

        return {
            title: title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
                { hid: 'description', name: 'description', content: description },
                { hid: 'og-description', name: 'og:description', content: description },
            ],
        };
    },
};

</script>


<template>
    <div class="page-seo">
        <article>
            <div class="container">
                <div class="top-line">
                    <div class="logo">
                        <a href="/"><img src="/img/logo-honee.svg" alt="" width="122" height="24"/></a>
                    </div>
                    <div class="share">
                        <span>Поделиться</span>
                        <a href="https://twitter.com/intent/tweet?url=https://honee.app/how-to-buy-bitcoin-2022&text=How+to+Buy+Bitcoin+2022" target="_blank" rel="nofollow"><img src="/img/landing/twitter.svg" alt="Поделиться в Twitter" width="40" height="40"></a>
                        <a href="https://www.facebook.com/share.php?u=https://honee.app/how-to-buy-bitcoin-2022&quote=How+to+Buy+Bitcoin+2022" target="_blank" rel="nofollow"><img src="/img/landing/facebook.svg" alt="Поделиться в Facebook" width="40" height="40"></a>
                        <a href="tg://msg_url?url=https://honee.app/how-to-buy-bitcoin-2022&text=How+to+Buy+Bitcoin+2022" rel="nofollow"><img src="/img/landing/telegram.svg" alt="Поделиться в Telegram" width="40" height="40"></a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://honee.app/how-to-buy-bitcoin-2022" target="_blank" rel="nofollow"><img src="/img/landing/linkedin.svg" alt="Поделиться в Linkedin" width="40" height="40"></a>
                        <!--<a href="" rel="nofollow"><img src="/img/landing/copy-link.svg" alt="Скопировать ссылку" width="40" height="40"></a>-->
                    </div>
                </div>
                <section class="article-header">
                    <h1>Как купить Биткоин (BTC) в 2022</h1>
                    <p class="subtitle-h1">С помощью этой пошаговой инструкции вы узнаете, как купить Биткоин в 2022 году за любые токены, доступные в криптокошельке Honee.</p>
                </section>
                <section class="article-picture-box">
                    <div class="article-picture-box-content">
                        <h2><span class="h2-badge">1</span>Депозит</h2>
                        <p>Для покупки BTC вам понадобится адрес в криптокошельке Honee. Вы можете зарегистрировать новый или войти с уже имеющимся.</p>
                    </div>
                    <div class="article-picture-box-img buy-bitcoin-1"><img src="/img/articles/buy-bitcoin-1.png" alt="лучший способ купить биткоин 2022" /></div>
                </section>
                <section class="article-picture-box box-reverse">
                    <div class="article-picture-box-content">
                        <p>После авторизации вы попадете в свой персональный кошелек. Теперь вам необходимо пополнить его нужной вам криптовалютой, например, USDT. Для этого:</p>
                        <ol>
                            <li>Нажмите кнопку <b>Депозит</b> на главном экране</li>
                            <li>Вы увидите <b>адрес</b> для пополнения</li>
                            <li>Отправьте на этот адрес необходимое количество монет (например, с биржи или через обменники)</li>
                        </ol>
                        <p>После того, как транзакция будет совершена, на вашем балансе отобразится сумма депозита.</p>
                    </div>
                    <div class="article-picture-box-img buy-bitcoin-2"><img src="/img/articles/buy-bitcoin-2.png" alt="как купить биткоин 2022" /></div>
                </section>
                <section>
                    <h2><span class="h2-badge">2</span>Как купить Биткоин 2022</h2>
                    <div class="article-picture-box">
                        <div class="article-picture-box-content">
                            <p>После того, как на вашем балансе появились токены, которые вы хотите обменять на Биткоин (например, USDT), нажмите на кнопку “Обмен” или выберите карточку “Купить Биткоин”.</p>
                            <p>В открывшемся окне:</p>
                            <ol>
                                <li>Выберите токены, которые вы хотите потратить</li>
                                <li>Укажите сумму</li>
                                <li>Выберите токен с тикером <b>BTC</b> (если вы зашли через карточку <b>Купить Биткоин</b>, то он будет выбран по-умолчанию)</li>
                                <li>Проверьте количество получаемых BTC и цену</li>
                                <li>Нажмите кнопку <b>Подтвердить</b></li>
                            </ol>
                            <p>После этого транзакция покупки Биткоина будет совершена и BTC появится на вашем балансе.</p>
                        </div>
                        <div class="article-picture-box-img buy-bitcoin-3"><img src="/img/articles/buy-bitcoin-3.png" alt="как купить биткойн 2022" class="img-deposit" /></div>
                    </div>
                </section>
                <section class="article-last-block">
                    <h2>Цена Биткоин</h2>
                    <p>Сколько стоит первая криптовалюта можно проверить двумя способами:</p>
                    <ol>
                        <li>В карточке <b>Купить Bitcoin</b> (или при нажатии кнопки <b>Обмен</b>)</li>
                        <li>На странице баланса, при нажатии на BTC откроется страница с графиком и ценой Биткоина</li>
                    </ol>
                    <p class="subtitle-h1">Мы надеемся, что после прочтения этой статьи у вас появилось практическое понимание того, как купить биткоин. В 2022 году на рынок выйдет релизная версия Honee, а значит, этот процесс станет намного удобнее!</p>
                    <div class="cta-center">
                        <a class="btn btn-2" href="#">{{ $td('Launch Honee', 'index.steps-button')}}</a>
                    </div>
                </section>
            </div>
        </article>
    </div>
</template>
