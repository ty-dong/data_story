$(function() {

  var name = "apricot"
  var dist_bootstrapped = [];
  var dist_bootstrapped_int = new Array(0);
  var menu;

  create_menu();

  document.getElementById("menu").addEventListener("change", function(){
    var prod = d3.select("select")
                  .property("value");

    d3.select("#product_name")
      .text(prod);

    drawBox();
    drawCalendar();
    drawLinePlot();
    drawbarchart();
  });


  function create_menu() {
    d3.csv("data/distance_per_prod.csv", function(error, data) {
      if (error) throw error;
      menu = d3.select("#menu");
      menu.selectAll("option")
          .data(data)
          .enter()
          .append("option")
          .attr("value", function(d) {return d.Name;})
          .text(function(d) {return d.Name;});
    });
    drawBox();
    drawCalendar();
    drawLinePlot();
    drawbarchart();
    return menu;
  }

  function drawBox() {
    name = d3.select("#product_name").text();
    d3.csv("data/distance_per_prod.csv", function(error, data) {
      if (error) throw error;
      data.forEach(function(e) {
        if(e.Name == name) {
          dist_bootstrapped = e.dist_to_fr_x.split(",");
          for (var s of dist_bootstrapped) {
            if(s.indexOf("[")!==-1 || s.indexOf("]")!==-1) {
              dist_bootstrapped_int.push(parseInt(s.substring(1)));
            }
            else {
              dist_bootstrapped_int.push(parseInt(s));
            }
          }
        }
      });
      var data = [
        {
          y: dist_bootstrapped_int,
          type: 'box',
          name: "distance distribution"
        }
      ];
      var layout = {
        paper_bgcolor:'rgba(0,0,0,0)',
        plot_bgcolor:'rgba(0,0,0,0)',
        autosize:true,
        margin:{
            l:50,
            r:0,
            b:20,
            t:50,
            pad:4
        },
        yaxis: {
         title: {
           text: 'Distance (km)',
           font: {
             family: 'Courier New, monospace',
             size: 15,
             color: '#000'
           }
         },
       },

      };

      Plotly.newPlot('boxplot', data, layout=layout);
    });
  }

  function drawCalendar() {
    var indices = new Array(12);
    var in_season = new Array(12);
    var higher_import = new Array(12);
    name = d3.select("#product_name").text();
    d3.csv("data/product_per_month_analysis.csv", function(error, data) {

      if (error) throw error;
      data.forEach(function(e) {
        if(e.Name == name) {
          indices[e.Importation_Month-1] = parseFloat(e.Index);
          in_season[e.Importation_Month-1] = e.is_right_season;
          higher_import[e.Importation_Month-1] = e.Higher_import;
        }
      });

      var calendar = document.getElementById("calendar").getElementsByTagName("td");
      for (var i=0; i<2; i++) {
        for (var j=6; j<12; j++) {
          var p = (i==0)? -1:1
          calendar[j-6*p].style.color = '#abcdef';
          calendar[j+12*i].innerHTML = '-';
        }
      }


      for (var i=0; i<2; i++) {
        for (var j=6; j<12; j++) {
          var p = (i==0)? -1:1
          calendar[j+12*i].style.backgroundColor = getGreenToRed(indices[j-6*(1-i)]);
          if (in_season[j-6*(1-i)]=='True') {
            calendar[j+6*p].style.color = '#FFFFFF';
          }
          if (higher_import[j-6*(1-i)]=='True') {
            calendar[j+12*i].innerHTML = '*';
          }
        }
      }
    });

  }

  function drawLinePlot() {
    var months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January+1']
    var values = new Array(13);
    var in_season = new Array(13);

    name = d3.select("#product_name").text();
    d3.csv("data/product_per_month_analysis.csv", function(error, data) {
      if (error) throw error;
      data.forEach(function(e) {
        if(e.Name == name) {
          console.log(name)
          console.log(e.Name)
          values[e.Importation_Month-1] = parseFloat(e.Month_mass);
          in_season[e.Importation_Month-1] = e.is_right_season;
        }
      });
      values[12] = values[0];
      var data = [{
        x:months,
        y:values,
        mode: 'lines+markers'
      }];

      var layout = {
        paper_bgcolor:'rgba(0,0,0,0)',
        plot_bgcolor:'rgba(0,0,0,0)',
        autosize:true,
        margin:{
            l:45,
            r:15,
            b:50,
            t:0,
            pad:4
        },
        yaxis: {
         title: {
           text: 'Mass imported (kg)',
           font: {
             family: 'Courier New, monospace',
             size: 15,
             color: '#000'
           }
         },
       },
        shapes:[],
        annotations: [{
        text: 'Importations per month',
        x: months[6],
        y: d3.max(values),
        showarrow: false,
        font: {size: 14}
    }]
      };
      for( var i = 0; i < 12;  i++ ){
        if(in_season[i]=='True') {
          var shape = {
              type: 'rect',
              xref: 'x',
              yref: 'paper',
              x0: months[i],
              y0: 0,
              x1: months[i+1],
              y1: 1,
              fillcolor: 'green',
              opacity: 0.2,
              line: {
                  width: 0
              }
          }
          layout.shapes.push(shape);
        }
      }
      Plotly.newPlot('linechart', data, layout=layout);
    });
  }

  function drawbarchart() {
    var names = [];
    var mass = [];

    name = d3.select("#product_name").text();
    d3.csv("data/origins_per_product.csv", function(error, data) {
      if (error) throw error;
      data.forEach(function(e) {
        if(e.Name == name) {
          mass.push(parseFloat(e.Mass));
          names.push(e.Country);
        }
      });

      var data = [
      {
        x: names,
        y: mass,
        type: 'bar'
      }];
      var layout = {
        paper_bgcolor:'rgba(0,0,0,0)',
        plot_bgcolor:'rgba(0,0,0,0)',
        autosize:true,
        margin:{
            l:45,
            r:10,
            b:30,
            t:0,
            pad:4
        },
        yaxis: {
         title: {
           text: 'Mass imported (kg)',
           font: {
             family: 'Courier New, monospace',
             size: 15,
             color: '#000'
           }
         },
       },
        annotations: [{
        text: 'Top importing countries',
        //xanchor: 'center',
        //yanchor: 'top',
        x: names[2],
        y: d3.max(mass),
        showarrow: false,
        font: {size: 14}
    }]
      };

      Plotly.newPlot('barchart-prod', data, layout=layout);
    });
  }

var cv  = document.getElementById('cv'),
    ctx = cv.getContext('2d');

for(var i = 0; i <= 255; i++) {
    ctx.beginPath();
    r = i<128 ? 255 : Math.floor(255-(i/255*100*2-100)*255/100);
    g = i>128 ? 255 : Math.floor((i/255*100*2)*255/100);
    var color = 'rgb('+r+','+g+',0)';

    ctx.fillStyle = color;

    ctx.fillRect(i * 2, 0, 2, 50);
}
  function getGreenToRed(index){
    var percent = index * 100;
    r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
    g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
    return 'rgb('+r+','+g+',0)';
  }
})
