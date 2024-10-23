library(tidyverse)
library(jsonlite)

dat <- read_csv("~/Projects/NA/JobSim/build/data/BEA.csv", skip=3, na=c("", "NA", "(NA)")) %>% 
  filter(LineCode %in% c(1, 8, 15)) %>%
  mutate(varlabel = sub(" +[0-9]$", "", Description))

dat2 <- dat %>% pivot_longer("1998":"2023") %>% mutate(year = as.numeric(name)) %>% filter(year >= 2008) %>%
  select(geoid=GeoFips, geo=GeoName, varid=LineCode, varlabel, year, value)

write_json(dat2, "~/Projects/NA/JobSim/assets/bea-data.json", digits=5, na="null")


