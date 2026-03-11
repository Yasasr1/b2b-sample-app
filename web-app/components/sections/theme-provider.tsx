import React from 'react';
import { CustomProvider } from 'rsuite';
import { useThemeStore } from './theme-store';
import { generateThemeVars } from "./sections/settingsSection/personalizationSection/themeUtils";

interface Props {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<Props> = ({ children }) => {
  const primaryColor = useThemeStore(state => state.primaryColor);
  const secondaryColor = useThemeStore(state => state.secondaryColor);

  React.useEffect(() => {
    const themeVars = generateThemeVars({ primaryColor, secondaryColor });
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [primaryColor, secondaryColor]);

  return (
    <CustomProvider>
      {children}
    </CustomProvider>
  );
};

export default ThemeProvider;
