'use strict';

L.Icon.Default.imagePath = window.bikeit.templateUri + '/css/images';

angular.module('bikeit.map', [
	'leaflet-directive'
])
.controller('MapController', [
	'$state',
	'leafletData',
	'leafletEvents',
	'$scope',
	function($state, leafletData, leafletEvents, $scope) {

		if(window.bikeit.city) {
			var bounds = window.bikeit.city.boundingbox;
			$scope.maxbounds = {
				northEast: {
					lat: parseFloat(bounds[0]),
					lng: parseFloat(bounds[2])
				},
				southWest: {
					lat: parseFloat(bounds[1]),
					lng: parseFloat(bounds[3])
				}
			};
		}

		$scope.mapDefaults = {
			tileLayer: window.bikeit.map.tile,
			scrollWheelZoom: false

		};

		$scope.$on('leafletDirectiveMarker.mouseover', function(event, args) {
			args.leafletEvent.target.openPopup();
			args.leafletEvent.target.setZIndexOffset(1000);
		});

		$scope.$on('leafletDirectiveMarker.mouseout', function(event, args) {
			args.leafletEvent.target.closePopup();
			args.leafletEvent.target.setZIndexOffset(0);
		});

		$scope.$on('leafletDirectiveMarker.click', function(event, args) {
			$state.go('placesSingle', { placeId:  args.markerName})
		});

		$scope.$watch('markers', function(markers) {

			if(markers && !_.isEmpty(markers)) {

				var latLngs = [];

				_.each(markers, function(marker) {

					latLngs.push([
						marker.lat,
						marker.lng
					]);

				});

				var bounds = L.latLngBounds(latLngs);

				leafletData.getMap().then(function(m) {

					var rightOffset = 20;
					var leftOffset = 20;

					if(jQuery('.content-map').length) {
						rightOffset = jQuery('body').width() - jQuery('.content-map-header').position().left -20;
					}

					m.fitBounds(bounds, { reset: true, paddingBottomRight: [rightOffset, 20], paddingTopLeft: [leftOffset, 20] });

				});

			}

		});

	}
])
.factory('MapMarkers', [
	'$window',
	function($window) {

		var markers = {};

		_.each($window.bikeit.placeCategories, function(place) {

			var images = ['default', 'approved', 'failed', 'stamp'];

			_.each(images, function(image) {

				var imageObj = place.markers[image];
				var position = place.markers.position;
				var popupAnchor;
				var offset = 5;

				if(position == 'center') {
					position = [imageObj.width/2, imageObj.height/2];
					popupAnchor = [0, -imageObj.height/2 + offset];
				} else if(position == 'bottom_center') {
					position = [imageObj.width/2, imageObj.height];
					popupAnchor = [0, -imageObj.height + offset];
				} else if(position == 'bottom_left') {
					position = [0, imageObj.height];
					popupAnchor = [imageObj.width/2, -imageObj.height + offset];
				} else if(position == 'bottom_right') {
					position = [imageObj.width, imageObj.height];
					popupAnchor = [-imageObj.width/2, -imageObj.height + offset];
				}

				markers['place-category-' + place.term_id + '-' + image] = {
					iconUrl: imageObj.url,
					shadowUrl: false,
					shadowSize: [0,0],
					iconSize: [imageObj.width, imageObj.height],
					iconAnchor: position,
					popupAnchor: popupAnchor
				};

			});

		});

		return markers;

	}
]);