<script>
export default {

};
</script>

<template>
    <div>
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
                <div class="footer-menu">
                    <div class="info-links">
                        <h3>{{ $td('Useful Information', 'index.footer-menu-useful')}}</h3>
                        <div class="footer-link-box">
                            <div class="buy-links">
                                <a :href="$i18nGetPreferredPath('/how-to-buy-bitcoin-2021')">{{ $td('Buy Bitcoin', 'index.footer-link-box-buy-bitcoin')}}</a>
                                <!--<a href="/how-to-buy-ethereum-2021">Buy Ethereum</a>
                                <a href="/how-to-buy-usdt-2021">Buy USDT</a>-->
                            </div>
                            <!--<div class="earn-links">
                                <a href="/how-to-earn-bitcoin-2021">Earn Bitcoin</a>
                                <a href="/how-to-earn-ethereum-2021">Earn Ethereum</a>
                                <a href="/how-to-earn-usdt-2021">Earn USDT</a>
                            </div>
                            <div class="wallet-links">
                                <a href="/best-bitcoin-wallet-2021">Bitcoin Wallet</a>
                                <a href="/best-ethereum-wallet-2021">Ethereum Wallet</a>
                                <a href="/best-usdt-wallet-2021">USDT Wallet</a>
                            </div>-->
                        </div>
                    </div>
                    <div class="about-links">
                        <h3>{{ $td('About Honee', 'index.footer-menu-about')}}</h3>
                        <ul>
                            <li><a href="/legal/terms.pdf" target="_blank">Terms</a></li>
                            <li><a href="/legal/privacy.pdf" target="_blank">Privacy</a></li>
                            <li><a href="mailto:hello@honee.app" target="_blank">Contact</a></li>
                        </ul>
                    </div>
                    <div class="footer-contacts">
                        <h3>{{ $td('Contacts', 'index.footer-menu-contacts')}}</h3>
                        GROM R&D LIMITED, COMPANY NUMBER 12444209, 27 OLD GLOUCESTER STREET, LONDON, UNITED KINGDOM, WC1N 3AX.<br>
                        <a href="mailto:hello@honee.app" class="link--underline u-fw-600">hello@honee.app</a>
                    </div>
                </div>
                <div class="logo"><img src="/img/logo-honee.svg" alt="" width="82" height="16"/></div>
                <div class="footer-copyright">
                    Copyright © 2021 Grom R&D Limited.<br>
                    All Rights Reserved.
                </div>
            </div>
        </footer>
    </div>
</template>
