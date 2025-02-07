const config = {
  name: "KiloTrack",
  slug: "kilotrack",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  owner: "allken",
  // ... autres configurations que vous aviez dans app.json ...
  extra: {
    eas: {
      projectId: "5d5dc5b5-f96d-41d1-9339-3f896b1499db"
    }
  },
  ios: {
    bundleIdentifier: "com.votrecompany.kilotrack",
    buildNumber: "1.0.0"
  },
  android: {
    package: "com.votrecompany.kilotrack"
  }
};

export default {
  expo: config
};