<script>
import InlineSvg from 'vue-inline-svg';
import Language from '~/components/layout/Language.vue';
export default {
    components: {
        InlineSvg,
        Language,
    },
};
</script>

<template>
    <footer class="footer">
        <div class="u-container u-container--large">
            <div class="footer__disclaimer">
                <h3 class="u-h3 u-mb-05">{{ $td('Disclaimer', 'index.footer-disclaimer-title') }}</h3>
                <p>{{ $td('Operations with virtual assets pose intrinsic risks, including the risk of monetary loss. We strongly suggest you seek professional advice before engaging in any operations with virtual assets.', 'index.footer-disclaimer-megachain-p1') }}</p>
                <p>{{ $td('We do not give any warranties, whether express or implied, as to the suitability or usability of the Metagarden Chain, its software or any of its content. We will not be liable for any loss, whether such loss is direct, indirect, special or consequential, suffered by any party as a result of their use of the Metagarden Chain, its content and functionalities.', 'index.footer-disclaimer-megachain-p2') }}</p>
                <p>{{ $td('Should you encounter any bugs, glitches, lack of functionality or other problems on the Metagarden Chain, please email us at', 'index.footer-disclaimer-megachain-p3') }} <a href="mailto:hello@metagarden.io" class="link--default-black">hello@metagarden.io</a>.</p>
            </div>
            <div class="footer__menu u-grid u-grid--medium u-grid--vertical-margin--medium">
                <div class="u-cell u-cell--auto">
                    <h3 class="footer__caption u-mb-05">{{ $td('Useful Information', 'index.footer-menu-megachain-useful') }}</h3>
                    <div class="footer__links-cell">
                        <a class="link--default-black" :href="$td('https://metagarden.io/', 'index.footer-menu-megachain-blockchain-url')" target="_blank">{{ $td('EVM Blockchain', 'index.footer-menu-megachain-blockchain') }}</a>
                        <a class="link--default-black" :href="$td('https://metagarden.io/early-access', 'index.footer-menu-megachain-early-url')" target="_blank">{{ $td('Early Access Campaign', 'index.footer-menu-megachain-early') }}</a>
                        <a class="link--default-black" :href="$td('https://metagarden.io/tokenomics', 'index.footer-menu-megachain-tokenomics-url')" target="_blank">{{ $td('Tokenomics', 'index.footer-menu-megachain-tokenomics') }}</a>
                        <a class="link--default-black" href="https://scan.testnet.metagarden.io/" target="_blank">{{ $td('Testnet', 'index.footer-menu-megachain-testnet') }}</a>
                    </div>
                </div>
                <div class="u-cell u-cell--auto">
                    <h3 class="footer__caption u-mb-05">{{ $td('About Metagarden Chain', 'index.footer-menu-megachain-about') }}</h3>
                    <div class="footer__links-cell">
                        <!--<a class="link--default-black" href="https://honee.app/legal/terms.pdf" target="_blank">Terms</a>
                        <a class="link--default-black" href="https://honee.app/legal/privacy.pdf" target="_blank">Privacy</a>-->
                        <a class="link--default-black" href="mailto:hello@metagarden.io" target="_blank">{{ $td('Contact', 'index.footer-menu-megachain-сontact') }}</a>
                    </div>
                </div>
                <div class="footer__contacts u-cell u-cell--auto">
                    <h3 class="footer__caption u-mb-05">{{ $td('Contacts', 'index.footer-menu-contacts') }}</h3>
                    GROM R&D LIMITED, COMPANY NUMBER 12444209, 27 OLD GLOUCESTER STREET, LONDON, UNITED KINGDOM, WC1N 3AX.<br>
                    <a href="mailto:hello@metagarden.io" class="link--default-black">hello@metagarden.io</a>
                </div>
            </div>
            <div class="u-flex u-flex--align-center u-flex--justify-between">
                <nuxt-link class="footer__logo" :to="$i18nGetPreferredPath('/')">
                    <InlineSvg src="/img/logo-megachain-side.svg" alt="Metagarden Chain" width="100%" height="48" fill="currentColor"/>
                </nuxt-link>
                <Language/>
            </div>
        </div>
    </footer>
</template>
