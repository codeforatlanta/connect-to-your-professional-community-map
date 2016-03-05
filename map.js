window.onload = function () {

  var documentSettings = {};

  function createMarkerIcon(icon, prefix, markerColor, iconColor) {
    return L.AwesomeMarkers.icon({
      icon: icon,
      prefix: prefix,
      markerColor: markerColor,
      iconColor: iconColor
    });
  }

  function centerAndZoomMap(points) {
    var mapCenter = L.latLng();
    var mapZoom = 0;

    // center and zoom map based on points or to user-specified zoom and center
    if (documentSettings["Initial Center Latitude:"] !== '' && documentSettings["Initial Center Longitude:"] !== '') {
      // center and zoom
      mapCenter = L.latLng(documentSettings["Initial Center Latitude:"], documentSettings["Initial Center Longitude"]);
      map.setView(mapCenter);
    } else {
      var groupBounds = points.getBounds();
      mapZoom = map.getBoundsZoom(groupBounds);
      mapCenter = groupBounds.getCenter();
    }

    if (documentSettings["Initial Zoom:"] !== '') {
      mapZoom = parseInt(documentSettings["Initial Zoom:"]);
    }

    map.setView(mapCenter, mapZoom);

    // once map is recentered, open popup in center of map
    if (documentSettings["Info Popup Text:"] !== '') {
      initInfoPopup(documentSettings["Info Popup Text:"], mapCenter);
    };
  }

  // only run this after Tabletop has loaded (onTabletopLoad())
  function mapPoints(points) {
    var markerArray = [];
    console.log(points[0]);
    // check that map has loaded before adding points to it?
    for (var i in points) {
      var point = points[i];
      markerArray.push(L.marker([point.Latitude, point.Longitude], {
        icon: createMarkerIcon(point['Marker Icon'], 'fa', point['Marker Color'].toLowerCase(), point['Marker Icon Color'])
      }).bindPopup("<b>" + point["Title"] + "</b><br>" + point["Description"]));
    }

    var group = L.featureGroup(markerArray);

    // cluster markers, or don't
    if (documentSettings["Markercluster:"] === 'on') {
        var cluster = L.markerClusterGroup({
            polygonOptions: {
                opacity: 0.3,
                weight: 3
            }
        });
    
        cluster.addLayer(group);
        map.addLayer(cluster);
    } else {
        map.addLayer(group);
    }

    centerAndZoomMap(group);
  }
  // reformulate documentSettings as a dictionary, e.g.
  // {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
  function createDocumentSettings(settings) {

    documentSettings = {};

    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customization;
    }

    console.log(documentSettings);
  }

  function onTabletopLoad() {
    // documentSettings = tabletop.sheets("Information").elements;
    createDocumentSettings(tabletop.sheets("Information").elements);
    addBaseMap();
    document.title = documentSettings["Webpage Title:"];
    mapPoints(tabletop.sheets("Points").elements);
  }

  var tabletop = Tabletop.init( { key: '1QEWSScFgDxwFYa76pI3IUAn4-krNhKd6NTe5awejFYs',
    callback: function(data, tabletop) { onTabletopLoad() } 
  });

  function initInfoPopup(info, coordinates) {
    L.popup({className: 'intro-popup'})
      .setLatLng(coordinates) // this needs to change
      .setContent(info)
      .openOn(map);
  }

  var pollingIcon = L.AwesomeMarkers.icon({
    icon: 'check-square-o',
    prefix: 'fa',
    markerColor: 'red'
  });

  // function createCountyLayer(county) {
  //   return L.geoJson(polling, {
  //     filter: function(feature, latlng) {
  //       switch (feature.properties.County) {
  //         case county: return true;
  //         default: return false;
  //       };
  //     },
  //     onEachFeature: onEachPolling,
  //     pointToLayer: function(feature, latlng) {
  //       return L.marker(latlng, {icon: pollingIcon});
  //     }
  //   });
  // };

  // var fultonLayer = createCountyLayer("Fulton").addTo(map);

  // map

  L.control.attribution({position: 'bottomleft'}).addTo(map);



  function addBaseMap() {
    var basemap = documentSettings["Tile Provider:"] === '' ? 'Stamen.TonerLite' : documentSettings["Tile Provider:"];

    console.log(documentSettings);

    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);
  }

  // var counties = {
  //   "Fulton": fultonLayer
  // };

  // L.control.layers(null, null, {
  //   collapsed: false
  // }).addTo(map);

  // // change zoom and center of map when county changes
  // map.on('baselayerchange', function(e) {
  //   map.fitBounds(e.layer.getBounds(), {
  //     maxZoom: 14
  //   });
  // });
};