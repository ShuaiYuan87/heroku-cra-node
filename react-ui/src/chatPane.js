import React from 'react'
import {TransitionMotion, spring, presets} from 'react-motion'

class ChatPane extends React.Component{

   render(): Object {
    return (
      <TransitionMotion
        defaultStyles={this.getDefaultValue()}
        styles={this.getEndValue()}
        willLeave={this.willLeave}
        willEnter={this.willEnter}>
        {
          styles => <div className={'chatpane'}>
          {
            styles.map(({key, style, data}) =>
              <div style={style}> {data}  </div>
          )}
          </div>
        }
      </TransitionMotion>
    );
  }

  getEndValue()  {
    var lastNToKeep = 5;
    var childrenMap = [];
    var total = this.props.children.length;
    var j = Math.max(total - lastNToKeep, 0);
    for (var i = j; i < total; i++){
      childrenMap[i-j] = {
        key: i.toString(),
        data: this.props.children[i],
        style: {
          width: spring(300, presets.gentle),
          opacity: spring(1, presets.gentle),
        }
      };
    }
    return childrenMap;
  }
     // actual animation-related logic
  getDefaultValue()  {
    return [];
  }
   willEnter() {
    return {
      width: 0,
      opacity: 1,
    };
  }
   willLeave() {
    return {
      width: spring(0),
      opacity: spring(0),
    };
  }
}

export default ChatPane
