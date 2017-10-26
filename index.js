import React, { 
  Component,
  NativeAppEventEmitter,
} from 'react';
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

const line_width = 8.0;

export default class DrawableView extends Component {
  constructor(props){
    super(props);
    this.width = 0;
    this.height = 0;
    this.send_clear_signal = true;

    this.base_line_width = line_width;
    this.line_x_width = this.base_line_width * 1;
    this.line_y_width = this.base_line_width * 1;
    this.point_index = 0;
    this.lines = [];
    this.triangles = [];
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
    this.line_x_width = this.base_line_width / evt.nativeEvent.layout.width;
    this.line_y_width = this.base_line_width / evt.nativeEvent.layout.height;
  }

  addEdge(p1,p2){
    if(p1[1]>p2[1]){
      p2 = [p1, p1 = p2][0];
    }
    var x1 = p1[0];
    var y1 = p1[1];
    var x2 = p2[0];
    var y2 = p2[1];
    var delta_x = x2 - x1;
    var delta_y = y2 - y1;
    var hypotenuse = Math.sqrt(delta_x*delta_x + delta_y+delta_y);
    var theta = Math.atan2(delta_y, delta_x);
    var sin_theta = Math.sin(2*theta);
    var screen_correction_factor = (Math.sqrt(2)-1)/2.0*sin_theta*sin_theta+1;
    var small_delta_x = line_width / 2.0 * delta_y * this.line_x_width * screen_correction_factor;
    var small_delta_y = line_width / 2.0 * delta_x * this.line_y_width * screen_correction_factor;
    var P1 = [x1-small_delta_x, y1-small_delta_y];
    var P2 = [x1+small_delta_x, y1+small_delta_y];
    var P3 = [x2-small_delta_x, y2-small_delta_y];
    var P4 = [x2+small_delta_x, y2+small_delta_y];
    this.triangles.push(
      {position: [P1,P2,P3]},
      {position: [P2,P3,P4]}
    );
  }

  addPoint(location){
    var x = 2.0*(location.locationX*1.0/this.width-0.5);
    var y = 2.0*(-location.locationY*1.0/this.height+0.5);

    if(this.line_index < this.raw_points.length){
      this.raw_points.push([]);
    }
    this.raw_points[this.line_index].push({
      x: x,
      y: y
    });
    this.lines.push([x, y]);
    this.point_index++;
  }

  onResponderGrant(evt){
    this.addPoint(evt.nativeEvent);
  }

  onResponderMove(evt){
    this.addPoint(evt.nativeEvent);
    var index_of_second_to_last_point = this.lines.length - 2;
    var index_of_last_point = index_of_second_to_last_point + 1;
    this.addEdge(
      this.lines[index_of_second_to_last_point],
      this.lines[index_of_last_point]
    );
  }

  onResponderRelease(evt){
    this.addPoint(evt.nativeEvent);
    var index_of_second_to_last_point = this.lines.length - 2;
    var index_of_last_point = index_of_second_to_last_point + 1;
    this.addEdge(
      this.lines[index_of_second_to_last_point],
      this.lines[index_of_last_point]
    );
    this.set_clear = true;
    this.line_index++;
  }

  _onContextCreate(gl){
    var context = this;
    const regl = REGL({ gl });

    const drawTriangle = regl({
      frag: `
        precision mediump float;
        uniform vec4 color;
        void main() {
          gl_FragColor = color;
        }`,
      vert: `
        precision mediump float;
        attribute vec2 position;
        void main () {
          gl_Position = vec4(position, 0, 1);
        }`,
      attributes: {
        position: regl.prop('position')
      },
      uniforms: {
        color: [0, 0, 1, 1],
      },
      count: 3
    });

    var lineWidth = 3;
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    const frame = () => {
      regl.poll();

      if(context.triangles.length>0){
        drawTriangle(context.triangles);  
      }
      if(context.triangles>0){  
        drawTriangle(context.triangles);
      }
      if(context.set_clear){
        context.triangles = [];
        context.lines = [];
        context.elements = [];
        context.point_index = 0;
        context.set_clear = false;
      }

      if(context.send_clear_signal){
        regl.clear({
          color: [1, 1, 1 , 1],
          depth: 1,
        });

        context.send_clear_signal = false;
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
        style={[this.props.style]}
        onStartShouldSetResponder={(evt) => true}
        onMoveShouldSetResponder={(evt) => true}  
        onLayout={this.onLayout}
        onResponderMove={this.onResponderMove}
        onResponderGrant={this.onResponderGrant}
        onResponderRelease={this.onResponderRelease}
      > 
        <GLView
          style={{flex: 1, backgroundColor: "transparent"}}
          onContextCreate={this._onContextCreate}
        />
      </View>
    );
  }

}