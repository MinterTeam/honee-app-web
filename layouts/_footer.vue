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
