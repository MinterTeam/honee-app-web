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
                    <h1>How to Buy Bitcoin (BTC) in 2021</h1>
                    <p class="subtitle-h1">This step-by-step guide will show you how to buy Bitcoin in 2021 for any token supported by the Honee crypto wallet.</p>
                </section>
                <section class="article-picture-box article-buy-bitcoin">
                    <div class="article-picture-box-content">
                        <h2><span class="h2-badge">1</span>Deposit</h2>
                        <p>To buy BTC, you will need an address in the Honee crypto wallet. You can log in with the one you already have or create a new one.</p>
                    </div>
                    <img src="/img/articles/buy-bitcoin-1.png" alt="buy bitcoin" />
                </section>
                <section class="article-picture-box article-buy-bitcoin-2 box-reverse">
                    <div class="article-picture-box-content">
                        <p>Upon sign-in, you’ll get into your personal wallet. Now, you need to top it up with the cryptocurrency that you have elsewhere—for example, USDT. For that:</p>
                        <ol>
                            <li>Press the <b>Deposit</b> button on the main screen</li>
                            <li>Next, you’ll see <b>an address</b> that you’ll need to transfer the cryptocurrency you’ve picked to</li>
                            <li>Send the necessary number of coins to that address (for example, from an exchange account or another wallet)</li>
                        </ol>
                        <p>Once the transaction has gone through, you’ll see the deposited amount on your balance.</p>
                    </div>
                    <img src="/img/articles/buy-bitcoin-2.png" alt="buy bitcoin" />
                </section>
                <section class="article-buy-bitcoin-3">
                    <h2><span class="h2-badge">2</span>How to Buy Bitcoin 2021</h2>
                    <div class="article-picture-box">
                        <div class="article-picture-box-content">
                            <p>After your balance has been topped up with the coins you’d like to exchange for Bitcoin (e.g., USDT), hit the Swap button or select the Buy Bitcoin card.</p>
                            <p>In the newly opened window:</p>
                            <ol>
                                <li>Choose the coin you want to spend</li>
                                <li>Specify the amount</li>
                                <li>Choose the coin with the ticker <b>BTC</b> (if you’ve decided to go with the <b>Buy Bitcoin</b> card, BTC will be set by default)</li>
                                <li>Verify the price and the amount of BTC to get</li>
                                <li>Press <b>Confirm</b></li>
                            </ol>
                            <p>Once the buy Bitcoin transaction is completed, BTC will appear on your balance.</p>
                        </div>
                        <img src="/img/articles/buy-bitcoin-3.png" alt="buy bitcoin" class="img-deposit" />
                    </div>
                </section>
                <section class="article-last-block">
                    <h2>Bitcoin Price</h2>
                    <p>There are two ways for you to check out the price of the first cryptocurrency:</p>
                    <ol>
                        <li>In the <b>Buy Bitcoin</b> card (or when you press <b>Swap</b>)</li>
                        <li>On the balance page, click on BTC to see Bitcoin’s price chart</li>
                    </ol>
                    <p class="subtitle-h1">We hope that now that you’ve finished scrolling down this page, you have an actionable understanding of how to buy Bitcoin. In 2021, Honee Alpha hits the market—meaning this process will get much more user-friendly!</p>
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
