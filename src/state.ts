import * as ko from 'knockout';

// App State

export const testing = false;

export interface IPage {
    id: string;
    component: string;
    title: string;
    data: any;
    busy: boolean;
    sequence: number;
}

export const AboutPage = {
    id: 'splash',
    sequence: 0,
    component: 'e1p-about',
    title: 'About',
    busy: true,
    data: null
};

export interface IState {
    pages$: ko.ObservableArray<IPage>;
}

export const defaultPages: IPage[] = [];
