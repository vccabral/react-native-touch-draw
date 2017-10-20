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
    this.points_added = 0;
    this.lines = [];
    this.elements = [];
    this.onResponderMove = this.onResponderMove.bind(this);
    this.onResponderGrant = this.onResponderGrant.bind(this);
    this.onResponderRelease = this.onResponderRelease.bind(this);
    this.addPoint = this.addPoint.bind(this);
    this._onContextCreate = this._onContextCreate.bind(this);
  }

  addPoint(location){
    this.lines[this.active_line_index].push([
      2.0*(location.pageX/this.width-0.5), 
      2.0*(-location.pageY/this.height+0.5)
    ]);

    if(this.lines[this.active_line_index].length>1){
      this.elements[this.active_line_index].push([this.lines[this.active_line_index].length-2, this.lines[this.active_line_index].length-1]);
    }
    this.points_added++;
  }

  onResponderGrant(evt){
    this.start = new Date().getTime();
    this.lines.push([]);
    this.elements.push([]);
    this.active_line_index = this.active_line_index + 1;
    this.points_added = 0;
    this.addPoint(evt.nativeEvent);
  }

  onResponderMove(evt){
    this.addPoint(evt.nativeEvent);
  }

  onResponderRelease(evt){
    this.addPoint(evt.nativeEvent);
    this.end = new Date().getTime();
    console.log(this.start, this.end);
    console.log("events per second",this.points_added/(this.end-this.start)*1000);
  }

  _onContextCreate(gl){
    var context = this;

    const regl = REGL({ gl });
    const frame = () => {
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
        onResponderRelease={this.onResponderRelease}
      >
        <GLView
          style={StyleSheet.absoluteFill}
          onContextCreate={this._onContextCreate}
        />
      </View>
    );
  }
}

