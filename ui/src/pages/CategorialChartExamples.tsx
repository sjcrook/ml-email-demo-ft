import { CategoricalChart } from "ml-fasttrack";

const CategorialChartExamples = () => {

    const dataRaw = [
        [ "Mon", 7 ],
        [ "Tues", 8 ],
        [ "Wed", 9 ],
        [ "Thurs", 7 ],
        [ "Fri", 6 ],
        [ "Sat", 5 ],
        [ "Sun", 6 ]
    ];
     
    const transformData = (dataArray) => {
        return dataArray.map(item => ({
            category: item[0],
            value: item[1]
        }));
    };

    const onEvent = (type, event) => {
        console.log(type, event);
    };

    const chartConfig = {
        chartProps: {
            onAxisLabelClick: (event) => onEvent('axisLabelClick', event),
            onLegendItemClick: (event) => onEvent('legendItemClick', event),
            onLegendItemHover: (event) => onEvent('legendItemHover', event),
            onPlotAreaClick: (event) => onEvent('plotAreaClick', event),
            onPlotAreaHover: (event) => onEvent('plotAreaHover', event),
            onSeriesClick: (event) => onEvent('seriesClick', event),
            onSeriesHover: (event) => onEvent('seriesHover', event)
        },
        chartTitleProps: {
            text: "My First Chart",
            margin: 5,
            color: "green",
            font: "bold 18px Arial, sans-serif"
        },
        chartLegendProps: {
            position: "custom",
            offsetX: 70,
            offsetY: 80 
        },
        chartCategoryAxisItemProps: {
            title: {
                text: 'Days of the Week',
                color: "blue",
                font: "bold 16px Arial, sans-serif"
            },
            labels: {
                color: "#ff00ff"
            }
        },
        chartSeriesItemProps: {
            name: "Fibonacci"
        },
        chartValueAxisItemProps: {
            title: {
                text: "Miles",
                color: "purple",
                font: "bold 16px Arial, sans-serif"
            },
            min: 0,
            max: 10,
            labels: {
                color: '#00aa00'
            }
        }
    };

    const allChartConfig = {
        areaChartProps: chartConfig,
        barChartProps: chartConfig,
        columnChartProps: chartConfig,
        donutChartProps: chartConfig,
        lineChartProps: chartConfig,
        radarLineProps: chartConfig,
        pieChartProps: chartConfig
    };

    const chartTypes = [ "area", "bar", "column", "donut", "line", "radarLine", "pie" ];

    const renderCharts = () => {
        return chartTypes.map(
            (chartType, i) =>
                <CategoricalChart
                    key={"categoricalChart_" + i}
                    style={{ float: 'left', height: 600, width: 600 }}
                    data={dataRaw}
                    chartType={chartType}
                    transformData={transformData}
                    settings={allChartConfig}
                />
        );
    };

    return (
        <>
            { renderCharts() }
        </>
    );
}

export default CategorialChartExamples;