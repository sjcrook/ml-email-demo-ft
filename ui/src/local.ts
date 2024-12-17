/*
    This code allows the developer to explicitly determine the loading order of
    other code files.  By not using such code, there a risk that certain code
    won't be available when it's required by other code.
*/
export { default as APP_CONFIG } from './configuration';