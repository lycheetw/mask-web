import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import './App.scss';

import '@material/react-typography/index.scss';
import '@material/react-card/index.scss';
import '@material/react-icon-button/index.scss';
import '@material/react-material-icon/index.scss';

import { Marker as LeafletMarker } from 'react-leaflet'
import Leaflet from 'leaflet'

export default class Marker extends React.Component {
  
  render() {
    const num = this.props.num || 0;
    let color;
    if(num > 50) color = "green";
    else if(num > 30) color = "orange";
    else if(num > 0) color = "red";
    else  color = "gray";

    let focused = "";
    let anchor = [14, 30];
    if(this.props.id === this.props.focusId) {
      focused = "focused";
      anchor = [24, 48];
    }
    

    const iconMarkup = renderToStaticMarkup(<i className="material-icons">place</i>);
    const CustomIcon = new Leaflet.DivIcon({
      className: `custom-icon ${color} ${focused}`,
      html: iconMarkup,
      iconAnchor: anchor,
    })
    return <LeafletMarker 
      icon={CustomIcon}
      position={this.props.position} 
      onClick={(e) => {
        this.props.onClick(e);
      }}
      >
      </LeafletMarker>
  }
}
