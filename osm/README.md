# Dane OpenStreetMap (Stalowa Wola)

`stw-okulickiego.deadzone-osm-1.json`: wycinek wokół ul. Okulickiego z mapy OSM Stalowej Woli
w formacie `deadzone-osm-1`, w surowym układzie OSM: obejmuje okno gry 1,5 × 1,5 km obrócone o
27° (generator obraca dane na siatkę ulic) plus margines 128 m
(`pnpm --filter @deadzone/map osm:crop <stw-map.json> okulickiego <plik>`).

© współtwórcy OpenStreetMap. Dane są dostępne na licencji Open Database License (ODbL) 1.0:
https://opendatacommons.org/licenses/odbl/1-0/ , https://www.openstreetmap.org/copyright

Plik danych jest osobnym utworem bazodanowym na ODbL; kod gry ma własną licencję. Gra pokazuje
podpis „© współtwórcy OpenStreetMap” na mapach wygenerowanych z tych danych.

`stw-16km/`: cały kwadrat 16 × 16 km (`?map=osm-stw`) w kafelkach 1 × 1 km świata gry
(`manifest.json` + `t-<x>-<y>.json`, format `deadzone-osm-tiles-1`,
`pnpm --filter @deadzone/map osm:tiles <stw-map.json> <katalog>`). Gra ładuje na starcie tylko
kafelki wokół gracza, resztę w miarę potrzeby; każdy kafelek ma sumę SHA-256 w manifeście, a
wersja świata to skrót wszystkich kafelków. Każdy kafelek niesie te same pola atrybucji i licencji.
