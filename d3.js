const width = 950;
const height = 600;
const padding = 60;

const svg = d3.select("#d3Canvas")
    .append("svg")
    .attr('id', 'treemap')
    .attr("width", width)
    .attr("height", height);

var tooltip = d3.select("#d3Canvas").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);



fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json').then(response => response.json())
    .then((data) => {

        const root = d3.hierarchy(data).sum(function (d) { return d.value }).sort(function (a, b) { return b.value - a.value; }); // Here the size of each leave is given in the 'value' field in input data

        // Then d3.treemap computes the position of each element of the hierarchy
        d3.treemap()
            .size([width, height])
            .padding(1)
            (root)

        var color = d3.scaleOrdinal()
            .range([
                '#1f77b4',
                '#aec7e8',
                '#ff7f0e',
                '#ffbb78',
                '#2ca02c',
                '#98df8a',
                '#d62728',
                '#ff9896',
                '#9467bd',
                '#c5b0d5',
                '#8c564b',
                '#c49c94',
                '#e377c2',
                '#f7b6d2',
                '#7f7f7f',
                '#c7c7c7',
                '#bcbd22',
                '#dbdb8d',
                '#17becf',
                '#9edae5'
            ]
                .map(function (c) { c = d3.rgb(c); c.opacity = 0.6; return c; }));

        //data-name, data-category, and data-value containing their corresponding name, category, and value.
        // use this information to add rectangles:
        svg
            .selectAll("rect")
            .data(root.leaves())
            .join("rect")
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })
            .attr('class', 'tile')
            .attr('data-name', (d) => d.data.name)
            .attr('data-category', (d) => d.data.category)
            .attr('data-value', (d) => d.data.value)
            .style("stroke", "black")
            .style("fill", function (d) { while (d.depth > 1) d = d.parent; return color(d.value); })
            .on("mouseover", function (d) {
                var name = this.getAttribute('data-name');
                var category = this.getAttribute('data-category');
                var value = this.getAttribute('data-value');

                var coordinates = d3.pointer(d);
                var x = coordinates[0] + document.getElementById('treemap').getBoundingClientRect().x - 2 * padding;
                var y = coordinates[1] + document.getElementById('treemap').getBoundingClientRect().y - padding;

                tooltip.attr('data-value', value);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Name: " + name + "<br />" + "Category: " + category + "<br />" + "Value: " + value)
                    .style("left", x + "px")
                    .style("top", y + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // and to add the text labels
        svg
            .selectAll("text")
            .data(root.leaves())
            .join("text")
            .attr("x", function (d) { return d.x0 + 5 })    // +10 to adjust position (more right)
            .attr("y", function (d) { return d.y0 + 10 })    // +20 to adjust position (lower)
            .attr("font-size", "7px")
            .attr("fill", "white")
            .each(function (d) {
                var name = d.data.name;
                var widthOfCell = d.x1 - d.x0;
                if (name.length * 7 > widthOfCell) {

                    var words = name.split(' ')
                    var displayName = "";
                    var tempLine = "";
                    var lines = []

                    words.forEach((word) => {
                        if (tempLine.length * 12 > widthOfCell) {
                            lines.push(tempLine)
                            displayName += tempLine + "\n"
                            tempLine = word
                        }
                        else {
                            tempLine += " " + word
                        }
                    });
                    lines.push(tempLine)
                    displayName += tempLine

                    for (var i = 0; i < lines.length; i++) {
                        d3.select(this).append("tspan")
                            .attr("y", d.y0 + 10 + i * 8)
                            .attr("x", d.x0 + 5)
                            .text(lines[i])
                    }
                }
                else {
                    d3.select(this).text(name)
                }
            })

        var legendWidth = width;
        var legendHeight = 50;
        var legendPadding = 20;

        var parents = root.descendants()[0].children
        console.log(root.descendants()[0].children)

        var legendRectWidth = (legendWidth) / parents.length

        const legend = d3.select("#d3Canvas")
            .append("svg")
            .attr('id', 'legend')
            .attr('width', legendWidth)
            .attr('height', legendHeight);

        legend
            .selectAll('rect')
            .data(parents)
            .enter()
            .append('rect')
            .attr('class', 'legend-item')
            .attr('x', (d, i) => i * legendRectWidth + legendPadding / 2)
            .attr('y', legendPadding)
            .attr('width', legendRectWidth - legendPadding)
            .attr('height', legendHeight - legendPadding)
            .attr('fill', (d) => color(d.value))

        legend
            .selectAll("text")
            .data(parents)
            .join("text")
            .attr("x", (d, i) => i * legendRectWidth + legendPadding / 2)    // +10 to adjust position (more right)
            .attr("y", legendHeight - legendPadding)    // +20 to adjust position (lower)
            .attr("font-size", "7px")
            .text((d) => d.data.name)

    })