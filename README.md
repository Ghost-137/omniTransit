
## OmniTransit

Omnitransit is a fast public transport app for Finland. It is built with React Native and Expo. Users can easily plan travel routes, see live maps, and save personal addresses safely. The app works in Helsinki, Tampere, and Turku, all in one simple app.

## Core Features

* **Easy Region Switching:** Quickly switch between Helsinki (HSL) and Waltti networks for Tampere and Turku.
* **GPS:** Uses the device's built-in GPS to fetch the current location.
* **Biometric Security:** Uses Face ID or Touch ID to protect your saved home and work addresses.
* **Saved Data Storage:** Uses `AsyncStorage` to securely save your custom locations on your device.
* **Custom Map System:** Replaces standard Apple or Google Maps with Digitransit’s official high-quality transit map tiles.
* **Smart Route Planning:** Uses GraphQL to find detailed travel routes with walking distances, transport types, times, and exact stop names.

## Tech Stack & Architecture

* **Framework:** React Native / Expo
* **Navigation:** React Navigation (Nested Bottom Tabs & Native Stacks)
* **Hardware APIs:** `expo-location`, `expo-local-authentication`
* **Storage:** `@react-native-async-storage/async-storage`
* **Maps:** `react-native-maps`
* **API:** Digitransit GraphQL API

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Ghost-137/omniTransit.git](https://github.com/Ghost-137/omniTransit.git)
   cd omnitransit
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

## Run the App

```bash
npx expo start
```


Hit **Send** to view the structured JSON response detailing the exact transit legs, vehicle modes, and station names.

![API Response in Postman](image.png)

## References & Documentation

* **Digitransit Developer API:** Primary documentation for the GraphQL routing endpoints, custom map tiles, and geocoding. https://digitransit.fi/en/developers/apis/1-routing-api/
* **Expo Documentation:** Used for accessing native device hardware including `expo-location` and `expo-local-authentication`. https://github.com/expo/expo/tree/main/packages/expo-local-authentication
* **React Navigation:** Used for architecting the nested Stack and Bottom Tab navigators.
* **AsyncStorage:** Used for persistent local data storage.

* **
```