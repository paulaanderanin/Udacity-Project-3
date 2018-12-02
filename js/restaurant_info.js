// Add import at the top
//import reviewForm from './review-form';

let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
		}
	});
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
	//favorites
		const favButton = document.getElementById('favoriteBtn');
		if (restaurant.is_favorite === 'true'){
			favButton.classList.add('favorite-active');
		}
		else {
			$('.favorite-active').removeClass('favorite-active')
		}
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
console.log(address)
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("alt", restaurant.name);
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;



  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
	DBHelper.fetchReviewsByRestaurantId(restaurant.id)
	.then(fillReviewsHTML);


	}

/** Favorite
*/
// function displayDataByIndex() {
//   tableEntry.innerHTML = '';
//   var transaction = db.transaction(['restaurants'], 'readonly');
//   var objectStore = transaction.objectStore('restaurants');
//
//   var myIndex = objectStore.index('id');
//   var getKeyRequest = myIndex.getKey('2');
//   getKeyRequest.onsuccess = function() {
//     console.log(getKeyRequest.result);
//   }
//
//   myIndex.openCursor().onsuccess = function(event) {
//     var cursor = event.target.result;
//     if(cursor) {
//       var tableRow = document.createElement('tr');
//       tableRow.innerHTML =   '<td>' + cursor.value.id + '</td>'
//                            + '<td>' + cursor.value.is_secured + '</td>'
//       tableEntry.appendChild(tableRow);
//
//       cursor.continue();
//     } else {
//       console.log('Entries all displayed.');
//     }
//   };
// };

// static checkFav(callback){
// 		 fetch(DBHelper.DATABASE_URL)
// 			.then(function(response) {
// 				return response.json();
// 			})
// 			.then(function(status) {
// 				var transaction = db.transaction(['restaurants'], 'readwrite');
// 				//report on Success
// 				transaction.oncomplete = function(e){
// 					console.log('transaction completed');
// 				};
// 				transaction.onerror = function(e){
// 					console.log('error ' + transaction.error )
// 				}
// 				//create an oject store on transaction
// 				var objectStore = transaction.objectStore('restaurants');
// 				var favIndex = objectStore.index('is_favorite');
// 				console.log(favIndex.keyPath);
//
//
// 				///making the request to get record by key from the object store
// 				var objectStoreRequest = objectStore.get('id');
//
// 				objectStoreRequest.onsuccess = function(e){
// 					console.log('report success of id');
//
// 					var myRecord = objectStoreRequest.result;
// 				}
// 				console.log(JSON.stringify(status));
// 			});///then end
// }

$('#favoriteBtn').on("click", function() {
  $('.favorite-active').not(this).removeClass('favorite-active');
  $(this).toggleClass('favorite-active');
	var favID = getParameterByName('id');

	if ($(this).hasClass('favorite-active')){
		//favorite = self.restaurant.is_favorite == false;
		console.log('true');
		submitFavorite(favID);
	}
	else {
		//favorite = self.restaurant.is_favorite == true;
		console.log('false');
		removeFavorite(favID);
	}
});

//favorites
function submitFavorite (favID){
console.log(`${DBHelper.DATABASE_URL}${favID}/?is_favorite=true`)
	return fetch(`${DBHelper.DATABASE_URL}${favID}/?is_favorite=true`, {
		credentials: 'include',
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
	})
	  .then(function(res) {
	    return res.json();
			console.log(favID)
	  })
	  .then(function(response) {

			dbPromise.then(function(db){
				var title  =  `true`;
				var objectStore = db.transaction(['restaurants'], 'readwrite').objectStore('restaurants');
				console.log('promised');
				//get to to do Listing
				var objectStoreTitleRequest = objectStore.get(title);
				objectStoreTitleRequest.onsuccess = function(){
					var data = objectStoreTitleRequest.result;
				//udpate dataset
				data.notified = "yes";
				//create anothere request that inserts the item back into the database
				var updateTitleRequest = objectStore.put(data);
				console.log("the transaction that originted that request is " + updateTitleRequest);
				//when this new request success, run the displayData()
				updateTitleRequest.onsuccess = function(){
					displayData();
					console.log(updateTitleRequest);
					}
				}
			});
	  })
		.catch(function(error) {
			console.log('error: ', error);
			dbPromise.then(function(db){
						var store = db.transaction('restaurants', 'readwrite').objectStore('restaurants', {KeyPath:'is_favorite'});
						return store.put(db);
					})
		})
}

//favorites
function removeFavorite (favID){
console.log(`${DBHelper.DATABASE_URL}${favID}/?is_favorite=false`)
	return fetch(`${DBHelper.DATABASE_URL}${favID}/?is_favorite=false`, {
		credentials: 'include',
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
	})
	  .then(function(res) {
	    return res.json();

	  })
	  .then(function(response) {
			dbPromise.then(function(db){
				var title = 'true';
				var objectStore = db.transaction(['restaurants'], 'readwrite').objectStore('restaurants');
				//get to to do Listing
				var objectStoreTitleRequest = objectStore.get(title);
				objectStoreTitleRequest.onsuccess = function(){
					var data = objectStoreTitleRequest.result;
				//udpate dataset
				data.notified = "yes";
				//create anothere request that inserts the item back into the database
				var updateTitleRequest = objectStore.put(data);
				console.log("the transaction that originted that request is " + updateTitleRequest);
				//when this new request success, run the displayData()
				updateTitleRequest.onsuccess = function(){
					displayData();
					console.log('promised removed favorite');
					}
				}
			});

		})
		.catch(function(error) {
			console.log('error: ', error);
			dbPromise.then(function(db){
						var store = db.transaction('restaurants', 'readwrite').objectStore('restaurants', {KeyPath:'is_favorite'});
						return store.put(db);
					})
		})


}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);


  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
  } else {
		const ul = document.getElementById('reviews-list');
	  reviews.forEach(review => {
	    ul.appendChild(createReviewHTML(review));
  	});
		container.appendChild(ul);
	}
	const h3 = document.createElement('h3');
	h3.innerHTML = "Leave a Review";
	container.appendChild(h3);
	const id = getParameterByName('id');
	container.appendChild(reviewForm(id));
	console.log ('did it load the form?');
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-label',document.getElementById('breadcrumb'));
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
