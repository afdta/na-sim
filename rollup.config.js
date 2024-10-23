import resolve from '@rollup/plugin-node-resolve';

export default {
  input: './build/js/main.js',
  output: {
    format: 'iife',
    file: './assets/app.js'
  },
  plugins: [resolve({mainFields:['module', 'browser', 'main']})]
};
