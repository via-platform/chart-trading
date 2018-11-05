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
        this.disposables.add(charts.plugin({
            describe: () => {
                return {
                    name: 'chart-trades',
                    parameters: {},
                    title: 'Chart Trades',
                    description: 'View and modify orders on the chart.',
                    priority: 9000
                };
            },
            instance: params => {
                return new ChartTrades(this, params);
            }
        }));
    }

    didDestroyChartTrade(ct){
        _.remove(this.chartTrades, ct);
    }
}

module.exports = new ChartTrading();