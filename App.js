import React, { Component } from 'react';
import { 
  View, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { 
  Constants, 
  GLView 
} from 'expo';
import Expo from 'expo';
import REGL from "regl";


export default class TestApp extends Component {
  constructor(props){
    super(props);
    let {width, height} = Dimensions.get('window');
    this.width = width;
    this.height = height;
    this.active_line_index = -1;
    this.lines = [];
    this.elements = [];
    this.onResponderMove = this.onResponderMove.bind(this);
    this.onResponderGrant = this.onResponderGrant.bind(this);
    this._onContextCreate = this._onContextCreate.bind(this);
  }

  onResponderGrant(evt){
    this.lines.push([]);
    this.elements.push([]);
    this.active_line_index = this.active_line_index + 1;

  }

  onResponderMove(evt){
    var location = evt.nativeEvent;
    this.lines[this.active_line_index].push([
      2.0*(location.pageX/this.width-0.5), 
      2.0*(-location.pageY/this.height+0.5)
    ]);

    if(this.lines[this.active_line_index].length>1){
      this.elements[this.active_line_index].push([this.lines[this.active_line_index].length-2, this.lines[this.active_line_index].length-1]);
    }
  }

  _onContextCreate = (gl) => {
    var context = this;

    const regl = REGL({ gl });
    const frame = () => {
      // console.log(context.lines);
      regl.poll();
      regl.clear({
        color: [1, 1, 1 , 1],
        depth: 1,
      });

      var lineWidth = 10
      if (lineWidth > regl.limits.lineWidthDims[1]) {
        lineWidth = regl.limits.lineWidthDims[1]
      }

      for(var i=0;i<context.lines.length;i++){
        if(context.lines[i].length > 0){
          regl({
            frag: `
              precision mediump float;
              uniform vec4 color;
              void main() {
                gl_FragColor = color;
              }`,

            vert: `
              precision mediump float;
              attribute vec2 position;
              void main() {
                gl_Position = vec4(position, 0, 1);
              }`,

            attributes: {
              position:  (context.lines[i])
            },

            uniforms: {
              color: [1, 0, 0, 1]
            },

            elements: context.elements[i],

            lineWidth: lineWidth
          })();
        }
      }

      gl.flush();
      gl.endFrameEXP();
      requestAnimationFrame(frame);
    };
    frame();

  }

  render() {
    return (
      <View 
        style={[{flex: 1, paddingTop: Constants.statusBarHeight}  ]}
        onStartShouldSetResponder={(evt) => true}
        onMoveShouldSetResponder={(evt) => true}  
        onResponderMove={this.onResponderMove}
        onResponderGrant={this.onResponderGrant}
      >
        <GLView
          style={StyleSheet.absoluteFill}
          onContextCreate={this._onContextCreate}
        />
      </View>
    );
  }
}

