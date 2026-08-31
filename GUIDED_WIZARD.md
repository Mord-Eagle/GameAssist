# Location Builder — Guided Wizard (AlmanacAssist v2.0) — Fully Scientific Causal Engine

## Goal: Fully Functional + Fully Scientific + Fully Immersive + Simple GM Mechanism + Expansive Matrices Built Into Code

**Player experience:** immersive, scientifically consistent world where causes produce consequences. Returning in winter uses same location with winter conditions. Snow persists. Moon visibility separates astronomical availability vs atmospheric vs obstruction.

**GM mechanism:** simple 3-tier wizard — Basic 9-step, Intermediate 14-step causal chain, Advanced 26-step exponential with subchoosers. Presets are common vague types (18) that preselect Region+Climate+Biome+Ecoregion+Geography and skip to Habitat/Microhabitat/Locale adjustments. Prominent SKIP button. 2-clicks to Generate Weather / Advance Time.

**Matrices built into code:** Elevation (12 bands with lapse rate), Latitude (13 bands with prevailing winds, Coriolis, daylight variation), Geology (17 types with pH, drainage, fertility, hazards, magical influence), Hydrology (13 types with water availability, flood risk), Köppen (19 climate types with scientific thresholds), Biome/Whittaker (14 biomes with temp/precip, soil, flora, fauna, productivity, biomass, canopy), Soil (12 USDA orders), Season (12 early/mid/late phases), Weather Fronts (10 front types with 3-5 stages, pressure, air masses), Surface (12 ground types with speed penalties, persistence).

## Canonical Hierarchy (Broadest → Most Granular)

```
World / Plane
└── Realm / Continent
    └── Region
        └── Climate Zone
            └── Biome
                └── Ecoregion
                    └── Geographic Area
                        └── Landscape / Physiographic Zone
                            └── Terrain / Landform
                                └── Habitat
                                    └── Microhabitat
                                        └── Locale / Site
```

Example: **Toril → Faerûn → Sword Coast North → Temperate Maritime → Temperate Forest → Coastal Conifer Ecoregion → Neverwinter Wood → River Valley → Forested Floodplain → Riparian Woodland → Streambank → Owlbear Den**

Geography is umbrella: Region, Geographic Area, Landscape, Terrain, Landform, Elevation, Geology, Hydrology.

Environmental Properties attach to relevant node: Elevation, Geology, Soil, Hydrology, Temperature, Precipitation, Humidity, Wind, Seasonality, Weather Regime, Disturbance Regime, Ecological Productivity, Flora, Fauna, Natural Resources, Environmental Hazards, Magical/Planar Influence.

Core sequence: `Region → Climate → Biome → Ecoregion → Landscape → Terrain → Habitat → Locale`

## Causal Resolution Sequence — Fully Scientific (IRL Order)

**Governing principle: Generate causes before consequences, resolve shared environmental facts once — one resolved environmental state → many specialized interpretations. Later systems must consume earlier results, not independently roll contradictory answers.**

```
1 World/Planar Rules — gravity 1G, atmospheric 1013 mb 78% N₂ 21% O₂, magical rules (Weave), day 24h, year 365.25d, axial tilt 23.44°, eccentricity 0.0167, 1 sun, 1 moon 29.5d cycle
2 Astronomy — solar declination = tilt * sin(360*(284+day)/365), daylight = 12 + (24/π)*asin(tan(lat)*tan(decl)) — polar day/night handling, moon phase/altitude/azimuth
3 Temporal Context — calendar, year, season, month, day, timeOfDay, dayOfYear
4 Spatial/Location Resolution — full chain Toril→...→Owlbear Den, World, Continent, Region, Biome, Ecoregion, Geographic Area
5 Physical Geography — latitude (13 bands, baseTemp, tempRange, daylightVariation, prevailingWind, Coriolis), elevation (12 bands, min/max/avg ft, lapseF = -3.56°F/1000ft, pressureFactor, oxygenFactor), relief, slope%, aspect (S warmest N hemisphere), landform, geology (17 types pH/drainage/fertility/mineral/hazards/magic), soil (filled after climate/biome), hydrology (13 types waterAvailability/floodRisk/droughtRisk/vegetation/travel/soilMoisture), distanceFromCoast miles, mountainBarriers windward/leeward rain shadow, exposure, prevailingWind from latitude
6 Climate Baseline — probability envelope, not today's weather, consumes physical geography: baseTemp + lapse + latBias + continentality + orographic + coastal = meanTemp, normalRange ±10F, extremeRange ±30F, precipDailyProb, annualPrecipIn, windPrevailing from latitude, pressureMB = 1013 * pressureFactor, oxygenFactor, Köppen classification scientific: Af Am Aw BWh BWk BSh BSk Csa Csb Cfa Cfb Cfc Dfa Dfb Dfc Dfd ET EF H from meanTemp, coldest/hottest month, annual precip, driest month precip
7 Seasonal State — SeasonMatrix 12 phases Early/Mid/Late per season: tempOffsetF, precipModifier, daylightModifier, snowpack (Building/Peak/Melting/Gone), riverStage (Low/High spring runoff), vegetation (Dormant/Bud break/Leaf out/Peak growth/Fruiting/Color change), migration (Wintering/Return/Nesting/Breeding/Migration), hazards, travel modifier, daylightLength scientific from astronomy
8 Local Environmental Profile — Whittaker biome from meanTemp + annualPrecipIn, soil from geology + Köppen + biome (Oxisol tropical, Alfisol temperate fertile, Mollisol grassland black fertile, Spodosol boreal acidic, Aridisol desert, Entisol river young, Inceptisol mountain young, Histosol peat bog, Gelisol permafrost, Vertisol shrink-swell, Andisol volcanic very high fertility), flora/fauna/productivity/biomass/canopy from biome, drainage from soil, water from hydrology, magic from geology, elevationFt, hydrologyEntry, geologyEntry, soilEntry pH/fertility
9 Weather Generation — Previous + Transition Model + Climate probabilities + Elapsed → Current, stateful front lifecycle: high-pressure (1020 mb fair), warm-front (1005 mb maritime tropical overrunning, cirrus→nimbostratus, steady rain), cold-front (1000 mb continental polar undercutting, cumulus→cumulonimbus, heavy rain, wind shift NW), occluded (995 mb heavy mixed), stationary (1010 mb prolonged), maritime-gale (980 mb gale), continental-freeze (1040 mb arctic outbreak -30F), heat-dome (1025 mb +20F), monsoon-surge (80% precip), thunderstorm (air mass, 1-6h). Each with stages forming→approaching→strengthening→mature→weakening→clearing, tempBiasF, windBiasMph, precipBias, cloud, visibility, durationHours, pressureMB, airMass, hazards, travel
10 Surface/Ground Conditions — SurfaceMatrix 12 types: firm (1.0 speed), soft (0.9), muddy (0.5 hard), sandy (0.7), rocky (0.6), snow-shallow 1-6in (0.7), snow-deep 6-24in (0.3), snow-very-deep 24+in (0.1), icy (0.4), flooded (0.2), vegetated (0.5), boardwalk (1.0). Each with difficulty, fatigue, description, weatherEffect, drainage. Ground persists: 6 inches snow does not disappear in clear weather. FireRisk from precip + temp. soilMoisture from soil drainage + organic
11 Illumination & Visibility — general 120 ft open, 60 ft beneath canopy, canopy closure from biome (Closed 100% rainforest, Open 0% desert), astronomical (moon above horizon? phase, altitude) vs atmospheric (cloud/fog/precip) vs local obstruction (terrain/buildings/canopy/cave) separated — Is moon out? vs Can I see moon?
12 Travel Conditions — base 2.5 mph * slopePenalty (steep 15-30% =0.5, moderate 5-15%=0.8, gentle 0-5%=1.0) * groundPenalty from SurfaceMatrix * weatherPenalty (precip>60% =0.7) = effectiveSpeed mph, difficulty from SurfaceMatrix, fatigue, navigation from exposure
13 Ecological/Encounter Conditions — animalActivity: Winter <20F dormant/hibernating, Summer >85F crepuscular avoids midday, otherwise active diurnal, migration from SeasonMatrix, floraScientific = biome flora + Soil pH fertility, faunaScientific = biome fauna + productivity biomass, foraging abundant if high productivity else scarce, encounterProb = biome + season phase + timeOfDay + hydrology, soil/geology/hydrology entries included
14 Final Scene Environment — one resolved state → many specialized interpretations: timeScientific Day of year + daylight scientific calc from lat + tilt, weatherScientific Köppen + pressure + oxygen, ground scientific Soil pH fertility, travel scientific slope + ground + weather penalties, environmentScientific Whittaker temp precip + soil, fullChain Toril→...→Owlbear Den
```

Resolvers are expression of what is resolved and at which step; built into code flow as causal dependencies, not arbitrary standalone.

## Expansive Matrices Built Into Code (Frozen)

### ElevationMatrix (12 bands)
- Below Sea Level -100ft lapse +2F pressure 1.05 oxygen 1.02
- Sea Level 50ft lapse 0F
- Low 0-500ft avg 250ft lapse -0.9F
- Low-Moderate 500-1000ft avg 750ft lapse -2.7F
- Moderate 1000-2000ft avg 1500ft lapse -5.3F
- High-Moderate 2000-3500ft avg 2750ft lapse -9.8F
- High 3500-6000ft avg 4750ft lapse -16.9F
- Alpine 6000-9000ft avg 7500ft lapse -26.7F
- High Alpine 9000-14000ft avg 11500ft lapse -40.9F
- Extreme 14000+ft avg 18000ft lapse -64.1F pressure 0.5 oxygen 0.5 death zone
- Coastal Lowland 0-300ft avg 100ft lapse -0.3F
- Mountain Valley 3000-7000ft avg 5000ft lapse -17.8F cold air pooling inversion

Scientific: `lapseF = -(elevationFt * 3.56 / 1000)` standard atmosphere 6.5°C/km.

### LatitudeMatrix (13 bands)
- Polar North 80-90°N avg 85° baseTemp -20F tempRange 40F daylight Extreme 6 months, wind Polar easterlies, Coriolis Strong
- Subarctic North 60-80°N avg 70° base 10F range 60F white nights, Polar easterlies/Westerlies boundary
- Boreal North 50-60°N avg 55° base 35F range 50F 16-18h summer 6-8h winter, Westerlies
- Temperate North 35-50°N avg 42.5° base 55F range 35F 15h summer 9h winter, Westerlies
- Subtropical North 23.5-35°N avg 29° base 70F range 25F 14h/10h, Westerlies/Trade boundary subtropical high
- Tropical North 10-23.5°N avg 16.75° base 80F range 15F ~12-13h, NE trade winds
- Equatorial 10°S-10°N avg 0° base 85F range 10F ~12h year-round, Doldrums/ITCZ trade convergence
- Tropical South, Subtropical South, Temperate South (Roaring forties), Boreal South (Furious fifties), Subarctic South, Polar South — mirrored

Scientific: `daylightHours = 12 + (24/π)*asin(tan(lat)*tan(declination))`, `declination = 23.44° * sin(360*(284+day)/365)`, polar day if cosHourAngle <= -1 (24h), polar night if >=1 (0h).

### GeologyMatrix (17 types)
- Granite: pH 5.5 acidic, well-drained, low fertility, very hard quartz/feldspar, hazards hard digging acidic, flora acid-loving conifers heath, fauna rock-dwelling, magic stable abjuration, construction excellent
- Limestone: pH 7.8 alkaline, variable karst, moderate-high fertility, medium calcium carbonate, hazards sinkholes caves karst, flora alkaline meadow orchids, fauna cave-dwelling, magic fey crossing portal, construction good soluble
- Sandstone: pH 6.5 slightly acidic, well-drained low-moderate fertility quartz sand, erosion sand, pine scrub, burrowing, neutral easy to carve
- Shale: pH 6.0 acidic poor drainage moderate fertility soft clay minerals landslide slippery, clay-tolerant, mud-dwelling, water retention scrying, poor unstable
- Basalt (Volcanic): pH 6.8 neutral well-drained high fertility hard iron magnesium sharp volcanic fertile lush volcanic adapted fire evocation excellent hard
- Obsidian: volcanic glass pH 6.0 acidic very low fertility very hard brittle sharp brittle sparse avoids divination scrying mirrors shadow decorative
- Alluvial: pH 6.8 neutral moderate-well very high fertility soft mixed silts flooding fertile floodplain forest crops riparian growth transmutation poor needs pilings
- Glacial Till: pH 6.2 slightly acidic poor-moderate moderate mixed unsorted boulders poor drainage boreal hardy cold-adapted preservation time variable
- Karst: pH 7.5 alkaline excessive underground low fertility medium calcium carbonate sinkholes caves disappearing streams sparse alkaline sparse cave bats Underdark portals fey dangerous sinkholes
- Loess: pH 7.0 neutral well-drained very high fertility soft silt erosion collapsible grassland crops burrowing grassland air affinity collapsible
- Peat: pH 4.5 very acidic very poor low acidic very soft organic matter bog flammable acidic bog sphagnum heath bog insects necromancy preservation fey very poor floats
- Chalk: pH 8.0 strongly alkaline well-drained low-moderate soft calcium carbonate alkaline dry chalk grassland rare orchids chalk adapted purification light soft carvable
- Slate: pH 6.0 acidic well-drained low hard fissile mica clay sharp slippery acidic sparse rock warding layered protection roofing excellent
- Marble: pH 7.8 alkaline well-drained low medium-hard calcite slippery alkaline rock art enchantment beauty excellent decorative
- Fey-Touched Crystal: pH variable magical magical variable fey crystal wild magic time distortion fey flora awakened fey creatures feywild illusion enchantment time unpredictable
- Shadowfell-touched: pH 5.0 acidic poor low brittle shadow essence despair necrotic withered shadow shadow undead shadow necromancy despair brittle depressing
- Volcanic Ash: pH 6.5 slightly acidic well-drained extremely high soft volcanic minerals volcanic fertile extremely lush abundant fire growth transmutation fertile unstable

### HydrologyMatrix (13 types)
- None: water 0% flood None drought Extreme xeric desert easy but water needed very low arid no surface water
- Ephemeral wash: water 10% flood High flash flood drought High desert wash dangerous during rain low flashy dry wash flows only after rain
- Seasonal stream: 30% flood Moderate drought Moderate riparian seasonal fordable except spring seasonal flows wet season
- Permanent stream: 50% low-moderate low riparian woodland bridge/ford moderate year-round stream
- Small river: 70% moderate very low floodplain forest bridge ferry high navigable small boat
- Large river: 90% high none extensive floodplain major barrier bridge/ferry very high major waterway trade route
- Lake shore: 85% low very low lakeshore coastal boat high lake stable
- Wetland swamp/marsh: 100% constant none wetland peat very difficult boardwalk saturated waterlogged peat high biodiversity
- Coastal tidal: 90% tidal+storm surge none salt marsh mangrove tidal dependent saturated saline tidal saltwater influence
- Aquifer: 60% low low oasis phreatophytes well water deep underground water wells
- Glacial melt: 80% seasonal summer low cold riparian cold fordable high cold glacial cold silty summer high
- Spring-fed: 75% very low very low spring oasis lush reliable high stable spring constant temp reliable
- Karst underground: 40% flash flood caves moderate sparse surface cave underground disappearing stream caves

### Köppen Matrix (19 types) — scientific thresholds
- Af Tropical Rainforest minTemp coldest 64°F minPrecip driest 2.4in hot year-round heavy constant hot humid daily rain biome tropical rainforest soil Oxisol low fertility flora broadleaf evergreen emergent fauna high diversity travel very difficult hazards disease insects
- Am Tropical Monsoon minTemp 64°F minPrecip driest 0.4 max 2.4 hot monsoonal hot monsoon short dry monsoon forest
- Aw Tropical Savanna minTemp 64°F maxPrecip driest 0.4 hot wet/dry hot distinct dry savanna laterite grass scattered trees baobab acacia large herds predators open easy dry season drought fire
- BWh Hot Desert maxPrecip 10in minTemp annual 64°F hot very low hot arid extreme diurnal desert Aridisol sand xerophytes cacti nocturnal reptiles hard water needed heat dehydration
- BWk Cold Desert maxPrecip 10in maxTemp annual 64°F cold very low cold arid extreme cold desert
- BSh Hot Semi-Arid 10-20in minTemp annual 64°F hot low hot semi-arid scrub steppe
- BSk Cold Semi-Arid 10-20in maxTemp annual 64°F cold low cold semi-arid cold steppe
- Csa Mediterranean Hot Summer minTemp coldest 27-64°F minTemp hottest 72°F minPrecip summer 0.1 max 1.2 hot summer mild winter dry summer wet winter hot dry summer mild wet winter Mediterranean scrub Alfisol sclerophyll olive Mediterranean easy summer drought fire
- Csb Mediterranean Warm Summer maxTemp hottest 72°F warm summer dry summer
- Cfa Humid Subtropical Hot minTemp coldest 27-64°F minTemp hottest 72°F hot summer year-round summer max hot humid summer mild winter temperate broadleaf Ultisol broadleaf evergreen diverse moderate humid hurricane flood
- Cfb Oceanic mild oceanic no dry season temperate rainforest Inceptisol deciduous+conifer temperate moderate wet storm
- Cfc Subpolar Oceanic cool oceanic subpolar Spodosol conifer moss cold hard wet cold storm
- Dfa Hot Summer Continental maxTemp coldest 27°F minTemp hottest 72°F extreme year-round hot summer cold winter large range temperate deciduous Alfisol deciduous forest continental seasonal snow winter blizzard heat wave
- Dfb Warm Summer Continental large year-round mixed forest
- Dfc Subarctic maxTemp coldest 27°F maxTemp hottest 50°F very large low short cool summer long cold winter boreal forest/taiga Spodosol coniferous boreal boreal hard winter extreme cold
- Dfd Extreme Subarctic maxTemp coldest -36°F extreme very low very cold winter taiga Gelisol sparse conifer arctic very hard extreme cold
- ET Tundra maxTemp hottest 50°F min 32°F cold low no month above 50F permafrost tundra Gelisol permafrost moss lichen dwarf shrub arctic migratory very hard permafrost cold wind
- EF Ice Cap maxTemp hottest 32°F extreme cold very low all months below freezing ice cap ice none none except edge extreme ice cold crevasse
- H Highland Alpine varies with elevation highland temp decreases with elevation alpine Inceptisol rocky alpine meadow to ice alpine mountain altitude avalanche

### Biome Matrix — Whittaker (14 biomes) temp vs precip
- Tropical Rainforest 75-95°F 80-400in very wet Oxisol low fast cycling broadleaf evergreen emergent epiphytes 100+ species/acre highest diversity primates big cats insects birds very high productivity biomass very high disease insects dense very difficult abundant closed 100%
- Tropical Seasonal 70-90°F 50-80in wet with dry season Oxisol/Ultisol semi-evergreen deciduous dry high difficult seasonal closed 80%
- Tropical Savanna 70-90°F 20-50in seasonal Oxisol laterite grass scattered trees baobab acacia large herds predators megafauna moderate-high moderate fire drought open easy seasonal open 20%
- Desert 50-110°F 0-10in very dry Aridisol sand rock xerophytes cacti succulents creosote sparse nocturnal reptiles insects rodents very low very low heat dehydration flash flood hard water needed very scarce open 0-10%
- Semi-Desert/Scrub 40-95°F 10-20in dry Aridisol scrub sage short grass rodents reptiles birds low low drought moderate scarce open 10-30%
- Temperate Grassland/Prairie 30-80°F 10-30in moderate Mollisol deep fertile black tallgrass shortgrass forbs herds burrowers raptors moderate moderate below ground fire tornado easy open moderate open 0%
- Temperate Shrubland/Chaparral 40-85°F 15-30in winter wet summer dry Alfisol sclerophyll shrubs manzanita scrub oak deer small mammals low-moderate low fire moderate dense scrub seasonal open 30-50%
- Temperate Deciduous Forest 25-80°F 30-60in moderate-high Alfisol fertile brown oak maple beech hickory 4 seasons leaf fall deer bears songbirds high diversity high high blizzard ticks moderate leaf litter abundant closed 80% summer open winter
- Temperate Rainforest 35-70°F 60-200in very wet Inceptisol high organic conifer broadleaf moss ferns huge trees high salmon bears very high very high wet landslide difficult dense wet abundant closed 90%
- Boreal Forest/Taiga -10-65°F 15-30in low-moderate Spodosol acidic podzol low fertility conifer spruce fir pine larch birch moose wolves bears lynx migratory birds moderate high extreme cold insects summer hard winter boggy summer moderate bogs closed 60%
- Tundra -30-50°F 5-15in low Gelisol permafrost active layer moss lichen dwarf shrub sedge no trees caribou lemmings arctic fox migratory birds low low permafrost cold wind very hard permafrost boggy summer frozen winter open 0%
- Alpine -10-60°F 10-40in variable Inceptisol rocky thin alpine meadow low cushion plants wildflowers summer mountain goats marmots pikas raptors low low altitude avalanche rockfall hard mountain snowmelt open 0%
- Wetland 20-85°F 20-100in wet Histosol peat organic saturated reeds cattails cypress mangrove peat moss waterfowl amphibians insects high biodiversity very high high flooding insects disease very difficult boardwalk saturated variable
- Riparian Woodland 30-80°F 20-60in moderate+river Entisol alluvial fertile willow cottonwood alder floodplain forest riparian beaver otters birds high high flooding moderate river barrier abundant closed 70%

### Soil Matrix (12 USDA)
- Oxisol pH 4.5 very low fertility well drainage very low organic highly weathered tropical low nutrients iron/aluminum tropical rainforest granite basalt weathered red-yellow
- Ultisol pH 5.0 low well low weathered subtropical clay low fertility subtropical mixed red-yellow
- Alfisol pH 6.5 high moderate-well moderate fertile temperate clay deciduous temperate deciduous limestone sandstone brown
- Mollisol pH 7.0 very high moderate very high deep black grassland most fertile grassland loess alluvial black
- Spodosol pH 4.5 low well moderate acidic coniferous podzol ash boreal granite sandstone ashy gray
- Aridisol pH 8.0 very low excessive very low desert sand salt desert sandstone shale light brown
- Entisol pH 7.0 moderate-high variable low young no horizons river deposits riparian alluvial variable
- Inceptisol pH 6.0 moderate well moderate young mountain weak horizons mountain temperate rainforest mixed brown
- Histosol pH 4.0 low acidic very poor very high peat organic waterlogged wetland bog peat black-brown
- Gelisol pH 5.5 very low poor permafrost moderate permafrost active layer tundra glacial till gray-brown
- Vertisol pH 7.5 high poor moderate clay cracks dry sticky wet savanna grassland basalt shale dark
- Andisol pH 6.0 very high well high volcanic ash fertile light volcanic basalt volcanic ash black

### Season Matrix (12 phases)
- Winter Early 1-10 tempOffset -10F precipModifier 1.2 daylight -0.5 snow Building river Low ice vegetation Dormant migration Wintering south hazards Blizzard ice travel Hard snow/ice early winter snow building rivers freezing
- Winter Mid 11-20 -18F precip 1.0 daylight 0 snow Peak river Low frozen dormant wintering extreme cold blizzard very hard deep snow mid winter coldest deep snow
- Winter Late 21-30 -8F 0.9 +0.5 melting start rising melt start budding return start thaw flood ice hard mud slush late winter thaw mud season
- Spring Early 1-10 -5F 1.3 +1.0 melting high spring runoff bud break early flowers return migration flood mud hard mud flood early spring melt flood mud
- Spring Mid 11-20 0F 1.1 +1.5 gone low remains high high but falling leaf out flowers nesting storms moderate wet mid spring growth nesting
- Spring Late 21-30 +8F 1.0 +2.0 gone normal full leaf growth breeding storms easy late spring full growth
- Summer Early 1-10 +12F 0.9 +2.5 none normal-low peak growth breeding resident heat storms insects easy early summer peak growth long days
- Summer Mid 11-20 +18F 0.8 +3.0 none low peak fruiting resident extreme heat drought fire insects easy but hot mid summer hottest drought risk
- Summer Late 21-30 +10F 1.0 +2.0 none low fruiting seeding pre-migration fattening storms fire easy late summer harvest storms return
- Autumn Early 1-10 +5F 1.1 +1.0 none low-normal color change leaf fall start migration start storms easy leaf fall early autumn color migration
- Autumn Mid 11-20 0F 1.2 0 first snow high normal leaf fall dormant migration peak storms first frost moderate wet leaves mid autumn leaf fall first snow high
- Autumn Late 21-30 -5F 1.2 -0.5 building high normal dormant late migrants first blizzard high ice hardening late autumn dormant snow building high

### Weather Front Matrix (10 types)
- High Pressure Fair high 3 stages forming mature weakening tempBias 0 wind -2 precip -20 cloud clear to few visibility excellent duration 24-72h pressure 1020 mb airMass continental polar or maritime tropical hazards none travel excellent fair stable subsiding
- Warm Front warm 5 stages approaching forming mature weakening clearing temp +8 wind +2 precip +30 cloud cirrus→cirrostratus→altostratus→nimbostratus visibility decreasing then improving 12-36h 1005 mb maritime tropical overrunning continental polar steady rain low stratus fog poor during improving after warm air overrunning cold steady precip warming after
- Cold Front cold 4 stages approaching strengthening mature weakening temp -12 wind +8 precip +40 cloud cumulus→cumulonimbus variable heavy rain then clear 6-24h 1000 mb continental polar undercutting maritime tropical heavy rain thunderstorms squall line wind shift dangerous during excellent after cold air undercutting warm heavy precip temp drop wind shift NW
- Occluded occluded 4 stages forming mature weakening clearing temp -5 wind +5 precip +50 mixed nimbostratus+cumulonimbus poor 12-30h 995 mb cold front overtaking warm front heavy mixed complex poor complex heavy precip
- Stationary stationary 3 stages forming mature weakening temp 0 wind 0 precip +25 stratus nimbostratus poor prolonged 24-72h 1010 mb boundary stalled prolonged rain flood poor prolonged boundary stalled prolonged precip one side
- Maritime Gale gale 4 stages approaching strengthening mature weakening temp +2 wind +20 precip +35 nimbostratus cumulonimbus poor spray rain 12-36h 980 mb maritime polar gale high seas heavy rain dangerous wind intense low maritime gale
- Continental Freeze arctic 3 stages approaching mature weakening temp -30 wind +10 precip -10 clear scattered excellent but cold 24-72h 1040 mb continental arctic extreme cold frostbite hard cold ice arctic high extreme cold clear
- Heat Dome heat 3 stages forming mature weakening temp +20 wind -3 precip -30 clear hazy 72-168h 1025 mb continental tropical extreme heat drought fire hard heat upper ridge subsidence extreme heat clear
- Monsoon Surge monsoon 3 stages approaching mature weakening temp -5 wind +5 precip +80 cumulonimbus poor heavy rain 24-72h 1000 mb maritime tropical monsoon extreme heavy rain flood thunderstorms dangerous flood monsoon flow extreme heavy rain
- Thunderstorm thunderstorm 3 stages forming mature dissipating temp -8 wind +15 precip +60 cumulonimbus very poor during 1-6h 1010 mb local heating lightning hail downburst heavy rain dangerous brief local heating afternoon brief heavy

### Surface Matrix (12 types)
- Firm 1.0 speed normal difficulty normal fatigue firm loam packed trail none well
- Soft 0.9 normal moderate soft loam leaf litter becomes muddy when wet moderate
- Muddy 0.5 hard high mud clay saturated worse when wet improves when dry poor
- Sandy 0.7 moderate high sand dune easier when wet loose when dry excessive
- Rocky 0.6 hard high rock scree boulders slippery when wet/icy excessive
- Snow-shallow 1-6in 0.7 moderate high shallow snow persists melts N/A
- Snow-deep 6-24in 0.3 very hard very high deep snow persists 6 inches does not disappear in clear weather N/A
- Snow-very-deep 24+in 0.1 extreme extreme very deep persistent snowshoes needed N/A
- Icy 0.4 very hard moderate ice frozen melts above 32F N/A
- Flooded 0.2 extreme very high flooded water recedes after rain flooded
- Vegetated 0.5 hard high dense vegetation roots wet makes worse variable
- Boardwalk 1.0 easy low boardwalk improved none improved

## Three Wizard Modes — Simple GM Mechanism

### Basic (9-step) — Simplified for new GMs
Command: `!aa-current choose preset --wizard yes --mode basic`
1/9 Preset (Common) 18 types + Skip button — preselects 2-6
2/9 Region Realm/Continent → Region
3/9 Climate Zone long-term baseline resolved temps + tags
4/9 Biome flora/fauna/soil veg/aridity/ground/water
5/9 Ecoregion reusable snapshot water/transition/bias
6/9 Geographic Area / Landscape / Terrain geography umbrella terrain/elev/coast/hydro/rough
7/9 GM Adjustments Habitat/Microhabitat/Locale biases + ground/water/visibility/environment + edit buttons
8/9 Review Effective resolved effective + scientific breakdown + full chain
9/9 Save As New Location grows world, does NOT freeze calendar/weather
Auto-advancing: Region → Climate → Biome → Ecoregion → Geography → Adjustments → Review → Save

### Intermediate (14-step) — Causal Chain for experienced GMs
Command: `!aa-current choose world --wizard yes --mode intermediate`
1 World/Planar Rules structure gravity atmospheric magic day/year length
2 Astronomy daylight hours scientific calc from lat + tilt, season, moons could be visible astronomical availability
3 Temporal Context season year month timeOfDay dayOfYear source TimeAlmanac vs manual
4 Spatial/Location Resolution full chain Toril→...→Owlbear Den World Continent Region Biome Ecoregion Geographic Area
5 Physical Geography latitude elevation relief slope landform geology soil hydrology distance coast mountain barriers drives climate — shows ElevationMatrix + LatitudeMatrix + GeologyMatrix + HydrologyMatrix
6 Climate Baseline meanTemp = base + lapse + lat + continentality + orographic + coastal + season, precip prob, wind, humidity, tags, pressureMB, oxygenFactor, Köppen scientific, source via geography
7 Seasonal State Early/Mid/Late tempOffset effectiveTemp precipRegime stormRegime daylight scientific snowpack riverStage vegetation migration hazards travelModifier from SeasonMatrix
8 Local Environmental Profile biome ecoregion terrain habitat microhabitat canopy drainage ground water flora fauna magic productivity biomass from BiomeMatrix + SoilMatrix + GeologyMatrix + HydrologyMatrix
9 Weather Generation Previous + Transition + Climate probabilities + Elapsed → Current stateful front lifecycle warm/cold/occlusion air masses pressure confidence decay from WeatherFrontMatrix
10 Surface/Ground Conditions ground trail river snowpack ice flooding vegetation fire risk Weather History + Soil + Terrain + Drainage from SurfaceMatrix — snow persists
11 Illumination & Visibility general open terrain beneath canopy canopy type moon visibility separated astronomical availability (above horizon phase altitude) vs atmospheric (cloud/fog/precip) vs local obstruction (terrain/buildings/canopy/cave)
12 Travel Conditions base effective speed difficulty Terrain + Surface + Weather + Visibility scientific calc slopePenalty * groundPenalty * weatherPenalty
13 Ecological/Encounter Conditions animal activity migration flora fauna Environment + Season + Weather + Time — scientific foraging abundant if high productivity, crepuscular if hot
14 Final Scene Environment time weather ground travel environment one resolved state → many interpretations timeScientific daylight scientific, weatherScientific Köppen pressure oxygen, ground scientific Soil pH fertility, travel scientific penalties, environmentScientific Whittaker

Each step shows: `Step 3 of 14 — INTERMEDIATE Mode — Guided Build: temporal -> spatial — Causal Chain: World→Astronomy+Location→Time+Geography→Climate→Season→Environment→Weather→Surface→Visibility+Ecology→Travel→Scene`

### Advanced (26-step Exponential) — In-Depth with Subchoosers for worldbuilders
Command: `!aa-current choose preset --wizard yes --mode advanced`
`preset → world → astronomy → temporal → spatial → physicalGeography.elevation → physicalGeography.geology → physicalGeography.hydrology → physicalGeography.landscape → physicalGeography.terrain → climate → seasonal → environment.biome → environment.ecoregion → environment.habitat → environment.microhabitat → environment.locale → weather → surface.ground → surface.trail → surface.river → surface.snowpack → visibility → travel → ecology → final`

Subchoosers with buttons:

- Physical Geography umbrella (Exponential):
  - Elevation: 12 bands Below Sea Level to Extreme 14000+ ft with lapseF, pressureFactor, oxygenFactor — each leads to Geology/Hydrology submenu — shows scientific calc
  - Geology: 17 types Granite Limestone Sandstone Shale Basalt Obsidian Alluvial Glacial Till Karst Loess Peat Chalk Slate Marble Fey-Touched Crystal Shadowfell Volcanic Ash — each with pH drainage fertility mineral hazards flora fauna magic construction — shapes soil drainage flora hazards magical influence
  - Hydrology: 13 types None to Karst underground river — each with waterAvailability floodRisk droughtRisk vegetation travel soilMoisture — shapes water regime vegetation travel ecology flood risk
  - Landscape: River Valley Coastal Plain Mountain Range Desert Basin Forest Canopy Wetland Delta Volcanic Field Feywild Crossing
  - Terrain/Landform: Forested Floodplain Rocky Slope Sandy Dune Muddy Swamp Icy Plateau Grassy Meadow Urban Ruins Crystal Cavern

- Environment (Exponential):
  - Biome: 14 Whittaker biomes — each with temp/precip thresholds soil flora fauna productivity biomass hazards travel water canopy — leads to Habitat/Flora submenu
  - Ecoregion: reusable snapshot water regime transition bias — leads to Water Regime submenu
  - Habitat: Riparian Woodland Forested Floodplain Dry Scrub Alpine Meadow Swamp Peat Coastal Dune — each with microhabitat/flora/fauna/magic submenu
  - Microhabitat: Streambank Canopy Shade Rock Shelter Mud Flat Leaf Litter Crystal Grove
  - Locale/Site: Owlbear Den Harbor Quay Mountain Pass Fey Crossing Abandoned Quarry River Crossing

- Surface (Exponential):
  - Ground: 12 types Firm to Boardwalk with baseSpeed difficulty fatigue description weatherEffect drainage — each leads to Ice/Flooding/Fire Risk submenu — snow persists
  - Trail: Clear Muddy Snow-packed Flooded Overgrown
  - River: Normal High but within banks High swollen Low dry Frozen
  - Snowpack: None Present 6 inches persists Persistent winter snowpack (Clear weather does not make 6 inches snow disappear if 6 inches fell yesterday)

Each option shows `Leads to:` filtered list (Preset → filtered Regions, Climate → filtered Biomes).

## How It Feeds Weather — Simple GM Flow

1. Choose: Preset (common, skips to 7) OR manually build Region→Climate→Biome→Ecoregion→Geographic Area/Landscape/Terrain→Habitat/Microhabitat/Locale (Basic) OR World→Astronomy→Temporal→Spatial→PhysicalGeography→Climate→Seasonal→Environment→Weather→Surface→Visibility→Travel→Ecology→Final (Intermediate/Advanced)
2. Adjust: GM Adjustments refines Habitat (ground/water/flora/fauna), Microhabitat (visibility, shelter), Locale (site name)
3. Season: Current calendar season (Wayfarer/Time Almanac) applied → Resolved Effective scientific breakdown Base + Lapse (elev ft *3.56/1000) + Lat (baseTemp) + Continentality + Orographic + Coastal + Season = Effective + Köppen + Biome + Soil pH + Pressure + Daylight scientific
4. Generate: `!aa-weather generate` uses Resolved Effective to pick compatible weather (front type, stage, duration, temp/wind/visibility/road) from WeatherFrontMatrix. Result kept until expires or GM changes (locked/manual/disabled). Weather is stateful: Previous + Transition + Climate probabilities + Elapsed → Current, with front lifecycle warm/cold/occlusion air masses pressure confidence decay
5. SceneResolver single truth: weather + environment + climate + terrain + hydrology + astronomy from one snapshot. One resolved environmental state → many specialized interpretations. No contradictions.

## UI Principles — Simple GM Mechanism

- Compact progressive disclosure Basic/Detailed/Technical. No `&amp;`, no meta labels like "(Front & Center)"
- Guided menus show vague generic types; technical numbers only in handout and scientific breakdown
- Preset chooser has prominent Skip and explains preselection
- Auto-advancing: picking preset → Adjustments, picking Region → Climate → Biome → Ecoregion → Geography → Adjustments → Review → Save. No monstrous main builder re-emit after each edit
- World Context always visible: `Aurelian Reach — World Library campaign | Current Area: Harbor Stead`
- 2-clicks to Generate Weather / Advance Time / Where Am I in Almanac Home
- Wizard Progress shows `Step X of Y — MODE — Guided Build: current -> next — Causal Chain: ...`
- Mode buttons always visible: Basic (9-step), Intermediate (14-step Causal), Advanced (Exponential Submenus)
- Navigation: Back: prev, Skip This Step, Next: next, Exit Guided Build, Back to Location Builder, Almanac Home
- Scientific breakdown always visible in technical view: `Base 58F + Lapse -16.9F (High 4750ft) + Lat 0F (Temperate North) + Continentality 0F + Season -18F (Winter Mid) = 23F | Köppen Dfb Warm Summer Continental | Biome boreal | Soil Spodosol pH 4.5 | Geology Granite | Pressure 842 mb | Elev 4750 ft | Lat 42.5° | Daylight 9.2h scientific`

## Quick Test

```
!aa-world starter install --id ember-coast
!aa-current
  → Location Builder - Current Settings (Causal Engine) with Causal Chain explanation and 3 mode buttons + Causal Summary with scientific: World Material Plane (1.0G 1013 mb) | Astronomy 9.2h daylight scientific from lat 42.5° + tilt 23.44° | Temporal Winter Day 80 | Spatial Material Plane → Temperate Lowlands → Plain → Scrub | Physical Geography High (3500-6000 ft) (4750 ft lapse -16.9F pressure x0.83) + Temperate North (42.5° wind Westerlies) + Moderate (10-100 miles) (50 mi) + Present windward/leeward rain shadow | Climate 23.09F mean (Köppen Dfb Warm Summer Continental 14.0in/yr) | Seasonal Winter Mid Mid winter coldest deep snow | Environment Semi-Desert/Scrub Plain - Soil Aridisol pH 8.0 Very low - Low productivity | Surface Firm - Firm loam packed trail - Fire risk High | Visibility Clear - Open 0% | Travel Plain 2.5 mph effective (slope 8% penalty 0.8 + ground 1.0 + weather 1.0) | Ecology Dormant/hibernating - reduced - Scarce

!aa-current choose preset --wizard yes --mode basic
  → Step 1/9 BASIC — Choose Preset (Common Options - Exponential) with 18 vague types + SKIP THIS STEP
  → pick Temperate Coastal → SKIPS to Step 7 GM Adjustments (Habitat/Microhabitat/Locale)

!aa-current choose world --wizard yes --mode intermediate
  → Step 1/14 INTERMEDIATE — World / Planar Rules (Causal Step 1) with causal chain + expansive matrices
  → Next: astronomy → temporal → spatial → physicalGeography → climate → seasonal → environment → weather → surface → visibility → travel → ecology → final
  → each step shows Current World/Spatial/Physical Geography with scientific: ElevationMatrix 12 bands, LatitudeMatrix 13 bands, GeologyMatrix 17 types, HydrologyMatrix 13 types, Köppen 19 types, Biome 14 types

!aa-current choose preset --wizard yes --mode advanced
  → Step 1/26 ADVANCED — Choose Preset with exponential submenus + scientific breakdown
  → Explore Submenu: Regions for this Preset → filtered regions
  → Choose Region → filtered climates/biomes/ecoregions/geographies
  → Physical Geography → Elevation subchooser 12 bands with Use buttons + lapseF pressureFactor oxygenFactor
    → Low (0-500 ft) avg 250ft lapse -0.9F [Use] etc. each leads to Geology/Hydrology submenu
  → Geology subchooser: 17 types Granite pH 5.5 acidic well-drained low fertility etc. [Use]
  → Hydrology subchooser: 13 types None 0% to Karst underground [Use]
  → Landscape subchooser: River Valley Coastal Plain etc.
  → Terrain subchooser: Forested Floodplain Rocky Slope etc.
  → Environment → Biome subchooser 14 Whittaker biomes with temp/precip thresholds
  → Habitat → Microhabitat → Locale
  → Surface → Ground 12 types with baseSpeed + Trail/River/Snowpack subchoosers

!aa-current choose physicalGeography.elevation --wizard yes --mode advanced
  → Physical Geography - Elevation Subchooser (Exponential) 12 bands with scientific: High (3500-6000 ft) avg 4750ft lapse -16.9F pressure 0.83 oxygen 0.83 death zone etc.

!aa-current choose environment.habitat --wizard yes --mode advanced
  → Environmental Profile - habitat Subchooser with flora/fauna/magic submenu + BiomeMatrix

!aa-current choose surface.ground --wizard yes --mode advanced
  → Surface - ground Subchooser 12 types with baseSpeed difficulty fatigue + ice/flooding/fire risk submenu — snow persists

!aa-current choose review --wizard yes --mode intermediate
  → Final Scene Environment (Causal Step 14) — Review Effective with full scientific breakdown + full chain summary + matrices

!aa-current choose save --wizard yes --mode basic
  → Save As New Location (Locale/Site) — grows world, does NOT freeze calendar/weather — includes currentSettingsSnapshot with scientific matrices

!aa-weather generate
!aa-scene
  → Shows one resolved state → many interpretations with scientific: Köppen, biome, soil pH, pressure, oxygen, daylight scientific

!aa-current handout review
  → Technical handout with full JSON: planarRules, astronomy scientific, temporal, spatial fullChain, physicalGeography with elevationFt latitudeDeg lapseF pressureFactor oxygenFactor prevailingWind Coriolis, climateBaseline with koppenEntry biomeEntry soilEntry, seasonalState with seasonEntry, environmentProfile with biomeEntry soilEntry geologyEntry hydrologyEntry, surface with groundEntry, travel with slopePenalty groundPenalty weatherPenalty effectiveSpeed, ecology with soil geology hydrology, finalScene with timeScientific weatherScientific ground scientific travel scientific environmentScientific
```

All choosers: no `undefinedF`, no empty `Terrain: Elev: Road:`, no `Temp +0F` noise when bias is zero. Causal chain preserved: returning in winter uses saved settings with winter conditions + scientific breakdown. Expansive matrices built directly into code as frozen objects with findMatrix helper, calculateLapseRate, calculateDaylightHours, classifyKoppen, determineBiomeWhittaker, determineSoil.
