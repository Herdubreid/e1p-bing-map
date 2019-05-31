// Address Book Search Component
import './style.scss';
import * as ko from 'knockout';
import { Actions } from '../../store';
import { Navigation } from '../nav';

const component = 'e1p-ab-search';

let vm: ViewModel;

class ViewModel {
    busy$ = ko.observable(false);
    rows$ = ko.observableArray<any>([]);
    search$ = ko.observable<string>().extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 600 } });
    abSearch(s: string) {
        if (s.length > 3) {
            this.busy$(true);
            const rq = {
                outputType: 'GRID_DATA',
                formServiceAction: 'R',
                formName: 'P01012_W01012B',
                version: 'ZJDE0001',
                returnControlIDs: '1[19,20,40,44]',
                maxPageSize: "50",
                formInputs: [],
                formActions: [
                    {
                        controlID: '63',
                        command: 'SetCheckboxValue',
                        value: 'on'
                    },
                    {
                        controlID: '58',
                        command: 'SetControlValue',
                        value: s
                    },
                    {
                        controlID: '15',
                        command: 'DoAction'
                    }
                ]
            };
            callAISService(rq, FORM_SERVICE, response => {
                vm.rows$(response.fs_P01012_W01012B.data.gridData.rowset);
                vm.busy$(false);
            });
        }
    }
    goto(d) {
        let page = Navigation.pages$().find(p => p.id === d.z_AN8_19);
        if (!page) {
            page = {
                id: d.z_AN8_19,
                component: 'e1p-map',
                title: `${d.z_ALPH_20} (${d.z_AN8_19})`,
                busy: false,
                sequence: 0,
                data: {
                    address: `${d.z_ADD1_40}, ${d.z_CTY1_44}`,
                }
            }
            Actions.PageAdd(page);
        }
        Navigation.goto(page);
    }
    descendantsComplete = () => {
        this.search$
            .subscribe(s => this.abSearch(s));
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
