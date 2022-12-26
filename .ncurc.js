module.exports = {
  format: [
      'group',
      'repo',
      'ownerChanged',
  ],
  reject: [
      'qr-scanner',
      // vue 3
      '@nuxt/content',
      'qrcode.vue',
      // nuxt 3 (webpack5)
      'less-loader',
      // es modules
      'beeper',
      'camelcase-keys',
      'del',
  ],
};
