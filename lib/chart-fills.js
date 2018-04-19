const {CompositeDisposable, Disposable, Emitter, d3} = require('via');
const _ = require('underscore-plus');

class ChartFills {
    constructor({chart, element, panel, layer, params}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.layer = layer;
        this.panel = panel;
        this.fills = [];
        this.element = element.classed('chart-fills', true);
        this.body = this.body.bind(this);
        this.size = 6; //TODO user preference

        this.disposables.add(via.orders.onDidUpdateOrder(this.reload.bind(this)));
        this.disposables.add(this.chart.onDidChangeMarket(this.update.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.draw.bind(this)));
        this.disposables.add(via.config.observe('chart-trading.showFills', this.draw.bind(this)));

        this.update();
    }

    serialize(){
        return {
            version: 1,
            name: 'chart-fills'
        };
    }

    hide(){
        this.element.classed('hide', true);
    }

    reload({order, property, value}){
        if(order.market === this.chart.market && property === 'fills'){
            this.update();
        }
    }

    update(){
        this.fills = [];

        if(this.chart.market){
            this.fills = via.orders.fills(this.chart.market);
        }

        this.draw();
    }

    draw(){
        if(!via.config.get('chart-trading.showFills')){
            return this.element.classed('hide', true);
        }

        this.element.classed('hide', false);

        const [start, end] = this.chart.scale.domain();
        const fills = this.fills.filter(fill => fill.date > start && fill.date < end);
        const arrow = this.element.selectAll('path.fill-arrow').data(fills, d => d.uuid).attr('d', this.body);
        arrow.enter().append('path').attr('d', this.body).attr('class', d => `fill-arrow ${d.side}`);
        arrow.exit().remove();
    }

    body(d){
        const candle = new Date(Math.round(d.date.getTime() / this.chart.granularity) * this.chart.granularity);
        const x = this.chart.scale(candle);
        const y = this.panel.scale(d.price);

        if(d.side === 'sell'){
            return `M ${x} ${y} l ${this.size} ${-this.size} h ${-this.size / 2} v ${-this.size} h ${-this.size} v ${this.size} h ${-this.size / 2} Z`;
        }else{
            return `M ${x} ${y} l ${this.size} ${this.size} h ${-this.size / 2} v ${this.size} h ${-this.size} v ${-this.size} h ${-this.size / 2} Z`;
        }
    }

    remove(){
        this.panel.removeLayer(this.layer);
    }

    destroy(){
        //Remove the things from the chart
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'chart-fills',
    type: 'other',
    settings: {},
    title: 'Chart Fills',
    description: 'View fill arrows on the chart.',
    selectable: false,
    priority: 1000,
    instance: params => new ChartFills(params)
};