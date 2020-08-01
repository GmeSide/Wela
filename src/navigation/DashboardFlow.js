/* @flow */
import React, { Component } from "react";
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Splash from "../screens/Splash";
import Login from "../screens/login/Login";
import LoginOptions from "../screens/login/LoginOptions";
import SignUp from "../screens/signup/SignUp";
import VenueSignUp from "../screens/venuesignup/VenueSignUp";
import VenueSetUp from "../screens/venuesignup/VenueSetUp";
import VerifyOTP from "../screens/otp/VerifyOTP";
import VenueDashboard from "../screens/venue/VenueDashboard";
import VenueLogin from "../screens/venue/VenueLogin";

import TabNavigator from "../navigation/TabNavigatorControl";

const RootStack = createStackNavigator(
  {
    Splash: { screen: Splash,  navigationOptions: { header: null } },
    LoginOptions: { screen: LoginOptions ,  navigationOptions: { header: null }},
    Login: { screen: Login,  navigationOptions: { header: null } },
    SignUp: { screen: SignUp },
    VerifyOTP: { screen: VerifyOTP },
    VenueDashboard: { screen: VenueDashboard, navigationOptions: { header: null } },
    VenueLogin: { screen: VenueLogin, navigationOptions: { header: null } },
    VenueSignUp: { screen: VenueSignUp },
    VenueSetUp: { screen: VenueSetUp },
    Home: { screen: TabNavigator,
      navigationOptions: {
        header: null //this will hide the header
      },
      initialRouteName: 'LocationsMap',
    },
  },
  {
      initialRouteName: 'Splash',
  }
  );

  const DashboardFlow = createAppContainer(RootStack);
  export default DashboardFlow;
