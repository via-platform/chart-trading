const {CompositeDisposable, Disposable, Emitter, d3} = require('via');
const _ = require('underscore-plus');
const ChartFills = require('./chart-fills');
const ChartOrder = require('./chart-order');

module.exports = class ChartTrades {
    constructor(manager, {chart}){
        this.disposables = new CompositeDisposable();
        this.manager = manager;
        this.chart = chart;
        this.panel = this.chart.center();
        this.element = this.panel.zoomable.append('g').attr('class', 'layer chart-trades');

        this.orders = [];

        this.disposables.add(this.chart.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.onDidChangeMarket(this.changeMarket.bind(this)));
        this.disposables.add(via.orders.onDidCreateOrder(this.add.bind(this)));
        this.disposables.add(via.orders.onDidUpdateOrder(this.update.bind(this)));

        this.panel.add(this);

        this.changeMarket();
    }

    add(order){
        if(this.chart.market && order.market === this.chart.market){
            this.orders.push(new ChartOrder({chart: this.chart, panel: this.panel, element: this.element, manager: this.manager, order}));
        }
    }

    update({order, property, value}){
        if(property === 'market' && value === this.chart.market){
            this.add(order);
        }

        //TODO Redraw if the fills property was updated
    }

    changeMarket(){
        this.orders.forEach(co => co.destroy());
        this.orders = [];

        if(this.chart.market){
            via.orders.market(this.chart.market).filter(order => !order.isDone()).forEach(this.add.bind(this));
        }
    }

    didDestroyChartOrder(co){
        _.remove(this.orders, co);
    }

    get domain(){
        return [];
    }

    get decimals(){
        return this.chart.market ? this.chart.market.precision.price : 0;
    }

    select(){}

    recalculate(){}

    render(){
        for(const order of this.orders){
            order.render();
        }
    }

    title(){
        return '';
    }

    value(){
        return '';
    }

    remove(){
        via.console.warn('This layer cannot be removed.');
    }

    destroy(){
        this.orders.forEach(co => co.destroy());
        this.disposables.dispose();
        this.manager.didDestroyChartTrade(this);
    }
}