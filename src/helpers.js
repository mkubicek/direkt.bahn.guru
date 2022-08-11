import isUicLocationCode from 'is-uic-location-code'
import { toISO } from 'uic-codes'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import deLocale from 'i18n-iso-countries/langs/de.json'

export const fetchStation = async (query) => {
	return Promise.race([
		fetch(`https://v5.db.transport.rest/locations?query=${query}&poi=false&addresses=false`),
		fetch(`https://v5.db.juliustens.eu/locations?query=${query}&poi=false&addresses=false`),
	])
}

countries.registerLocale(enLocale)
countries.registerLocale(deLocale)

export const formatStationId = i => (i.length === 9 && i.slice(0, 2)) ? i.slice(2) : i
const countryForStationId = (_i, language) => {
	const i = formatStationId(_i)
	if (!isUicLocationCode(i)) return undefined
	const countryPrefix = +i.slice(0, 2)
	const alpha3 = toISO[countryPrefix]
	if (!alpha3) return undefined
	return countries.getName(alpha3, language, { select: 'official' }) || countries.getName(alpha3, 'en', { select: 'official' })
}

export const stationById = async id => {
	const candidates = await (fetchStation(id).then(res => res.json()))
	return candidates.find(s => (formatStationId(s.id) === formatStationId(id)) && formatStationId(id) && s.location)
}

export const locationToPoint = location => ({ type: 'Point', coordinates: [location.longitude, location.latitude] })

export const durationCategory = d => {
	if (d === 0) return 0
	if (!d) return -1
	if (d > 0 && d <= 60) return d
	if (d > 0 && d <= 120) return 61
	if (d > 0 && d <= 240) return 62
	if (d > 0 && d <= 480) return 63
	if (d > 0 && d <= 960) return 64
	return 65
}

export const durationCategoryColour = c => {
	if (c === -1) return '#999' // unknown duration
	if (c === 1) return '#70ff00'
	if (c === 2) return '#75ff00'
	if (c === 3) return '#7aff00'
	if (c === 4) return '#7fff00'
	if (c === 5) return '#84ff00'
	if (c === 6) return '#89ff00'
	if (c === 7) return '#8eff00'
	if (c === 8) return '#93ff00'
	if (c === 9) return '#98ff00'
	if (c === 10) return '#9eff00'
	if (c === 11) return '#a3ff00'
	if (c === 12) return '#a8ff00'
	if (c === 13) return '#adff00'
	if (c === 14) return '#b2ff00'
	if (c === 15) return '#b7ff00'
	if (c === 16) return '#bcff00'
	if (c === 17) return '#c1ff00'
	if (c === 18) return '#c6ff00'
	if (c === 19) return '#cbff00'
	if (c === 20) return '#d1ff00'
	if (c === 21) return '#d6ff00'
	if (c === 22) return '#dbff00'
	if (c === 23) return '#e0ff00'
	if (c === 24) return '#e5ff00'
	if (c === 25) return '#eaff00'
	if (c === 26) return '#efff00'
	if (c === 27) return '#f4ff00'
	if (c === 28) return '#f9ff00'
	if (c === 29) return '#feff00'
	if (c === 30) return '#fff900'
	if (c === 31) return '#fff400'
	if (c === 32) return '#ffef00'
	if (c === 33) return '#ffea00'
	if (c === 34) return '#ffe500'
	if (c === 35) return '#ffe000'
	if (c === 36) return '#ffdb00'
	if (c === 37) return '#ffd600'
	if (c === 38) return '#ffd100'
	if (c === 39) return '#ffcc00'
	if (c === 40) return '#ffc600'
	if (c === 41) return '#ffc100'
	if (c === 42) return '#ffbc00'
	if (c === 43) return '#ffb700'
	if (c === 44) return '#ffb200'
	if (c === 45) return '#ffad00'
	if (c === 46) return '#ffa800'
	if (c === 47) return '#ffa300'
	if (c === 48) return '#ff9e00'
	if (c === 49) return '#ff9900'
	if (c === 50) return '#ff9300'
	if (c === 51) return '#ff8e00'
	if (c === 52) return '#ff8900'
	if (c === 53) return '#ff8400'
	if (c === 54) return '#ff7f00'
	if (c === 55) return '#ff7a00'
	if (c === 56) return '#ff7500'
	if (c === 57) return '#ff7000'
	if (c === 58) return '#ff6b00'
	if (c === 59) return '#ff6600'
	if (c === 60) return '#ff6000'
	if (c === 61) return '#d41' // 1h-2h
	if (c === 62) return '#d41' // 2h-4h
	if (c === 63) return '#d41' // 4h-8h
	if (c === 64) return '#d41' // 8h-16h
	if (c === 65) return '#a41' // > 16h
	return '#999'
}

export const toPoint = language => station => ({
	center: [station.location.longitude, station.location.latitude],
	geometry: {
		type: 'Point',
		coordinates: [station.location.longitude, station.location.latitude],
	},
	place_name: [station.name, countryForStationId(station.id, language)].filter(Boolean).join(', '),
	place_type: ['coordinate'],
	properties: {
		id: station.id,
		name: station.name,
	},
	type: 'Feature',
})

export const isLongDistanceOrRegionalOrSuburban = s => {
	return s.products && (s.products.nationalExp || s.products.nationalExpress || s.products.national || s.products.regionalExp || s.products.regionalExpress || s.products.regional || s.products.suburban) && isUicLocationCode(formatStationId(s.id))
}

export const isRegion = s => {
	return s.name.toUpperCase() === s.name
}

export const hasLocation = s => {
	return !!s.location
}
