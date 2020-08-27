import React, { useContext } from "react";
import { SettingsStore } from "../store/settings";

export const StoresContext = React.createContext({
	settingsStore: new SettingsStore()
});

export const useStores = () => useContext(StoresContext);