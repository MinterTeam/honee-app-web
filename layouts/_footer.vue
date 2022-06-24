<script>
export default {

};
</script>

<template>
    <footer class="footer">
        <div class="u-container">
            <div class="footer__disclaimer">
                <h3 class="u-h3 u-mb-05">{{ $td('Disclaimer', 'index.footer-disclaimer-title')}}</h3>
                <p>{{ $td('Please note that you are accessing the ALPHA Version of the Honee service which is in the process of being tested before its official release. The sole purpose of this ALPHA Version is to conduct testing and obtain feedback.', 'index.footer-disclaimer-p1')}}</p>
                <p>{{ $td('ALPHA testing is free for users and we do not demand any remuneration for access to the ALPHA Version of the services. Intra-blockchain fees you pay for transactions are not the payment for using the Honee service.', 'index.footer-disclaimer-p2')}}</p>
                <p>{{ $td('Operations with virtual assets pose intrinsic risks, including the risk of monetary loss. We strongly suggest you seek professional advice before engaging in any operations with virtual assets.', 'index.footer-disclaimer-p3')}}</p>
                <p>{{ $td('We do not give any warranties, whether express or implied, as to the suitability or usability of the service, its software or any of its content. We will not be liable for any loss, whether such loss is direct, indirect, special or consequential, suffered by any party as a result of their use of the ALPHA, its content and functionalities.', 'index.footer-disclaimer-p4')}}</p>
                <p>{{ $td('Should you encounter any bugs, glitches, lack of functionality or other problems on the ALPHA, please email us at', 'index.footer-disclaimer-p5')}} <a href="mailto:hello@honee.app" class="link--default-black">hello@honee.app</a>.</p>
            </div>
            <div class="footer__menu u-grid u-grid--medium u-grid--vertical-margin--medium">
                <div class="u-cell u-cell--auto">
                    <h3 class="footer__caption u-mb-05">{{ $td('Useful Information', 'index.footer-menu-useful')}}</h3>
                    <div class="footer__links-cell">
                        <a class="link--default-black" href="https://minter.network/earn" target="_blank">{{ $td('Learn', 'todo') }}</a>
                        <a class="link--default-black" href="https://t.me/MinterHelp" target="_blank">{{ $td('Support', 'todo')}}</a>
                    </div>
                </div>
                <div class="u-cell u-cell--auto">
                    <h3 class="footer__caption u-mb-05">{{ $td('About Honee', 'index.footer-menu-about')}}</h3>
                    <div class="footer__links-cell">
                        <a class="link--default-black" href="https://honee.app/legal/terms.pdf" target="_blank">Terms</a>
                        <a class="link--default-black" href="https://honee.app/legal/privacy.pdf" target="_blank">Privacy</a>
                        <a class="link--default-black" href="mailto:hello@honee.app" target="_blank">Contact</a>
                    </div>
                </div>
                <div class="footer__contacts u-cell u-cell--auto">
                    <h3 class="footer__caption u-mb-05">{{ $td('Contacts', 'index.footer-menu-contacts')}}</h3>
                    GROM R&D LIMITED, COMPANY NUMBER 12444209, 27 OLD GLOUCESTER STREET, LONDON, UNITED KINGDOM, WC1N 3AX.<br>
                    <a href="mailto:hello@honee.app" class="link--default-black">hello@honee.app</a>
                </div>
            </div>
            <nuxt-link class="footer__logo" :to="$i18nGetPreferredPath('/')"><img src="/img/logo-honee.svg" alt="" width="82" height="16"/></nuxt-link>
            <div class="footer__copyright">
                Copyright © {{ (new Date()).getFullYear() }} Grom R&D Limited.<br>
                All Rights Reserved.
            </div>
        </div>
    </footer>
</template>
