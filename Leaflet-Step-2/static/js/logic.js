// Specify link to USGS API
let usgs_link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

//Specify location of fault data
let fault_data = "static/data/PB2002_boundaries.geojson"

// Create function to select colors based on magnitude
function getColor(d) {
    return d > 5.0 ? '#bf0000' :
           d > 4.0  ? '#ff5c00' :
           d > 3.0  ? '#ff8106' :
           d > 2.0  ? '#fec34d' :
           d > 1.0  ? '#9acd32' :
                      '#2ef429';
}

// Create basemaps
let satelliteView = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
})

let outdoorsView = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
})

let grayscaleView = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
})

// Define a baseMaps object to hold our base layers
let baseMaps = {
    "Satellite": satelliteView ,
    "Grayscale": grayscaleView,
    "Outdoors": outdoorsView
  };

// Initialize overlay maps
let layers = {
    earthquakes: new L.LayerGroup(),
    faults: new L.LayerGroup()
};

// Create a map centered at the following location and with the specficied zoom level
let mymap = L.map('mapid', {
    center: [0,0], // center of the world
    zoom: 3,
    layers:[
        satelliteView,
        layers.earthquakes,
        layers.faults
    ] //default basemap
});

// Create array of overlay maps
let overlays = {
    "Earthquakes": layers.earthquakes,
    "Faults": layers.faults
};

// Create a layer control 
L.control.layers(baseMaps,overlays,{
    condensed: false
}).addTo(mymap);

// Read in earthquake data
d3.json(usgs_link).then(data=>{
    data.features.forEach(element => {
        let lat = element.geometry.coordinates[1]
        let long = element.geometry.coordinates[0]
        let timetag = new Date(element.properties.time).toGMTString()

        // Magnitude Color Selector
        let color = getColor(parseFloat(element.properties.mag));

        // Create Circle Layer
        L.circle(
            [lat,long],
            {
              fillOpacity: 0.8,
              weight: 0.1,
              color : '#fafafa',
              fillColor : color,
              radius : Math.exp(element.properties.mag)*500
            }
          ).bindPopup(`<h3><a href=${element.properties.url} target=="_blank">${element.properties.place}</a></h3>
          <hr><p style="margin: 0;"><time>${timetag}</time></p><p style="font-weight: bold; margin: 0;">Magnitude: ${element.properties.mag}</p>`)
          .addTo(layers.earthquakes)
    });
});

// Read in fault boundary data
d3.json(fault_data).then(data=>{
    let onEachFeature = (feature, layer) => {layer}
    let fault = L.geoJson(data,{
        style: function(feature){
            return {
                color: '#f95700ff', //highlighter orange
                weight: 1.5
            }
        },
    }).addTo(layers.faults)
});

// Add legened to the map
let legend = L.control({
    position: 'bottomright'
});
legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> '+
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] +'<br>': '+');
    }
    return div;
};

// Add legend to map
legend.addTo(mymap)

// Add legend controls to only show up when earthquakes layer is selected
mymap.on('overlayremove', function (eventLayer) {
    console.log(eventLayer)
    if (eventLayer.name === 'Earthquakes') {
        mymap.removeControl(legend);
    };
});

mymap.on('overlayadd', function (eventLayer) {
    console.log(eventLayer)
    if (eventLayer.name === 'Earthquakes') {
        legend.addTo(mymap);
    };
});
