<script>
export default {
    props: {
        paginationInfo: {
            type: Object,
            required: true,
            default: () => ({
                currentPage: null,
                lastPage: null,
            }),
        },
        activeTab: {
            type: String,
        },
        hideMeta: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            // currentPage: this.paginationInfo.currentPage,
        };
    },
    computed: {
        currentPage() {
            return this.paginationInfo.currentPage;
        },
        hasPrev() {
            return this.currentPage > 1;
        },
        hasNext() {
            return this.currentPage < this.paginationInfo.lastPage;
        },
        firstNumber() {
            return (this.currentPage - 1) * this.paginationInfo.perPage + 1;
        },
        lastNumber() {
            const displayedAmount = this.currentPage === this.paginationInfo.lastPage ? this.paginationInfo.total % this.paginationInfo.perPage : this.paginationInfo.perPage;

            return this.firstNumber - 1 + displayedAmount;
        },
    },
    methods: {
        getPageHref(page) {
            let location = {
                path: this.$route.path,
                query: Object.assign({}, this.$route.query),
            };
            if (page && page !== 1) {
                location.query.page = page;
            } else {
                delete location.query.page;
            }
            if (this.activeTab) {
                location.query.active_tab = this.activeTab;
            }

            return location;
        },
    },
};
</script>

<template>
    <div class="pagination-wrap" v-if="currentPage && paginationInfo.lastPage > 1">
        <div class="pagination">
            <nuxt-link
                class="pagination__button button button--ghost-main"
                :class="{'u-visually-hidden': !hasPrev, 'pagination__button--disabled': isLoading}"
                :to="getPageHref(1)"
                :replace="true"
                :event="!hasPrev ? '' : 'click'"
            >
                &lt;&lt;
            </nuxt-link>
            <nuxt-link
                class="pagination__button button button--ghost-main"
                :class="{'u-visually-hidden': !hasPrev, 'pagination__button--disabled': isLoading}"
                :to="getPageHref(currentPage - 1)"
                :replace="true"
                :event="!hasPrev ? '' : 'click'"
            >
                &lt;
            </nuxt-link>
            <div class="pagination__current">Page {{ paginationInfo.currentPage }} of {{ paginationInfo.lastPage }}</div>
            <nuxt-link
                class="pagination__button button button--ghost-main"
                :class="{'u-visually-hidden': !hasNext, 'pagination__button--disabled': isLoading}"
                :to="getPageHref(currentPage + 1)"
                :replace="true"
                :event="!hasNext ? '' : 'click'"
            >
                >
            </nuxt-link>
            <nuxt-link
                class="pagination__button button button--ghost-main"
                :class="{'u-visually-hidden': !hasNext, 'pagination__button--disabled': isLoading}"
                :to="getPageHref(paginationInfo.lastPage)"
                :replace="true"
                :event="!hasNext ? '' : 'click'"
            >
                >>
            </nuxt-link>
        </div>
        <div class="pagination__meta u-text-muted u-text-small u-text-center" v-if="!hideMeta && firstNumber && lastNumber">Displayed {{ firstNumber }}-{{ lastNumber }} of total {{ paginationInfo.total }} items</div>
    </div>
</template>

<style lang="less">
.pagination {display: flex; align-items: center; justify-content: center;}
.pagination__button {
    padding-left: 0; padding-right: 0; width: 40px; letter-spacing: -1px;
    &:hover, &:focus, &:active {z-index: 2;}
    & + & {margin-left: 10px;}
}
.pagination__button--disabled {pointer-events: none;}
.pagination__current {margin: 0 15px; display: inline-block; white-space: nowrap; font-size: 16px; letter-spacing: 0.15px;}
.pagination__meta {margin-top: 16px;}
</style>
