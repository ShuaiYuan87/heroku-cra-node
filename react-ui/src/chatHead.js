import React from 'react'
import PropTypes from 'prop-types'
class Chathead extends React.Component{
    propTypes: {
      text: PropTypes.string.isRequired,
    }
   render(): Object {
    return (
      <div className={'message'}>
        {this.props.text}
        <div className={'arrow'} />
        <img
          className={'head'} alt="avatar"
          src="https://scontent.xx.fbcdn.net/v/t1.0-1/c8.0.50.50/p50x50/10455055_10201367490508021_5069266853102258405_n.jpg?_nc_cat=0&oh=9ffd89c21a116acecac703bc63351530&oe=5C0CEA59"/>
      </div>
    );
  }
}

export default Chathead
