<script>

export default {
    layout: 'landing',
    nuxtI18n: {
        locales: ['en'],
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
    </div>
</template>
