const {CompositeDisposable, Disposable, Emitter} = require('via');
const _ = require('underscore-plus');
const ChartTrades = require('./chart-trades');

class ChartTrading {
    activate(){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.chartTrades = [];
    }

    deactivate(){
        for(const ct of this.chartTrades){
            ct.destroy();
        }

        this.disposables.dispose();
    }

    consumeCharts(charts){
        this.disposables.add(charts.observeCharts(chart => this.chartTrades.push(new ChartTrades({manager: this, chart}))));
    }

    didDestroyChartTrade(ct){
        _.remove(this.chartTrades, ct);
    }
}

module.exports = new ChartTrading();