if ('serviceWorker' in navigator) {
  navigator.serviceWorker
  .register('./sw.js')
  .then(reg => navigator.serviceWorker.ready)
  .then(reg => {
    console.log('serviceWorker is registered');
  }).catch(err => {
    console.log('service worker failed to register', err);
  });
} else {
  document.getElementById('submitbtn').addEventListener('click', () => {
    console.log('fallback to fetch the reviews as usual');
  })
}
