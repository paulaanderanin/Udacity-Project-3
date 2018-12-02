if ('serviceWorker' in navigator) {
  //scope is where the file directory is
  navigator.serviceWorker
  .register('./sw.js', { scope:'./'})
  .then(registration => navigator.serviceWorker.ready)
  .then(registration => {
    setTimeout(function () {
      document.getElementById('submitReview').addEventListener('click', () => {
        registration.sync.register('sync-reviews').then(() => {
          console.log('Sync registered');
        });
      });
    }, 1000);
  })
  .catch(err => {
    console.log('Service worker failed to register', err);
  });
}

window.addEventListener('online', () => {
  console.log('back online', localStorage.getItem('offlineDate'));
});
window.addEventListener('offline', () => {
  console.log('creating offlline ts');
  localStorage = window.localStorage;
  localStorage.setItem('offlineDate', new Date());
  console.log(localStorage.getItem('offlineDate'));
});
