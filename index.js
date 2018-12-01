// JavaScript code
var width = 900;
var height = 600;
var centered;

var projection = d3.geo.mercator()

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)

svg.append("rect")
    .attr("class", "background")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#cbefdf");
    //.on("click", country_clicked);

var g = svg.append("g");


d3.json("doc/world.json", function(error, topology) {
  g.append("g")
    .selectAll("path")
    .data(topojson.object(topology, topology.objects.countries)
        .geometries)
    .enter()
    .append("path")
    .attr("d", path)
    .on("click", country_clicked);
});
/*
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("path")
            .attr("d", path.projection(projection));
});

svg.call(zoom)
*/

function zoom(xyz) {
  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + xyz[2] + ")translate(" + -xyz[0] + "," + -xyz[1] + ")")
      .style("stroke-width", 1.5 / xyz[2] + "px");
}

function get_xyz(d) {
  var bounds = path.bounds(d);
  var w_scale = (bounds[1][0] - bounds[0][0]) / width;
  var h_scale = (bounds[1][1] - bounds[0][1]) / height;
  var z = .96 / Math.max(w_scale, h_scale);
  var x = (bounds[1][0] + bounds[0][0]) / 2;
  var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
  return [x, y, z];
}

function country_clicked(d) {
  if (d && centered !== d) {
    var xyz = get_xyz(d);
    country = d;
    zoom(xyz);
    centered = d;
  } else {
    var xyz = [width/2, height/2,1]
    centered = null;
    zoom(xyz)
  }
}
