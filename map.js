// Map configuration
const width = 960;
const height = 600;

// Style constants
const STYLES = {
    defaultOpacity: 0.6,
    hoverOpacity: 0.8,
    colors: {
        darkSlateGreen: "#183A37",
        cambridgeBlue: "#75BBA7",
        snow: "#F3F5F7"
    }
};

// Create tooltip div
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", STYLES.colors.darkSlateGreen)
    .style("color", STYLES.colors.snow)
    .style("padding", "8px 12px")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("z-index", "1000");

// Create SVG container
const svg = d3.select("#map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create a group for the map
const g = svg.append("g");

// Create projection
const projection = d3.geoNaturalEarth2()
    .scale(200)
    .center([0, 0])
    .translate([width / 2, height / 2]);

// Create path generator
const path = d3.geoPath().projection(projection);

// Sample collaborator data - replace with your actual data
const collaborators = [
    { name: "University of Manchester", location: [-2.2337, 53.483959] },
    { name: "Wellcome Sanger Institute", location: [0.1869, 52.0797] },
    { name: "NYC Lab", location: [-74.0060, 40.7128] },
    { name: "University of Melbourne", location: [144.9631, -37.8136] },
    { name: "University of Antioquia", location: [-75.5696, 6.2518] },
    // Add more collaborators here
];

// Lab location
const labLocation = {
    name: "Duque-Correa Lab",
    location: [0.1218, 52.2053]  // Cambridge coordinates
};

// Load world map data
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(data => {
        // Draw countries
        g.selectAll("path")
            .data(topojson.feature(data, data.objects.countries).features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", STYLES.colors.darkSlateGreen)
            .attr("stroke", STYLES.colors.cambridgeBlue)
            .attr("stroke-opacity", STYLES.defaultOpacity)
            .attr("stroke-width", 0.5);

        // Add connection lines
        collaborators.forEach(collab => {
            const interpolate = d3.geoInterpolate(labLocation.location, collab.location);
            const points = [];
            for (let i = 0; i <= 100; i++) {
                points.push(projection(interpolate(i / 100)));
            }

            g.append("path")
                .attr("class", "connection-arc")
                .attr("data-collaborator", collab.name)
                .attr("d", d3.line()(points))
                .attr("fill", "none")
                .attr("stroke", STYLES.colors.cambridgeBlue)
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "5,5")
                .attr("opacity", STYLES.defaultOpacity);
        });

        // Add lab pin
        g.append("circle")
            .attr("cx", projection(labLocation.location)[0])
            .attr("cy", projection(labLocation.location)[1])
            .attr("r", 8)
            .attr("fill", STYLES.colors.snow)
            .attr("stroke", STYLES.colors.snow)
            .attr("stroke-width", 2)
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(labLocation.name)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add collaborator pins
        g.selectAll("circle.collaborator")
            .data(collaborators)
            .enter()
            .append("circle")
            .attr("class", "collaborator")
            .attr("cx", d => projection(d.location)[0])
            .attr("cy", d => projection(d.location)[1])
            .attr("r", 5)
            .attr("fill", STYLES.colors.cambridgeBlue)
            .attr("stroke", STYLES.colors.snow)
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.name)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");

                // Highlight the connection line
                d3.selectAll(".connection-arc")
                    .transition()
                    .duration(200)
                    .attr("opacity", STYLES.defaultOpacity)
                    .attr("stroke", STYLES.colors.cambridgeBlue);
                
                d3.select(`.connection-arc[data-collaborator="${d.name}"]`)
                    .transition()
                    .duration(200)
                    .attr("opacity", STYLES.hoverOpacity)
                    .attr("stroke", STYLES.colors.snow);
            })
            .on("mouseout", function(d) {
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                // Reset all connection lines
                d3.selectAll(".connection-arc")
                    .transition()
                    .duration(200)
                    .attr("opacity", STYLES.defaultOpacity)
                    .attr("stroke", STYLES.colors.cambridgeBlue);
            });
    })
    .catch(error => console.error("Error loading the map data:", error)); 