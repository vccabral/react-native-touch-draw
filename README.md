
React Native TouchDraw
---

Overview
---
React Native TouchDraw offers a View that is a sketchable surface. The react component 
 * is impelemented in pure javascript
 * does not require linking to an Xcode project or an Android Studio project. 
 * uses an implementation of OpenGL for speed to put closest tactile drawing expierence.

Open Issues
---
 * Bezier, quadratic, or other line smoothing will improve performance.
 * Optimize speed inside of index.js
   * Use only 1 object to draw lines in regl code.
   * Use ES20** standards to optimize touch code.
 * Unit testing coverage.

You
---
If you found this project, it might be exactly what you need and god speed! If you are planning on using this library and need to customize it, consider adding a PR back!

Me
---
You can reach out to me by adding an issue, forking, or submitting a PR.

similar projects
---
 * https://github.com/jgrancher/react-native-sketch
 * https://github.com/keshavkaul/react-native-sketch-viewz
 * https://github.com/keshavkaul/react-native-sketch-viewz