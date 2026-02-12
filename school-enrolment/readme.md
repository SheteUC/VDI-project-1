# Share of people enrolled in tertiary education - Data package

This data package contains the data that powers the chart ["Share of people enrolled in tertiary education"](https://ourworldindata.org/grapher/school-enrolment?v=1&csvType=full&useColumnShortNames=false&enrolment_type=gross_enrolment&level=tertiary&sex=both) on the Our World in Data website. It was downloaded on February 12, 2026.

### Active Filters

A filtered subset of the full data was downloaded. The following filters were applied:

## CSV Structure

The high level structure of the CSV file is that each row is an observation for an entity (usually a country or region) and a timepoint (usually a year).

The first two columns in the CSV file are "Entity" and "Code". "Entity" is the name of the entity (e.g. "United States"). "Code" is the OWID internal entity code that we use if the entity is a country or region. For most countries, this is the same as the [iso alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) code of the entity (e.g. "USA") - for non-standard countries like historical countries these are custom codes.

The third column is either "Year" or "Day". If the data is annual, this is "Year" and contains only the year as an integer. If the column is "Day", the column contains a date string in the form "YYYY-MM-DD".

The final column is the data column, which is the time series that powers the chart. If the CSV data is downloaded using the "full data" option, then the column corresponds to the time series below. If the CSV data is downloaded using the "only selected data visible in the chart" option then the data column is transformed depending on the chart type and thus the association with the time series might not be as straightforward.


## Metadata.json structure

The .metadata.json file contains metadata about the data package. The "charts" key contains information to recreate the chart, like the title, subtitle etc.. The "columns" key contains information about each of the columns in the csv, like the unit, timespan covered, citation for the data etc..

## About the data

Our World in Data is almost never the original producer of the data - almost all of the data we use has been compiled by others. If you want to re-use data, it is your responsibility to ensure that you adhere to the sources' license and to credit them correctly. Please note that a single time series may have more than one source - e.g. when we stich together data from different time periods by different producers or when we calculate per capita metrics using population data from a second source.

## Detailed information about the data


## Gross enrollment ratio in tertiary education
Number of people of any age group who are enrolled in [tertiary](#dod:tertiary-education) education, expressed as a percentage of the total population of the five-year age group following on from secondary school leaving.
Last updated: May 1, 2025  
Next update: May 2026  
Date range: 1970–2025  
Unit: %  


### How to cite this data

#### In-line citation
If you have limited space (e.g. in data visualizations), you can use this abbreviated in-line citation:  
UNESCO Institute for Statistics (2025) – with minor processing by Our World in Data

#### Full citation
UNESCO Institute for Statistics (2025) – with minor processing by Our World in Data. “Gross enrollment ratio in tertiary education” [dataset]. UNESCO Institute for Statistics, “UNESCO Institute for Statistics (UIS) - Education” [original data].
Source: UNESCO Institute for Statistics (2025) – with minor processing by Our World In Data

### What you should know about this data
* The gross enrollment ratio counts all students enrolled at a specific education level, regardless of their age. This includes students who are younger or older than the official age range because they started school early, started late, or repeated grades.
* It measures enrollment at a given level by dividing the total number of students—of any age—by the size of the age group officially assigned to that level. For instance, primary enrollment counts everyone enrolled, even outside ages 6–11, but compares it only to the 6–11 population.
* Values can exceed 100% when students repeat grades or start late. For instance, primary school enrollment might include 12- or 13-year-olds who started late or repeated grades, pushing the ratio above 100%.
* A value of 100% does not guarantee that all children in the official age group are enrolled in school; some may be out of school entirely, but the ratio appears high due to older students being counted in the total.
* Values much lower than 100% indicate that many children of the official age are not enrolled at the expected education level - they may be out of school entirely, enrolled at a different level, or have never started school.
* Values much higher than 100% can indicate educational challenges such as high grade repetition rates, late school entry, or inefficient progression through the system.
* The data comes from administrative records such as school enrollment reports, combined with population estimates typically sourced from the United Nations or national statistical offices.

### How is this data described by its producer - UNESCO Institute for Statistics (2025)?
Total enrollment in tertiary education (ISCED 5 to 8), regardless of age, expressed as a percentage of the total population of the five-year age group following on from secondary school leaving.

### Source

#### UNESCO Institute for Statistics – UNESCO Institute for Statistics (UIS) - Education
Retrieved on: 2025-05-01  
Retrieved from: https://databrowser.uis.unesco.org/resources/bulk  


    