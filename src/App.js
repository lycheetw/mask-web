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
      navigator.geolocation.getCurrentPosition(position => {
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
          
          
          const idx1 = this.state.maskData.findIndex(it2 => it.id === it2.id);
          const idx2 = this.state.maskData.findIndex(it2 => this.state.focusId === it2.id);

          const isMobile = window.innerWidth < 480;
          if(isMobile) {
            const width = this.cardListRef.offsetWidth;
            if(Math.abs(idx1 - idx2) > 5) {
              this.cardListRef.scrollTo({'behavior': 'auto', 'left': width * idx1});
            } else {
              this.cardListRef.scrollTo({'behavior': 'smooth', 'left': width * idx1});
            }
          } else {
            const height = this.cardListRef.childNodes[0].offsetHeight + 10;
            if(Math.abs(idx1 - idx2) > 5) {
              this.cardListRef.scrollTo({'behavior': 'auto', 'top': height * idx1});
            } else {
              this.cardListRef.scrollTo({'behavior': 'smooth', 'top': height * idx1});
            }
          }
          
          this.setState({
            focusId: it.id
          });
        }}
        />
    });

    const cards = this.state.maskData.map(it => {
      return <InfoCard key={it.id} 
        detail={it}
        focusId={this.state.focusId}
        onClick={e => {
          const isMobile = window.innerWidth < 480;
          if(!isMobile) {
            const height = this.cardListRef.childNodes[0].offsetHeight + 10;
            const idx = this.state.maskData.findIndex(it2 => it.id === it2.id);
            this.cardListRef.scrollTo({'behavior': 'smooth', 'top': height * idx});
            this.setState({
            focusId: it.id
          });
          }
        }}
      />
    });

    return (
      <div id="root-continer">
      <Map id="map-continer" 
        ref={(ref) => this.mapRef = ref}
        center={this.state.defaultCenter} 
        zoom={this.state.zoom}
        minZoom={14}
        maxZoom={18}
        onMoveend={(it) =>  {
            this.drawMarkers();
          }
        }
        >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {markers}
      </Map>
      <div id="list-continer"
        ref={(ref) => this.cardListRef = ref}
        onScroll={e => {
          if(this.timeoutFun) {
            clearTimeout(this.timeoutFun);
          }
          this.timeoutFun = setTimeout(() => {
            const width = this.cardListRef.offsetWidth;
            let idx;
            const isMobile = window.innerWidth < 480;
            if(isMobile) {
              idx = Math.round(this.cardListRef.scrollLeft / width);
              this.cardListRef.scrollTo({'behavior': 'smooth', 'left': width * idx});
              this.setState({
                focusId: this.state.maskData[idx].id
              });
            } else {
              // const height = this.cardListRef.childNodes[0].offsetHeight + 10;
              // idx = Math.round(this.cardListRef.scrollTop / height);
              // this.cardListRef.scrollTo({'behavior': 'smooth', 'top': height * idx});
              // this.setState({
              //   focusId: this.state.maskData[idx].id
              // });
            }
          }, 50);
        }}
        >
        {cards}
      </div>

      </div>
    );
  }
}
