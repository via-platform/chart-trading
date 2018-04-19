const {CompositeDisposable, Disposable, Emitter, d3} = require('via');
const _ = require('underscore-plus');
const ChartFills = require('./chart-fills');
const ChartOrder = require('./chart-order');

module.exports = class ChartTrades {
    constructor({manager, chart}){
        this.disposables = new CompositeDisposable();
        this.manager = manager;
        this.chart = chart;
        this.chartOrders = [];

        this.fills = this.chart.center().addLayer(ChartFills);

        this.disposables.add(this.chart.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.onDidChangeMarket(this.changeMarket.bind(this)));
        this.disposables.add(via.orders.onDidCreateOrder(this.add.bind(this)));
        this.disposables.add(via.orders.onDidUpdateOrder(this.update.bind(this)));

        this.changeMarket();
    }

    add(order){
        if(this.chart.market && order.market === this.chart.market){
            const layer = this.chart.center().addLayer(ChartOrder, order);
        }
    }

    update({order, property, value}){
        if(property === 'market' && value === this.chart.market){
            this.add(order);
        }
    }

    changeMarket(){
        this.chartOrders.forEach(co => co.destroy());
        this.chartOrders = [];

        if(this.chart.market){
            via.orders.market(this.chart.market).filter(order => !order.isDone()).forEach(this.add.bind(this));
        }
    }

    didDestroyChartOrder(co){
        _.remove(this.chartOrders, co);
    }

    destroy(){
        this.chartOrders.forEach(co => co.destroy());
        this.fills.destroy();
        this.disposables.dispose();
        this.manager.didDestroyChartTrade(this);
    }
}