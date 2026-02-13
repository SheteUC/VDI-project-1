let globalData = null;
let worldGeo = null;
let currentAttr1 = 'gdp_per_capita';
let currentAttr2 = 'youth_unemployment';
let selectedCountries = new Set(); // Track selected countries for brushing

const attributeConfig = {
    gdp_per_capita: {
        name: 'GDP per Capita',
        unit: 'USD',
        colorScheme: d3.interpolateGreens,
        format: d => `$${(d/1000).toFixed(1)}k`,
        isPositive: true  // higher is better
    },
    youth_unemployment: {
        name: 'Youth Unemployment Rate',
        unit: '%',
        colorScheme: d3.interpolateOranges,
        format: d => `${d.toFixed(1)}%`,
        isPositive: false  // lower is better
    },
    tertiary_education: {
        name: 'Tertiary Education Enrollment',
        unit: '%',
        colorScheme: d3.interpolateBlues,
        format: d => `${d.toFixed(1)}%`,
        isPositive: true  // higher is better
    },
    life_expectancy: {
        name: 'Life Expectancy',
        unit: 'years',
        colorScheme: d3.interpolatePurples,
        format: d => `${d.toFixed(1)} years`,
        isPositive: true  // higher is better
    }
};

const tooltip = d3.select('#tooltip');

function showTooltip(content, event) {
    tooltip
        .html(content)
        .classed('visible', true)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 10) + 'px');
}

function moveTooltip(event) {
    tooltip
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 10) + 'px');
}

function hideTooltip() {
    tooltip.classed('visible', false);
}

Promise.all([
    d3.csv('youth_opportunity_level3.csv'),
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
]).then(([data, geo]) => {
    data.forEach(d => {
        d.gdp_per_capita = d.gdp_per_capita ? +d.gdp_per_capita : null;
        d.youth_unemployment = d.youth_unemployment ? +d.youth_unemployment : null;
        d.tertiary_education = d.tertiary_education ? +d.tertiary_education : null;
        d.life_expectancy = d.life_expectancy ? +d.life_expectancy : null;
    });

    globalData = data;
    worldGeo = geo;

    d3.select('#attribute1-select').on('change', function() {
        currentAttr1 = this.value;
        updateVisualizations();
    });

    d3.select('#attribute2-select').on('change', function() {
        currentAttr2 = this.value;
        updateVisualizations();
    });

    // clear selection button
    d3.select('#clear-selection').on('click', function() {
        selectedCountries.clear();
        updateVisualizations();
    });

    updateVisualizations();
});

function updateVisualizations() {
    const selectionInfo = d3.select('#selection-info');
    const selectionCount = d3.select('#selection-count');
    
    if (selectedCountries.size > 0) {
        selectionInfo.style('display', 'block');
        selectionCount.text(`${selectedCountries.size} ${selectedCountries.size === 1 ? 'country' : 'countries'} selected`);
    } else {
        selectionInfo.style('display', 'none');
    }

    // clear all visualizations
    d3.select('#map1').selectAll('*').remove();
    d3.select('#map2').selectAll('*').remove();
    d3.select('#histogram1').selectAll('*').remove();
    d3.select('#histogram2').selectAll('*').remove();
    d3.select('#correlation-scatterplot').selectAll('*').remove();

    const config1 = attributeConfig[currentAttr1];
    const config2 = attributeConfig[currentAttr2];

    d3.select('#map1-title').text(`${config1.name} by Country`);
    d3.select('#map2-title').text(`${config2.name} by Country`);
    d3.select('#hist1-title').text(`Distribution of ${config1.name}`);
    d3.select('#hist2-title').text(`Distribution of ${config2.name}`);
    d3.select('#scatter-title').text(`${config1.name} vs ${config2.name}`);

    // filter data for each attribute (remove nulls)
    const data1 = globalData.filter(d => d[currentAttr1] !== null);
    const data2 = globalData.filter(d => d[currentAttr2] !== null);
    const dataBoth = globalData.filter(d => d[currentAttr1] !== null && d[currentAttr2] !== null);

    // lookup maps for choropleth
    const dataByCode1 = new Map(data1.map(d => [d.Code, d[currentAttr1]]));
    const dataByCode2 = new Map(data2.map(d => [d.Code, d[currentAttr2]]));
    const countryByCode = new Map(globalData.map(d => [d.Code, d.Entity]));

    // visualizations
    createChoroplethMap('#map1', worldGeo, dataByCode1, countryByCode, config1, currentAttr1);
    createChoroplethMap('#map2', worldGeo, dataByCode2, countryByCode, config2, currentAttr2);
    createHistogram('#histogram1', data1, currentAttr1, config1);
    createHistogram('#histogram2', data2, currentAttr2, config2);
    createScatterplot('#correlation-scatterplot', dataBoth, currentAttr1, currentAttr2, config1, config2);
}

// Choropleth Map
function createChoroplethMap(selector, geoData, dataByCode, countryByCode, config, attrKey) {
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    const width = 700 - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const projection = d3.geoNaturalEarth1()
        .scale(width / 1.8 / Math.PI)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const colorScale = d3.scaleSequential(config.colorScheme)
        .domain([0, d3.max(Array.from(dataByCode.values()))]);

    // countries
    svg.selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('class', d => {
            if (selectedCountries.size === 0) return 'country';
            return selectedCountries.has(d.id) ? 'country selected' : 'country dimmed';
        })
        .attr('d', path)
        .attr('fill', d => {
            const value = dataByCode.get(d.id);
            return value ? colorScale(value) : '#ccc';
        })
        .on('click', function(event, d) {
            // toggle selection
            if (selectedCountries.has(d.id)) {
                selectedCountries.delete(d.id);
            } else {
                selectedCountries.add(d.id);
            }
            updateVisualizations();
        })
        .on('mouseover', function(event, d) {
            const value = dataByCode.get(d.id);
            const name = countryByCode.get(d.id) || d.properties.name;
            
            if (value) {
                const country = globalData.find(c => c.Code === d.id);
                let content = `<strong>${name}</strong>`;
                content += `<div class="detail-row" style="font-size: 11px; font-style: italic;">Click to select/deselect</div>`;
                content += `<div class="detail-row">${config.name}: ${config.format(value)}</div>`;
                
                if (country) {
                    if (country.gdp_per_capita && attrKey !== 'gdp_per_capita') {
                        content += `<div class="detail-row">GDP per Capita: ${attributeConfig.gdp_per_capita.format(country.gdp_per_capita)}</div>`;
                    }
                    if (country.youth_unemployment && attrKey !== 'youth_unemployment') {
                        content += `<div class="detail-row">Youth Unemployment: ${attributeConfig.youth_unemployment.format(country.youth_unemployment)}</div>`;
                    }
                    if (country.tertiary_education && attrKey !== 'tertiary_education') {
                        content += `<div class="detail-row">Education Enrollment: ${attributeConfig.tertiary_education.format(country.tertiary_education)}</div>`;
                    }
                    if (country.life_expectancy && attrKey !== 'life_expectancy') {
                        content += `<div class="detail-row">Life Expectancy: ${attributeConfig.life_expectancy.format(country.life_expectancy)}</div>`;
                    }
                }
                showTooltip(content, event);
            } else {
                showTooltip(`<strong>${name}</strong><div class="detail-row">No data available</div>`, event);
            }
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);

    // legend
    const legendWidth = 200;
    const legendHeight = 10;
    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(Array.from(dataByCode.values()))])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(4)
        .tickFormat(config.format);

    const legend = svg.append('g')
        .attr('transform', `translate(${width - legendWidth - 20}, ${height - 40})`);

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${attrKey}`);

    gradient.selectAll('stop')
        .data(d3.range(0, 1.1, 0.1))
        .enter()
        .append('stop')
        .attr('offset', d => `${d * 100}%`)
        .attr('stop-color', d => colorScale(d * d3.max(Array.from(dataByCode.values()))));

    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', `url(#gradient-${attrKey})`);

    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis)
        .attr('class', 'legend');
}

// Histogram
function createHistogram(selector, data, attrKey, config) {
    const margin = {top: 20, right: 30, bottom: 60, left: 70};
    const width = 550 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[attrKey]) * 1.05])
        .range([0, width]);

    const histogram = d3.histogram()
        .value(d => d[attrKey])
        .domain(x.domain())
        .thresholds(x.ticks(20));

    const bins = histogram(data);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    // grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    // bars
    const bars = svg.selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('class', d => {
            // check if any country in this bin is selected
            const hasSelected = d.some(country => selectedCountries.has(country.Code));
            const allSelected = d.every(country => selectedCountries.has(country.Code));
            if (selectedCountries.size === 0) return 'bar';
            if (allSelected && d.length > 0) return 'bar selected';
            if (hasSelected) return 'bar';
            return 'bar dimmed';
        })
        .attr('x', d => x(d.x0) + 1)
        .attr('y', d => y(d.length))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('height', d => height - y(d.length))
        .on('click', function(event, d) {
            // toggle selection
            if (d.length > 0) {
                const codes = d.map(country => country.Code);
                const allSelected = codes.every(code => selectedCountries.has(code));
                
                if (allSelected) {
                    codes.forEach(code => selectedCountries.delete(code));
                } else {
                    codes.forEach(code => selectedCountries.add(code));
                }
                updateVisualizations();
            }
        })
        .on('mouseover', function(event, d) {
            let content = `<strong>Range: ${config.format(d.x0)} - ${config.format(d.x1)}</strong>`;
            content += `<div class="detail-row">Countries: ${d.length}</div>`;
            content += `<div class="detail-row" style="font-size: 11px; font-style: italic;">Click to select/deselect</div>`;
            
            // show country names (limit to 10)
            if (d.length > 0) {
                const countryNames = d.map(country => country.Entity).slice(0, 10);
                content += `<div class="detail-row" style="margin-top: 5px;">` + countryNames.join(', ');
                if (d.length > 10) {
                    content += ` +${d.length - 10} more`;
                }
                content += `</div>`;
            }
            showTooltip(content, event);
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);

    // X axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(config.format))
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
        .text(`${config.name} (${config.unit})`);

    // Y axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .text('Number of Countries');
}

// Scatterplot
function createScatterplot(selector, data, attr1, attr2, config1, config2) {
    const margin = {top: 20, right: 30, bottom: 60, left: 70};
    const width = 1400 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[attr1]) * 1.05])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[attr2]) * 1.1])
        .range([height, 0]);

    // grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(-height).tickFormat(''));

    // Dots
    const dots = svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', d => {
            if (selectedCountries.size === 0) return 'dot';
            return selectedCountries.has(d.Code) ? 'dot selected' : 'dot dimmed';
        })
        .attr('cx', d => x(d[attr1]))
        .attr('cy', d => y(d[attr2]))
        .attr('r', 4)
        .on('click', function(event, d) {
            // toggle selection
            if (selectedCountries.has(d.Code)) {
                selectedCountries.delete(d.Code);
            } else {
                selectedCountries.add(d.Code);
            }
            updateVisualizations();
        })
        .on('mouseover', function(event, d) {
            // enlarge dot
            d3.select(this).attr('r', 6);
            
            let content = `<strong>${d.Entity}</strong>`;
            content += `<div class="detail-row" style="font-size: 11px; font-style: italic;">Click to select/deselect</div>`;
            content += `<div class="detail-row">${config1.name}: ${config1.format(d[attr1])}</div>`;
            content += `<div class="detail-row">${config2.name}: ${config2.format(d[attr2])}</div>`;
            
            if (d.gdp_per_capita && attr1 !== 'gdp_per_capita' && attr2 !== 'gdp_per_capita') {
                content += `<div class="detail-row">GDP per Capita: ${attributeConfig.gdp_per_capita.format(d.gdp_per_capita)}</div>`;
            }
            if (d.youth_unemployment && attr1 !== 'youth_unemployment' && attr2 !== 'youth_unemployment') {
                content += `<div class="detail-row">Youth Unemployment: ${attributeConfig.youth_unemployment.format(d.youth_unemployment)}</div>`;
            }
            if (d.tertiary_education && attr1 !== 'tertiary_education' && attr2 !== 'tertiary_education') {
                content += `<div class="detail-row">Education Enrollment: ${attributeConfig.tertiary_education.format(d.tertiary_education)}</div>`;
            }
            if (d.life_expectancy && attr1 !== 'life_expectancy' && attr2 !== 'life_expectancy') {
                content += `<div class="detail-row">Life Expectancy: ${attributeConfig.life_expectancy.format(d.life_expectancy)}</div>`;
            }
            
            showTooltip(content, event);
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', function() {
            // Reset dot size
            d3.select(this).attr('r', 4);
            hideTooltip();
        });

    // brush for selecting multiple countries
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on('end', function(event) {
            if (!event.selection) return; // ignore empty selections
            
            const [[x0, y0], [x1, y1]] = event.selection;
            
            // find countries within the brush selection
            selectedCountries.clear();
            data.forEach(d => {
                const cx = x(d[attr1]);
                const cy = y(d[attr2]);
                if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
                    selectedCountries.add(d.Code);
                }
            });

            svg.select('.brush').call(brush.move, null);
            
            updateVisualizations();
        });

    svg.append('g')
        .attr('class', 'brush')
        .call(brush);

    // X axis
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(config1.format))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Y axis
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(config2.format));

    // X axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 50)
        .text(`${config1.name} (${config1.unit})`);

    // Y axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .text(`${config2.name} (${config2.unit})`);
}
