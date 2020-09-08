/* @flow */
import React from "react";
import { View, Text, Image } from "react-native";
import {
    createAppContainer,
    createBottomTabNavigator,
    createStackNavigator
} from "react-navigation";
import WaitingList from "../screens/waiting/WaitingList"
import LocationsMap from "../screens/locations/LocationsMap"
import FavouritesList from "../screens/fav/FavouritesList"
import UserProfile from "../screens/profile/UserProfile"

import { colors } from "../common/AppColors";

const UserProfileStack = createStackNavigator({
    UserProfile: {
        screen: UserProfile, navigationOptions: { header: null }
    }
});

const WaitingListStack = createStackNavigator({
    WaitingList: { screen: WaitingList, navigationOptions: { header: null } },
});

const LocationsMapStack = createStackNavigator({
    LocationsMap: {
        screen: LocationsMap, navigationOptions: { header: null }
    }
});

const FavouritesListStack = createStackNavigator({
    FavouritesList: { screen: FavouritesList, navigationOptions: { header: null } },
});


const TabNavigator = createBottomTabNavigator(
    {
        WaitingList: WaitingListStack,
        LocationsMap: LocationsMapStack,
        FavouritesList: FavouritesListStack,
        UserProfile: UserProfileStack
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({


            tabBarIcon: ({ focused, tintColor }) => {

                const { routeName } = navigation.state;
                let iconName;
                let title;

                if (routeName == "WaitingList") {
                    iconName = require("../screens/images/ic_menu.png");
                    //   title = "Home"
                } else if (routeName == "LocationsMap") {
                    iconName = require("../screens/images/ic_locations.png");
                    //   title = "Setting"
                } else if (routeName == "FavouritesList") {
                    iconName = require("../screens/images/ic_fav.png");
                    //   title = "Notifications"
                } else if (routeName == "UserProfile") {
                    iconName = require("../screens/images/ic_profile.png");
                    //   title = "MedList"
                }

                return (
                    <View style={{ alignItems: "center" }}>
                        <Image
                            style={{
                                width: 40,
                                height: 40
                            }}
                            source={iconName}
                        />
                        {/* <Text style={{ fontFamily: 'Rubik-Light', color: tintColor, fontSize: 12, paddingTop: 3 }}>
              {title}
            </Text> */}
                        {/* {home.showBadge(title, badgeCount)} */}
                    </View>
                );
            }
        }),
        lazy: true,
        tabBarPosition: "bottom",
        tabBarOptions: {
            upperCaseLabel: false,
            activeTintColor: colors.themeDark,
            inactiveTintColor: colors.themeDark,
            inactiveBackgroundColor: colors.white,
            showIcon: true,
            showLabel: false,
            labelStyle: {
                fontSize: 8
            },
            indicatorStyle: {
                opacity: 0
            },
            style: {
                height: 55,
                borderColor: colors.white,
                backgroundColor: colors.white,
                borderWidth: 0
            }
        },
        initialRouteName: "LocationsMap"
    }
);

export default createAppContainer(TabNavigator);
