Promise.all([
    d3.csv('youth_opportunity_level1.csv'),
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
]).then(([data, worldGeo]) => {
    data.forEach(d => {
        d.gdp_per_capita = +d.gdp_per_capita;
        d.youth_unemployment = +d.youth_unemployment;
    });

    const gdpByCode = new Map(data.map(d => [d.Code, d.gdp_per_capita]));
    const unemploymentByCode = new Map(data.map(d => [d.Code, d.youth_unemployment]));
    const countryByCode = new Map(data.map(d => [d.Code, d.Entity]));

    createGDPMap(worldGeo, gdpByCode, countryByCode);
    createUnemploymentMap(worldGeo, unemploymentByCode, countryByCode);
    createGDPHistogram(data);
    createUnemploymentHistogram(data);
    createCorrelationScatterplot(data);
});

// Choropleth Map 1: GDP per Capita
function createGDPMap(worldGeo, gdpByCode, countryByCode) {
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    const width = 700 - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;

    const svg = d3.select('#gdp-map')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    //projection
    const projection = d3.geoNaturalEarth1()
        .scale(width / 1.8 / Math.PI)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // color scale - sequential green for GDP (higher is better)
    const colorScale = d3.scaleSequential(d3.interpolateGreens)
        .domain([0, d3.max(Array.from(gdpByCode.values()))]);

    // countries
    svg.selectAll('path')
        .data(worldGeo.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('fill', d => {
            const code = d.id;
            const value = gdpByCode.get(code);
            return value ? colorScale(value) : '#ccc';
        })
        .append('title')
        .text(d => {
            const code = d.id;
            const value = gdpByCode.get(code);
            const name = countryByCode.get(code) || d.properties.name;
            return value ? `${name}\nGDP per Capita: $${value.toFixed(0)}` : `${name}\nNo data`;
        });

    // legend
    const legendWidth = 200;
    const legendHeight = 10;
    
    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(Array.from(gdpByCode.values()))])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(4)
        .tickFormat(d => `$${(d/1000).toFixed(0)}k`);

    const legend = svg.append('g')
        .attr('transform', `translate(${width - legendWidth - 20}, ${height - 40})`);

    // legend gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
        .attr('id', 'gdp-gradient');

    gradient.selectAll('stop')
        .data(d3.range(0, 1.1, 0.1))
        .enter()
        .append('stop')
        .attr('offset', d => `${d * 100}%`)
        .attr('stop-color', d => colorScale(d * d3.max(Array.from(gdpByCode.values()))));

    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#gdp-gradient)');

    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis)
        .attr('class', 'legend');
}

// Choropleth Map 2: Youth Unemployment Rate
function createUnemploymentMap(worldGeo, unemploymentByCode, countryByCode) {
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    const width = 700 - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;

    const svg = d3.select('#unemployment-map')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // projection
    const projection = d3.geoNaturalEarth1()
        .scale(width / 1.8 / Math.PI)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // color scale - sequential orange/red for unemployment (higher is worse)
    const colorScale = d3.scaleSequential(d3.interpolateOranges)
        .domain([0, d3.max(Array.from(unemploymentByCode.values()))]);

    // countries
    svg.selectAll('path')
        .data(worldGeo.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('fill', d => {
            const code = d.id;
            const value = unemploymentByCode.get(code);
            return value ? colorScale(value) : '#ccc';
        })
        .append('title')
        .text(d => {
            const code = d.id;
            const value = unemploymentByCode.get(code);
            const name = countryByCode.get(code) || d.properties.name;
            return value ? `${name}\nYouth Unemployment: ${value.toFixed(1)}%` : `${name}\nNo data`;
        });

    // legend
    const legendWidth = 200;
    const legendHeight = 10;
    
    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(Array.from(unemploymentByCode.values()))])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(4)
        .tickFormat(d => `${d.toFixed(0)}%`);

    const legend = svg.append('g')
        .attr('transform', `translate(${width - legendWidth - 20}, ${height - 40})`);

    // legend gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
        .attr('id', 'unemployment-gradient');

    gradient.selectAll('stop')
        .data(d3.range(0, 1.1, 0.1))
        .enter()
        .append('stop')
        .attr('offset', d => `${d * 100}%`)
        .attr('stop-color', d => colorScale(d * d3.max(Array.from(unemploymentByCode.values()))));

    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#unemployment-gradient)');

    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis)
        .attr('class', 'legend');
}

// Histogram 1: GDP per Capita Distribution
function createGDPHistogram(data) {
    const margin = {top: 20, right: 30, bottom: 60, left: 70};
    const width = 550 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select('#gdp-histogram')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // histogram bins
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.gdp_per_capita)])
        .range([0, width]);

    const histogram = d3.histogram()
        .value(d => d.gdp_per_capita)
        .domain(x.domain())
        .thresholds(x.ticks(20));

    const bins = histogram(data);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    // grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''));

    // bars
    svg.selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.x0) + 1)
        .attr('y', d => y(d.length))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('height', d => height - y(d.length))
        .append('title')
        .text(d => `$${d.x0.toFixed(0)} - $${d.x1.toFixed(0)}\nCountries: ${d.length}`);

    // X axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d => `$${d/1000}k`))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Y axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));

    // X axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .text('GDP per Capita (USD)');

    // Y axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .text('Number of Countries');
}

// Histogram 2: Youth Unemployment Distribution
function createUnemploymentHistogram(data) {
    const margin = {top: 20, right: 30, bottom: 60, left: 70};
    const width = 550 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select('#unemployment-histogram')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // histogram bins
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.youth_unemployment)])
        .range([0, width]);

    const histogram = d3.histogram()
        .value(d => d.youth_unemployment)
        .domain(x.domain())
        .thresholds(x.ticks(15));

    const bins = histogram(data);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    // grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''));

    // bars
    svg.selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.x0) + 1)
        .attr('y', d => y(d.length))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('height', d => height - y(d.length))
        .append('title')
        .text(d => `${d.x0.toFixed(1)}% - ${d.x1.toFixed(1)}%\nCountries: ${d.length}`);

    // X axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `${d}%`))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Y axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));

    // X axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .text('Youth Unemployment Rate (%)');

    // Y axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .text('Number of Countries');
}

// Scatterplot: GDP vs Youth Unemployment Correlation
function createCorrelationScatterplot(data) {
    const margin = {top: 20, right: 30, bottom: 60, left: 70};
    const width = 1400 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select('#correlation-scatterplot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.gdp_per_capita) * 1.05])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.youth_unemployment) * 1.1])
        .range([height, 0]);

    // grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''));

    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat(''));

    // dots
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.gdp_per_capita))
        .attr('cy', d => y(d.youth_unemployment))
        .attr('r', 4)
        .append('title')
        .text(d => `${d.Entity}\nGDP per Capita: $${d.gdp_per_capita.toFixed(0)}\nYouth Unemployment: ${d.youth_unemployment.toFixed(1)}%`);

    // X axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d => `$${d/1000}k`))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Y axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(d => `${d}%`));

    // X axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .text('GDP per Capita (USD)');

    // Y axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .text('Youth Unemployment Rate (%)');
}
