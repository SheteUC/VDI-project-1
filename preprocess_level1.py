import pandas as pd

gdp = pd.read_csv('gdp-per-capita-worldbank/gdp-per-capita-worldbank.csv')
unemployment = pd.read_csv('unemployment-rate-for-young-people/unemployment-rate-for-young-people.csv')

gdp = gdp.rename(columns={'GDP per capita': 'gdp_per_capita'})
unemployment = unemployment.rename(columns={'Unemployment rate, ages 15-24': 'youth_unemployment'})

common_years = set(gdp['Year'].unique()) & set(unemployment['Year'].unique())
latest_year = max(common_years)

print(f"Latest common year: {latest_year}")

gdp = gdp[gdp['Year'] == latest_year]
unemployment = unemployment[unemployment['Year'] == latest_year]

print(f"GDP countries in {latest_year}: {len(gdp)}")
print(f"Unemployment countries in {latest_year}: {len(unemployment)}")

data = gdp[['Entity', 'Code', 'Year', 'gdp_per_capita']].merge(
    unemployment[['Entity', 'Code', 'Year', 'youth_unemployment']],
    on=['Entity', 'Code', 'Year'],
    how='inner'
)

data = data.dropna()

data = data[data['Code'].notna()]

print(f"\nFinal dataset: {len(data)} countries with both GDP and Youth Unemployment in {latest_year}")
print(f"\nFirst 10 countries:")
print(data.head(10))
print(f"\nData statistics:")
print(data[['gdp_per_capita', 'youth_unemployment']].describe())

data.to_csv('youth_opportunity_level1.csv', index=False)
print(f"\nSaved to youth_opportunity_level1.csv")
