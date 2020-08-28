import React, { useContext } from "react";
import { SettingsStore } from "../store/settings";
import { GlobalStore } from "../store/global";

export const StoresContext = React.createContext({
	settingsStore: new SettingsStore(),
	globalStore: new GlobalStore()
});

export const useStores = () => useContext(StoresContext);

