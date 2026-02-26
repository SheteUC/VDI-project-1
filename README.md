# Youth Opportunity Explorer

## Motivation

I built "Youth Opportunity Explorer" to help new grads compare countries in a practical way: Where is it easier to find opportunity, keep learning, and live well?

The dashboard lets you explore how economic strength, access to higher education, youth job markets, and quality-of-life indicators vary across the world and how they relate to each other.

## Data

All datasets come from Our World in Data (OWID), which publishes country-level indicators and makes them easy to download and reuse.

For this project I used four quantitative measures from the year 2023 (merged into a single dataset):

- **GDP per capita (World Bank):**  
  https://ourworldindata.org/grapher/gdp-per-capita-worldbank

- **Tertiary education enrollment:**  
  https://ourworldindata.org/grapher/gross-enrollment-ratio-in-tertiary-education

- **Youth unemployment rate (ages 15–24):**  
  https://ourworldindata.org/grapher/unemployment-rate-for-young-people

- **Life expectancy:**  
  https://ourworldindata.org/grapher/life-expectancy

## Design

The dashboard is organized as a single-page layout where you can compare multiple views simultaneously. The interface includes two side-by-side choropleth maps at the top, two distribution histograms in the middle, and a wide scatterplot at the bottom for correlation analysis.

## Visual components

The app has multiple linked views so you can understand each variable by itself and also see relationships across variables.

- **Distribution views (histograms/bar-style bins):** Two histograms show how countries are spread across values for each selected metric. Hovering reveals the bin range, count, and country names. Clicking a bar selects all countries in that bin.

- **Correlation view (scatterplot):** A large scatterplot lets you see whether countries with higher values on one measure tend to also score higher/lower on another. Hovering shows the country's exact values for all four metrics. You can click individual dots to select countries, or drag a brush rectangle to select multiple countries at once.

- **Spatial views (choropleth maps):** Two side-by-side maps color countries by the selected attributes, making it easy to spot regional patterns. Hovering shows the country name and all available metrics. Clicking a country selects it across all views.

**Interactive brushing & linking:** The dashboard implements full cross-view highlighting. When you select countries by clicking on any visualization (map, histogram bar, or scatterplot dot) or by brushing on the scatterplot, those countries are highlighted across all views simultaneously. Selected countries appear in full color while non-selected countries are dimmed. A "Clear Selection" button resets all selections.

## What this enables you to discover

This tool makes it easy to spot patterns that aren't obvious from a single chart. By selecting and comparing countries across multiple views, you can identify:

- Countries that combine high tertiary education enrollment with low youth unemployment
- Regions where GDP per capita doesn't correlate strongly with life expectancy
- Outliers that perform exceptionally well or poorly on specific metrics
- Clusters of countries with similar opportunity profiles

The interactive selection feature lets you explore specific groups of countries (e.g., a geographic region, an income bracket) and see how they compare across all four dimensions simultaneously.

## Process, challenges, AI, demo

**Implementation:** I built the site with HTML/CSS + JavaScript using D3.js (v7) for all charts and interactions. The OWID CSV files were preprocessed and merged into a single clean dataset (`youth_opportunity_level3.csv`) containing data from 2023 for all four indicators. The app uses D3's brush interaction for multi-select on the scatterplot and implements custom click handlers for selection across all visualizations.

**Code + access:**

- Live app on GitHub Pages: https://sheteuc.github.io/VDI-project-1/
- How to run locally: Clone the repository, then open `index.html` with a local web server (e.g., VS Code Live Server extension, or `python -m http.server`). Opening the HTML file directly in a browser may cause CORS issues when loading the CSV data.

**Demo Link** -> https://1drv.ms/v/c/ac11ea8bde0a5031/IQBFoZc4hg7aQ7V7OdXvhRlBAVQdta8S1C1j_OrIvDdW8RY?e=in6e53

**Challenges + future work:**

- Challenges I ran into included aligning country codes between the OWID data and the GeoJSON map, keeping scales/legends consistent across views, and coordinating the selection state across all five visualizations.
- Future work: add a year slider for time-varying exploration, implement lasso selection on the maps, and/or add a "weighted preference" control so users can rank countries based on customizable weights for each metric.

**AI + collaboration:**

- I used AI to troubleshoot D3 bugs.
