// Map Component
import './style.scss';
import * as ko from 'knockout';
import { IPage } from '../../state';
import { Actions } from '../../store';
const mapKey = require('./map-key.json');

const component = 'e1p-map';

let vm: ViewModel;

class ViewModel {
    page: IPage;
    map: Microsoft.Maps.Map;
    sm: Microsoft.Maps.Search.SearchManager;
    subscriptions = [];
    center$ = ko.observable<any>().extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 2000 } });
    ready$ = ko.observable(false);
    address$: ko.Observable<string>;
    geocodeQry(qry) {
        vm.sm.geocode({
            where: qry,
            callback: (r) => {
                if (r && r.results && r.results.length > 0) {
                    const pin = new Microsoft.Maps.Pushpin(r.results[0].location);
                    vm.map.entities.push(pin);
                    vm.map.setView({ bounds: r.results[0].bestView });
                    vm.address$(r.results[0].address.formattedAddress);
                    vm.page.data.location = r.results[0].bestView.center;
                    vm.page.data.name = r.results[0].name;
                    vm.page.data.zoom = vm.map.getZoom();
                    vm.address$(`${this.page.data.name} (${this.page.data.address})`);
                }
            },
            errorCallback: () => vm.page.data.name = 'Address unknown!'
        });
    }
    descendantsComplete = () => {
        const center = vm.page.data.location;
        const zoom = vm.page.data.zoom;
        vm.ready$(!center);
        vm.map = new Microsoft.Maps.Map('#map', {
            ...mapKey,
            center,
            zoom
        });
        Microsoft.Maps.Events.addHandler(vm.map, 'viewchangeend', () => vm.center$((vm.map.getCenter())));
        if (center) {
            const pin = new Microsoft.Maps.Pushpin(center);
            vm.map.entities.push(pin);
            vm.ready$(true);
        }
        else {
            Microsoft.Maps.loadModule('Microsoft.Maps.Search', () => {
                vm.sm = new Microsoft.Maps.Search.SearchManager(vm.map);
                vm.geocodeQry(vm.page.data.address);
            });
        }
        vm.subscriptions.push(vm.center$
            .subscribe(c => {
                vm.page.data.location = c;
                vm.page.data.zoom = vm.map.getZoom();
                Actions.PageSave(vm.page);
            }));
    }
    dispose() {
        vm.subscriptions.forEach(s => s.dispose());
    }
    constructor(params: { page: IPage }) {
        this.page = params.page;
        this.address$ = ko.observable(this.page.data.name
            ? `${this.page.data.name} (${this.page.data.address})`
            : this.page.data.address);
        vm = this;
    }
}

ko.components.register(component, {
    viewModel: {
        createViewModel: (params, componentInfo) => {
            const vm = new ViewModel(params);
            vm.subscriptions.push(ko.bindingEvent
                .subscribe(componentInfo.element, 'descendantsComplete', vm.descendantsComplete));
            return vm;
        }
    },
    template: require('./template.html')
});
