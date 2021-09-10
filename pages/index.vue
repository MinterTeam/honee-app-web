<script>
import IndexSubscribeForm from '@/components/IndexSubscribeForm.vue';

export default {
    layout: 'simple',
    components: {
        IndexSubscribeForm,
    },
    data() {
        return {

        };
    },
};
</script>


<template>
    <div class="wrapper page-index">
        <header>
            <!--<nav class="lang"><a href="#"><img src="/img/landing/en.svg" alt="" /></a></nav>-->
            <div class="container">
                <div class="hello">
                    <div class="hello-content">
                        <div class="logo"><img src="/img/logo-honee.svg" alt="" width="122" height="24"/></div>
                        <h1>{{ $td('The simplest crypto wallet that helps you earn', 'index.hello-title')}}</h1>
                        <p class="subtitle-h1">{{ $td('Honee wallet is focused on enabling people to&nbsp;earn crypto. Enter&nbsp;your e-mail address below to be among the first&nbsp;users!', 'index.hello-description')}}</p>
                        <!-- <a class="btn" href="#">Start Earning</a> -->
                        <IndexSubscribeForm class="u-mb-15"/>
                        <h3>{{ $td('Coming this September', 'index.hello-coming')}}</h3>
                    </div>
                    <img src="/img/landing/phone.png" alt="" class="hello-image" />
                </div>
            </div>
        </header>
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
                <!--<a class="btn btn-2" href="#">{{ $td('Get Started', 'index.steps-button')}}</a>-->
            </div>
        </section>
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
                    <a href="https://www.youtube.com/channel/UChqsLhknZKhKfNxmMT7yytQ" target="_blank">
                        <img src="/img/landing/youtube.svg" alt="" width="64" height="64">
                    </a>
                    <a href="https://www.facebook.com/honeeapp" target="_blank">
                        <img src="/img/landing/facebook.svg" alt="" width="64" height="64">
                    </a>
                    <a href="https://medium.com/@honeeapp" target="_blank">
                        <img src="/img/landing/medium.svg" alt="" width="64" height="64">
                    </a>
                    <!--<a href="#" target="_blank"><img src="/img/landing/instagram.svg" alt="" width="64" height="64"></a>-->
                </div>
            </div>
        </section>
        <footer class="footer">
            <div class="container">
                <div class="footer-disclaimer">
                    <h3>{{ $td('Disclaimer', 'index.footer-disclaimer-title')}}</h3>
                    <p>Please note that you are accessing the ALPHA Version of the Honee service which is in the process of being tested before its official release. The sole purpose of this ALPHA Version is to conduct testing and obtain feedback.</p>
                    <p>ALPHA testing is free for users and we do not demand any remuneration for access to the ALPHA Version of the services. Intra-blockchain fees you pay for transactions are not the payment for using the Honee service.</p>
                    <p>Operations with virtual assets pose intrinsic risks, including the risk of monetary loss. We strongly suggest you seek professional advice before engaging in any operations with virtual assets.</p>
                    <p>We do not give any warranties, whether express or implied, as to the suitability or usability of the service, its software or any of its content. We will not be liable for any loss, whether such loss is direct, indirect, special or consequential, suffered by any party as a result of their use of the ALPHA, its content and functionalities.</p>
                    <p>Should you encounter any bugs, glitches, lack of functionality or other problems on the ALPHA, please email us at <a href="mailto:hello@honee.app" class="link--underline u-fw-600">hello@honee.app</a>.</p>
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
                <!--<nav class="footer-menu">
                    <ul>
                        <li><a href="">Terms</a></li>
                        <li><a href="">Privacy</a></li>
                        <li><a href="">Help</a></li>
                        <li><a href="">Contact</a></li>
                    </ul>
                </nav>-->
            </div>
        </footer>
    </div>
</template>
