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
      //篩選可視範圍內的資料點，因為手機與桌機版型不同(資料卡清單擺放位置不同)，而分開處理。

      if(this.mapRef.leafletElement.getZoom() < 14) {
        return false;
      }
      
      const isMobile = window.innerWidth < 480;
      const _topBound = leftTop.lat;;
      const _bottomBound = rightBottom.lat;
      const _leftBound = leftTop.lng;
      const _rightBound = rightBottom.lng;

      let topBound, bottomBound, leftBound, rightBound;
      
      if(isMobile) {
        const h = _topBound - _bottomBound;
        topBound = _topBound - h * 0.05;
        bottomBound = topBound - h * ((window.innerHeight - this.cardListRef.offsetHeight) / window.innerHeight) * 0.9;

        const w = _rightBound - _leftBound;
        leftBound = _leftBound + w * 0.05;
        rightBound = _rightBound - w * 0.05;
      } else {
        const h = _topBound - _bottomBound;
        topBound = _topBound - h * 0.05;
        bottomBound = _bottomBound + h * 0.05;

        const w = _rightBound - _leftBound;
        leftBound = _leftBound + w * 0.05;
        rightBound = _leftBound + w * ((window.innerWidth - this.cardListRef.offsetWidth) / window.innerWidth);
      }
      return it["latLng"][0] < topBound && it["latLng"][0] > bottomBound
          && it["latLng"][1] > leftBound && it["latLng"][1] < rightBound
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
        onClick={e => {
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
        minZoom={8}
        maxZoom={19}
        onMoveend={e =>  {
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
            // 手機版讓focus的資料卡保持在中央。
            if(isMobile) {
              idx = Math.round(this.cardListRef.scrollLeft / width);
              this.cardListRef.scrollTo({'behavior': 'smooth', 'left': width * idx});
              this.setState({
                focusId: this.state.maskData[idx].id
              });
            } else {
              
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
