let restaurants,
  neighborhoods,
  cuisines
var map
var markers = [];
let firstLoad = true;
let liveMap = false;


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.setAttribute("aria-labelledby", cuisine);
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  console.log("initMap");
  updateRestaurants();
};

/**
 * Initialize Google map, called from HTML.
 */
/*
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };*/


  /*
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}  */



/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;

}

/**
 * Create all restaurants HTML and add them to the webpage.
 */

 /**
 * Create all restaurants HTML and add them to the webpage.
 */
const switchToLiveMap = event => {
  updateRestaurants();
  if (liveMap)
    return;

  document
    .getElementById("mapImg")
    .remove();

  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google
    .maps
    .Map(document.getElementById("map"), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    });

  liveMap = true;
};

const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  if (firstLoad) {
    fetchNeighborhoods();
    fetchCuisines();
    const mapURL = DBHelper.getStaticAllRestaurantsMapImage(self.restaurants);
    const mapDiv = document.getElementById("map");
    const mapImg = document.createElement("img");
    mapImg.id = "mapImg";
    mapImg.onclick = e => switchToLiveMap();
    mapImg.src = mapURL;
    mapDiv.append(mapImg);

    firstLoad = false;
  } else {
    addMarkersToMap();
  }
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.setAttribute("aria-labelledby", restaurant.name);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  /* THIS OPTION CAN USE THE RESTAURANT NAME + CUISINE TO NOT UPDATE THE DATABASE ---- image.setAttribute("alt", "Restaurant Name: "+ restaurant.name+", Type of Food: " +restaurant.cuisine_type);*/
  image.setAttribute ("alt", DBHelper.altTag(restaurant));
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute("aria-label","View details for " + restaurant.name);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    }), {passive: true};
    self.markers.push(marker);
  });
}

///reviews

// window.addEventListener('online', () => {
//   var offlineTS = new Date();
//
//   console.log('#### online #####');
//   dbPromise.then(db => {
//     //stores results
//     var tx = db.transaction('reviews', 'readwrite');
//     var store = tx.objectStore('reviews');
//     store.forEach(review => {
//       if(review.createdAt > offlineTS) {
//         postReview(review);
//       }
//       // store.put(review);
//     })
//   //return response;
//   });
// });
