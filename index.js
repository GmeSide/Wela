/**
 * @format
 */

import {AppRegistry} from 'react-native';
import DashboardFlow from './src/navigation/DashboardFlow';
import App from './App';
import LoginOptions from './src/screens/login/LoginOptions';
import {name as appName} from './app.json';
console.disableYellowBox = true;

import { Text, StyleSheet } from "react-native";
Text.defaultProps = Text.defaultProps || {}
Text.defaultProps.style =  { fontFamily: 'Rubik-Light' }

AppRegistry.registerComponent(appName, () => DashboardFlow);
