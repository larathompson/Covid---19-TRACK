import React, { useState, useEffect } from "react"
import './App.css';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from "@material-ui/core"

import InfoBox from './InfoBox'
import Map from './Map'

import Table from './Table'
import './Table.css'
import { sortData, prettyPrintStat } from './util'
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css"



function App() {
  const [countries, setCountries] = useState([])
  //here we rememeber which country we selected - worldwide by default
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter,setMapCenter]  = useState({ lat: 34.80745, lng: -40.4796 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType ] = useState("cases")

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      //you can also use axios but just using fetch here which is built into javadscript
      await fetch("https://disease.sh/v3/covid-19/countries")
        //from the reponse we just want the json
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            //it is returning an object for all the countries
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ))
          const sortedData = sortData(data)
          setTableData(sortedData)
          //this is all the info on countries
          setMapCountries(data)
          setCountries(countries)

        })
    }
    getCountriesData()

  }, [])

  const onCountryChange = (event) => {
    //this gets selected value
    const countryCode = event.target.value
    setCountry(countryCode)

    const url = countryCode === 'worldwide'
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`

     fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode)
        setCountryInfo(data)
//this will move the map to the selected country
        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        //this works in conjunction with a zoom out
        setMapZoom(4)
      })
   
  }
  console.log(countryInfo)


  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          {/* this is material UI - this is BEM naming. This is for dropdown */}
          <FormControl className="app__dropdown">
            <Select variant="outlined"
              onChange={onCountryChange}
              value={country}>
              {/* //here we are manually adding worldwide */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}> {country.name}</MenuItem>
              ))}
              {/* <MenuItem value="worldwide"> Worldwide</MenuItem>
            <MenuItem value="worldwide"> Option 2</MenuItem>
            <MenuItem value="worldwide"> dd</MenuItem>
            <MenuItem value="worldwide"> dd</MenuItem> */}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox isRed active={casesType === "cases"} onClick={e => setCasesType('cases')} title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={countryInfo.cases}></InfoBox>
          <InfoBox active={casesType === "recovered"} onClick={e => setCasesType('recovered')}  title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={countryInfo.recovered}></InfoBox>
          <InfoBox isRed active={casesType === "deaths"} onClick={ e => setCasesType('deaths')}  title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={countryInfo.deaths}></InfoBox>
        </div>

        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}>
          
        </Map>
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData}/>
          <h3 className="app__graphTitle"> Worldwide New {casesType}</h3>

          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>


    </div>
  );
}

export default App;
