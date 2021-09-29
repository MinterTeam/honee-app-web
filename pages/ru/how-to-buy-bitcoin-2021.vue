<script>
import getTitle from '~/assets/get-title.js';

export default {
    layout: 'landing',
    nuxtI18n: {
        paths: {
            ru: '/how-to-buy-bitcoin-2021',
        },
        locales: ['ru'],
    },
    head() {
        const title = getTitle('Купить Биткоин (BTC) в 2021');
        const description = 'С помощью этой пошаговой инструкции вы сможете купить Биткоин за любые токены, доступные в криптокошельке Honee.';

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
                <div class="logo">
                    <img src="/img/logo-honee.svg" alt="" width="122" height="24"/>
                </div>
                <section class="article-header">
                    <h1>Купить Биткоин (BTC) в 2021</h1>
                    <p class="subtitle-h1">С помощью этой пошаговой инструкции вы сможете купить Биткоин за любые токены, доступные в криптокошельке Honee.</p>
                </section>
                <section class="article-picture-box article-buy-bitcoin">
                    <div class="article-picture-box-content">
                        <h2><span class="h2-badge">1</span>Депозит</h2>
                        <p>Для покупки BTC вам понадобится адрес в криптокошельке Honee. Вы можете зарегистрировать новый или войти с уже имеющимся.</p>
                    </div>
                    <img src="/img/articles/buy-bitcoin-1.png" alt="buy bitcoin" />
                </section>
                <section class="article-picture-box article-buy-bitcoin-2 box-reverse">
                    <div class="article-picture-box-content">
                        <p>После авторизации вы попадете в свой персональный кошелек. Теперь вам необходимо пополнить его нужной вам криптовалютой, например, USDT. Для этого:</p>
                        <ol>
                            <li>Нажмите кнопку <b>Депозит</b> на главном экране</li>
                            <li>Вы увидите <b>адрес</b> для пополнения</li>
                            <li>Отправьте на этот адрес необходимое количество монет (например, с биржи или через обменники)</li>
                        </ol>
                        <p>После того, как транзакция будет совершена, на вашем балансе отобразится сумма депозита.</p>
                    </div>
                    <img src="/img/articles/buy-bitcoin-2.png" alt="buy bitcoin" />
                </section>
                <section class="article-buy-bitcoin-3">
                    <h2><span class="h2-badge">2</span>Как купить Биткоин 2021</h2>
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
                        <img src="/img/articles/buy-bitcoin-3.png" alt="buy bitcoin" class="img-deposit" />
                    </div>
                </section>
                <section class="article-last-block">
                    <h2>Цена Биткоин</h2>
                    <p>Сколько стоит первая криптовалюта можно проверить двумя способами:</p>
                    <ol>
                        <li>В карточке <b>Купить Bitcoin</b> (или при нажатии кнопки <b>Обмен</b>)</li>
                        <li>На странице баланса, при нажатии на BTC откроется страница с графиком и ценой Биткоина</li>
                    </ol>
                    <p class="subtitle-h1">Мы надеемся, что после прочтения этой статьи у вас появилось практическое понимание того, как купить биткоин. В 2021 году на рынок выйдет Honee Alpha, а значит, этот процесс станет намного удобнее!</p>
                    <div class="cta-center">
                        <a class="btn btn-2" href="#">{{ $td('Launch Honee', 'index.steps-button')}}</a>
                    </div>
                </section>
            </div>
        </article>
    </div>
</template>
