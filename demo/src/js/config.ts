export interface Config {
    demoOption: string;
    cssautoload: boolean;
    csspath: string;
    debug: boolean;
}

export const defaultConfig: Config = {
    demoOption: 'default value',
    cssautoload: true,
    csspath: '',
    debug: false
};