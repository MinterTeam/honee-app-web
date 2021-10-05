<script>
// import IndexSubscribeForm from '@/components/IndexSubscribeForm.vue';
import getTitle from '~/assets/get-title.js';

export default {
    layout: 'landing',
    components: {
        // IndexSubscribeForm,
    },
    head() {
        const title = getTitle(this.$td('Crypto Wallet That Helps You Earn', 'index.title'));
        const description = this.$td('Honee is the simplest crypto wallet that helps you earn through user-friendly, one-click money-making cards.', 'index.description');

        return {
            title: title,
            meta: [
                { hid: 'og-title', name: 'og:title', content: title },
                { hid: 'description', name: 'description', content: description },
                { hid: 'og-description', name: 'og:description', content: description },
            ],
        };
    },
    data() {
        return {

        };
    },
};
</script>


<template>
    <div>
        <header>
            <!--<nav class="lang"><a href="#"><img src="/img/landing/en.svg" alt="" /></a></nav>-->
            <div class="container">
                <div class="hello">
                    <div class="hello-content">
                        <div class="logo"><img src="/img/logo-honee.svg" alt="" width="122" height="24"/></div>
                        <h1>{{ $td('The simplest crypto wallet that helps you earn', 'index.hello-title')}}</h1>
                        <p class="subtitle-h1">{{ $td('Honee is focused on helping people to earn crypto. Join today!', 'index.hello-description')}}</p>
                        <nuxt-link class="btn" :to="$i18nGetPreferredPath('/dashboard')">{{ $td('Start Earning', 'index.hello-button')}}</nuxt-link>
<!--                        <IndexSubscribeForm class="u-mb-15"/>-->
<!--                        <h3>{{ $td('Alpha Coming Sep 28, 2021', 'index.hello-coming')}}</h3>-->
                    </div>
                    <img src="/img/landing/phone.png" alt="" class="hello-image" />
                </div>
            </div>
        </header>
        <section class="video">
            <div class="container">
                <h2>{{ $td('What’s Honee?', 'index.video-title')}}</h2>
                <p class="subtitle-h2">{{ $td('Hit the play button to learn more', 'index.video-description')}}</p>
                <div class="video-youtube">
                    <iframe :src="$td('https://www.youtube.com/embed/fVRlrTYCtvg', 'index.video-url') + '?rel=0'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </section>
        <section class="features">
            <div class="container">
                <h2>{{ $td('Сrypto wallet as it’s meant to be', 'index.features-title')}}</h2>
                <i18n tag="p" class="subtitle-h2" path="index.features-description">
                    <b><i>{{ $td('the', 'index.features-description-highlight')}}</i></b>
                </i18n>
                <p class="subtitle-h2"></p>
                <div class="features-items">
                    <div class="features-item">
                        <img src="/img/landing/f1.svg" alt="" width="64" height="64">
                        <h3>{{ $td('Great to Earn With', 'index.features-item1-title')}}</h3>
                        <p>{{ $td('Crypto and decentralized finance are complicated, but we did all the hard work for you. Enjoy our one-click solutions applying the best earning tools to your balance.', 'index.features-item1-description')}}</p>
                    </div>
                    <div class="features-item">
                        <img src="/img/landing/f2.svg" alt="" width="64" height="64">
                        <h3>{{ $td('Simple to Use', 'index.features-item2-title')}}</h3>
                        <p>{{ $td('Aside from helping you earn, our second-biggest goal is to provide a smooth user experience. Honee is simple and user-friendly at every step of the way.', 'index.features-item2-description')}}</p>
                    </div>
                    <div class="features-item">
                        <img src="/img/landing/f3.svg" alt="" width="64" height="64">
                        <h3>{{ $td('Best to Trade At', 'index.features-item3-title')}}</h3>
                        <p>{{ $td('Buy, sell, and swap your Bitcoin, Ether, USDT, and other popular cryptos instantly & at the lowest fees in the industry.', 'index.features-item3-description')}}</p>
                    </div>
                    <div class="features-item">
                        <img src="/img/landing/f4.svg" alt="" width="64" height="64">
                        <h3>{{ $td('Private & Secure', 'index.features-item4-title')}}</h3>
                        <p>{{ $td('You are the only person who can access your wallet. We don\'t store your seed phrase.', 'index.features-item4-description')}}</p>
                    </div>
                    <div class="features-item">
                        <img src="/img/landing/f5.svg" alt="" width="64" height="64">
                        <h3>{{ $td('Fully Decentralized', 'index.features-item5-title')}}</h3>
                        <p>{{ $td('It means that only you own your money, not an exchange or a wallet. No one can stop or limit your actions.', 'index.features-item5-description')}}</p>
                    </div>
                    <div class="features-item">
                        <img src="/img/landing/f6.svg" alt="" width="64" height="64">
                        <h3>{{ $td('Rewarding', 'index.features-item6-title')}}</h3>
                        <p>{{ $td('Honee has rich programs to reward users for different actions. It’s the best way to win crypto or get it for free.', 'index.features-item6-description')}}</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="steps">
            <div class="container">
                <h2>{{ $td('Two simple steps to get started', 'index.steps-title')}}</h2>
                <p class="subtitle-h2">{{ $td('Takes a few minutes, tops', 'index.steps-description')}}</p>
                <div class="steps-items">
                    <div class="steps-item">
                        <div class="steps-icon">
                            <img src="/img/landing/step1.svg" alt="" width="64" height="64">
                            <span class="badge">1</span>
                        </div>
                        <h3>{{ $td('Create a new wallet', 'index.steps-step1')}}</h3>
                    </div>
                    <img src="/img/landing/arrow-right.svg" class="arrow" alt="">
                    <div class="steps-item">
                        <div class="steps-icon">
                            <img src="/img/landing/step2.svg" alt="" width="64" height="64">
                            <span class="badge">2</span>
                        </div>
                        <h3>{{ $td('Top it up', 'index.steps-step2')}}</h3>
                    </div>
                </div>
                <nuxt-link class="btn btn-2 u-mt-40" :to="$i18nGetPreferredPath('/dashboard')">{{ $td('Get Started', 'index.steps-button')}}</nuxt-link>
            </div>
        </section>
    </div>
</template>
