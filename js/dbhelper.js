/**
 * Common database helper functions.
 */


 var dbPromise = idb.open('restdb', 3, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
      // a placeholder case so that the switch block will
      // execute when the database is first created
      // (oldVersion is 0)
    case 1:
      console.log('Creating the restaurants object store');
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
    case 2:
      console.log('Creating a name index');
      var store = upgradeDb.transaction.objectStore('restaurants');
      store.createIndex('restaurant', 'restaurant', {unique: true});
    case 3:
    upgradeDb.createObjectStore('reviews', {keyPath: 'id'})
    case 4:
      var store = upgradeDb.transaction.objectStore('reviews');
      store.createIndex('review', 'review', {unique:true});
    case 4:
    upgradeDb.createObjectStore('favorites', {keyPath: 'id'})
    case 5:
    var store = upgradeDb.transaction.objectStore('restaurants');
    store.createIndex('is_favorite', 'is_favorite', {unique: true});
  }
});//end dbPromise

class DBHelper {
	/**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
	static get DATABASE_URL() {
		const port = 1337; // Change this to your server port
		return `http://localhost:${port}/restaurants/`;
	}
  static get API_URL() {
		 const port = 1337; // Change this to your server port
		return `http://localhost:${port}/reviews/`;
	}
  /*
  static get API_FAVORITE() {
     const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants/${restaurant_id}`;
  }  */


	/**
   * Fetch all restaurants.
   */
	static fetchRestaurants(callback) {
		fetch(DBHelper.DATABASE_URL)
			.then(function(response){
				return response.json();
			})
			.then(restaurants => {
				dbPromise.then(db => {
					var tx = db.transaction('restaurants', 'readwrite');
					var store = tx.objectStore('restaurants');
					restaurants.forEach(restaurant => {
						store.put(restaurant);
					})
					callback(null, restaurants);
				});
			}).catch(err => {
				dbPromise.then(function(db) {
					var store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
					return store.getAll();
				}).then(function(data) {
					callback(null, data);
				});

			});


	}

	/**
   * Fetch a restaurant by its ID.
   */
	static fetchRestaurantById(id, callback) {
		// fetch all restaurants with proper error handling.
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				const restaurant = restaurants.find(r => r.id == id);
				if (restaurant) { // Got the restaurant
					callback(null, restaurant);
				} else { // Restaurant does not exist in the database
					callback('Restaurant does not exist', null);
				}
			}
		});
	}

	/**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
	static fetchRestaurantByCuisine(cuisine, callback) {
		// Fetch all restaurants  with proper error handling
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given cuisine type
				const results = restaurants.filter(r => r.cuisine_type == cuisine);
				callback(null, results);
			}
		});
	}

	/**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
	static fetchRestaurantByNeighborhood(neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given neighborhood
				const results = restaurants.filter(r => r.neighborhood == neighborhood);
				callback(null, results);
			}
		});
	}

	/**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
	static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				let results = restaurants;
				if (cuisine != 'all') { // filter by cuisine
					results = results.filter(r => r.cuisine_type == cuisine);
				}
				if (neighborhood != 'all') { // filter by neighborhood
					results = results.filter(r => r.neighborhood == neighborhood);
				}
				callback(null, results);
			}
		});
	}


	// Fetch all neighborhoods with proper error handling.

	static fetchNeighborhoods(callback) {
	  // Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all neighborhoods from all restaurants
				const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
				// Remove duplicates from neighborhoods
				const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
				callback(null, uniqueNeighborhoods);
			}
		});
	}

	/**
   * Fetch all cuisines with proper error handling.
   */
	static fetchCuisines(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
				callback(null, uniqueCuisines);
			}
		});
	}

	/**
   * Restaurant page URL.
   */
	static urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	/**
   * Restaurant image URL.
   */
	static imageUrlForRestaurant(restaurant) {
		return (`/img/${restaurant.photograph}.jpg`);
	}
static altTag(restaurant){
		return (`${restaurant.name}`);
	}

  ///*** favorites
  static favoriteF(restaurant){
    return (`${restaurant.is_favorite}`);
  }
	/**
   * Map marker for a restaurant.
   */
	static mapMarkerForRestaurant(restaurant, map) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: DBHelper.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP}
		);
		return marker;
	}

////GOOGLE STATIC

static getStaticAllRestaurantsMapImage(restaurants) {
   let loc = {
     lat: 40.722216,
     lng: -73.987501
   };
   // Create static map image for initial display
   let mapURL = `http://maps.googleapis.com/maps/api/staticmap?center=${
   loc.lat},${loc.lng}&zoom=12&size=${
   document.documentElement.clientWidth}x400&markers=color:red`;
   restaurants.forEach(r => {
     mapURL += `|${r.latlng.lat},${r.latlng.lng}`;
   });
   mapURL += "&key=AIzaSyDpMBZUHqaUaHOdTf10Fk-brZBH8TuzNys";

   return mapURL;
 }


/** FAVORITE FETCH
**/

static fetchFavorite(restaurant_id){
  return fetch(`${DBHelper.DATABASE_URL}`)
  .then(function(response){
    if (!response.ok) return Promise.reject("favorites could not be fetched from network");
    return response.json();
  })
  .then(favorite => {
    dbPromise.then(db => {
      var fav = db.transaction('favorites', 'readwrite');
      var store = fav.objectStore('favorites');
      favorite.forEach(favorite => {
        store.put (favorite);
      })
    })
  })
}


  /**
  * REVIEWS
  */
static fetchReviewsByRestaurantId(restaurant_id){
  return fetch(`${DBHelper.API_URL}?restaurant_id=${restaurant_id}`)
  .then(function(response){
    //returns results as json for storing
    //extra
    if (!response.ok) return Promise.reject("reviews could not be fetched from network");

    return response.json();
  })
  .then(reviews => {
    dbPromise.then(db => {
      //stores results
        var tx = db.transaction('reviews', 'readwrite');
        var store = tx.objectStore('reviews');
        reviews.forEach(review => {
        store.put(review);
      })
    });
    return reviews;
  }).catch(networkError => {
    dbPromise.then(db => {
      return db.transaction('reviews')
      .objectStore('reviews').getAll();
    }).then (allReviews => console.log (allReviews));
      return (`${networkError}`);
      //return allReviews; //return null to handle error ,as though there are no reviews.
  });
}
}


/// extra
/**
 * Returns a li element with review data so it can be appended to
 * the review list.
 */
function createReviewHTML(review) {
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
 * Clear form data
 */
function clearForm() {
  // clear form data
  document.getElementById('name').value = "";
  document.getElementById('rating').selectedIndex = 0;
  document.getElementById('comments').value = "";
}

/**
 * Make sure all form fields have a value and return data in
 * an object, so is ready for a POST request.
 */
function validateAndGetData() {
  const data = {};

  // get name
  let name = document.getElementById('name');
  if (name.value === '') {
    name.focus();
    return;
  }
  data.name = name.value;

  // get rating
  const ratingSelect = document.getElementById('rating');
  const rating = ratingSelect.options[ratingSelect.selectedIndex].value;
  if (rating == "--") {
    ratingSelect.focus();
    return;
  }
  data.rating = Number(rating);

  // get comments
  let comments = document.getElementById('comments');
  if (comments.value === "") {
    comments.focus();
    return;
  }
  data.comments = comments.value;

  // get restaurant_id
  let restaurantId = document.getElementById('review-form').dataset.restaurantId;
  data.restaurant_id = Number(restaurantId);

  // set createdAT
  data.createdAt = new Date().toISOString();

  return data;
}

/**
 * Handle submit.
 */
function handleSubmit(e) {
  e.preventDefault();
  window.location.reload();
  const review = validateAndGetData();
  if (!review) return;

  console.log(review);

  const url = `${DBHelper.API_URL}`;
  const POST = {
    method: 'POST',
    body: JSON.stringify(review)
  };

  // TODO: use Background Sync to sync data with API server
  return fetch(url, POST).then(response => {
    if (!response.ok) return Promise.reject("We couldn't post review to server.");
    return response.json();
  }).then(newNetworkReview => {
    // save new review on idb
    dbPromise.putReviews(newNetworkReview);
    // post new review on page
    const reviewList = document.getElementById('reviews-list');
    const review = createReviewHTML(newNetworkReview);
    reviewList.appendChild(review);
    // clear form
    clearForm();
  });

}

/**
 * Returns a form element for posting new reviews.
 */
  function reviewForm(restaurantId) {
  const form = document.createElement('form');
  form.id = "review-form";
  form.dataset.restaurantId = restaurantId;

  let p = document.createElement('p');
  const name = document.createElement('input');
  name.id = "name"
  name.setAttribute('type', 'text');
  name.setAttribute('aria-label', 'Name');
  name.setAttribute('placeholder', 'Enter Your Name');
  p.appendChild(name);
  form.appendChild(p);

  p = document.createElement('p');
  const selectLabel = document.createElement('label');
  selectLabel.setAttribute('for', 'rating');
  selectLabel.innerText = "Your rating: ";
  p.appendChild(selectLabel);
  const select = document.createElement('select');
  select.id = "rating";
  select.name = "rating";
  select.classList.add('rating');
  ["--", 1,2,3,4,5].forEach(number => {
    const option = document.createElement('option');
    option.value = number;
    option.innerHTML = number;
    if (number === "--") option.selected = true;
    select.appendChild(option);
  });
  p.appendChild(select);
  form.appendChild(p);

  p = document.createElement('p');
  const textarea = document.createElement('textarea');
  textarea.id = "comments";
  textarea.setAttribute('aria-label', 'comments');
  textarea.setAttribute('placeholder', 'Enter any comments here');
  textarea.setAttribute('rows', '10');
  p.appendChild(textarea);
  form.appendChild(p);

  p = document.createElement('p');
  const addButton = document.createElement('button');
  addButton.setAttribute('type', 'submit');
  addButton.setAttribute('id', 'submitbtn')
  addButton.setAttribute('aria-label', 'Add Review');
  addButton.classList.add('add-review');
  addButton.innerHTML = "<span>+</span>";
  p.appendChild(addButton);
  form.appendChild(p);

  form.onsubmit = handleSubmit;

  return form;
};
