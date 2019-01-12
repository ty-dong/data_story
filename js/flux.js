
$(function() {

	var width = 500; var height = 500;
	var stroke_color = "#FFF"
	var opacity_strength=1;
	var max_volume=1;
	var hide_arcs = false;

	var proj = d3.geoOrthographic()//geoKavrayskiy7()
		.scale(250)
	  .rotate([0,0])
		.translate([width/2,height/2])
		.precision(0.1);

	var path = d3.geoPath().projection(proj);

	var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height);

	var sgv2 = d3.select("#Country").append("svg")
	            .attr("id","info")
							.attr("align", "center")
							.attr("width", 350)
							.attr("height", 0)
	            .append("g");

	svg.call(d3.drag()
	        .on("start", dragstarted)
	        .on("drag", dragged));

	svg.call(d3.zoom()
						.scaleExtent([0.75, 50]) //bound zoom
						.on("zoom", zoomed));

	var g1 = svg.append("g");

	d3.json("data/countries.json",function(error,world) {
		var countries = topojson.feature(world, world.objects.countries1).features;
		g1.append("path")
			 .datum({type: "Sphere"})
			 .attr("class", "water")
			 .attr("d", path);

		g1.selectAll("path.land")
	    .data(countries)
	    .enter().append("path")
	    .attr("class", "land")
	    .attr("d", path)
			.on("click", country_clicked);

		drawTrade();
		});

		document.getElementById("color").addEventListener("change", function() {
		   stroke_color = this.value;
		   refresh();
		});

		document.getElementById("opacity").addEventListener("change", function() {
			opacity_strength = this.value;
			refresh();
		})

		document.getElementById("hide").addEventListener("change", function(){
			if(hide_arcs)
				{
					hide_arcs = false;
					g1.selectAll(".route").attr("visibility", "visible");
				}
			else
			{
				hide_arcs =true;
				g1.selectAll(".route").attr("visibility", "hidden");
			}
			//refresh();
		});

	// Draw a set of routes
	function drawTrade() {
		d3.csv("data/countries_import.csv", function (error, routes) {
			var maxVolume = d3.max(routes, function(d) { return +parseFloat(d.Mass); });
			max_volume = maxVolume;

			routePath = g1.selectAll(".route")
				.data(routes)
				.enter()
				.append("path")
				.attr("class","route")
				.style("stroke-width", function(d) {
	        return (Math.log(parseFloat(d.Mass))*0.1);
				})
				.style("opacity", function(d) {
					return(parseFloat(d.Mass)*opacity_strength/max_volume);
				})
				.style("stroke", stroke_color)
				.attr('d', function(d) {
	        var loc = getLoc(d)
	        return path ({
					type:"LineString",
					coordinates: [ [2,46], loc]
					});
				})
	    });

		}

	  function refresh() {
	    svg.selectAll(".land").attr("d", path);
			svg.selectAll(".water").attr("d", path);
			g1.selectAll(".route").attr('d', function(d) {
			 var loc = getLoc(d)
			 return path ({
			 type:"LineString",
			 coordinates: [ [2,46], loc]
			 });
		 })
		 .style("stroke", stroke_color)
		 .style("opacity", function(d) {
			 if(opacity_strength==100) {
				 return(parseFloat(d.Mass));
			 }
			 else {
				 return(parseFloat(d.Mass)*opacity_strength/max_volume);
			 }
		});
		}



	  function dragstarted() {
	    v0 = versor.cartesian(proj.invert(d3.mouse(this)));
	    r0 = proj.rotate();
	    q0 = versor(r0);
	  }

	function dragged() {
	    var v1 = versor.cartesian(proj.rotate(r0).invert(d3.mouse(this))),
	        q1 = versor.multiply(q0, versor.delta(v0, v1)),
	        r1 = versor.rotation(q1);
	    proj.rotate(r1);
	    refresh();
	  }

	function getLoc(country_) {
	    var locy = parseInt(country_.loc.split(",")[1]);
	    var locx = parseInt(country_.loc.split(",")[0].substring(1));
	    return [locy,locx];
	  }

	function zoomed() {
		var scl = Math.min(width, height)/2.5;
		proj.scale(d3.event.transform.translate(proj).k * scl)
		refresh()
	}

	function country_clicked(d) {

			// set the dimensions and margins of the graph
		var margin = {top: 20, right: 20, bottom: 150, left: 70},
			width = 400 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;

		// append the svg object to the body of the page
		// append a 'group' element to 'svg'
		// moves the 'group' element to the top left margin
		d3.select("#info").remove();
		d3.select("#name").remove();

		d3.select("#Country-name")
			.append("h4")
			.attr("id", "name")
			.attr("float","right")
			.text(d.properties.name)

		var svg = d3.select("#Country")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("id", "info")
			.attr("align", "center")
			.attr("position", "absolute")
		.append("g")
			.attr("transform",
						"translate(" + margin.left + "," + margin.top + ")");

		// get the data
		d3.csv("data/import_per_country.csv", function(error, data) {
		if (error) throw error;

		var products = new Array(0);

		data.forEach(function(e) {
			if (d.properties["Alpha-2"] == e.cca2) {
				products.push(new Array([e.Name, e.Mass]));
			}
		})
		// set the ranges
		var x = d3.scaleBand()
						.range([0, width+10])
						.padding(0.1);
		var y = d3.scaleLinear()
						.range([height, 0]);

		// Scale the range of the data in the domains
		x.domain(products.map(function(e) { return e[0][0]; }));

		y.domain([0, d3.max(products, function(e) {return parseInt(e[0][1]); })]);

		// append the rectangles for the bar chart
		svg.selectAll(".bar")
				.data(products)
			.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(e) { return x(e[0][0]); })
				.attr("width", x.bandwidth())
				.attr("y", function(e) { return y(e[0][1]); })
				.attr("height", function(e) { return height - y(e[0][1]); })

		// add the x Axis
		svg.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x))
				.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

		// add the y Axis
		svg.append("g")
				.call(d3.axisLeft(y).ticks())

			});
	}
});
