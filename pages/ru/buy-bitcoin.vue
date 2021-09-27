<script>

export default {
    layout: 'simple',
    nuxtI18n: false,
};

</script>


<template>
    <div class="wrapper page-index page-seo">
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

        <section class="follow">
            <div class="container">
                <h2>{{ $td('Follow us', 'index.follow-title')}}</h2>
                <div class="socials">
                    <a href="https://twitter.com/HoneeApp" target="_blank">
                        <img src="/img/landing/twitter.svg" alt="" width="64" height="64">
                    </a>
                    <a href="https://t.me/HoneeApp" target="_blank">
                        <img src="/img/landing/telegram.svg" alt="" width="64" height="64">
                    </a>
                    <a href="https://www.youtube.com/c/honeeapp" target="_blank">
                        <img src="/img/landing/youtube.svg" alt="" width="64" height="64">
                    </a>
                    <a href="https://www.facebook.com/honeeapp" target="_blank">
                        <img src="/img/landing/facebook.svg" alt="" width="64" height="64">
                    </a>
                    <a href="https://medium.com/@honeeapp" target="_blank">
                        <img src="/img/landing/medium.svg" alt="" width="64" height="64">
                    </a>
                    <a href="https://www.instagram.com/honee_app/" target="_blank"><img src="/img/landing/instagram.svg" alt="" width="64" height="64"></a>
                </div>
            </div>
        </section>
        <footer class="footer">
            <div class="container">
                <div class="footer-disclaimer">
                    <h3>{{ $td('Disclaimer', 'index.footer-disclaimer-title')}}</h3>
                    <p>{{ $td('Please note that you are accessing the ALPHA Version of the Honee service which is in the process of being tested before its official release. The sole purpose of this ALPHA Version is to conduct testing and obtain feedback.', 'index.footer-disclaimer-p1')}}</p>
                    <p>{{ $td('ALPHA testing is free for users and we do not demand any remuneration for access to the ALPHA Version of the services. Intra-blockchain fees you pay for transactions are not the payment for using the Honee service.', 'index.footer-disclaimer-p2')}}</p>
                    <p>{{ $td('Operations with virtual assets pose intrinsic risks, including the risk of monetary loss. We strongly suggest you seek professional advice before engaging in any operations with virtual assets.', 'index.footer-disclaimer-p3')}}</p>
                    <p>{{ $td('We do not give any warranties, whether express or implied, as to the suitability or usability of the service, its software or any of its content. We will not be liable for any loss, whether such loss is direct, indirect, special or consequential, suffered by any party as a result of their use of the ALPHA, its content and functionalities.', 'index.footer-disclaimer-p4')}}</p>
                    <p>{{ $td('Should you encounter any bugs, glitches, lack of functionality or other problems on the ALPHA, please email us at', 'index.footer-disclaimer-p5')}} <a href="mailto:hello@honee.app" class="link--underline u-fw-600">hello@honee.app</a>.</p>
                </div>
                <div class="logo"><img src="/img/logo-honee.svg" alt="" width="82" height="16"/></div>
                <div class="footer-copyright-container">
                    <div class="footer-copyright">
                        Copyright © 2021 Grom R&D Limited.<br>
                        All Rights Reserved.
                    </div>
                    <div class="footer-copyright">
                        GROM R&D LIMITED, COMPANY NUMBER 12444209, 27 OLD GLOUCESTER STREET, LONDON, UNITED KINGDOM, WC1N 3AX.<br>
                        <a href="mailto:hello@honee.app" class="link--underline u-fw-600">hello@honee.app</a>
                    </div>
                </div>
                <nav class="footer-menu">
                    <ul>
                        <li><a href="/legal/terms.pdf" target="_blank">Terms</a></li>
                        <li><a href="/legal/privacy.pdf" target="_blank">Privacy</a></li>
                        <li><a href="mailto:hello@honee.app" target="_blank">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </footer>
    </div>
</template>
