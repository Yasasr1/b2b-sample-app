import chroma from "chroma-js";
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR } from "components/sections/theme-store";

export interface ThemeColors {
    primaryColor: string;
    secondaryColor: string;
}

export function generateThemeVars({ primaryColor, secondaryColor }: ThemeColors) {
    const primary = primaryColor || DEFAULT_PRIMARY_COLOR;
    const secondary = secondaryColor || DEFAULT_SECONDARY_COLOR;
    const contrastText = chroma.contrast(secondary, '#000') > chroma.contrast(secondary, '#fff') ? '#000' : '#fff';
    const hoverBg = chroma(secondary).brighten(0.5).hex();
    const themeVars: { [key: string]: string } = {
        '--rs-btn-default-bg': secondary,
        '--rs-btn-default-text': contrastText,
        '--rs-btn-default-hover-bg': hoverBg,
        '--rs-btn-subtle-bg': secondary,
        '--rs-btn-subtle-text': contrastText,
        '--rs-btn-subtle-hover-bg': hoverBg,
        '--rs-btn-ghost-bg': secondary,
        '--rs-btn-ghost-text': secondary,
        '--rs-btn-ghost-hover-bg': hoverBg,
    };
    const scale = chroma.scale([chroma(primary).brighten(2), primary, chroma(primary).darken(2)])
        .mode('lab')
        .colors(9);
    for (let i = 0; i < 9; i++) {
        themeVars[`--rs-primary-${(i+1)*100}`] = scale[i];
    }
    return themeVars;
}
