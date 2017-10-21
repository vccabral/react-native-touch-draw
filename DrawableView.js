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
import REGL from 'regl';


export default class DrawableView extends Component {
  constructor(props){
    super(props);
    this.width = 0;
    this.height = 0;
    this.send_clear_signal = true;

    this.point_index = 0;
    this.lines = [];
    this.elements = [];
    this.raw_points = [[]];
    this.set_clear = false;
    this.line_index = 0;

    this.onLayout = this.onLayout.bind(this);
    this.onResponderMove = this.onResponderMove.bind(this);
    this.onResponderGrant = this.onResponderGrant.bind(this);
    this.onResponderRelease = this.onResponderRelease.bind(this);
    this._onContextCreate = this._onContextCreate.bind(this);
    this.addPoint = this.addPoint.bind(this);
    this.addEdge = this.addEdge.bind(this);
    this.clear = this.clear.bind(this);
    this.get_points = this.get_points.bind(this);
  }

  clear(){
    this.send_clear_signal = true;
  }

  get_points(){
    return this.raw_points;
  }

  onLayout(evt){
    this.width = evt.nativeEvent.layout.width;
    this.height = evt.nativeEvent.layout.height;
  }

  addEdge(){
    this.elements.push([
      this.point_index-2,
      this.point_index-1
    ]);
  }

  addPoint(location){
    var x = 2.0*(location.locationX/this.width-0.5);
    var y = 2.0*(-location.locationY/this.height+0.5);

    if(this.line_index < this.raw_points.length){
      this.raw_points.push([]);
    }
    this.raw_points[this.line_index].push({
      x: x,
      y: y
    })
    this.lines.push([x,y]);
    this.point_index++;
  }

  onResponderGrant(evt){
    this.addPoint(evt.nativeEvent);
  }

  onResponderMove(evt){
    this.addPoint(evt.nativeEvent);
    this.addEdge();
  }

  onResponderRelease(evt){
    this.addPoint(evt.nativeEvent);
    this.addEdge();
    this.set_clear = true;
    this.line_index++;
  }

  _onContextCreate(gl){
    var context = this;

    const regl = REGL({ gl });

    const frame = () => {
      regl.poll();

      var lineWidth = 10

      if(context.elements.length>0){
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
            position:  (context.lines)
          },

          uniforms: {
            color: [0, 0, 1, 1],
          },

          elements: context.elements,

          lineWidth: lineWidth,
        })();
      }
      if(context.set_clear){
        context.lines = [];
        context.elements = [];
        context.point_index = 0;
        context.set_clear = false;
      }

      if(this.send_clear_signal){
        regl.clear({
          color: [1, 1, 1 , 1],
          depth: 1,
        });

        this.send_clear_signal = false;
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
        style={[{flex: 1}]}
        onStartShouldSetResponder={(evt) => true}
        onMoveShouldSetResponder={(evt) => true}  
        onLayout={this.onLayout}
        onResponderMove={this.onResponderMove}
        onResponderGrant={this.onResponderGrant}
        onResponderRelease={this.onResponderRelease}
      > 
        <GLView
          style={{flex: 1}}
          onContextCreate={this._onContextCreate}
        />
      </View>
    );
  }

}