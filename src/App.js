import React from 'react';
import './App.scss';

import '@material/react-typography/index.scss';
import '@material/react-card/index.scss';
import '@material/react-icon-button/index.scss';
import '@material/react-material-icon/index.scss';

import { Map, TileLayer } from 'react-leaflet'
import InfoCard from './InfoCard'
import Marker from './Marker'
import API from './API'
import L from 'leaflet'

const dataSet = require("./data/raw.json");

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      zoom: 16,
      defaultCenter: [25.044463, 121.543273],
      maskData: [],
      focusId: -1
    }
    this.maskRawData = {};
    
    this.init();
  }

  init = async () => {
    this.maskRawData = await API.featchMaskData();
    this.drawMarkers();

    setInterval(async () => {
      this.maskRawData = await API.featchMaskData();
      this.drawMarkers();
    }, 60 * 1000);

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(position => {
        this.mapRef.leafletElement.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));
      }, err => {});
    }

    if(window.screen.lockOrientation) {
      window.screen.lockOrientation("portrait");
    }
  }

  drawMarkers = async () => {
    // const center = this.mapRef.leafletElement.getCenter(); 
    const bounds = this.mapRef.leafletElement.getBounds();
    const leftTop = bounds.getNorthWest();
    const rightBottom = bounds.getSouthEast();

    const data = dataSet.filter(it => {
      return it["latLng"][0] < leftTop.lat && it["latLng"][0] > rightBottom.lat
          && it["latLng"][1] > leftTop.lng && it["latLng"][1] < rightBottom.lng
    }).filter(it => this.maskRawData[it.id])
    .map(it => {
      return {
        id: it.id,
        name: it.name,
        addr: it.address,
        phone: it.phone,
        position: it.latLng,
        adult: this.maskRawData[it.id]["成人口罩總剩餘數"],
        child: this.maskRawData[it.id]["兒童口罩剩餘數"],
        timestamp: this.maskRawData[it.id]["來源資料時間"]
      }
    });
    
    this.setState({
      maskData: data
    });
  }

  render() {
    const markers = this.state.maskData.map(it => {
      return <Marker key={it.id} id={it.id} position={it.position} focusId={this.state.focusId} num={it.adult}
        onClick={(e) => {
          this.setState({
            focusId: it.id
          });
          const width = this.cardListRef.offsetWidth;
          const idx = this.state.maskData.findIndex(it2 => it.id === it2.id);
          this.cardListRef.scrollTo({'behavior': 'smooth', 'left': width * idx})
        }}
        />
    });

    const cards = this.state.maskData.map(it => {
      return <InfoCard key={it.id} 
        detail={it}
      />
    });

    return (
      <div id="root-continer">
      <Map id="map-continer" 
        ref={(ref) => this.mapRef = ref}
        center={this.state.defaultCenter} 
        zoom={this.state.zoom}
        minZoom={15}
        maxZoom={18}
        onMoveend={(it) =>  {
            this.drawMarkers();
          }
        }
        >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {markers}
      </Map>
      <div id="list-continer"
        ref={(ref) => this.cardListRef = ref}>
        {cards}
      </div>

      </div>
    );
  }
}
