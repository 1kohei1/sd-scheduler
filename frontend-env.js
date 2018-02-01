const prod = process.env.NODE_ENV === 'production';

module.exports = {
  'process.env.BACKEND_URL': prod ? 'DEFINE_THIS_LATER' : 'http://localhost:3000'
}