import React from 'react';
import './InfoCard.scss';

import '@material/react-card/index.scss';
import '@material/react-icon-button/index.scss';
import '@material/react-chips/index.scss';
import '@material/react-material-icon/index.scss';

import Card, {
  CardPrimaryContent,
  CardActions,
  CardActionButtons,
  CardActionIcons
} from "@material/react-card";
import {Chip} from '@material/react-chips';
import IconButton from '@material/react-icon-button';
import MaterialIcon from '@material/react-material-icon';

export default class InfoCard extends React.Component {
  render() {
    // const mapLink = `http://maps.apple.com/?q=${this.props.detail.name}&sll=${this.props.detail.position[0]},${this.props.detail.position[1]}&z=12`;
    const mapLink = `http://maps.google.com/?q=${this.props.detail.name}-${this.props.detail.addr}`;
    const phone = `tel:${this.props.detail.phone}`;
    const focused = this.props.detail.id === this.props.focusId ? "focused" : "";
    return (
      <Card className={`mdc-card demo-card info-card ${focused}`} onClick={e => {this.props.onClick(e)}}>
        <CardPrimaryContent className='demo-card__primary-action'>
        <div className="card__primary">
          <h2>{this.props.detail.name}</h2>
          <h3>{this.props.detail.addr}</h3>
          <div style={{display: 'flex'}}><MaterialIcon icon='face' />： {this.props.detail.adult}</div>
          <div style={{display: 'flex'}}><MaterialIcon icon='child_care'/>： {this.props.detail.child}</div>
        </div>
        </CardPrimaryContent>
        <CardActions>
          <CardActionButtons>
          <a href={mapLink} target="_blank" rel="noopener noreferrer" className="no-decoration">
          <Chip
            label="在地圖中開啟"
            leadingIcon={<MaterialIcon icon='map' />}/>
            </a>
          </CardActionButtons>
          <CardActionIcons>
            {/* <a href={phone} className="no-decoration">
            <IconButton>
              <MaterialIcon icon='call' />
            </IconButton>
            </a> */}
            <div>{this.props.detail.timestamp}</div>
          </CardActionIcons>
          
        </CardActions>
      </Card>

    );
  }
}
