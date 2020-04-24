import React from 'react'
import CanvasJSReact from "../libs/canvasjs/canvasjs.react";
const CanvasJSChart = CanvasJSReact.CanvasJSChart;



const WeaponChartComponent = ({ weapons, property }) => {
    if(weapons){
        let data = weapons.filter(weapon => Math.round(weapon[property]) > 0);

        const options = {
            exportEnabled: true,
            animationEnabled: true,
            title: {
                text: property
            },
            data: [{
                type: "pie",
                startAngle: 75,
                toolTipContent: "<b>{label}</b>: {y}",
                showInLegend: "true",
                legendText: "{label}",
                indexLabelFontSize: 16,
                indexLabel: "{label} - {y}",
                dataPoints: data.map(weapon => {return {y: Math.round(weapon[property]), label: weapon.name}})
            }]
        };

        return <div>
            <CanvasJSChart options = {options}
                /* onRef={ref => this.chart = ref} */
            />
        </div>
    } else {
        return <div></div>
    }
}

export default WeaponChartComponent;