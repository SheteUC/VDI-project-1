import pandas as pd

gdp = pd.read_csv('gdp-per-capita-worldbank/gdp-per-capita-worldbank.csv')
education = pd.read_csv('school-enrolment/share-of-people-enrolled-in-tertiary-education.csv')
unemployment = pd.read_csv('unemployment-rate-for-young-people/unemployment-rate-for-young-people.csv')
life_exp = pd.read_csv('life-expectancy/life-expectancy.csv')

gdp = gdp.rename(columns={'GDP per capita': 'gdp_per_capita'})
education = education.rename(columns={'Tertiary education': 'tertiary_education'})
unemployment = unemployment.rename(columns={'Unemployment rate, ages 15-24': 'youth_unemployment'})
life_exp = life_exp.rename(columns={'Life expectancy': 'life_expectancy'})

common_years = set(gdp['Year'].unique()) & set(education['Year'].unique()) & \
               set(unemployment['Year'].unique()) & set(life_exp['Year'].unique())
latest_year = max(common_years)

gdp = gdp[gdp['Year'] == latest_year]
education = education[education['Year'] == latest_year]
unemployment = unemployment[unemployment['Year'] == latest_year]
life_exp = life_exp[life_exp['Year'] == latest_year]

data = gdp[['Entity', 'Code', 'Year', 'gdp_per_capita']].merge(
    education[['Entity', 'Code', 'Year', 'tertiary_education']],
    on=['Entity', 'Code', 'Year'],
    how='inner'
).merge(
    unemployment[['Entity', 'Code', 'Year', 'youth_unemployment']],
    on=['Entity', 'Code', 'Year'],
    how='inner'
).merge(
    life_exp[['Entity', 'Code', 'Year', 'life_expectancy']],
    on=['Entity', 'Code', 'Year'],
    how='inner'
)

data = data.dropna()

data = data[data['Code'].notna()]

print(f"Final dataset: {data.shape[0]} countries, Year: {latest_year}")
print(data.head())

data.to_csv('youth_opportunity_data.csv', index=False)
