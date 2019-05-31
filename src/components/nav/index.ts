// Navigation Component
import './style.scss';
import * as ko from 'knockout';
import { IPage, AboutPage } from '../../state';
import { Actions } from '../../store';

export let Navigation: ViewModel;

class ViewModel {
    pages$: ko.ObservableArray<IPage>;
    selectedPage$: ko.Observable<IPage>;
    celin() {
        window.open('http://e1p-templates.celin.io');
    }
    goto(page: IPage) {
        if (page !== Navigation.selectedPage$()) {
            Navigation.selectedPage$(page);
        }
    }
    delete() {
        Actions.PageDelete(Navigation.selectedPage$());
        Navigation.selectedPage$(Navigation.pages$().length > 0
            ? Navigation.pages$()[0]
            : AboutPage);
    }
    toggleNav() {
        $('.wrapper').toggleClass('toggled');
        $('.fa-bars').toggleClass('fa-rotate-90');
    };
    descendantsComplete = () => {
    }
    constructor(params: { data: ko.ObservableArray<IPage> }) {
        Navigation = this;
        this.pages$ = params.data;
        this.selectedPage$ = ko.observable(AboutPage);
    }
}

ko.components.register('e1p-nav', {
    viewModel: {
        createViewModel: (params, componentInfo) => {
            const vm = new ViewModel(params);
            const sub = (ko as any).bindingEvent
                .subscribe(componentInfo.element, 'descendantsComplete', vm.descendantsComplete);
            (vm as any).dispose = () => sub.dispose();
            return vm;
        }
    },
    template: require('./template.html')
});
