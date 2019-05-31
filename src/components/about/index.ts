// About Component
import * as ko from 'knockout';
import './style.scss';
import { Navigation } from '../nav';

const component = 'e1p-about';

let vm: ViewModel;

class ViewModel {
    ready$ = ko.observable(false);
    descendantsComplete = () => {
        vm.ready$(true);
        setTimeout(() => {
            if (Navigation.pages$().length > 0) {
                Navigation.goto(Navigation.pages$()[0]);
            }
        }, 1500);
    }
    constructor() {
        vm = this;
    }
}

ko.components.register(component, {
    viewModel: {
        createViewModel: (_, componentInfo) => {
            const vm = new ViewModel();
            const sub = (ko as any).bindingEvent
                .subscribe(componentInfo.element, 'descendantsComplete', vm.descendantsComplete);
            (vm as any).dispose = () => sub.dispose();
            return vm;
        }
    },
    template: require('./template.html')
});
