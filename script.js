d3.csv('youth_opportunity_data.csv').then(data => {
    data.forEach(d => {
        d.gdp_per_capita = +d.gdp_per_capita;
        d.youth_unemployment = +d.youth_unemployment;
        d.tertiary_education = +d.tertiary_education;
        d.life_expectancy = +d.life_expectancy;
    });

    createGDPHistogram(data);
    createUnemploymentHistogram(data);
    createCorrelationScatterplot(data);
});

// Histogram 1: GDP per Capita Distribution
function createGDPHistogram(data) {
    const margin = {top: 20, right: 30, bottom: 60, left: 70};
    const width = 550 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

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
    const height = 400 - margin.top - margin.bottom;

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
    const width = 1200 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

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
