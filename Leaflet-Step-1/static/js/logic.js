// Create a map centered at the following location and with the specficied zoom level
let mymap = L.map('mapid', {
    center: [7.8984813,-3.2742263], // Ghana
    zoom: 2.4}
);

// Specify link to USGS API
let usgs_link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
}).addTo(mymap);

function getColor(d) {
    return d > 5.0 ? '#bf0000' :
           d > 4.0  ? '#ff5c00' :
           d > 3.0  ? '#ff8106' :
           d > 2.0  ? '#fec34d' :
           d > 1.0  ? '#9acd32' :
                       '#2ef429';
}

// Read in data
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
          .addTo(mymap);
    });
});

var legend = L.control({position: 'bottomright'});
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

legend.addTo(mymap);
