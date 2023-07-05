<script>
import FieldAddressDisplay from '~/components/base/FieldAddressDisplay.vue';


export default {
    components: {
        FieldAddressDisplay,
    },
    head: {
        bodyAttrs: {
            class: 'megagamer__body',
        },
    },
    fetch() {
        // this.$store.commit('SET_METAGARDEN');
    },
    /*
    head: {
        htmlAttrs: {
            class: 'metagarden-layout theme--metagarden',
        },
    },
    */
    data() {
        return {
            isDepositProcessing: false,
            successDeposit: '',
            isShowWaitSmartWallet: false,
        };
    },
    computed: {
    },
    methods: {
        logout() {
            this.$store.commit('telegram/saveAuth', undefined);
            this.$store.commit('telegram/cleanLegacySecretId');
            this.$router.push(this.$i18nGetPreferredPath('/auth'));
        },
    },
};
</script>

<template>
    <div class="u-container--small">
        <div class="card card--light-grey u-text-left u-mb-10">
            <div class="card__content card__content--medium">
                <div class="card__action-head">
                    <div class="card__action-title">
                        <!--<div class="card__action-title-type">Metagarden</div>-->
                        <div class="card__action-title-value">@{{ $store.getters['telegram/username'] }}</div>
                    </div>
                    <div class="card__action-stats">
                        <div class="card__action-stats-caption">{{ $td('Gamer Level', 'gamer-id.rating-label') }}</div>
                        <div class="card__action-stats-value">
                            <span class="u-text-main" style="vertical-align: top;margin-top: -1px;display: inline-block;">⭑</span>
                            1
                        </div>
                    </div>
                </div>
            </div>
            <div class="card__content card__content--medium">
                <h2 class="u-h5 u-mb-05">{{ $td('Your Privileges', 'gamer-id.privileges-title') }}</h2>
                <ul class="list-simple u-text-medium">
                    <template v-if="$i18n.locale === 'en'">
                        <li>Ability to receive free game tokens;</li>
                        <li>Various game bonuses;</li>
                        <li>Income boosts on the platform;</li>
                        <li>GamerID will be released in the form of an NFT at the mainnet launch.</li>
                    </template>
                    <template v-if="$i18n.locale === 'ru'">
                        <li>Возможность получать бесплатные игровые токены;</li>
                        <li>Различные игровые бонусы;</li>
                        <li>Увеличение доходов на платформе;</li>
                        <li>GamerID будет выпущен в форме NFT при запуске основной сети.</li>
                    </template>
                </ul>
            </div>
        </div>

        <div class="card card__content card__content--medium u-text-center u-mb-10">
            <h2 class="u-h3 u-mb-05">{{ $td('Become early adopter', 'meganet.early-adopter-title') }}</h2>
            <p class="u-text-medium">{{ $td('All LAUNCHER token holders will receive MEGA coins (native Metagarden Chain coins) with a bonus after the Mainnet launch.', 'meganet.early-adopter-description') }}</p>

            <a class="button button--main button--full u-mt-10" href="https://launchpad.metagarden.io/">
                {{ $td('Buy LAUNCHER tokens', 'meganet.buy-button', {coin: 'LAUNCHER'}) }}
            </a>
        </div>

        <div class="card card__content card__content--medium u-text-center" v-if="$store.getters.smartWalletAddress">
            <h2 class="u-h3 u-mb-05">{{ $td('Your universal address', 'gamer-id.universal-address-title') }}</h2>
            <p class="u-text-medium">{{ $td('This is your universal address for the Metagarden chain and other EVM-compatible blockchains such as Ethereum, BNB Smart Chain, Polygon, Arbitrum and others.', 'gamer-id.universal-address-description') }}</p>

            <FieldAddressDisplay
                class="u-mt-10"
                :value="$store.getters.smartWalletAddress"
                :label="$td('Universal address', 'gamer-id.universal-address')"
            />
        </div>

        <button type="button" class="button button--full button--ghost u-mt-15" @click="logout()">{{ $td('Logout', 'common.logout') }}</button>
    </div>
</template>
